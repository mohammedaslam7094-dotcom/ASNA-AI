'use client'

import { motion } from 'framer-motion'

export default function LoadingSkeleton() {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div className="flex-1 space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          <div className="h-4 bg-gray-800 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-gray-800 rounded w-1/2 animate-pulse"></div>
          <div className="h-4 bg-gray-800 rounded w-5/6 animate-pulse"></div>
        </motion.div>
      </div>
    </div>
  )
}

