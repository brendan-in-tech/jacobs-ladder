import React, { useState, useEffect } from 'react'
import { EnvelopeIcon, PaperAirplaneIcon, CalendarIcon, StarIcon } from '@heroicons/react/24/outline'
import EmailModal from './components/EmailModal'
import EmailThread from './components/EmailThread'
import Login from './components/Login'

function App() {
  const [threads, setThreads] = useState(() => {
    // Initialize from localStorage if available
    const savedThreads = localStorage.getItem('email_threads')
    return savedThreads ? JSON.parse(savedThreads) : []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [serverStatus, setServerStatus] = useState('checking')
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [lastCheck, setLastCheck] = useState(Date.now())
  const [expandedThreads, setExpandedThreads] = useState([])

  // Save threads to localStorage whenever they change
  useEffect(() => {
    if (threads.length > 0) {
      localStorage.setItem('email_threads', JSON.stringify(threads))
    }
  }, [threads])

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
        if (data.has_new && data.new_threads) {
          // Add new threads to the beginning of the list
          setThreads(prevThreads => {
            const newThreads = data.new_threads
            const existingThreadIds = new Set(prevThreads.map(thread => thread.threadId))
            const uniqueNewThreads = newThreads.filter(thread => !existingThreadIds.has(thread.threadId))
            return [...uniqueNewThreads, ...prevThreads]
          })
        }
        setLastCheck(Date.now())
      } catch (err) {
        console.error('Error checking for new emails:', err)
      }
    }

    const interval = setInterval(checkNewEmails, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [user])

  // Clear threads from localStorage on logout
  const handleLogout = async () => {
    await fetch('http://localhost:5001/logout', {
      method: 'POST',
      credentials: 'include',
    })
    setUser(null)
    setThreads([])
    setSelectedEmail(null)
    setExpandedThreads([])
    localStorage.removeItem('email_threads')
  }

  // Format date for email list
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
          // Always fetch threads after login
          fetchThreads()
        }
        setAuthLoading(false)
      })
      .catch(() => setAuthLoading(false))
  }, [])

  const handleLogin = (user) => {
    setUser(user)
    setError(null)
    // Always fetch threads after login
    fetchThreads()
  }

  const fetchThreads = async () => {
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
      
      // Validate that we received thread data
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected array of threads')
      }
      
      // Validate thread structure
      const validThreads = data.filter(thread => 
        thread && 
        thread.threadId && 
        Array.isArray(thread.messages) && 
        thread.latestMessage
      )
      
      if (validThreads.length !== data.length) {
        console.warn('Some threads were invalid and have been filtered out')
      }
      
      setThreads(validThreads)
    } catch (err) {
      console.error('Error fetching threads:', err)
      if (err.message.includes('Failed to fetch')) {
        setError('Unable to connect to the server. Please make sure the backend is running on port 5001.')
      } else {
        setError(err.message || 'Failed to fetch threads. Please try again.')
      }
    }
    setLoading(false)
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
                onClick={fetchThreads}
                disabled={loading || serverStatus !== 'running'}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                style={{height: '40px'}}
              >
                {loading ? 'Loading...' : 'Refresh Emails'}
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                style={{height: '40px'}}
              >
                Logout
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Email List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {loading ? (
              <div className="px-4 py-8 text-center">
                <div className="inline-flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">Loading mail...</span>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {threads.map((thread) => (
                  <li key={thread.threadId}>
                    <EmailThread
                      thread={thread}
                      expandedThreads={expandedThreads}
                      setExpandedThreads={setExpandedThreads}
                    />
                  </li>
                ))}
                {threads.length === 0 && !loading && serverStatus === 'running' && (
                  <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                    No emails to display. Click "Refresh Emails" to fetch your inbox.
                  </li>
                )}
              </ul>
            )}
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