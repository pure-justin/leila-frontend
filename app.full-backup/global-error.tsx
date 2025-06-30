'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mb-6 shadow-lg">
                  <AlertTriangle className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
                  Oops! Something went wrong
                </h1>
                <p className="text-gray-600 text-lg">
                  We encountered an unexpected error. Our team has been notified and is working on it.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-4"
            >
              <button
                onClick={reset}
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try again
              </button>
              
              <div>
                <a
                  href="/"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-800 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-md border border-gray-200"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Go home
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-12"
            >
              <p className="text-sm text-gray-500">
                Error ID: {error.digest || 'Unknown'}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                If this problem persists, please contact support
              </p>
            </motion.div>
          </div>
        </div>
      </body>
    </html>
  )
}