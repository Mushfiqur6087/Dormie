"use client"

import { useState, useEffect } from "react"
import { createApiUrl } from "../../../lib/api"
import {
  ChefHat,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Info,
  XCircle,
  X,
  Send,
} from "lucide-react"

export default function MessManagerCalls() {
  const [calls, setCalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [canApply, setCanApply] = useState(true)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedCall, setSelectedCall] = useState(null)
  const [applicationReason, setApplicationReason] = useState("")
  const [submittingApplication, setSubmittingApplication] = useState(false)
  const [applicationMessage, setApplicationMessage] = useState("")

  useEffect(() => {
    fetchMessManagerCalls()
    checkCanApply()
  }, [])

  const fetchMessManagerCalls = async () => {
    setLoading(true)
    setError("")

    const jwtToken = localStorage.getItem("jwtToken")
    if (!jwtToken) {
      setError("You are not logged in. Please log in to view mess manager calls.")
      setLoading(false)
      return
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    }

    try {
      // Fetch all calls (both active and inactive for reference)
      const response = await fetch(createApiUrl("/api/mess-manager-calls"), {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setCalls(data || [])
    } catch (err) {
      console.error("Error fetching mess manager calls:", err)
      setError("Failed to fetch mess manager calls. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const checkCanApply = async () => {
    const jwtToken = localStorage.getItem("jwtToken")
    const studentId = localStorage.getItem("userId")
    
    if (!jwtToken || !studentId) {
      setCanApply(false)
      return
    }

    try {
      const response = await fetch(createApiUrl(`/api/mess-manager-applications/can-apply/${studentId}`), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCanApply(data.canApply)
      }
    } catch (err) {
      console.error("Error checking application eligibility:", err)
      setCanApply(false)
    }
  }

  const openApplicationModal = (call) => {
    setSelectedCall(call)
    setApplicationReason("")
    setApplicationMessage("")
    setShowApplicationModal(true)
  }

  const closeApplicationModal = () => {
    setShowApplicationModal(false)
    setSelectedCall(null)
    setApplicationReason("")
    setApplicationMessage("")
  }

  const submitApplication = async () => {
    if (!selectedCall || !applicationReason.trim()) {
      setApplicationMessage("Please provide a reason for your application.")
      return
    }

    if (applicationReason.trim().length < 100) {
      setApplicationMessage("Reason must be at least 100 characters long.")
      return
    }

    setSubmittingApplication(true)
    setApplicationMessage("")

    const jwtToken = localStorage.getItem("jwtToken")
    const studentId = localStorage.getItem("userId")

    try {
      const response = await fetch(createApiUrl("/api/mess-manager-applications/apply"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          callId: selectedCall.callId,
          studentId: parseInt(studentId),
          reason: applicationReason.trim(),
        }),
      })

      if (response.ok) {
        setApplicationMessage("Application submitted successfully!")
        setCanApply(false) // Update can apply status
        setTimeout(() => {
          closeApplicationModal()
        }, 2000)
      } else {
        const errorData = await response.json()
        setApplicationMessage(errorData.message || "Failed to submit application.")
      }
    } catch (err) {
      console.error("Error submitting application:", err)
      setApplicationMessage("Failed to submit application. Please try again.")
    } finally {
      setSubmittingApplication(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (status) => {
    const statusInfo = {
      active: {
        color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        text: "Active",
        icon: CheckCircle
      },
      expired: {
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        text: "Expired",
        icon: XCircle
      },
      completed: {
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        text: "Completed",
        icon: CheckCircle
      },
    }

    const info = statusInfo[status?.toLowerCase()] || statusInfo.active
    const IconComponent = info.icon

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${info.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {info.text}
      </span>
    )
  }

  const getDaysRemaining = (applicationEndDate) => {
    const today = new Date()
    const endDate = new Date(applicationEndDate)
    const diffTime = endDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`
    } else if (diffDays === 0) {
      return "Last day to apply!"
    } else {
      return "Application period ended"
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <ChefHat className="h-8 w-8 text-orange-600 mr-4" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mess Manager Calls</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View available mess manager positions and application details
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="p-8">
          <div className="flex items-center mb-6">
            <Info className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Available Positions</h2>
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
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Calls</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button
                onClick={fetchMessManagerCalls}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : calls.length === 0 ? (
            <div className="text-center py-12">
              <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Calls Available</h3>
              <p className="text-gray-600 dark:text-gray-400">
                There are currently no mess manager calls. Check back later for new opportunities.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {calls.map((call, index) => (
                <div
                  key={call.callId}
                  className={`border rounded-xl p-6 transition-all duration-200 ${
                    call.status?.toLowerCase() === "active"
                      ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                      : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div className="flex items-center mb-2 lg:mb-0">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mr-4">
                        Call #{call.callId} - Year {call.year}
                      </h3>
                      {getStatusBadge(call.status)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-1" />
                      Created on {formatDate(call.createdAt)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Application Deadline */}
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center mb-2">
                        <Clock className="h-5 w-5 text-red-600 mr-2" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Application Deadline</h4>
                      </div>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        {formatDate(call.applicationEndDate)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {getDaysRemaining(call.applicationEndDate)}
                      </p>
                    </div>

                    {/* Activity Period */}
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Activity Period</h4>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(call.managerActivityStartDate)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">to</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(call.managerActivityEndDate)}
                      </p>
                    </div>

                    {/* Max Managers */}
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center mb-2">
                        <Users className="h-5 w-5 text-green-600 mr-2" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Max Managers</h4>
                      </div>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {call.maxManagers}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">positions available</p>
                    </div>

                    {/* Action Button */}
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                      {call.status?.toLowerCase() === "active" && canApply ? (
                        <button 
                          onClick={() => openApplicationModal(call)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Apply Now
                        </button>
                      ) : call.status?.toLowerCase() === "active" && !canApply ? (
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Cannot Apply</p>
                          <p className="text-xs text-orange-600 dark:text-orange-400">
                            You have a pending application or are already a mess manager
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Status</p>
                          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                            {call.status?.charAt(0)?.toUpperCase() + call.status?.slice(1)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Info */}
                  {call.status?.toLowerCase() === "active" && (
                    <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                            Application Open!
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            This position is currently accepting applications. Don't miss the deadline on{" "}
                            <span className="font-semibold">{formatDate(call.applicationEndDate)}</span>.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Application Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <ChefHat className="h-6 w-6 text-orange-600 mr-3" />
                  Apply for Mess Manager
                </h2>
                <button
                  onClick={closeApplicationModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Call Information */}
              {selectedCall && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Call #{selectedCall.callId} - Year {selectedCall.year}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Application Deadline:</span>
                      <p className="text-gray-900 dark:text-white">{formatDate(selectedCall.applicationEndDate)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Max Managers:</span>
                      <p className="text-gray-900 dark:text-white">{selectedCall.maxManagers}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Application Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Why do you want to be a mess manager? *
                  </label>
                  <textarea
                    value={applicationReason}
                    onChange={(e) => setApplicationReason(e.target.value)}
                    placeholder="Please provide a detailed reason for your application (minimum 100 characters)..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white resize-none"
                    rows={8}
                    disabled={submittingApplication}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {applicationReason.length}/100 characters minimum
                    </p>
                    {applicationReason.length >= 100 && (
                      <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Minimum length met
                      </span>
                    )}
                  </div>
                </div>

                {/* Application Message */}
                {applicationMessage && (
                  <div className={`p-4 rounded-lg ${
                    applicationMessage.includes("successfully") 
                      ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400"
                      : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400"
                  }`}>
                    <div className="flex items-center">
                      {applicationMessage.includes("successfully") ? (
                        <CheckCircle className="h-5 w-5 mr-2" />
                      ) : (
                        <AlertCircle className="h-5 w-5 mr-2" />
                      )}
                      <p>{applicationMessage}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={closeApplicationModal}
                  disabled={submittingApplication}
                  className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitApplication}
                  disabled={submittingApplication || applicationReason.trim().length < 100}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>{submittingApplication ? "Submitting..." : "Submit Application"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
