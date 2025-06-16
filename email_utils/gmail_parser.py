import requests
import logging
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_email_address(email_string):
    """Extract email address from a string that might contain a name."""
    match = re.search(r'[\w\.-]+@[\w\.-]+', email_string)
    return match.group(0) if match else None

def get_company_logo(email_domain):
    """Get company logo URL using Clearbit's Logo API for a given email domain."""
    try:
        # Extract domain from email
        domain = email_domain.split('@')[-1]
        # Use Clearbit's Logo API
        response = requests.get(f'https://logo.clearbit.com/{domain}', timeout=2)
        if response.status_code == 200:
            return f'https://logo.clearbit.com/{domain}'
    except Exception as e:
        logger.error(f"Error getting company logo: {e}")
    return None


def get_profile_photo(service, email_address):
    """Get profile photo URL for a given email address using People API."""
    try:
        # Search for the person by email
        results = service.people().connections().list(
            resourceName='people/me',
            pageSize=100,
            personFields='photos,emailAddresses'
        ).execute()

        # Look for the person in connections
        if 'connections' in results:
            for person in results['connections']:
                if 'emailAddresses' in person:
                    for email_info in person['emailAddresses']:
                        if email_info.get('value', '').lower() == email_address.lower():
                            # Found the person, get their photo
                            if 'photos' in person and person['photos']:
                                # Prefer the primary, non-default photo
                                for photo in person['photos']:
                                    if photo.get('metadata', {}).get('primary') and not photo.get('default', False):
                                        return photo.get('url')
                                # Fallback to the first photo if no primary found
                                return person['photos'][0].get('url')
    except Exception as e:
        logger.error(f"Error getting profile photo: {e}")
    return None