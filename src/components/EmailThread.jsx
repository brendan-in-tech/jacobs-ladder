import React, { useState, useEffect } from 'react'
import { ChevronDownIcon, ChevronRightIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import ThreadMessage from './ThreadMessage'
import ThreadCountModal from './ThreadCountModal'

const EmailThread = ({ thread, onSelectMessage, isExpanded, onToggleExpanded, user }) => {
  const [localExpanded, setLocalExpanded] = useState(isExpanded)
  const [showCountModal, setShowCountModal] = useState(false)

  // Sync with parent component's expanded state
  useEffect(() => {
    setLocalExpanded(isExpanded)
  }, [isExpanded])

  const handleToggleExpanded = () => {
    const newExpanded = !localExpanded
    setLocalExpanded(newExpanded)
    onToggleExpanded(thread.threadId, newExpanded)
  }

  const handleSelectMessage = (message) => {
    onSelectMessage(message)
  }

  const handleCountClick = (e) => {
    e.stopPropagation()
    setShowCountModal(true)
  }

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

  // Utility to normalize Gmail addresses (remove dots in username)
  function normalizeGmail(email) {
    if (!email) return '';
    const [user, domain] = email.toLowerCase().split('@');
    if (domain === 'gmail.com') {
      return user.replace(/\./g, '') + '@' + domain;
    }
    return email.toLowerCase();
  }

  // Avatars for all participants (excluding user and aliases and name). If 1, show 1. If 2+, show 2 and +N.
  const getParticipantAvatars = () => {
    if (!thread.participants || thread.participants.length === 0) return null
    // Deduplicate participants
    const uniqueParticipants = Array.from(new Set(thread.participants))
    // Build userEmails and userNames arrays (main + aliases + name)
    const userEmails = user
      ? [user.email, ...(user.aliases || [])].map(normalizeGmail)
      : []
    const userNames = user && user.name ? [user.name.toLowerCase().trim()] : []
    // Exclude all user emails and names
    const others = uniqueParticipants.filter(emailOrName => {
      const val = normalizeGmail(emailOrName.trim())
      return !userEmails.includes(val) && !userNames.includes(val)
    })
    if (others.length === 1) {
      const other = others[0]
      const msg = thread.messages.find(m => m.sender_email && m.sender_email.toLowerCase().trim() === other.toLowerCase().trim())
      const photo = msg && msg.sender_photo
      return photo ? (
        <img
          key={other}
          src={photo}
          alt={other}
          className={`w-7 h-7 rounded-full border ${photo.includes('clearbit.com') ? 'bg-white p-1' : ''}`}
        />
      ) : (
        <div
          key={other}
          className={`w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold border`}
        >
          {other[0].toUpperCase()}
        </div>
      )
    }
    // If 2 or more others, show 2 avatars and +N
    const avatars = others.slice(0, 2).map((email, idx) => {
      const msg = thread.messages.find(m => m.sender_email && m.sender_email.toLowerCase().trim() === email.toLowerCase().trim())
      const photo = msg && msg.sender_photo
      return photo ? (
        <img
          key={email}
          src={photo}
          alt={email}
          className={`w-7 h-7 rounded-full border ${photo.includes('clearbit.com') ? 'bg-white p-1' : ''} -ml-2 first:ml-0`}
          style={{zIndex: 10 - idx}}
        />
      ) : (
        <div
          key={email}
          className={`w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold border -ml-2 first:ml-0`}
          style={{zIndex: 10 - idx}}
        >
          {email[0].toUpperCase()}
        </div>
      )
    })
    return (
      <div className="flex items-center">
        {avatars}
        {others.length > 2 && (
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700 border -ml-2" style={{zIndex: 6}}>
            +{others.length - 2}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="border-b border-gray-200 last:border-b-0">
        {/* Thread Header */}
        <div 
          className="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
          onClick={handleToggleExpanded}
          tabIndex={0}
          aria-label={`Toggle thread: ${thread.subject}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleToggleExpanded()
            }
          }}
        >
          <div className="px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0 flex-1">
                <div className="flex-shrink-0 mr-3">
                  {getParticipantAvatars()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {thread.latest_sender}
                      </p>
                      <button 
                        className="flex items-center space-x-1 text-gray-400 hover:text-blue-600 transition-colors"
                        onClick={handleCountClick}
                        aria-label={`View thread details: ${thread.message_count} messages`}
                      >
                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        <span className="text-xs font-medium">{thread.message_count}</span>
                      </button>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {formatDate(thread.latest_date)}
                      </span>
                      {localExpanded ? (
                        <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {thread.subject}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {thread.latest_snippet}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thread Messages */}
        {localExpanded && (
          <div className="bg-gray-50 border-t border-gray-200">
            <div className="px-4 py-2">
              <div className="space-y-2">
                {thread.messages.map((message, index) => (
                  <ThreadMessage
                    key={`${thread.threadId}-${message.id}`}
                    message={message}
                    isLatest={index === 0}
                    onSelect={() => handleSelectMessage(message)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Thread Count Modal */}
      <ThreadCountModal
        thread={thread}
        isOpen={showCountModal}
        onClose={() => setShowCountModal(false)}
      />
    </>
  )
}

export default EmailThread 