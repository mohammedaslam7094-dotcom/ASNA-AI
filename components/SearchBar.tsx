'use client'

import { Search, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Chat } from '@/lib/storage'

interface SearchBarProps {
  chats: Chat[]
  currentMessages: Array<{ role: 'user' | 'assistant'; content: string }>
  onSearchResult?: (chatId: string | null, messageIndex: number | null) => void
}

export default function SearchBar({ chats, currentMessages, onSearchResult }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<Array<{
    chatId: string | null
    chatTitle: string
    messageIndex: number
    content: string
    role: 'user' | 'assistant'
  }>>([])

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setResults([])
      return
    }

    const query = searchQuery.toLowerCase()
    const searchResults: typeof results = []

    // Search in current messages
    currentMessages.forEach((msg, index) => {
      if (msg.content.toLowerCase().includes(query)) {
        searchResults.push({
          chatId: null,
          chatTitle: 'Current Chat',
          messageIndex: index,
          content: msg.content,
          role: msg.role,
        })
      }
    })

    // Search in chat history
    chats.forEach((chat) => {
      chat.messages.forEach((msg, index) => {
        if (msg.content.toLowerCase().includes(query)) {
          searchResults.push({
            chatId: chat.id,
            chatTitle: chat.title,
            messageIndex: index,
            content: msg.content,
            role: msg.role,
          })
        }
      })
    })

    setResults(searchResults.slice(0, 10)) // Limit to 10 results
  }, [searchQuery, chats, currentMessages])

  const handleResultClick = (chatId: string | null, messageIndex: number) => {
    if (onSearchResult) {
      onSearchResult(chatId, messageIndex)
    }
    setIsOpen(false)
    setSearchQuery('')
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(!isOpen)
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl mx-4"
            >
              <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
                <div className="flex items-center gap-3 p-4 border-b border-gray-700">
                  <Search size={20} className="text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations... (Press Esc to close)"
                    className="flex-1 bg-transparent outline-none text-gray-100 placeholder-gray-500"
                    autoFocus
                  />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <X size={18} className="text-gray-400" />
                  </button>
                </div>
                {results.length > 0 && (
                  <div className="max-h-96 overflow-y-auto">
                    {results.map((result, index) => (
                      <motion.button
                        key={`${result.chatId}-${result.messageIndex}-${index}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleResultClick(result.chatId, result.messageIndex)}
                        className="w-full text-left p-4 hover:bg-gray-700 border-b border-gray-700 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            result.role === 'user' ? 'bg-blue-500' : 'bg-gray-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-400 mb-1">{result.chatTitle}</div>
                            <div className="text-sm text-gray-300 line-clamp-2">
                              {result.content.slice(0, 150)}
                              {result.content.length > 150 && '...'}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
                {searchQuery.length >= 2 && results.length === 0 && (
                  <div className="p-8 text-center text-gray-400">
                    No results found
                  </div>
                )}
                {searchQuery.length < 2 && (
                  <div className="p-8 text-center text-gray-400">
                    Type at least 2 characters to search
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-lg transition-all text-sm text-gray-400 backdrop-blur-sm border border-gray-700/50 shadow-md"
        title="Search (Ctrl/Cmd + K)"
      >
        <Search size={16} />
        <span className="hidden md:inline">Search</span>
      </button>
    </>
  )
}

