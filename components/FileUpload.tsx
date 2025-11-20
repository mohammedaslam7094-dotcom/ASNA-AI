'use client'

import { Upload, X, File, Image as ImageIcon } from 'lucide-react'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onFileRemove?: () => void
  selectedFile?: File | null
  maxSize?: number // in MB
}

export default function FileUpload({ onFileSelect, onFileRemove, selectedFile: externalFile, maxSize = 10 }: FileUploadProps) {
  const [internalFile, setInternalFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  
  const selectedFile = externalFile !== undefined ? externalFile : internalFile

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      if (externalFile === undefined) {
        setInternalFile(file)
      }
      onFileSelect(file)
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setPreview(null)
      }
    }
  }, [onFileSelect, externalFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: maxSize * 1024 * 1024,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.md', '.json'],
    },
    multiple: false,
  })

  const removeFile = () => {
    if (externalFile === undefined) {
      setInternalFile(null)
    }
    setPreview(null)
    if (onFileRemove) {
      onFileRemove()
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon size={20} />
    }
    return <File size={20} />
  }

  return (
    <div className="space-y-2">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-700 hover:border-gray-600'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2 text-center">
            <Upload size={24} className="text-gray-400" />
            <p className="text-sm text-gray-400">
              {isDragActive ? 'Drop file here' : 'Click or drag file to upload'}
            </p>
            <p className="text-xs text-gray-500">Max size: {maxSize}MB</p>
          </div>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative border border-gray-700 rounded-lg p-3 bg-gray-800"
          >
            {preview && (
              <div className="mb-2">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-32 rounded object-contain"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              {getFileIcon(selectedFile)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                onClick={removeFile}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <X size={16} className="text-gray-400" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

