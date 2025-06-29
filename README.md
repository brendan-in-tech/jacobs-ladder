# Gmail Template

A modern Gmail-like email client built with React and Flask, featuring email threading and real-time updates.

## Features

### Email Threading
- **Thread Grouping**: Emails are automatically grouped into threads using Gmail's threadId
- **Newest-First Ordering**: Both threads and messages within threads are displayed in newest-first order
- **Expand/Collapse**: Users can expand threads to view the full conversation history
- **Thread Indicators**: Visual indicators show the number of messages in each thread
- **Persistent State**: Expanded/collapsed state is saved to localStorage

### Email Management
- **Real-time Updates**: Automatic polling for new emails every 30 seconds
- **Rich Email Display**: Support for HTML and plain text emails with proper formatting
- **Attachment Support**: Display of email attachments (download functionality coming soon)
- **Sender Photos**: Integration with Google People API and Clearbit for sender profile photos

### User Experience
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Accessibility**: Full keyboard navigation and screen reader support
- **Mobile Responsive**: Optimized for desktop and mobile devices
- **Loading States**: Proper loading indicators and error handling

## Technical Implementation

### Backend (Flask)
- **Gmail API Integration**: Uses Gmail API for fetching emails and threads
- **Thread Processing**: Groups individual messages into threads with metadata
- **Real-time Updates**: Implements Gmail history API for detecting new emails
- **Authentication**: Google OAuth 2.0 integration

### Frontend (React)
- **Thread Components**: Dedicated EmailThread component for thread display
- **State Management**: React hooks for managing thread state and expanded/collapsed status
- **Local Storage**: Persistence of thread state and expanded threads
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Data Structure
```javascript
// Thread Object
{
  threadId: "string",
  messages: [EmailObject],
  messageCount: number,
  latestMessage: EmailObject,
  subject: "string",
  participants: ["string"],
  latestDate: "timestamp",
  snippet: "string"
}

// Email Object
{
  id: "string",
  threadId: "string",
  sender: "string",
  subject: "string",
  snippet: "string",
  internalDate: "timestamp",
  body: "string",
  body_type: "html|plain",
  attachments: [AttachmentObject]
}
```

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jacobs-ladder
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   npm install
   
   # Backend
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up Google OAuth**
   - Create a Google Cloud Project
   - Enable Gmail API and People API
   - Create OAuth 2.0 credentials
   - Download credentials.json to the project root

5. **Start the servers**
   ```bash
   # Backend (Terminal 1)
   python backend.py
   
   # Frontend (Terminal 2)
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5001

## Email Threading Features

### Thread Display
- Threads are displayed with the most recent message at the top
- Each thread shows the subject, participants, and snippet of the latest message
- Threads with multiple messages display a message count badge

### Thread Interaction
- Click the chevron icon to expand/collapse a thread
- Click anywhere on the thread header to open the latest message
- When expanded, click on individual messages to view them
- Use keyboard navigation (Tab, Enter, Space) for accessibility

### Thread State Persistence
- Expanded/collapsed state is automatically saved to localStorage
- State persists across browser sessions
- State is cleared on logout

## API Endpoints

- `GET /fetch-emails` - Fetch email threads
- `GET /check-new-emails` - Check for new emails since last check
- `GET /me` - Get current user information
- `POST /logout` - Logout user

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License. 
