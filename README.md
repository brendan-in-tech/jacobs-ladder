# Jacobs Ladder - Gmail Client

A modern, React-based Gmail client with intelligent email threading support.

## Features

- **Smart Email Threading**: Groups related emails using Gmail's threadId, but shows single messages as individual emails
- **Newest-First Ordering**: Displays threads and messages in chronological order (newest first)
- **Expandable Threads**: Click to expand/collapse multi-message conversations
- **Thread Count Modal**: Detailed view of thread statistics and participants
- **Persistent State**: Remembers expanded/collapsed state using localStorage
- **Real-time Updates**: Polls for new emails every 30 seconds
- **Profile Photos**: Shows sender profile photos from Google or company logos
- **Modern UI**: Clean, responsive interface built with React and TailwindCSS

## Email Threading Logic

The application implements intelligent email threading:

- **Multi-Message Threads**: Conversations with 2+ messages are displayed as expandable threads
- **Single Messages**: Threads with only 1 message are shown as individual emails (not as threads)
- **Thread Grouping**: Uses Gmail's `threadId` to group related messages
- **Message Ordering**: Within each thread, messages are sorted newest to oldest
- **Thread Indicators**: Shows message count and thread icon for multi-message conversations
- **Participant Display**: Shows all participants in multi-message conversations
- **Expand/Collapse**: Click thread headers to expand and view all messages
- **State Persistence**: Expanded/collapsed state is saved to localStorage

## Thread Count Modal

Click the thread count button (chat bubble icon) to view detailed thread information:

- **Message Count**: Total messages in the conversation
- **Participants**: All email addresses involved in the thread
- **Unique Senders**: Distinct list of people who sent messages
- **Date Range**: Timeline of the conversation
- **Attachments**: Total count across all messages
- **Latest Message**: Preview of the most recent message

## Technical Implementation

### Backend (Python/Flask)
- `fetch_emails()`: Fetches both threads and individual messages with smart deduplication
- `get_thread_content()`: Processes thread data and sorts messages
- `get_new_thread_updates()`: Handles real-time thread updates
- `/fetch-emails` endpoint: Returns hybrid data structure
- **Single Message Logic**: Threads with 1 message are converted to individual emails

### Frontend (React)
- `EmailThread` component: Displays multi-message threads with expand/collapse
- `ThreadMessage` component: Shows individual messages within threads
- `ThreadCountModal` component: Detailed thread statistics and information
- Hybrid state management for threads and individual emails
- Real-time updates via polling

## Getting Started

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   npm install
   ```

2. Set up Google OAuth credentials in `credentials.json`

3. Start the backend server:
   ```bash
   python backend.py
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173 in your browser

## API Endpoints

- `GET /fetch-emails`: Fetch emails and threads with smart deduplication
- `GET /check-new-emails`: Check for new thread updates
- `GET /me`: Get current user information
- `POST /logout`: Log out current user

## Data Structure

### API Response
```javascript
{
  "threads": Thread[],           // Multi-message conversations only
  "individual_emails": Email[],  // Single messages + individual emails
  "total_count": number         // Total items (threads + individual emails)
}
```

### Thread Object (Multi-message conversations)
```javascript
{
  threadId: string,
  subject: string,
  participants: string[],
  latest_snippet: string,
  latest_timestamp: number,
  message_count: number,        // Always > 1
  messages: EmailMessage[],
  latest_date: string,
  latest_sender: string,
  latest_sender_photo: string
}
```

### Email Message Object
```javascript
{
  id: string,
  threadId: string,
  sender: string,
  sender_email: string,
  sender_photo: string,
  subject: string,
  date: string,
  snippet: string,
  body: string,
  attachments: Attachment[]
}
```

## Display Logic

1. **Multi-message threads** are shown as expandable thread components
2. **Single-message threads** are converted to individual email items
3. **Individual emails** (not part of any thread) are shown as email items
4. **Threads are displayed first**, followed by individual emails
5. **All items are sorted** by latest timestamp (newest first)

## Browser Support

- Modern browsers with ES6+ support
- Requires JavaScript enabled
- LocalStorage for state persistence

## 🚀 How to Use This as a Template

1. **Clone or use as a GitHub template:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/gmail-template.git my-new-gmail-app
   cd my-new-gmail-app
   ```
2. **Install dependencies:**
   - Backend: `pip install -r requirements.txt`
   - Frontend: `npm install`
3. **Copy and edit `.env.example` to `.env`:**
   - Fill in your Google Cloud, Pub/Sub, and Flask settings.
4. **Set up Google Cloud:**
   - Create OAuth credentials, Pub/Sub topic, and service account as described below.
5. **Run tests to verify setup:**
   - Backend: `pytest`
   - Frontend: `npm test`
6. **Start developing!**
   - Backend: `python backend.py`
   - Frontend: `npm run dev`

---

A full-stack template for building Gmail-integrated web apps with React, Tailwind, Flask, and Google APIs.

## Features
- Google OAuth login and demo email/password login
- Fetch and display Gmail messages (with sender avatars, company logos, and attachments)
- Real-time updates via Gmail push notifications (Google Pub/Sub)
- Responsive, Gmail-like UI with React + Tailwind
- Local email persistence (localStorage)
- Easy to extend for custom email workflows

## Project Structure
```
/ (root)
├── backend.py           # Flask backend entry point
├── gmail_fetcher.py     # Gmail/People API logic, notification handling
├── .env                 # Environment variables (secrets, config)
├── requirements.txt     # Python dependencies
├── /src/                # React + Tailwind frontend
│   ├── App.jsx
│   ├── components/
│   │   ├── EmailModal.jsx
│   │   └── Login.jsx
│   └── ...
├── package.json         # Frontend dependencies
└── README.md            # This file
```

## Configuration
- All secrets and config are in `.env` (see example in repo).
- Update allowed CORS origins, ports, and Google settings as needed.

## Customization
- Extend `gmail_fetcher.py` for more Gmail/People API features.
- Tweak React components in `/src/` for your UI/UX needs.
- Add endpoints to `backend.py` for new workflows.

## Testing

### Backend (Python)
- Run all backend tests:
  ```bash
  pytest
  ```
- See coverage:
  ```bash
  coverage run -m pytest && coverage report
  ```

### Frontend (React)
- Run all frontend tests:
  ```bash
  npm test
  ```
- Add tests in `src/__tests__/` using [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

## License
MIT 
