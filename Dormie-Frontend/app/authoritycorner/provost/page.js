"use client"

import { Shield } from "lucide-react"

export default function ProvostDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Provost Dashboard</h1>
            <p className="text-purple-100 text-lg">Coming Soon...</p>
          </div>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <div className="py-16">
          <Shield className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Dashboard Under Development</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            This page is currently being developed. Check back later for provost dashboard features.
          </p>
        </div>
      </div>
    </div>
  )
}
