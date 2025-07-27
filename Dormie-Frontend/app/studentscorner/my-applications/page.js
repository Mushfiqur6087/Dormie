"use client"

import { useState, useEffect } from "react"
import { createApiUrl } from "../../../lib/api"
import {
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  ChefHat,
} from "lucide-react"

export default function MyApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchMyApplications()
  }, [])

  const fetchMyApplications = async () => {
    setLoading(true)
    setError("")

    const jwtToken = localStorage.getItem("jwtToken")
    const studentId = localStorage.getItem("userId")

    if (!jwtToken || !studentId) {
      setError("You are not logged in. Please log in to view your applications.")
      setLoading(false)
      return
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    }

    try {
      const response = await fetch(createApiUrl(`/api/mess-manager-applications/my-applications/${studentId}`), {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setApplications(data || [])
    } catch (err) {
      console.error("Error fetching applications:", err)
      setError("Failed to fetch your applications. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status) => {
    const statusInfo = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        text: "Pending",
        icon: Clock
      },
      accepted: {
        color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        text: "Accepted",
        icon: CheckCircle
      },
      rejected: {
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        text: "Rejected",
        icon: XCircle
      },
      month_end: {
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        text: "Completed",
        icon: CheckCircle
      },
    }

    const info = statusInfo[status?.toLowerCase()] || statusInfo.pending
    const IconComponent = info.icon

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${info.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {info.text}
      </span>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <FileText className="h-8 w-8 text-blue-600 mr-4" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Applications</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View your mess manager application history and status
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="p-8">
          <div className="flex items-center mb-6">
            <ChefHat className="h-6 w-6 text-orange-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Application History</h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Applications</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button
                onClick={fetchMyApplications}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Applications Yet</h3>
              <p className="text-gray-600 dark:text-gray-400">
                You haven't submitted any mess manager applications yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {applications.map((application) => (
                <div
                  key={application.applicationId}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div className="flex items-center mb-2 lg:mb-0">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mr-4">
                        <ChefHat className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Application #{application.applicationId}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Call #{application.callId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(application.status)}
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Applied on</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(application.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Application Reason */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Application Reason</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {application.reason}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Information */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    {application.status?.toLowerCase() === "pending" && (
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Application Under Review
                          </p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Your application is being reviewed by the provost. You will be notified once a decision is made.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {application.status?.toLowerCase() === "accepted" && (
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            Application Accepted!
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Congratulations! You have been selected as a mess manager. You cannot apply for other positions while serving.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {application.status?.toLowerCase() === "rejected" && (
                      <div className="flex items-start">
                        <XCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-800 dark:text-red-200">
                            Application Not Selected
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            Unfortunately, your application was not selected this time. You can apply for future positions.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {application.status?.toLowerCase() === "month_end" && (
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Service Completed
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            You have successfully completed your mess manager duties. You can now apply for new positions.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
