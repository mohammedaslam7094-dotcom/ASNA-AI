'use client'

import { Edit, Trash2, RotateCcw, Check, X } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface MessageActionsProps {
  messageIndex: number
  isUser: boolean
  messageContent: string
  onEdit?: (index: number, newContent: string) => void
  onDelete?: (index: number) => void
  onRegenerate?: () => void
}

export default function MessageActions({
  messageIndex,
  isUser,
  messageContent,
  onEdit,
  onDelete,
  onRegenerate,
}: MessageActionsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const handleEditClick = () => {
    setEditValue(messageContent)
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    if (onEdit && editValue.trim()) {
      onEdit(messageIndex, editValue)
      setIsEditing(false)
      setEditValue('')
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditValue('')
  }

  const handleDeleteClick = () => {
    if (showConfirm && onDelete) {
      onDelete(messageIndex)
      setShowConfirm(false)
    } else {
      setShowConfirm(true)
      setTimeout(() => setShowConfirm(false), 3000)
    }
  }

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 mt-2"
      >
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm resize-none"
          rows={2}
          autoFocus
        />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSaveEdit}
          className="p-1 text-green-400 hover:bg-gray-700 rounded"
        >
          <Check size={16} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleCancelEdit}
          className="p-1 text-red-400 hover:bg-gray-700 rounded"
        >
          <X size={16} />
        </motion.button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-1 mt-2"
    >
      {isUser && onEdit && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleEditClick}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="Edit message"
        >
          <Edit size={14} />
        </motion.button>
      )}
      {!isUser && onRegenerate && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRegenerate}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="Regenerate response"
        >
          <RotateCcw size={14} />
        </motion.button>
      )}
      {onDelete && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleDeleteClick}
          className={`p-1.5 rounded transition-colors ${
            showConfirm
              ? 'text-red-400 bg-red-900/20'
              : 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
          }`}
          title={showConfirm ? 'Click again to confirm' : 'Delete message'}
        >
          <Trash2 size={14} />
        </motion.button>
      )}
    </motion.div>
  )
}

