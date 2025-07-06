"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createApiUrl } from "../../../../lib/api"
import {
  Search,
  Filter,
  Eye,
  Users,
  TrendingUp,
  TrendingDown,
  MapPin,
  DollarSign,
  Calendar,
  FileText,
  ArrowUpDown,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react"

export default function ProvostApplicationListPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get sort parameters from URL or set defaults
  const sortBy = searchParams.get("sortBy") || "applicationDate"
  const sortOrder = searchParams.get("sortOrder") || "desc"

  // Function to fetch applications with sorting
  const fetchApplications = useCallback(async () => {
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
      const response = await fetch(
        createApiUrl(`/api/applications/all-summaries?sortBy=${sortBy}&sortOrder=${sortOrder}`),
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || response.statusText)
      }

      const data = await response.json()
      console.log("Applications data:", data) // Debug log
      if (data.length > 0) {
        console.log("First application:", data[0]) // Debug log
      }
      setApplications(data)
    } catch (err) {
      console.error("Error fetching applications:", err)
      setError(err.message || "Failed to load applications.")
    } finally {
      setLoading(false)
    }
  }, [sortBy, sortOrder, router])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  // Function to handle sort change
  const handleSortChange = (newSortBy) => {
    let newSortOrder = "asc"
    if (sortBy === newSortBy) {
      newSortOrder = sortOrder === "asc" ? "desc" : "asc"
    }
    router.push(`/authoritycorner/provost/applications?sortBy=${newSortBy}&sortOrder=${newSortOrder}`)
  }

  const getSortIndicator = (columnName) => {
    if (sortBy === columnName) {
      return sortOrder === "asc" ? (
        <TrendingUp className="h-4 w-4 inline ml-1" />
      ) : (
        <TrendingDown className="h-4 w-4 inline ml-1" />
      )
    }
    return <ArrowUpDown className="h-4 w-4 inline ml-1 opacity-50" />
  }

  // Filter applications based on search and status
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.studentIdNo?.toString().includes(searchTerm) ||
      app.applicationId?.toString().includes(searchTerm)
    const matchesStatus = statusFilter === "all" || app.applicationStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
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
          <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading applications...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-8 py-6 rounded-xl shadow-lg max-w-md">
          <div className="flex items-center space-x-3 mb-2">
            <XCircle className="h-6 w-6" />
            <p className="font-bold text-lg">Error</p>
          </div>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go to Login
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
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Hall Seat Applications</h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">Review and manage student applications</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {applications.filter((app) => app.applicationStatus === "PENDING").length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {applications.filter((app) => app.applicationStatus === "APPROVED").length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {applications.filter((app) => app.applicationStatus === "REJECTED").length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by name, student ID, or application ID..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Sort Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSortChange("familyIncome")}
                className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-all duration-200 flex items-center space-x-1 shadow-lg hover:shadow-xl"
              >
                <DollarSign className="h-4 w-4" />
                <span>Income</span>
                {getSortIndicator("familyIncome")}
              </button>
              <button
                onClick={() => handleSortChange("distanceFromHallKm")}
                className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-all duration-200 flex items-center space-x-1 shadow-lg hover:shadow-xl"
              >
                <MapPin className="h-4 w-4" />
                <span>Distance</span>
                {getSortIndicator("distanceFromHallKm")}
              </button>
              <button
                onClick={() => handleSortChange("applicationDate")}
                className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-all duration-200 flex items-center space-x-1 shadow-lg hover:shadow-xl"
              >
                <Calendar className="h-4 w-4" />
                <span>Date</span>
                {getSortIndicator("applicationDate")}
              </button>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No applications found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search criteria or filters."
                  : "No applications have been submitted yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Application
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Financial Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {filteredApplications.map((app) => (
                    <tr key={app.applicationId} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">#{app.applicationId}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {app.applicationDate 
                              ? new Date(app.applicationDate).toLocaleDateString() 
                              : "Date not available"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{app.username}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">ID: {app.studentIdNo}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            ৳{app.familyIncome?.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {app.distanceFromHallKm ? `${app.distanceFromHallKm.toFixed(1)} km` : "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(app.applicationStatus)}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.applicationStatus)}`}
                          >
                            {app.applicationStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/authoritycorner/provost/applications/${app.applicationId}`}>
                          <button className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors group">
                            <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
                            <span>View Details</span>
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
