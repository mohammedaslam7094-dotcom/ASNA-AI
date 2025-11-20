'use client'

import { User, Bot, Copy, Check } from 'lucide-react'
import { useState, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { motion } from 'framer-motion'
import MessageActions from './MessageActions'

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant'
    content: string
  }
  messageIndex: number
  onEdit?: (index: number, newContent: string) => void
  onDelete?: (index: number) => void
  onRegenerate?: () => void
}

export default function ChatMessage({ message, messageIndex, onEdit, onDelete, onRegenerate }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [showActions, setShowActions] = useState(false)
  
  // Generate a stable ID for this message's code blocks
  const messageId = useMemo(() => Math.random().toString(36).substr(2, 9), [message.content])

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // Parse message content to extract images
  const parseMessageContent = useMemo(() => {
    const content = message.content
    const imagePattern = /\[Image: ([^\]]+)\]\n(data:image\/[^;]+;base64,[^\s]+)/g
    const parts: Array<{ type: 'text' | 'image'; content: string; imageName?: string }> = []
    let lastIndex = 0
    let match

    while ((match = imagePattern.exec(content)) !== null) {
      // Add text before image
      if (match.index > lastIndex) {
        const textContent = content.substring(lastIndex, match.index).trim()
        if (textContent) {
          parts.push({ type: 'text', content: textContent })
        }
      }
      // Add image
      parts.push({
        type: 'image',
        content: match[2],
        imageName: match[1],
      })
      lastIndex = imagePattern.lastIndex
    }

    // Add remaining text
    if (lastIndex < content.length) {
      const textContent = content.substring(lastIndex).trim()
      if (textContent) {
        parts.push({ type: 'text', content: textContent })
      }
    }

    // If no images found, return original content as text
    if (parts.length === 0) {
      return [{ type: 'text' as const, content }]
    }

    return parts
  }, [message.content])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-4 mb-6 ${isUser ? 'flex-row-reverse' : ''}`}
      data-message-index={messageIndex}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-blue-600' : 'bg-gray-700'
        }`}
      >
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </motion.div>
      <div
        className={`flex-1 ${isUser ? 'text-right' : ''}`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          className={`inline-block rounded-lg max-w-3xl ${
            isUser
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 shadow-lg shadow-blue-500/20'
              : 'bg-transparent text-gray-100 px-1'
          }`}
        >
          {isUser ? (
            <div className="space-y-3">
              {parseMessageContent.map((part, idx) => {
                if (part.type === 'image') {
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-lg overflow-hidden my-2"
                    >
                      <img
                        src={part.content}
                        alt={part.imageName || 'Uploaded image'}
                        className="max-w-full h-auto rounded-lg"
                        style={{ maxHeight: '400px' }}
                      />
                      {part.imageName && (
                        <p className="text-xs text-blue-100 mt-1 opacity-75">{part.imageName}</p>
                      )}
                    </motion.div>
                  )
                }
                return (
                  <div key={idx} className="whitespace-pre-wrap break-words">
                    {part.content}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="prose prose-invert max-w-none leading-relaxed">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '')
                    const codeString = String(children).replace(/\n$/, '')
                    // Use a hash of the code content for stable ID
                    const codeHash = codeString.slice(0, 20).replace(/\s/g, '')
                    const codeId = `code-${messageId}-${codeHash}`
                    
                    return !inline && match ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="relative my-6"
                      >
                        <div className="flex items-center justify-between bg-[#1e1e1e] px-4 py-2.5 rounded-t-lg border-b border-gray-700/50">
                          <span className="text-xs text-gray-400 font-mono uppercase tracking-wide">
                            {match[1]}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => copyToClipboard(codeString, codeId)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-all rounded-md hover:bg-gray-800/50"
                            title="Copy code"
                          >
                            {copiedCode === codeId ? (
                              <>
                                <Check size={14} className="text-green-400" />
                                <span className="text-green-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={14} />
                                <span>Copy code</span>
                              </>
                            )}
                          </motion.button>
                        </div>
                        <div className="overflow-hidden rounded-b-lg">
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            className="!m-0 !bg-[#1e1e1e]"
                            customStyle={{
                              margin: 0,
                              padding: '1rem',
                              fontSize: '0.875rem',
                              lineHeight: '1.6',
                              fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', 'Menlo', 'Consolas', monospace",
                            }}
                            codeTagProps={{
                              style: {
                                fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', 'Menlo', 'Consolas', monospace",
                              }
                            }}
                            {...props}
                          >
                            {codeString}
                          </SyntaxHighlighter>
                        </div>
                      </motion.div>
                    ) : (
                      <code
                        className="bg-gray-900/60 px-1.5 py-0.5 rounded text-sm font-mono text-pink-400 font-medium"
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  },
                  p({ children }) {
                    return <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>
                  },
                  ul({ children }) {
                    return <ul className="list-disc list-outside mb-4 ml-6 space-y-2">{children}</ul>
                  },
                  ol({ children }) {
                    return <ol className="list-decimal list-outside mb-4 ml-6 space-y-2">{children}</ol>
                  },
                  li({ children }) {
                    return <li className="leading-relaxed">{children}</li>
                  },
                  h1({ children }) {
                    return <h1 className="text-2xl font-semibold mb-4 mt-6 first:mt-0 leading-tight">{children}</h1>
                  },
                  h2({ children }) {
                    return <h2 className="text-xl font-semibold mb-3 mt-5 first:mt-0 leading-tight">{children}</h2>
                  },
                  h3({ children }) {
                    return <h3 className="text-lg font-semibold mb-2 mt-4 first:mt-0 leading-tight">{children}</h3>
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote className="border-l-4 border-gray-600 pl-4 my-4 italic text-gray-300">
                        {children}
                      </blockquote>
                    )
                  },
                  a({ children, href }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                      >
                        {children}
                      </a>
                    )
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
          {showActions && (
            <MessageActions
              messageIndex={messageIndex}
              isUser={isUser}
              messageContent={message.content}
              onEdit={onEdit}
              onDelete={onDelete}
              onRegenerate={onRegenerate}
            />
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

