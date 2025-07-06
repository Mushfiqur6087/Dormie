"use client"

import { useState, useEffect } from "react"
import { User, Mail, Phone, MapPin, Calendar, GraduationCap, Edit, Save, X, Home, CheckCircle, Clock, AlertCircle } from "lucide-react"

export default function StudentDashboard() {
  const [studentInfo, setStudentInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    studentId: "",
    department: "",
    batch: "",
    regNo: "",
    dateOfBirth: "",
    presentAddress: "",
    permanentAddress: "",
    residencyStatus: "",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editableFields, setEditableFields] = useState({
    phone: "",
    presentAddress: "",
    permanentAddress: "",
    regNo: "",
    dateOfBirth: "",
  })
  const [saving, setSaving] = useState(false)
  const [allocationStatus, setAllocationStatus] = useState("")
  const [allocationLoading, setAllocationLoading] = useState(true)
  const [allocationError, setAllocationError] = useState(null)

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset editable fields to original values when canceling
      setEditableFields({
        phone: studentInfo.phone,
        presentAddress: studentInfo.presentAddress,
        permanentAddress: studentInfo.permanentAddress,
        regNo: studentInfo.regNo,
        dateOfBirth: studentInfo.dateOfBirth,
      })
    }
    setIsEditing(!isEditing)
  }

  const handleFieldChange = (field, value) => {
    setEditableFields(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("jwtToken") || 
                   localStorage.getItem("accessToken") || 
                   localStorage.getItem("token") || 
                   localStorage.getItem("authToken") || 
                   localStorage.getItem("jwt")
      
      if (!token) {
        setError("Authentication token not found. Please log in again.")
        setSaving(false)
        return
      }

      const updateData = {
        contactNo: editableFields.phone,
        presentAddress: editableFields.presentAddress,
        permanentAddress: editableFields.permanentAddress,
        regNo: editableFields.regNo,
        dateOfBirth: editableFields.dateOfBirth
      }

      const response = await fetch("http://localhost:8080/api/students/update", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const updatedData = await response.json()
      
      // Update the student info with new data
      setStudentInfo(prev => ({
        ...prev,
        phone: editableFields.phone,
        presentAddress: editableFields.presentAddress,
        permanentAddress: editableFields.permanentAddress,
        regNo: editableFields.regNo,
        dateOfBirth: editableFields.dateOfBirth
      }))

      setIsEditing(false)
      setError(null)
      
      // Show success message (you can replace this with a toast notification if available)
      alert("Information updated successfully!")
      
    } catch (err) {
      console.error("Error updating student info:", err)
      setError("Failed to update information. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const fetchAllocationStatus = async () => {
    try {
      const token = localStorage.getItem("jwtToken") || 
                   localStorage.getItem("accessToken") || 
                   localStorage.getItem("token") || 
                   localStorage.getItem("authToken") || 
                   localStorage.getItem("jwt")
      
      console.log("Token found for allocation status:", !!token)
      console.log("Token length:", token ? token.length : 0)
      
      // Debug: Try to decode JWT payload (just for debugging - don't do this in production)
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          console.log("JWT Payload:", payload)
          console.log("User ID in token:", payload.userId || payload.sub || payload.id)
        } catch (e) {
          console.log("Could not decode JWT payload:", e)
        }
      }
      
      if (!token) {
        setAllocationError("Authentication token not found. Please log in again.")
        setAllocationLoading(false)
        return
      }

      console.log("Making allocation status request...")
      const response = await fetch("http://localhost:8080/api/rooms/allocation-status", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("Allocation status response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Allocation status error response:", errorText)
        
        // Try to parse error as JSON, fallback to text
        let errorMessage = errorText
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorText
        } catch (e) {
          // Keep original error text
        }
        
        if (response.status === 401 || response.status === 403) {
          setAllocationError("Session expired. Please log in again.")
          // Optionally redirect to login
          // router.push("/login")
        } else {
          setAllocationError(`Failed to load allocation status: ${errorMessage}`)
        }
        return
      }

      // Parse JSON response to get the message field
      const responseData = await response.json()
      console.log("Allocation status received:", responseData)
      const statusMessage = responseData.message || ""
      setAllocationStatus(statusMessage)
      
    } catch (err) {
      console.error("Error fetching allocation status:", err)
      setAllocationError("Failed to load allocation status")
    } finally {
      setAllocationLoading(false)
    }
  }

  const renderAllocationMessage = () => {
    if (allocationLoading) {
      return (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 dark:text-gray-300">Loading allocation status...</span>
        </div>
      )
    }

    if (allocationError) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div>
                <h4 className="font-semibold text-red-800 dark:text-red-200">Unable to Load Status</h4>
                <p className="text-red-700 dark:text-red-300 text-sm">{allocationError}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setAllocationError(null)
                setAllocationLoading(true)
                fetchAllocationStatus()
              }}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )
    }

    if (allocationStatus === "attached") {
      return (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Application Required</h4>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                You are currently an attached student. Please apply to the Provost for room allocation through the application system.
              </p>
            </div>
          </div>
        </div>
      )
    } else if (allocationStatus === "room not assigned") {
      return (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">Allocation Pending</h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Your application has been approved and you are eligible for room allocation. You will be assigned a room soon.
              </p>
            </div>
          </div>
        </div>
      )
    } else if (allocationStatus.startsWith("room assigned to ")) {
      const roomNumber = allocationStatus.replace("room assigned to ", "")
      return (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            <div>
              <h4 className="font-semibold text-green-800 dark:text-green-200">Room Assigned</h4>
              <p className="text-green-700 dark:text-green-300 text-sm">
                Congratulations! You have been assigned to <strong>Room {roomNumber}</strong>.
              </p>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">Status Unknown</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {allocationStatus || "Unable to determine allocation status at this time."}
              </p>
            </div>
          </div>
        </div>
      )
    }
  }

  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        // Try different possible token key names, prioritizing the one used in login
        const token = localStorage.getItem("jwtToken") || 
                     localStorage.getItem("accessToken") || 
                     localStorage.getItem("token") || 
                     localStorage.getItem("authToken") || 
                     localStorage.getItem("jwt")
        
        // Debug: Log what's in localStorage
        console.log("Available localStorage keys:", Object.keys(localStorage))
        console.log("Token found:", !!token)
        
        if (!token) {
          setError("Authentication token not found. Please log in again.")
          setLoading(false)
          return
        }

        const response = await fetch("http://localhost:8080/api/students/me", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        console.log("API Response Status:", response.status)
        console.log("API Response Headers:", response.headers)

        if (!response.ok) {
          const errorText = await response.text()
          console.log("API Error Response:", errorText)
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }

        const data = await response.json()
        console.log("API Response Data:", data)
        console.log("Raw data fields:", {
          firstName: data.firstName,
          lastName: data.lastName,
          studentId: data.studentId,
          department: data.department,
          batch: data.batch,
          regNo: data.regNo,
          contactNo: data.contactNo,
          dateOfBirth: data.dateOfBirth,
          presentAddress: data.presentAddress,
          permanentAddress: data.permanentAddress,
          residencyStatus: data.residencyStatus
        })
        
        setStudentInfo({
          name: `${data.firstName} ${data.lastName}`,
          email: localStorage.getItem("userEmail") || "",
          phone: data.contactNo || "",
          address: data.presentAddress || "",
          studentId: data.studentId || "",
          department: data.department || "",
          batch: data.batch || "",
          regNo: data.regNo || "",
          dateOfBirth: data.dateOfBirth || "",
          presentAddress: data.presentAddress || "",
          permanentAddress: data.permanentAddress || "",
          residencyStatus: data.residencyStatus || "",
        })

        // Initialize editable fields
        setEditableFields({
          phone: data.contactNo || "",
          presentAddress: data.presentAddress || "",
          permanentAddress: data.permanentAddress || "",
          regNo: data.regNo || "",
          dateOfBirth: data.dateOfBirth || "",
        })
      } catch (err) {
        console.error("Error fetching student info:", err)
        setError("Failed to load student information")
        
        // Fallback to localStorage data if available
        const userName = localStorage.getItem("userName")
        const userEmail = localStorage.getItem("userEmail")
        const userId = localStorage.getItem("userId")
        
        if (userName || userEmail || userId) {
          setStudentInfo({
            name: userName || "Student",
            email: userEmail || "",
            phone: "",
            address: "",
            studentId: userId || "",
            department: "",
            batch: "",
            regNo: "",
            dateOfBirth: "",
            presentAddress: "",
            permanentAddress: "",
            residencyStatus: "",
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchStudentInfo()
    fetchAllocationStatus()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome, {loading ? "Loading..." : studentInfo.name || "Student"}!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">Student Dashboard</p>
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>
          </div>
          {!loading && (
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? "Saving..." : "Save"}</span>
                  </button>
                  <button
                    onClick={handleEditToggle}
                    disabled={saving}
                    className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEditToggle}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Information</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Student Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Personal Information</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading student information...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</p>
                  <p className="text-gray-900 dark:text-white">{studentInfo.name || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Email Address</p>
                  <p className="text-gray-900 dark:text-white">{studentInfo.email || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone Number</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editableFields.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{studentInfo.phone || "N/A"}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Present Address</p>
                  {isEditing ? (
                    <textarea
                      value={editableFields.presentAddress}
                      onChange={(e) => handleFieldChange('presentAddress', e.target.value)}
                      rows={2}
                      className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      placeholder="Enter present address"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{studentInfo.presentAddress || "N/A"}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Permanent Address</p>
                  {isEditing ? (
                    <textarea
                      value={editableFields.permanentAddress}
                      onChange={(e) => handleFieldChange('permanentAddress', e.target.value)}
                      rows={2}
                      className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      placeholder="Enter permanent address"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{studentInfo.permanentAddress || "N/A"}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <GraduationCap className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Student ID</p>
                  <p className="text-gray-900 dark:text-white">{studentInfo.studentId || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <GraduationCap className="h-5 w-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Registration Number</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editableFields.regNo}
                      onChange={(e) => handleFieldChange('regNo', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter registration number"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{studentInfo.regNo || "N/A"}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <GraduationCap className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Department</p>
                  <p className="text-gray-900 dark:text-white">{studentInfo.department || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Batch</p>
                  <p className="text-gray-900 dark:text-white">{studentInfo.batch || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Date of Birth</p>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editableFields.dateOfBirth}
                      onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{studentInfo.dateOfBirth || "N/A"}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Residency Status</p>
                  <p className="text-gray-900 dark:text-white">{studentInfo.residencyStatus || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Seat Allocation Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <Home className="h-6 w-6 mr-3 text-red-600" />
          Seat Allocation Status
        </h2>
        {renderAllocationMessage()}
      </div>
    </div>
  )
}
