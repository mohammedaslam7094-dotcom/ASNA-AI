'use client'

import { ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { storage } from '@/lib/storage'

const MODELS = [
  { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B', description: 'Most capable model' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', description: 'Fast and efficient' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'High quality responses' },
  { id: 'gemma-7b-it', name: 'Gemma 7B', description: 'Google\'s efficient model' },
]

const DEFAULT_MODEL = 'llama-3.1-8b-instant'

interface ModelSelectorProps {
  onModelChange?: (model: string) => void
}

export default function ModelSelector({ onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedModel = storage.getSelectedModel()
    setSelectedModel(savedModel)
    if (onModelChange) {
      onModelChange(savedModel)
    }
  }, [onModelChange])

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId)
    storage.setSelectedModel(modelId)
    setIsOpen(false)
    if (onModelChange) {
      onModelChange(modelId)
    }
  }

  const currentModel = MODELS.find((m) => m.id === selectedModel) || MODELS[0]

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-lg transition-all text-sm backdrop-blur-sm border border-gray-700/50 shadow-md"
      >
        <span className="text-gray-300">{currentModel.name}</span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full mt-2 right-0 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden"
            >
              <div className="p-2">
                {MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedModel === model.id
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs opacity-75">{model.description}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

