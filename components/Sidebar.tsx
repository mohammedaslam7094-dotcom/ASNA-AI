'use client'

import { useState } from 'react'
import { Plus, MessageSquare, X, Trash2 } from 'lucide-react'
import { Chat } from '@/lib/storage'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeSwitcher from './ThemeSwitcher'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onNewChat: () => void
  chats: Chat[]
  currentChatId: string | null
  onLoadChat: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
}

export default function Sidebar({ isOpen, onClose, onNewChat, chats, currentChatId, onLoadChat, onDeleteChat }: SidebarProps) {
  const [hoveredChat, setHoveredChat] = useState<string | null>(null)

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gray-800 to-gray-900 border-r border-gray-700/50 backdrop-blur-sm shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNewChat}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all shadow-lg shadow-blue-500/20 w-full font-medium"
            >
              <Plus size={18} />
              <span>New chat</span>
            </motion.button>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors ml-2"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-2">
            {chats.length === 0 ? (
              <div className="text-gray-400 text-sm p-4 text-center">
                No chat history yet
              </div>
            ) : (
              <div className="space-y-1">
                <AnimatePresence>
                  {chats.map((chat) => (
                    <motion.div
                      key={chat.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="group relative"
                      onMouseEnter={() => setHoveredChat(chat.id)}
                      onMouseLeave={() => setHoveredChat(null)}
                    >
                      <button
                        onClick={() => onLoadChat(chat.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                          currentChatId === chat.id
                            ? 'bg-gray-700 text-white'
                            : 'hover:bg-gray-700 text-gray-300'
                        }`}
                      >
                        <MessageSquare size={18} className="text-gray-400 flex-shrink-0" />
                        <span className="text-sm truncate flex-1">{chat.title}</span>
                        {hoveredChat === chat.id && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteChat(chat.id)
                            }}
                            className="p-1 hover:bg-gray-600 rounded transition-colors"
                            aria-label="Delete chat"
                          >
                            <Trash2 size={14} className="text-red-400" />
                          </motion.button>
                        )}
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700 space-y-3">
            <div className="flex items-center justify-center">
              <ThemeSwitcher />
            </div>
            <div className="text-xs text-gray-400 text-center">
              <p>ASNA GPT</p>
              <p className="mt-1">Version 2.0.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

