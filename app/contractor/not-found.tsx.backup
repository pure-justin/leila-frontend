'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Briefcase, ArrowLeft, Home, LayoutDashboard } from 'lucide-react'

export default function ContractorNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <Briefcase className="w-20 h-20 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-9xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">404</h1>
          </div>
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Contractor Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            The contractor page you're looking for doesn't exist or has been moved.
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
              href="/contractor/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              <LayoutDashboard className="w-5 h-5 mr-2" />
              Go to Dashboard
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </button>
          </div>
          
          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to home page
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12"
        >
          <p className="text-sm text-gray-500">
            Not a contractor yet? <Link href="/contractor/signup" className="text-indigo-600 hover:underline">Apply now</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}