import React, { useState } from 'react'
import EmailModal from './EmailModal'

const EmailThread = ({ thread, expandedThreads, setExpandedThreads }) => {
  const [selectedEmail, setSelectedEmail] = useState(null)
  const isThread = thread.messageCount > 1
  const isExpanded = expandedThreads.includes(thread.threadId)

  const handleRowClick = (e) => {
    e.stopPropagation()
    if (isThread) {
      setExpandedThreads(prev =>
        isExpanded ? prev.filter(id => id !== thread.threadId) : [...prev, thread.threadId]
      )
    } else {
      setSelectedEmail(thread.latestMessage)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleRowClick(e)
    }
  }

  const handleEmailClick = (email, e) => {
    e.stopPropagation()
    setSelectedEmail(email)
  }

  const formatDate = (date) => {
    if (!date) return ''
    const now = new Date()
    const emailDate = new Date(parseInt(date))
    const diffDays = Math.floor((now - emailDate) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) {
      return emailDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return emailDate.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return emailDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const latestMessage = thread.latestMessage

  return (
    <div className={`border-b border-gray-200 ${isExpanded ? 'bg-blue-50/50 border-l-4 border-blue-400' : ''}`}>
      {/* Thread or Email Row */}
      <div
        className={`px-4 py-3 sm:px-6 cursor-pointer hover:bg-gray-50 transition-colors duration-150 flex items-center min-w-0`}
        onClick={handleRowClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={isThread ? `Expand thread: ${thread.subject}` : `Open email: ${thread.subject}`}
      >
        {/* Avatar */}
        <div className="flex-shrink-0 mr-3">
          {latestMessage.sender_photo ? (
            <img
              src={latestMessage.sender_photo}
              alt={latestMessage.sender}
              className={`w-8 h-8 rounded-full border ${latestMessage.sender_photo.includes('clearbit.com') ? 'bg-white p-1' : ''}`}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold border">
              {latestMessage.sender.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        {/* Main Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-900 truncate">
                {thread.participants.length > 1
                  ? `${thread.participants.slice(0, 2).join(', ')}${thread.participants.length > 2 ? ` +${thread.participants.length - 2}` : ''}`
                  : latestMessage.sender
                }
              </p>
              {isThread && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {thread.messageCount}
                </span>
              )}
            </div>
            <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {formatDate(latestMessage.internalDate)}
              </span>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-900 truncate">
            {thread.subject}
          </p>
          <p className="text-sm text-gray-500 truncate">
            {thread.snippet}
          </p>
        </div>
      </div>

      {/* Expanded Thread Messages (Gmail style) */}
      {isThread && isExpanded && (
        <div className="bg-gray-50 border-t border-gray-200">
          {thread.messages.map((email, index) => (
            <div
              key={email.id}
              className={`px-8 py-2 cursor-pointer hover:bg-gray-100 transition-colors duration-150 ${index === 0 ? 'border-b border-gray-200' : ''}`}
              onClick={(e) => handleEmailClick(email, e)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleEmailClick(email, e) }}
              tabIndex={0}
              role="button"
              aria-label={`Open email from ${email.sender}: ${email.subject}`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {email.sender_photo ? (
                    <img
                      src={email.sender_photo}
                      alt={email.sender}
                      className={`w-6 h-6 rounded-full border ${email.sender_photo.includes('clearbit.com') ? 'bg-white p-1' : ''}`}
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-xs border">
                      {email.sender.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {email.sender}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatDate(email.internalDate)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {email.snippet}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Email Modal */}
      <EmailModal
        email={selectedEmail}
        onClose={() => setSelectedEmail(null)}
      />
    </div>
  )
}

export default EmailThread 