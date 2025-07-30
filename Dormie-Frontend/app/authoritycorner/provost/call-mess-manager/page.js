"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { createApiUrl } from "../../../../lib/api"
import {
  ChefHat,
  Save,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  List,
  Eye,
  Users,
  Info,
  XCircle,
} from "lucide-react"

export default function CallMessManager() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm()
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [diningFees, setDiningFees] = useState([])
  const [diningFeesLoading, setDiningFeesLoading] = useState(true)
  const [diningFeesError, setDiningFeesError] = useState("")
  const [existingCalls, setExistingCalls] = useState([])
  const [callsLoading, setCallsLoading] = useState(true)
  const [callsError, setCallsError] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState({})
  const router = useRouter()

  // Watch selected dining fee to auto-fill dates
  const selectedDiningFeeId = watch("diningFeeId")
  const currentYear = watch("year")
  const currentStartDate = watch("managerActivityStartDate")
  const currentEndDate = watch("managerActivityEndDate")

  // Fetch dining fees and existing calls
  useEffect(() => {
    fetchDiningFees()
    fetchExistingCalls()
    
    // Debug: Test basic connectivity
    testConnectivity()
  }, [])

  // Auto-fill dates and year when dining fee is selected
  useEffect(() => {
    if (selectedDiningFeeId) {
      const selectedFee = diningFees.find(fee => fee.id === parseInt(selectedDiningFeeId))
      if (selectedFee) {
        setValue("managerActivityStartDate", selectedFee.startDate)
        setValue("managerActivityEndDate", selectedFee.endDate)
        setValue("year", selectedFee.year)
      }
    }
  }, [selectedDiningFeeId, diningFees, setValue])

  const testConnectivity = async () => {
    console.log("=== CONNECTIVITY TEST ===")
    console.log("Current environment:", process.env.NODE_ENV)
    console.log("API Base URL from createApiUrl:", createApiUrl(""))
    console.log("Testing basic API connectivity...")
    
    const jwtToken = localStorage.getItem("jwtToken")
    if (!jwtToken) {
      console.log("No JWT token found")
      return
    }
    
    try {
      // Test a simple endpoint first
      const testUrl = createApiUrl("/api/auth/verify")
      console.log("Testing connectivity to:", testUrl)
      
      const response = await fetch(testUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
      })
      
      console.log("Connectivity test response status:", response.status)
      console.log("Connectivity test response headers:", Object.fromEntries(response.headers.entries()))
      
      if (response.ok) {
        console.log("✅ Basic connectivity is working")
      } else {
        console.log("❌ Basic connectivity failed")
      }
    } catch (error) {
      console.error("❌ Connectivity test failed with error:", error)
    }
    console.log("=== END CONNECTIVITY TEST ===")
  }

  const fetchDiningFees = async () => {
    setDiningFeesLoading(true)
    setDiningFeesError("")

    const jwtToken = localStorage.getItem("jwtToken")
    if (!jwtToken) {
      setDiningFeesError("You are not logged in. Please log in as Provost.")
      setDiningFeesLoading(false)
      return
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    }

    try {
      // Use the new endpoint to get only available dining fees
      const response = await fetch(createApiUrl("/api/mess-manager-calls/available-dining-fees"), {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setDiningFees(data || [])
    } catch (err) {
      console.error("Error fetching available dining fees:", err)
      setDiningFeesError("Failed to fetch available dining fees. Please try again.")
    } finally {
      setDiningFeesLoading(false)
    }
  }

  const fetchExistingCalls = async () => {
    setCallsLoading(true)
    setCallsError("")

    const jwtToken = localStorage.getItem("jwtToken")
    if (!jwtToken) {
      setCallsError("You are not logged in. Please log in as Provost.")
      setCallsLoading(false)
      return
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    }

    try {
      const apiUrl = createApiUrl("/api/mess-manager-calls")
      console.log("Fetching mess manager calls from:", apiUrl)
      console.log("Environment:", process.env.NODE_ENV)
      console.log("Headers:", headers)
      
      const response = await fetch(apiUrl, {
        method: "GET",
        headers,
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Response error text:", errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log("Fetched calls data:", data)
      setExistingCalls(data || [])
    } catch (err) {
      console.error("Error fetching mess manager calls:", err)
      console.error("Error details:", {
        name: err.name,
        message: err.message,
        stack: err.stack
      })
      setCallsError("Failed to fetch existing calls. Please try again.")
    } finally {
      setCallsLoading(false)
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    setMessage("")
    setError("")

    const jwtToken = localStorage.getItem("jwtToken")
    const provostId = localStorage.getItem("userId")

    if (!jwtToken || !provostId) {
      setError("You are not logged in. Please log in as Provost.")
      setLoading(false)
      return
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    }

    const payload = {
      provostId: parseInt(provostId),
      diningFeeId: parseInt(data.diningFeeId),
      applicationEndDate: data.applicationEndDate,
      managerActivityStartDate: data.managerActivityStartDate,
      managerActivityEndDate: data.managerActivityEndDate,
      year: parseInt(data.year),
      maxManagers: parseInt(data.maxManagers) || 5,
    }

    console.log("Payload being sent:", payload) // Debug log

    // Validate required fields
    if (!payload.diningFeeId || !payload.year || !payload.applicationEndDate || !payload.managerActivityStartDate || !payload.managerActivityEndDate) {
      setError("Please ensure all required fields are filled correctly.")
      setLoading(false)
      return
    }

    // Validate dates logic
    const startDate = new Date(payload.managerActivityStartDate)
    const endDate = new Date(payload.managerActivityEndDate)
    const appEndDate = new Date(payload.applicationEndDate)

    if (startDate <= appEndDate) {
      setError("Manager activity start date must be after application end date.")
      setLoading(false)
      return
    }

    if (endDate <= startDate) {
      setError("Manager activity end date must be after start date.")
      setLoading(false)
      return
    }

    try {
      const apiUrl = createApiUrl("/api/mess-manager-calls")
      console.log("Creating mess manager call at:", apiUrl)
      console.log("Environment:", process.env.NODE_ENV)
      console.log("Payload:", payload)
      console.log("Headers:", headers)
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      })

      console.log("Create response status:", response.status)
      console.log("Create response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const responseText = await response.text()
          console.error("Create response error text:", responseText)
          // Try to parse as JSON first
          try {
            const errorData = JSON.parse(responseText)
            errorMessage = errorData.message || errorMessage
          } catch (jsonError) {
            // If not JSON, use the text directly
            errorMessage = responseText || errorMessage
          }
        } catch (textError) {
          // Use default error message if we can't read response
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log("Create result:", result)
      setMessage("Mess Manager Call created successfully!")
      reset()
      fetchExistingCalls() // Refresh the list
      fetchDiningFees() // Refresh available dining fees
    } catch (err) {
      console.error("Error creating mess manager call:", err)
      setError(err.message || "Failed to create call. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const updateCallStatus = async (callId, newStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [callId]: true }))

    const jwtToken = localStorage.getItem("jwtToken")
    if (!jwtToken) {
      setError("You are not logged in. Please log in as Provost.")
      setUpdatingStatus(prev => ({ ...prev, [callId]: false }))
      return
    }

    const headers = {
      "Content-Type": "text/plain",
      Authorization: `Bearer ${jwtToken}`,
    }

    try {
      const response = await fetch(createApiUrl(`/api/mess-manager-calls/${callId}/status`), {
        method: "PUT",
        headers,
        body: newStatus, // Send as plain text, not JSON
      })

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const responseText = await response.text()
          try {
            const errorData = JSON.parse(responseText)
            errorMessage = errorData.message || errorMessage
          } catch (jsonError) {
            errorMessage = responseText || errorMessage
          }
        } catch (textError) {
          // Use default error message
        }
        throw new Error(errorMessage)
      }

      setMessage(`Call status updated to ${newStatus} successfully!`)
      setError("") // Clear any existing errors
      fetchExistingCalls() // Refresh the list
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage("")
      }, 3000)
    } catch (err) {
      console.error("Error updating call status:", err)
      setError(err.message || "Failed to update call status. Please try again.")
      setMessage("") // Clear any existing success messages
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setError("")
      }, 5000)
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [callId]: false }))
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      expired: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors.active}`}>
        {status?.charAt(0)?.toUpperCase() + status?.slice(1) || "Active"}
      </span>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <ChefHat className="h-8 w-8 text-orange-600 mr-4" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Call Mess Manager</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create a call for mess manager applications
            </p>
          </div>
        </div>
      </div>

      {/* Create Call Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <Save className="h-6 w-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Call</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dining Fee Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="h-4 w-4 inline mr-2" />
                Dining Fee *
              </label>
              {diningFeesLoading ? (
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 rounded-md"></div>
              ) : diningFees.length === 0 ? (
                <div className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  No available dining fees (all have been used for calls)
                </div>
              ) : (
                <select
                  {...register("diningFeeId", { required: "Please select a dining fee" })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a dining fee</option>
                  {diningFees.map((fee) => (
                    <option key={fee.id} value={fee.id}>
                      {fee.year} - ${fee.fee} ({formatDate(fee.startDate)} to {formatDate(fee.endDate)})
                    </option>
                  ))}
                </select>
              )}
              {errors.diningFeeId && (
                <p className="text-red-500 text-sm mt-1">{errors.diningFeeId.message}</p>
              )}
              {diningFeesError && (
                <p className="text-red-500 text-sm mt-1">{diningFeesError}</p>
              )}
              {diningFees.length === 0 && !diningFeesLoading && !diningFeesError && (
                <p className="text-amber-600 dark:text-amber-400 text-sm mt-1">
                  <Info className="h-3 w-3 inline mr-1" />
                  All dining fees have been used for mess manager calls. Please create new dining fees first.
                </p>
              )}
            </div>

            {/* Year (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-2" />
                Year
              </label>
              <input
                type="number"
                {...register("year", { required: "Year is required" })}
                value={currentYear || ""}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                placeholder="Auto-filled from dining fee"
                readOnly
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                <Info className="h-3 w-3 inline mr-1" />
                Auto-filled from selected dining fee
              </p>
            </div>

            {/* Application End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="h-4 w-4 inline mr-2" />
                Application End Date *
              </label>
              <input
                type="date"
                {...register("applicationEndDate", { required: "Application end date is required" })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              {errors.applicationEndDate && (
                <p className="text-red-500 text-sm mt-1">{errors.applicationEndDate.message}</p>
              )}
            </div>

            {/* Max Managers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Users className="h-4 w-4 inline mr-2" />
                Maximum Managers
              </label>
              <input
                type="number"
                {...register("maxManagers", { 
                  min: { value: 1, message: "Must be at least 1" },
                  max: { value: 20, message: "Must be 20 or less" }
                })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="5"
                defaultValue={5}
              />
              {errors.maxManagers && (
                <p className="text-red-500 text-sm mt-1">{errors.maxManagers.message}</p>
              )}
            </div>

            {/* Manager Activity Start Date (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-2" />
                Manager Activity Start Date
              </label>
              <input
                type="date"
                {...register("managerActivityStartDate")}
                value={currentStartDate || ""}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                readOnly
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                <Info className="h-3 w-3 inline mr-1" />
                Auto-filled from selected dining fee
              </p>
            </div>

            {/* Manager Activity End Date (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-2" />
                Manager Activity End Date
              </label>
              <input
                type="date"
                {...register("managerActivityEndDate")}
                value={currentEndDate || ""}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                readOnly
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                <Info className="h-3 w-3 inline mr-1" />
                Auto-filled from selected dining fee
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || diningFees.length === 0}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <Save className="h-5 w-5" />
              <span>
                {loading ? "Creating..." : 
                 diningFees.length === 0 ? "No Available Dining Fees" : 
                 "Create Call"}
              </span>
            </button>
          </div>
        </form>

        {/* Messages */}
        {message && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-green-800 dark:text-green-400">{message}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Existing Calls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <List className="h-6 w-6 mr-3 text-green-600" />
            Existing Mess Manager Calls
          </h2>
        </div>

        {callsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-20 rounded-lg"></div>
            ))}
          </div>
        ) : callsError ? (
          <div className="text-center py-8">
            <AlertCircle className="h-16 w-16 text-red-300 dark:text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Calls</h3>
            <p className="text-gray-500 dark:text-gray-400">{callsError}</p>
          </div>
        ) : existingCalls.length === 0 ? (
          <div className="text-center py-8">
            <ChefHat className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Calls Created Yet</h3>
            <p className="text-gray-500 dark:text-gray-400">Create your first mess manager call using the form above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {existingCalls.map((call) => (
              <div key={call.callId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                      <ChefHat className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Call #{call.callId} - Year {call.year}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Created on {formatDate(call.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(call.status)}
                    {call.status?.toLowerCase() === "active" && (
                      <button
                        onClick={() => updateCallStatus(call.callId, "expired")}
                        disabled={updatingStatus[call.callId]}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs font-medium rounded-md transition-colors duration-200 flex items-center space-x-1"
                        title="Mark as Expired"
                      >
                        <XCircle className="h-3 w-3" />
                        <span>{updatingStatus[call.callId] ? "Updating..." : "Mark Expired"}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Application Deadline:</span>
                    <p className="text-gray-900 dark:text-white">{formatDate(call.applicationEndDate)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Activity Period:</span>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(call.managerActivityStartDate)} to {formatDate(call.managerActivityEndDate)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Max Managers:</span>
                    <p className="text-gray-900 dark:text-white">{call.maxManagers}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
