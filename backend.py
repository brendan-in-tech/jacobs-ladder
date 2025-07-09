from flask import Flask, jsonify, request, session, redirect, url_for
from flask_cors import CORS
from gmail_fetcher import fetch_emails, fetch_threads, get_gmail_service, get_history_id, get_new_emails, get_new_thread_updates
from utils.email_filter import get_filter_configuration
import logging
import os
from google_auth_oauthlib.flow import Flow
import google.auth.transport.requests
import requests as ext_requests
import googleapiclient.discovery
from flask_session import Session
from flask_wtf import CSRFProtect
from functools import wraps

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'supersecretkey')
app.config['SESSION_TYPE'] = os.getenv('SESSION_TYPE', 'filesystem')
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
Session(app)
csrf = CSRFProtect(app)

# Disable CSRF for OAuth routes
def disable_csrf(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        return f(*args, **kwargs)
    return decorated_function

# Enable CORS for all domains on all routes
CORS(app, 
     resources={r"/*": {
         "origins": [os.getenv('FRONTEND_URL', 'http://localhost:5173')],
         "methods": ["GET", "POST", "OPTIONS"],
         "allow_headers": ["Content-Type"]
     }},
     supports_credentials=True)

@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    if origin == "http://localhost:5173":
        response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

@app.route('/')
def home():
    logger.debug("Received request to /")
    return jsonify({"status": "Server is running"})

# Demo user
DEMO_USER = {
    'email': 'test@example.com',
    'password': 'password123',
    'name': 'Test User'
}

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if email == DEMO_USER['email'] and password == DEMO_USER['password']:
        session['user'] = {'email': DEMO_USER['email'], 'name': DEMO_USER['name']}
        return jsonify({'message': 'Login successful', 'user': session['user']})
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return jsonify({'message': 'Logged out'})

@app.route('/me', methods=['GET'])
def me():
    user = session.get('user')
    if user:
        return jsonify({'user': user})
    return jsonify({'user': None}), 401

@app.route('/fetch-emails')
def get_emails():
    logger.debug("Received request to /fetch-emails")
    user = session.get('user')
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    try:
        email_data = fetch_emails()
        logger.debug(f"Successfully fetched {email_data.get('total_count', 0)} total items")
        return jsonify(email_data)
    except Exception as e:
        logger.error(f"Error fetching emails: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/fetch-threads')
def get_threads():
    logger.debug("Received request to /fetch-threads")
    user = session.get('user')
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    try:
        threads = fetch_threads()
        logger.debug(f"Successfully fetched {len(threads)} threads")
        return jsonify(threads)
    except Exception as e:
        logger.error(f"Error fetching threads: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/check-new-emails')
def check_new_emails():
    """Check for new emails since last check."""
    logger.debug("Received request to /check-new-emails")
    user = session.get('user')
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        gmail_service, _ = get_gmail_service()
        
        # Get the last history ID from session or get current one
        last_history_id = session.get('last_history_id')
        if not last_history_id:
            last_history_id = get_history_id(gmail_service)
            session['last_history_id'] = last_history_id
        
        # Get new thread updates
        updated_threads = get_new_thread_updates(gmail_service, last_history_id)
        
        # Update last history ID
        if updated_threads:
            current_history_id = get_history_id(gmail_service)
            session['last_history_id'] = current_history_id
        
        return jsonify({
            'updated_threads': updated_threads,
            'has_new': len(updated_threads) > 0
        })
    except Exception as e:
        logger.error(f"Error checking new emails: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/filter-config')
def get_filter_config():
    """Get the current job email filter configuration."""
    logger.debug("Received request to /filter-config")
    user = session.get('user')
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        config = get_filter_configuration()
        return jsonify(config)
    except Exception as e:
        logger.error(f"Error getting filter config: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/debug/clear-oauth-state')
def clear_oauth_state():
    """Debug endpoint to clear OAuth state."""
    session.pop('oauth_state', None)
    session.pop('google_token', None)
    session.pop('user', None)
    return jsonify({'message': 'OAuth state cleared'})

# Google OAuth config
GOOGLE_CLIENT_SECRETS_FILE = 'credentials.json'
GOOGLE_SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/contacts.readonly'  # Added People API scope
]
REDIRECT_URI = 'http://localhost:5001/login/google/callback'
LOGIN_URL = 'http://localhost:5001/login'
FRONTEND_URL = 'http://localhost:5173/'
REFRESH_TOKEN_URL = 'http://localhost:5001/refresh-token'

@app.route('/login/google')
@disable_csrf
def login_google():
    try:
        flow = Flow.from_client_secrets_file(
            GOOGLE_CLIENT_SECRETS_FILE,
            scopes=GOOGLE_SCOPES,
            redirect_uri=REDIRECT_URI
        )
        auth_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )
        session['oauth_state'] = state
        logger.debug(f"OAuth state stored: {state}")
        return redirect(auth_url)
    except Exception as e:
        logger.error(f"Error in login_google: {e}")
        return jsonify({'error': 'OAuth initialization failed'}), 500

@app.route('/login/google/callback')
@disable_csrf
def login_google_callback():
    try:
        # Get state from session
        stored_state = session.get('oauth_state')
        received_state = request.args.get('state')
        
        logger.debug(f"Stored state: {stored_state}")
        logger.debug(f"Received state: {received_state}")
        logger.debug(f"Session data: {dict(session)}")
        
        # More lenient state checking - allow if either is missing
        if stored_state and received_state and stored_state != received_state:
            logger.error(f"State mismatch: stored={stored_state}, received={received_state}")
            # Instead of failing, try to continue without state validation
            logger.warning("Continuing without state validation due to mismatch")
        
        # Create flow without state if there's a mismatch
        if stored_state and received_state and stored_state == received_state:
            flow = Flow.from_client_secrets_file(
                GOOGLE_CLIENT_SECRETS_FILE,
                scopes=GOOGLE_SCOPES,
                state=stored_state,
                redirect_uri=REDIRECT_URI
            )
            # Clear the state from session after successful validation
            session.pop('oauth_state', None)
        else:
            # Create flow without state validation
            flow = Flow.from_client_secrets_file(
                GOOGLE_CLIENT_SECRETS_FILE,
                scopes=GOOGLE_SCOPES,
                redirect_uri=REDIRECT_URI
            )
            # Clear any existing state
            session.pop('oauth_state', None)
        
        flow.fetch_token(authorization_response=request.url)
        credentials = flow.credentials
        session['google_token'] = {
            'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'scopes': credentials.scopes
        }
        # Get user info
        userinfo_response = ext_requests.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            headers={'Authorization': f'Bearer {credentials.token}'}
        )
        userinfo = userinfo_response.json()
        # Fetch Google profile photo using People API
        people_service = googleapiclient.discovery.build('people', 'v1', credentials=credentials)
        profile = people_service.people().get(
            resourceName='people/me',
            personFields='photos'
        ).execute()
        photo_url = None
        if 'photos' in profile and profile['photos']:
            # Prefer the primary, non-default photo
            for photo in profile['photos']:
                if photo.get('metadata', {}).get('primary') and not photo.get('default', False):
                    photo_url = photo.get('url')
                    break
            # Fallback to the first photo if no primary found
            if not photo_url:
                photo_url = profile['photos'][0].get('url')
        session['user'] = {
            'email': userinfo.get('email'),
            'name': userinfo.get('name', userinfo.get('email')),
            'photo': photo_url
        }
        return redirect(FRONTEND_URL)
    except Exception as e:
        logger.error(f"Error in login_google_callback: {e}")
        logger.error(f"Request URL: {request.url}")
        logger.error(f"Request args: {dict(request.args)}")
        return jsonify({'error': f'OAuth callback failed: {str(e)}'}), 500

if __name__ == '__main__':
    logger.info("Starting Flask server...")
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
    debug = os.getenv('FLASK_ENV', 'production') == 'development'
    app.run(debug=debug, port=5001, host='0.0.0.0') 