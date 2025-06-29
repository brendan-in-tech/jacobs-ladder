import React from 'react'
import { StarIcon } from '@heroicons/react/24/outline'

const ThreadMessage = ({ message, isLatest, onSelect }) => {
  const formatDate = (date) => {
    if (!date) return ''
    const now = new Date()
    const emailDate = new Date(date)
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

  const handleClick = (e) => {
    e.stopPropagation()
    onSelect(message)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      onSelect(message)
    }
  }

  return (
    <div 
      className={`cursor-pointer hover:bg-gray-100 transition-colors duration-150 rounded-md p-3 ${
        isLatest ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-white border-l-4 border-gray-200'
      }`}
      onClick={handleClick}
      tabIndex={0}
      aria-label={`View message from ${message.sender}: ${message.subject}`}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start min-w-0 flex-1">
          <div className="flex-shrink-0 mr-3">
            {message.sender_photo ? (
              <img
                src={message.sender_photo}
                alt={message.sender}
                className={`w-6 h-6 rounded-full border ${message.sender_photo.includes('clearbit.com') ? 'bg-white p-0.5' : ''}`}
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold border">
                {message.sender?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900 truncate">
                {message.sender}
              </p>
              <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  {formatDate(message.date)}
                </span>
                <button 
                  className="text-gray-400 hover:text-yellow-400"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Star message"
                >
                  <StarIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            {!isLatest && (
              <p className="text-sm font-medium text-gray-900 truncate mt-1">
                {message.subject}
              </p>
            )}
            <p className="text-sm text-gray-500 truncate mt-1">
              {message.snippet}
            </p>
            {message.attachments && message.attachments.length > 0 && (
              <div className="flex items-center space-x-1 mt-1">
                <span className="text-xs text-gray-400">📎</span>
                <span className="text-xs text-gray-400">
                  {message.attachments.length} attachment{message.attachments.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThreadMessage 