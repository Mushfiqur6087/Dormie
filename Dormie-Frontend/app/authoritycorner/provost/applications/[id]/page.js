"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  User,
  Mail,
  MapPin,
  GraduationCap,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Home,
  Users,
  Building,
  AlertCircle,
  Eye,
} from "lucide-react"

export default function ProvostApplicationDetailPage() {
  const router = useRouter()
  const { id } = useParams()

  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const IMAGE_BASE_URL = "http://localhost:8080/uploads/"

  const fetchApplicationDetails = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const jwtToken = localStorage.getItem("jwtToken")
    if (!jwtToken) {
      setError("Authentication required. Please log in as Provost or Admin.")
      setLoading(false)
      router.push("/login")
      return
    }

    try {
      const response = await fetch(`http://localhost:8080/api/applications/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Application not found.")
        }
        const errorData = await response.json()
        throw new Error(errorData.message || response.statusText)
      }

      const data = await response.json()
      setApplication(data)
    } catch (err) {
      console.error("Error fetching application details:", err)
      setError(err.message || "Failed to load application details.")
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchApplicationDetails()
  }, [fetchApplicationDetails])

  const handleApplicationAction = useCallback(
    async (actionType) => {
      setIsProcessing(true)
      setError(null)

      const jwtToken = localStorage.getItem("jwtToken")
      if (!jwtToken) {
        setError("Authentication required. Please log in.")
        setIsProcessing(false)
        router.push("/login")
        return
      }

      try {
        const response = await fetch(`http://localhost:8080/api/applications/${id}/${actionType}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || response.statusText)
        }

        const result = await response.json()
        alert(result.message)
        router.push("/authoritycorner/provost/applications")
      } catch (err) {
        console.error(`Error ${actionType}ing application:`, err)
        setError(err.message || `Failed to ${actionType} application.`)
      } finally {
        setIsProcessing(false)
      }
    },
    [id, router],
  )

  const getStatusIcon = (status) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "PENDING":
        return <Clock className="h-6 w-6 text-yellow-500" />
      case "REJECTED":
        return <XCircle className="h-6 w-6 text-red-500" />
      default:
        return <Clock className="h-6 w-6 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading application details...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-8 py-6 rounded-xl shadow-lg max-w-md">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="h-6 w-6" />
            <p className="font-bold text-lg">Error</p>
          </div>
          <p className="mb-4">{error}</p>
          <div className="flex space-x-3">
            <button
              onClick={() => router.push("/authoritycorner/provost/applications")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to List
            </button>
            <button
              onClick={() => router.push("/login")}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 px-8 py-6 rounded-xl shadow-lg max-w-md text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p className="text-lg font-semibold mb-4">Application not found</p>
          <button
            onClick={() => router.push("/authoritycorner/provost/applications")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/authoritycorner/provost/applications")}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Application Details</h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">Application #{application.applicationId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {getStatusIcon(application.applicationStatus)}
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(application.applicationStatus)}`}
              >
                {application.applicationStatus}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Student Image */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Student Photo
              </h2>
              <div className="flex justify-center">
                {application.studentImagePath ? (
                  <img
                    src={`${IMAGE_BASE_URL}${application.studentImagePath}`}
                    alt={`Student ${application.studentIdNo} Image`}
                    className="max-w-full h-auto max-h-80 object-contain rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = "https://placehold.co/200x200/cccccc/000000?text=Image+Not+Found"
                      console.error("Image failed to load:", e.target.src)
                    }}
                  />
                ) : (
                  <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 text-sm rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="text-center">
                      <User className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                      <p>No Student Image</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Application Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <User className="h-6 w-6 mr-3 text-indigo-600" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailItem
                  icon={<FileText className="h-5 w-5 text-blue-500" />}
                  label="Application ID"
                  value={application.applicationId}
                />
                <DetailItem
                  icon={<GraduationCap className="h-5 w-5 text-green-500" />}
                  label="Student ID"
                  value={application.studentIdNo}
                />
                <DetailItem
                  icon={<User className="h-5 w-5 text-purple-500" />}
                  label="User ID"
                  value={application.userId}
                />
                <DetailItem
                  icon={<Calendar className="h-5 w-5 text-orange-500" />}
                  label="Application Date"
                  value={new Date(application.applicationDate).toLocaleString()}
                />
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Building className="h-6 w-6 mr-3 text-indigo-600" />
                Academic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailItem
                  icon={<Building className="h-5 w-5 text-blue-500" />}
                  label="College"
                  value={`${application.college} (${application.collegeLocation})`}
                />
                <DetailItem
                  icon={<MapPin className="h-5 w-5 text-red-500" />}
                  label="District"
                  value={application.district}
                />
                <DetailItem
                  icon={<Mail className="h-5 w-5 text-green-500" />}
                  label="Postcode"
                  value={application.postcode}
                />
                <DetailItem
                  icon={<MapPin className="h-5 w-5 text-blue-500" />}
                  label="Distance to Hall"
                  value={application.distanceFromHallKm ? `${application.distanceFromHallKm.toFixed(2)} km` : "N/A"}
                />
              </div>
            </div>

            {/* Financial & Family Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <DollarSign className="h-6 w-6 mr-3 text-indigo-600" />
                Financial & Family Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailItem
                  icon={<DollarSign className="h-5 w-5 text-green-500" />}
                  label="Family Income"
                  value={`৳${application.familyIncome?.toLocaleString()}`}
                />
                <DetailItem
                  icon={<Users className="h-5 w-5 text-purple-500" />}
                  label="Local Relative"
                  value={application.hasLocalRelative ? "Yes" : "No"}
                />
                {application.hasLocalRelative && application.localRelativeAddress && (
                  <div className="md:col-span-2">
                    <DetailItem
                      icon={<Home className="h-5 w-5 text-orange-500" />}
                      label="Relative Address"
                      value={application.localRelativeAddress}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Status Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <CheckCircle className="h-6 w-6 mr-3 text-indigo-600" />
                Application Status
              </h2>
              <div className="flex items-center space-x-4">
                {getStatusIcon(application.applicationStatus)}
                <span
                  className={`px-6 py-3 rounded-xl text-lg font-semibold border ${getStatusColor(application.applicationStatus)}`}
                >
                  {application.applicationStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={() => handleApplicationAction("accept")}
              disabled={isProcessing || application.applicationStatus !== "PENDING"}
              className={`flex items-center justify-center space-x-3 px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 ${
                isProcessing || application.applicationStatus !== "PENDING"
                  ? "bg-green-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              }`}
            >
              <CheckCircle className="h-6 w-6" />
              <span>{isProcessing ? "Accepting..." : "Accept Application"}</span>
            </button>

            <button
              onClick={() => handleApplicationAction("reject")}
              disabled={isProcessing || application.applicationStatus !== "PENDING"}
              className={`flex items-center justify-center space-x-3 px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 ${
                isProcessing || application.applicationStatus !== "PENDING"
                  ? "bg-red-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              }`}
            >
              <XCircle className="h-6 w-6" />
              <span>{isProcessing ? "Rejecting..." : "Reject Application"}</span>
            </button>

            <button
              onClick={() => router.push("/authoritycorner/provost/applications")}
              disabled={isProcessing}
              className="flex items-center justify-center space-x-3 px-8 py-4 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <ArrowLeft className="h-6 w-6" />
              <span>Back to List</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper component for displaying detail items
function DetailItem({ icon, label, value, status }) {
  let statusClass = ""
  if (status) {
    if (status === "PENDING")
      statusClass =
        "text-yellow-700 bg-yellow-100 px-3 py-1 rounded-lg border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
    else if (status === "APPROVED")
      statusClass =
        "text-green-700 bg-green-100 px-3 py-1 rounded-lg border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
    else if (status === "REJECTED")
      statusClass =
        "text-red-700 bg-red-100 px-3 py-1 rounded-lg border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
  }

  return (
    <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
      {icon}
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</p>
        {status ? (
          <span className={statusClass}>{value}</span>
        ) : (
          <p className="text-gray-900 dark:text-white font-medium">{value}</p>
        )}
      </div>
    </div>
  )
}
