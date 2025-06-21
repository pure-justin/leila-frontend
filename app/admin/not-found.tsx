'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, ArrowLeft, Home, Search } from 'lucide-react'

export default function AdminNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <Shield className="w-20 h-20 text-purple-500 mx-auto mb-4" />
            <h1 className="text-9xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">404</h1>
          </div>
          <h2 className="text-3xl font-semibold text-white mb-4">
            Admin Page Not Found
          </h2>
          <p className="text-gray-300 mb-8">
            The admin page you're looking for doesn't exist or you don't have permission to access it.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/admin/crm"
              className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              <Shield className="w-5 h-5 mr-2" />
              Go to CRM Dashboard
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-700 text-gray-200 font-medium rounded-lg hover:bg-gray-600 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </button>
          </div>
          
          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors duration-200"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to main site
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12"
        >
          <p className="text-sm text-gray-400">
            Need admin access? <Link href="/admin/login" className="text-purple-400 hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}