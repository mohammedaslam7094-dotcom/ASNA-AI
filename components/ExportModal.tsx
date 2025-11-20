'use client'

import { X, FileText, Download } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import jsPDF from 'jspdf'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  messages: Message[]
  chatTitle?: string
}

export default function ExportModal({ isOpen, onClose, messages, chatTitle = 'Chat' }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'txt'>('pdf')

  const exportAsText = () => {
    const content = messages
      .map((msg) => `${msg.role === 'user' ? 'You' : 'Assistant'}: ${msg.content}\n`)
      .join('\n')
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${chatTitle}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportAsPDF = () => {
    const doc = new jsPDF()
    let y = 20
    const pageHeight = doc.internal.pageSize.height
    const margin = 20
    const maxWidth = doc.internal.pageSize.width - 2 * margin

    doc.setFontSize(16)
    doc.text(chatTitle, margin, y)
    y += 10

    doc.setFontSize(10)
    messages.forEach((msg) => {
      const role = msg.role === 'user' ? 'You' : 'Assistant'
      const content = msg.content

      // Check if we need a new page
      if (y > pageHeight - 30) {
        doc.addPage()
        y = 20
      }

      // Add role label
      doc.setFont('helvetica', 'bold')
      doc.text(role + ':', margin, y)
      y += 7

      // Split content into lines
      const lines = doc.splitTextToSize(content, maxWidth)
      
      doc.setFont('helvetica', 'normal')
      lines.forEach((line: string) => {
        if (y > pageHeight - 20) {
          doc.addPage()
          y = 20
        }
        doc.text(line, margin + 5, y)
        y += 7
      })
      y += 5
    })

    doc.save(`${chatTitle}.pdf`)
  }

  const handleExport = () => {
    if (exportFormat === 'pdf') {
      exportAsPDF()
    } else {
      exportAsText()
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Export Chat</h2>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Export Format</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setExportFormat('pdf')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                        exportFormat === 'pdf'
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <FileText size={18} />
                      <span>PDF</span>
                    </button>
                    <button
                      onClick={() => setExportFormat('txt')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                        exportFormat === 'txt'
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <FileText size={18} />
                      <span>Text</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExport}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Export
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

