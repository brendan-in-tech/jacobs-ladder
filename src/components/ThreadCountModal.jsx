import React from 'react'
import { XMarkIcon, ChatBubbleLeftRightIcon, UserGroupIcon, CalendarIcon } from '@heroicons/react/24/outline'

const ThreadCountModal = ({ thread, isOpen, onClose }) => {
  if (!isOpen || !thread) return null

  const formatDate = (date) => {
    if (!date) return 'Unknown'
    const emailDate = new Date(date)
    return emailDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    })
  }

  const getUniqueSenders = () => {
    const senders = new Set()
    thread.messages.forEach(message => {
      if (message.sender_email) {
        senders.add(message.sender_email)
      }
    })
    return Array.from(senders)
  }

  const getMessageDateRange = () => {
    if (!thread.messages || thread.messages.length === 0) return 'No messages'
    
    const dates = thread.messages.map(msg => new Date(msg.date)).filter(date => !isNaN(date))
    if (dates.length === 0) return 'No valid dates'
    
    const oldest = new Date(Math.min(...dates))
    const newest = new Date(Math.max(...dates))
    
    if (oldest.toDateString() === newest.toDateString()) {
      return formatDate(newest)
    }
    
    return `${formatDate(oldest)} - ${formatDate(newest)}`
  }

  const getAttachmentCount = () => {
    return thread.messages.reduce((total, message) => {
      return total + (message.attachments ? message.attachments.length : 0)
    }, 0)
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Thread Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Subject */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Subject</h3>
            <p className="text-gray-700">{thread.subject}</p>
          </div>

          {/* Message Count */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-900">{thread.message_count}</p>
                <p className="text-sm text-blue-700">Messages in thread</p>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <UserGroupIcon className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Participants</h3>
            </div>
            <div className="space-y-2">
              {thread.participants && thread.participants.length > 0 ? (
                thread.participants.map((participant, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">{participant}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No participants found</p>
              )}
            </div>
          </div>

          {/* Unique Senders */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Unique Senders</h3>
            <div className="space-y-2">
              {getUniqueSenders().map((sender, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">{sender}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <CalendarIcon className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Date Range</h3>
            </div>
            <p className="text-gray-700">{getMessageDateRange()}</p>
          </div>

          {/* Attachments */}
          {getAttachmentCount() > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Attachments</h3>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-700">
                  <span className="font-medium">{getAttachmentCount()}</span> total attachment{getAttachmentCount() !== 1 ? 's' : ''} across all messages
                </p>
              </div>
            </div>
          )}

          {/* Latest Message */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Latest Message</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-2">
                From: <span className="font-medium">{thread.latest_sender}</span>
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Date: <span className="font-medium">{formatDate(thread.latest_date)}</span>
              </p>
              <p className="text-gray-700 text-sm">
                {thread.latest_snippet}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ThreadCountModal 