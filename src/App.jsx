import React, { useState, useEffect } from 'react'
import { EnvelopeIcon, PaperAirplaneIcon, CalendarIcon, StarIcon } from '@heroicons/react/24/outline'
import EmailModal from './components/EmailModal'
import EmailThread from './components/EmailThread'
import Login from './components/Login'

function App() {
  const [emailData, setEmailData] = useState(() => {
    // Initialize from localStorage if available
    const savedEmailData = localStorage.getItem('email_data')
    return savedEmailData ? JSON.parse(savedEmailData) : { threads: [], individual_emails: [], total_count: 0 }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [serverStatus, setServerStatus] = useState('checking')
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [lastCheck, setLastCheck] = useState(Date.now())
  const [expandedThreads, setExpandedThreads] = useState(() => {
    // Initialize expanded threads from localStorage
    const savedExpanded = localStorage.getItem('expanded_threads')
    return savedExpanded ? JSON.parse(savedExpanded) : {}
  })

  // Save email data to localStorage whenever it changes
  useEffect(() => {
    if (emailData.total_count > 0) {
      localStorage.setItem('email_data', JSON.stringify(emailData))
    }
  }, [emailData])

  // Save expanded threads to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('expanded_threads', JSON.stringify(expandedThreads))
  }, [expandedThreads])

  // Poll for new emails every 30 seconds
  useEffect(() => {
    if (!user) return

    const checkNewEmails = async () => {
      try {
        const response = await fetch('http://localhost:5001/check-new-emails', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        if (data.has_new && data.updated_threads) {
          // For now, we'll refetch all emails when new emails arrive
          // In a more sophisticated implementation, we'd merge new emails into existing data
          fetchEmails()
        }
        setLastCheck(Date.now())
      } catch (err) {
        console.error('Error checking for new emails:', err)
      }
    }

    const interval = setInterval(checkNewEmails, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [user])

  // Clear data from localStorage on logout
  const handleLogout = async () => {
    await fetch('http://localhost:5001/logout', {
      method: 'POST',
      credentials: 'include',
    })
    setUser(null)
    setEmailData({ threads: [], individual_emails: [], total_count: 0 })
    setSelectedEmail(null)
    setExpandedThreads({})
    localStorage.removeItem('email_data')
    localStorage.removeItem('expanded_threads')
  }

  // Handle thread expansion/collapse
  const handleToggleThreadExpanded = (threadId, isExpanded) => {
    setExpandedThreads(prev => ({
      ...prev,
      [threadId]: isExpanded
    }))
  }

  // Handle selecting a message from a thread
  const handleSelectMessage = (message) => {
    setSelectedEmail(message)
  }

  // Handle selecting an individual email
  const handleSelectEmail = (email) => {
    setSelectedEmail(email)
  }

  // Format date for email list
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

  // Format last refresh time
  const formatLastRefresh = (timestamp) => {
    if (!timestamp) return ''
    const now = new Date()
    const date = new Date(timestamp)
    if (now.toDateString() === date.toDateString()) {
      // Today: show time only
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    } else {
      // Previous day: show date and time
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' + date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    }
  }

  useEffect(() => {
    // Check if server is running
    fetch('http://localhost:5001/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then(data => {
        setServerStatus('running')
      })
      .catch(err => {
        console.error('Server check error:', err)
        setServerStatus('error')
        setError('Server is not running. Please start the Flask server.')
      })
  }, [])

  useEffect(() => {
    // Check authentication
    fetch('http://localhost:5001/me', {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
          // If we have a user but no emails, fetch them
          if (emailData.total_count === 0) {
            fetchEmails()
          }
        }
        setAuthLoading(false)
      })
      .catch(() => setAuthLoading(false))
  }, [])

  const handleLogin = (user) => {
    setUser(user)
    setError(null)
    // If we have a user but no emails, fetch them
    if (emailData.total_count === 0) {
      fetchEmails()
    }
  }

  const fetchEmails = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:5001/fetch-emails', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setEmailData(data)
      setLastCheck(Date.now())
    } catch (err) {
      console.error('Error fetching emails:', err)
      if (err.message.includes('Failed to fetch')) {
        setError('Unable to connect to the server. Please make sure the backend is running on port 5001.')
      } else {
        setError(err.message || 'Failed to fetch emails. Please try again.')
      }
    }
    setLoading(false)
  }

  // Combine and sort all items newest-first
  const getSortedItems = () => {
    const threads = emailData.threads.map(thread => ({
      ...thread,
      _type: 'thread',
      _sortTimestamp: thread.latest_timestamp || 0
    }))
    const emails = emailData.individual_emails.map(email => ({
      ...email,
      _type: 'email',
      _sortTimestamp: email.internalDate
        ? parseInt(email.internalDate, 10)
        : (email.date ? new Date(email.date).getTime() : 0)
    }))
    return [...threads, ...emails].sort((a, b) => b._sortTimestamp - a._sortTimestamp)
  }

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-gray-600">Loading...</div>
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="px-8 py-6 sm:px-12">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 bg-white" style={{minHeight: '72px'}}>
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-1">Inbox</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Server Status: {serverStatus === 'checking' ? 'Checking...' : 
                              serverStatus === 'running' ? 'Running' : 'Not Running'}
                {emailData.total_count > 0 && (
                  <span className="ml-2">• {emailData.total_count} total items</span>
                )}
                {lastCheck && (
                  <span className="ml-2">• Last refreshed: {formatLastRefresh(lastCheck)}</span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {user.photo ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold border">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={fetchEmails}
                disabled={loading || serverStatus !== 'running'}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                style={{height: '40px'}}
              >
                {loading ? 'Loading...' : 'Refresh Emails'}
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Logout
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {getSortedItems().map((item) => (
                <li key={item._type === 'thread' ? item.threadId : item.id}>
                  {item._type === 'thread' ? (
                    <EmailThread
                      thread={item}
                      onSelectMessage={handleSelectMessage}
                      isExpanded={expandedThreads[item.threadId] || false}
                      onToggleExpanded={handleToggleThreadExpanded}
                      user={user}
                    />
                  ) : (
                    <div
                      onClick={() => handleSelectEmail(item)}
                      className="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                    >
                      <div className="px-4 py-3 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center min-w-0 flex-1">
                            <div className="flex-shrink-0 mr-3">
                              {item.sender_photo ? (
                                <img
                                  src={item.sender_photo}
                                  alt={item.sender}
                                  className={`w-8 h-8 rounded-full border ${item.sender_photo.includes('clearbit.com') ? 'bg-white p-1' : ''}`}
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold border">
                                  {item.sender.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {item.sender}
                                </p>
                                <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                                  <span className="text-sm text-gray-500">
                                    {formatDate(item.date)}
                                  </span>
                                  <button className="text-gray-400 hover:text-yellow-400">
                                    <StarIcon className="h-5 w-5" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.subject}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {item.snippet}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ))}
              {emailData.total_count === 0 && !loading && serverStatus === 'running' && (
                <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                  No emails to display. Click "Refresh Emails" to fetch your inbox.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <EmailModal 
        email={selectedEmail} 
        onClose={() => setSelectedEmail(null)} 
      />
    </div>
  )
}

export default App 