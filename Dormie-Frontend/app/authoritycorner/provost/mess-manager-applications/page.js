"use client"

import { useState, useEffect } from "react"
import { createApiUrl } from "../../../../lib/api"
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ChefHat,
  Calendar,
  Filter,
  Eye,
  UserCheck,
  UserX,
  RotateCcw,
} from "lucide-react"

export default function MessManagerApplications() {
  const [calls, setCalls] = useState([])
  const [selectedCall, setSelectedCall] = useState(null)
  const [applications, setApplications] = useState([])
  const [currentManagers, setCurrentManagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("all") // all, pending, accepted, rejected
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)

  useEffect(() => {
    fetchCalls()
  }, [])

  useEffect(() => {
    if (selectedCall) {
      fetchApplicationsForCall(selectedCall.callId)
      fetchCurrentManagers(selectedCall.callId)
    }
  }, [selectedCall])

  const fetchCalls = async () => {
    setLoading(true)
    setError("")

    const jwtToken = localStorage.getItem("jwtToken")
    if (!jwtToken) {
      setError("You are not logged in. Please log in to view applications.")
      setLoading(false)
      return
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    }

    try {
      const response = await fetch(createApiUrl("/api/mess-manager-calls"), {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setCalls(data || [])
      if (data && data.length > 0) {
        setSelectedCall(data[0]) // Auto-select first call
      }
    } catch (err) {
      console.error("Error fetching calls:", err)
      setError("Failed to fetch mess manager calls. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchApplicationsForCall = async (callId) => {
    const jwtToken = localStorage.getItem("jwtToken")
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    }

    try {
      const response = await fetch(createApiUrl(`/api/mess-manager-applications/call/${callId}`), {
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
      setError("Failed to fetch applications for this call.")
    }
  }

  const fetchCurrentManagers = async (callId) => {
    const jwtToken = localStorage.getItem("jwtToken")
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    }

    try {
      const response = await fetch(createApiUrl(`/api/mess-manager-applications/call/${callId}/current-managers`), {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setCurrentManagers(data || [])
    } catch (err) {
      console.error("Error fetching current managers:", err)
    }
  }

  const updateApplicationStatus = async (applicationId, status) => {
    setActionLoading(true)
    const jwtToken = localStorage.getItem("jwtToken")
    const headers = {
      "Content-Type": "text/plain",
      Authorization: `Bearer ${jwtToken}`,
    }

    try {
      const response = await fetch(createApiUrl(`/api/mess-manager-applications/${applicationId}/status`), {
        method: "PUT",
        headers,
        body: status,  // Send as plain text, not JSON
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Refresh applications
      await fetchApplicationsForCall(selectedCall.callId)
      await fetchCurrentManagers(selectedCall.callId)
      setShowApplicationModal(false)
    } catch (err) {
      console.error("Error updating application status:", err)
      setError("Failed to update application status.")
    } finally {
      setActionLoading(false)
    }
  }

  const endMonthForAll = async () => {
    if (!confirm("Are you sure you want to end the month for all current mess managers? This action cannot be undone.")) {
      return
    }

    setActionLoading(true)
    const jwtToken = localStorage.getItem("jwtToken")
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    }

    try {
      const response = await fetch(createApiUrl(`/api/mess-manager-applications/call/${selectedCall.callId}/end-month`), {
        method: "POST",
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      alert(`Month ended successfully! ${result.updatedManagers} managers updated.`)
      
      // Refresh data
      await fetchApplicationsForCall(selectedCall.callId)
      await fetchCurrentManagers(selectedCall.callId)
    } catch (err) {
      console.error("Error ending month:", err)
      setError("Failed to end month for managers.")
    } finally {
      setActionLoading(false)
    }
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

  const filteredApplications = applications.filter(app => {
    if (filter === "all") return true
    return app.status?.toLowerCase() === filter
  })

  const openApplicationModal = (application) => {
    setSelectedApplication(application)
    setShowApplicationModal(true)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <ChefHat className="h-8 w-8 text-orange-600 mr-4" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mess Manager Applications</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Review and manage mess manager applications
            </p>
          </div>
        </div>
      </div>

      {/* Call Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Select Call</h2>
          {loading ? (
            <div className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-20 rounded-lg"></div>
            </div>
          ) : calls.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No mess manager calls found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {calls.map((call) => (
                <div
                  key={call.callId}
                  onClick={() => setSelectedCall(call)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedCall?.callId === call.callId
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-orange-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Call #{call.callId}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      call.status === 'open' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {call.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Created: {formatDate(call.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Current Managers */}
      {selectedCall && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <UserCheck className="h-6 w-6 text-green-600 mr-2" />
                Current Mess Managers ({currentManagers.length})
              </h2>
              {currentManagers.length > 0 && (
                <button
                  onClick={endMonthForAll}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  End Month for All
                </button>
              )}
            </div>
            {currentManagers.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No current mess managers for this call.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentManagers.map((manager) => (
                  <div key={manager.applicationId} className="p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center mb-2">
                      <UserCheck className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-semibold text-gray-900 dark:text-white">Student #{manager.studentId}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Started: {formatDate(manager.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Applications */}
      {selectedCall && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <Users className="h-6 w-6 text-blue-600 mr-2" />
                Applications ({filteredApplications.length})
              </h2>
              <div className="flex items-center space-x-4">
                <Filter className="h-5 w-5 text-gray-600" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Applications</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="month_end">Completed</option>
                </select>
              </div>
            </div>

            {filteredApplications.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Applications Found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {filter === "all" ? "No applications for this call yet." : `No ${filter} applications found.`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <div
                    key={application.applicationId}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center mb-4 lg:mb-0">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-4">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Student #{application.studentId}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Applied: {formatDate(application.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(application.status)}
                        <button
                          onClick={() => openApplicationModal(application)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Application Review Modal */}
      {showApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Review Application #{selectedApplication.applicationId}
                </h2>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Student Information</h3>
                  <p className="text-gray-600 dark:text-gray-400">Student ID: {selectedApplication.studentId}</p>
                  <p className="text-gray-600 dark:text-gray-400">Applied: {formatDate(selectedApplication.createdAt)}</p>
                  <p className="text-gray-600 dark:text-gray-400">Status: {getStatusBadge(selectedApplication.status)}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Application Reason</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                      {selectedApplication.reason}
                    </p>
                  </div>
                </div>

                {selectedApplication.status?.toLowerCase() === "pending" && (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => updateApplicationStatus(selectedApplication.applicationId, "accepted")}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Accept Application
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(selectedApplication.applicationId, "rejected")}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <XCircle className="h-5 w-5 mr-2" />
                      Reject Application
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {error}
          </div>
        </div>
      )}
    </div>
  )
}
