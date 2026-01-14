'use client'

import { useState, useRef, useEffect } from 'react'
import ChatMessage from '@/components/ChatMessage'
import Sidebar from '@/components/Sidebar'
import { Send, Menu, X, Download, Bot } from 'lucide-react'
import { storage, Chat } from '@/lib/storage'
import { v4 as uuidv4 } from 'uuid'
import ExportModal from '@/components/ExportModal'
import VoiceInput from '@/components/VoiceInput'
import FileUpload from '@/components/FileUpload'
import ModelSelector from '@/components/ModelSelector'
import SearchBar from '@/components/SearchBar'
import ShortcutsModal from '@/components/ShortcutsModal'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { motion } from 'framer-motion'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [showExportModal, setShowExportModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedModel, setSelectedModel] = useState(() => storage.getSelectedModel())
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [newMessageIndices, setNewMessageIndices] = useState<Set<number>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load chat history on mount
  useEffect(() => {
    const savedChats = storage.getChats()
    setChats(savedChats)
    const savedChatId = storage.getCurrentChatId()
    if (savedChatId) {
      const chat = storage.getChat(savedChatId)
      if (chat) {
        setCurrentChatId(chat.id)
        setMessages(chat.messages)
        // Clear new message indices when loading from history
        setNewMessageIndices(new Set())
      }
    }
  }, [])

  // Save chat when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const chatId = currentChatId || uuidv4()
      const title = messages[0]?.content?.slice(0, 50) || 'New Chat'
      const chat: Chat = {
        id: chatId,
        title,
        messages,
        createdAt: currentChatId ? storage.getChat(currentChatId)?.createdAt || Date.now() : Date.now(),
        updatedAt: Date.now(),
      }
      storage.saveChat(chat)
      storage.setCurrentChatId(chatId)
      setCurrentChatId(chatId)
      setChats(storage.getChats())
    }
  }, [messages, currentChatId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && !selectedFile) || isLoading) return

    let messageContent = input

    // Process file if selected
    if (selectedFile) {
      try {
        if (selectedFile.type.startsWith('image/')) {
          // Compress and resize image before converting to base64
          const compressedBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => {
              const img = new Image()
              img.onload = () => {
                const canvas = document.createElement('canvas')
                // More aggressive compression: max 512x512 pixels
                const MAX_WIDTH = 512
                const MAX_HEIGHT = 512
                let width = img.width
                let height = img.height

                // Calculate new dimensions
                if (width > height) {
                  if (width > MAX_WIDTH) {
                    height = (height * MAX_WIDTH) / width
                    width = MAX_WIDTH
                  }
                } else {
                  if (height > MAX_HEIGHT) {
                    width = (width * MAX_HEIGHT) / height
                    height = MAX_HEIGHT
                  }
                }

                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext('2d')
                if (!ctx) {
                  reject(new Error('Could not get canvas context'))
                  return
                }
                ctx.drawImage(img, 0, 0, width, height)

                // More aggressive compression: quality 0.5 and try different formats
                let compressedBase64 = canvas.toDataURL('image/jpeg', 0.5)

                // If still too large, try even lower quality
                if (compressedBase64.length > 50000) {
                  compressedBase64 = canvas.toDataURL('image/jpeg', 0.3)
                }

                resolve(compressedBase64)
              }
              img.onerror = reject
              img.src = reader.result as string
            }
            reader.onerror = reject
            reader.readAsDataURL(selectedFile)
          })

          // Only include image if it's reasonably sized (less than 50KB base64 to stay within token limits)
          // Base64 is ~4/3 the size of binary, so 50KB base64 ≈ 37KB binary ≈ ~9,000 tokens
          if (compressedBase64.length < 50000) {
            messageContent = `${input ? input + '\n\n' : ''}[Image: ${selectedFile.name}]\n${compressedBase64}`
          } else {
            // If still too large, just describe it without the image data
            messageContent = `${input ? input + '\n\n' : ''}[Image attached: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(2)} KB). The image appears to be too large to send directly. Please describe what you see in the image or ask a specific question about it.]`
          }
        } else if (selectedFile.type.startsWith('text/') || selectedFile.name.endsWith('.md') || selectedFile.name.endsWith('.txt')) {
          // Read text file content
          const text = await selectedFile.text()
          messageContent = `${input ? input + '\n\n' : ''}[File: ${selectedFile.name}]\n${text}`
        } else {
          // For other file types, just mention the file
          messageContent = `${input ? input + '\n\n' : ''}[File attached: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(2)} KB)]`
        }
      } catch (error) {
        console.error('Error processing file:', error)
        messageContent = input || `[Error reading file: ${selectedFile.name}]`
      }
    }

    const userMessage: Message = { role: 'user', content: messageContent }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setSelectedFile(null) // Clear file after sending
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model: selectedModel,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      if (data.error) {
        throw new Error(data.error)
      }

      setMessages((prev) => {
        const newIndex = prev.length
        // Mark the new assistant message as new for typing animation
        setNewMessageIndices((prevIndices) => {
          const newSet = new Set(prevIndices)
          newSet.add(newIndex)
          return newSet
        })
        return [...prev, { role: 'assistant', content: data.message }]
      })
    } catch (error: any) {
      console.error('Error:', error)
      const errorMessage = error.message || 'Sorry, I encountered an error. Please try again.'
      setMessages((prev) => {
        const newIndex = prev.length
        // Mark error message as new for typing animation
        setNewMessageIndices((prevIndices) => {
          const newSet = new Set(prevIndices)
          newSet.add(newIndex)
          return newSet
        })
        return [
          ...prev,
          { role: 'assistant', content: `Error: ${errorMessage}` },
        ]
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setInput('')
    setCurrentChatId(null)
    setNewMessageIndices(new Set())
    storage.setCurrentChatId(null)
  }

  const handleLoadChat = (chatId: string) => {
    const chat = storage.getChat(chatId)
    if (chat) {
      setCurrentChatId(chat.id)
      setMessages(chat.messages)
      // Clear new message indices when loading from history
      setNewMessageIndices(new Set())
      storage.setCurrentChatId(chat.id)
      setSidebarOpen(false)
    }
  }

  const handleDeleteChat = (chatId: string) => {
    storage.deleteChat(chatId)
    setChats(storage.getChats())
    if (currentChatId === chatId) {
      handleNewChat()
    }
  }

  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [input])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        handleNewChat()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        setShowShortcuts(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-gray-100 overflow-x-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        chats={chats}
        currentChatId={currentChatId}
        onLoadChat={handleLoadChat}
        onDeleteChat={handleDeleteChat}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="fixed lg:static top-0 left-0 right-0 lg:right-auto z-30 border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-sm p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-xl font-semibold">ASNA GPT</h1>
          </div>
          <div className="flex items-center gap-3">
            <SearchBar
              chats={chats}
              currentMessages={messages}
              onSearchResult={(chatId, messageIndex) => {
                if (chatId) {
                  handleLoadChat(chatId)
                }
                if (messageIndex !== null) {
                  setTimeout(() => {
                    const element = document.querySelector(`[data-message-index="${messageIndex}"]`)
                    element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }, 100)
                }
              }}
            />
            <ModelSelector onModelChange={setSelectedModel} />
            {messages.length > 0 && (
              <button
                onClick={() => setShowExportModal(true)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
                title="Export chat"
              >
                <Download size={18} />
              </button>
            )}
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 pt-28 lg:pt-6" style={{ paddingBottom: '140px' }}>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-6 max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <Bot size={32} className="text-white" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold">Hello! I'm ASNA</h2>
                  <p className="text-lg text-gray-300">
                    An AI Assistant created by <span className="font-semibold text-blue-400">Aslam</span>
                  </p>
                  <p className="text-gray-400 mt-4">How can I help you today?</p>
                  <p className="text-sm text-gray-500">Start a conversation by typing a message below.</p>
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="max-w-full lg:max-w-3xl mx-auto w-full pt-2">
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  message={message}
                  messageIndex={index}
                  isNew={newMessageIndices.has(index)}
                  onEdit={(idx, newContent) => {
                    const newMessages = [...messages]
                    newMessages[idx] = { ...newMessages[idx], content: newContent }
                    setMessages(newMessages)
                    // Remove from new indices when edited
                    setNewMessageIndices((prev) => {
                      const next = new Set(prev)
                      next.delete(idx)
                      return next
                    })
                  }}
                  onDelete={(idx) => {
                    const newMessages = messages.filter((_, i) => i !== idx)
                    setMessages(newMessages)
                    // Remove from new indices and adjust indices
                    setNewMessageIndices((prev) => {
                      const next = new Set<number>()
                      prev.forEach((i) => {
                        if (i < idx) {
                          next.add(i)
                        } else if (i > idx) {
                          next.add(i - 1)
                        }
                      })
                      return next
                    })
                  }}
                  onRegenerate={async () => {
                    if (index > 0) {
                      const messagesToRegenerate = messages.slice(0, index)
                      setIsLoading(true)
                      try {
                        const response = await fetch('/api/chat', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ messages: messagesToRegenerate, model: selectedModel }),
                        })
                        const data = await response.json()
                        if (response.ok && !data.error) {
                          const newMessages = [...messagesToRegenerate, { role: 'assistant' as const, content: data.message }]
                          setMessages(newMessages)
                          // Mark regenerated message as new
                          setNewMessageIndices(new Set([messagesToRegenerate.length]))
                        }
                      } catch (error) {
                        console.error('Regenerate error:', error)
                      } finally {
                        setIsLoading(false)
                      }
                    }
                  }}
                />
              ))}
              {isLoading && <LoadingSkeleton />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Input */}
        <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 right-0 lg:left-64 border-t border-gray-800/50 bg-gray-900/50 backdrop-blur-sm p-3 sm:p-4 shadow-2xl z-[100]">
          <div className="max-w-3xl mx-auto space-y-3">
            {/* Temporarily hidden: File upload preview */}
            {false && selectedFile && (
              <div className="px-2">
                <FileUpload
                  selectedFile={selectedFile}
                  onFileSelect={(file) => setSelectedFile(file)}
                  onFileRemove={() => setSelectedFile(null)}
                />
              </div>
            )}
            <div className="flex items-end gap-2 sm:gap-3">
              <div className="flex-1 relative min-w-0">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    adjustTextareaHeight()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                  placeholder="Message ASNA GPT..."
                  className="w-full bg-gray-800/80 border border-gray-700/50 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-100 placeholder-gray-400 backdrop-blur-sm shadow-inner text-sm sm:text-base"
                  rows={1}
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Temporarily hidden: File upload button */}
                {false && !selectedFile && (
                  <FileUpload
                    onFileSelect={(file) => setSelectedFile(file)}
                  />
                )}
                {/* Temporarily hidden: Voice input */}
                {false && (
                  <VoiceInput
                    onTranscript={(text) => {
                      setInput(text)
                      adjustTextareaHeight()
                    }}
                  />
                )}
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 sm:p-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg transition-all flex-shrink-0 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-95"
                  aria-label="Send message"
                >
                  <Send size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2 px-2">
            ASNA GPT can make mistakes. Check important info.
          </p>
        </form>

        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          messages={messages}
          chatTitle={currentChatId ? storage.getChat(currentChatId)?.title || 'Chat' : 'Chat'}
        />

        <ShortcutsModal
          isOpen={showShortcuts}
          onClose={() => setShowShortcuts(false)}
        />
      </div>
    </div>
  )
}

