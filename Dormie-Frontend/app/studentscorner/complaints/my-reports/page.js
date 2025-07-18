"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createApiUrl } from "../../../../lib/api"
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Edit,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Download,
  Star,
  FileText,
  Activity,
  Target
} from "lucide-react"

export default function MyReportsPage() {
  const router = useRouter()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all") // all, open, in_progress, resolved, closed
  const [searchTerm, setSearchTerm] = useState("")
  const [updating, setUpdating] = useState({})
  const [sortBy, setSortBy] = useState("newest") // newest, oldest, status, priority
  const [viewMode, setViewMode] = useState("grid") // grid, list
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  })

  useEffect(() => {
    fetchMyComplaints()
  }, [sortBy])

  const fetchMyComplaints = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("jwtToken")
      if (!token) {
        setError("Authentication token not found. Please log in again.")
        return
      }

      const response = await fetch(createApiUrl("/api/complaints/my-reports"), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const data = await response.json()
      setComplaints(data)
      calculateStats(data)
    } catch (err) {
      console.error("Error fetching my complaints:", err)
      setError("Failed to load your complaints")
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (complaintsData) => {
    const newStats = {
      total: complaintsData.length,
      open: complaintsData.filter(c => c.status.toLowerCase() === 'open').length,
      inProgress: complaintsData.filter(c => c.status.toLowerCase() === 'in_progress').length,
      resolved: complaintsData.filter(c => c.status.toLowerCase() === 'resolved').length,
      closed: complaintsData.filter(c => c.status.toLowerCase() === 'closed').length
    }
    setStats(newStats)
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchMyComplaints()
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("jwtToken")
      const response = await fetch(createApiUrl(`/api/complaints/my-reports?search=${encodeURIComponent(searchTerm)}`), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Filter by search term on frontend as well
        const filteredData = data.filter(complaint => 
          complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          complaint.complaintId.toString().includes(searchTerm)
        )
        setComplaints(filteredData)
        calculateStats(filteredData)
      }
    } catch (err) {
      console.error("Error searching complaints:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (complaintId, newStatus) => {
    setUpdating(prev => ({ ...prev, [complaintId]: true }))
    
    try {
      const token = localStorage.getItem("jwtToken")
      const response = await fetch(createApiUrl(`/api/complaints/${complaintId}/update-own-status`), {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Refresh the complaints list to show updated status
        await fetchMyComplaints()
        // Show success message
        alert("Status updated successfully!")
      } else {
        const errorText = await response.text()
        throw new Error(errorText)
      }
    } catch (err) {
      console.error("Error updating status:", err)
      alert("Failed to update status: " + err.message)
    } finally {
      setUpdating(prev => ({ ...prev, [complaintId]: false }))
    }
  }

  const sortComplaints = (complaintsToSort) => {
    const sorted = [...complaintsToSort]
    switch (sortBy) {
      case "newest":
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      case "oldest":
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      case "status":
        const statusOrder = { 'open': 1, 'in_progress': 2, 'resolved': 3, 'closed': 4 }
        return sorted.sort((a, b) => statusOrder[a.status.toLowerCase()] - statusOrder[b.status.toLowerCase()])
      case "priority":
        return sorted.sort((a, b) => {
          const priorityA = getPriorityLevel(a)
          const priorityB = getPriorityLevel(b)
          const priorityOrder = { 'CRITICAL': 1, 'HIGH': 2, 'MEDIUM': 3, 'LOW': 4 }
          return priorityOrder[priorityA] - priorityOrder[priorityB]
        })
      default:
        return sorted
    }
  }

  const filteredComplaints = sortComplaints(
    complaints.filter(complaint => {
      if (statusFilter !== "all" && complaint.status.toLowerCase() !== statusFilter) {
        return false
      }
      return true
    })
  )

  const getPriorityLevel = (complaint) => {
    const daysSinceCreated = Math.floor((new Date() - new Date(complaint.createdAt)) / (1000 * 60 * 60 * 24))
    
    if (complaint?.complaintType === 'MAINTENANCE' && daysSinceCreated > 3) return 'HIGH'
    if (complaint.status === 'OPEN' && daysSinceCreated > 14) return 'HIGH'
    if (complaint.status === 'OPEN' && daysSinceCreated > 7) return 'MEDIUM'
    return 'LOW'
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "open":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "closed":
        return <CheckCircle className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "maintenance":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case "general":
        return <MessageSquare className="h-5 w-5 text-gray-500" />
      default:
        return <MessageSquare className="h-5 w-5 text-gray-500" />
    }
  }

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "maintenance":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "general":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const canUpdateStatus = (complaint) => {
    // Allow status updates only for general complaints
    return complaint.status.toLowerCase() !== "closed" && complaint.status.toLowerCase() !== "resolved"
  }

  const getAvailableStatuses = (currentStatus) => {
    const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]
    return statuses.filter(status => status.toLowerCase() !== currentStatus.toLowerCase())
  }

  if (loading && complaints.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-8 py-6 rounded-xl shadow-lg max-w-md text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p className="text-lg font-semibold mb-4">Error Loading Your Reports</p>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null)
              fetchMyComplaints()
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
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
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">My Reports</h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">Manage and track all your submitted complaints</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push("/studentscorner/complaints/create")}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Plus className="h-5 w-5" />
                <span>New Report</span>
              </button>
              <button
                onClick={() => router.push("/studentscorner/complaints")}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <MessageSquare className="h-5 w-5" />
                <span>All Complaints</span>
              </button>
              <button
                onClick={fetchMyComplaints}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Reports</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Open</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.open}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Resolved</p>
                <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Success Rate</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.total > 0 ? Math.round(((stats.resolved + stats.closed) / stats.total) * 100) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports by title, description, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Filters and Controls */}
            <div className="flex flex-wrap items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-gray-400" />
                <select
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="status">Sort by Status</option>
                  <option value="priority">Sort by Priority</option>
                </select>
              </div>
              
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 text-sm transition-colors ${
                    viewMode === "grid" 
                      ? "bg-indigo-600 text-white" 
                      : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 text-sm transition-colors ${
                    viewMode === "list" 
                      ? "bg-indigo-600 text-white" 
                      : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Display */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-16">
              <UserCheck className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Reports Found</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
                {searchTerm ? "No reports match your search criteria. Try adjusting your search terms or filters." : "You haven't submitted any reports yet. Click 'New Report' to get started."}
              </p>
              <div className="space-x-4">
                <button
                  onClick={() => router.push("/studentscorner/complaints/create")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  Create Your First Report
                </button>
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm("")
                      fetchMyComplaints()
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-hidden">
              {viewMode === "grid" ? (
                // Grid View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {filteredComplaints.map((complaint) => {
                    const priority = getPriorityLevel(complaint)
                    return (
                      <div key={complaint.complaintId} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {getTypeIcon(complaint.complaintType)}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                                {complaint.title}
                              </h3>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border mt-1 ${getTypeColor(complaint.complaintType)}`}>
                                {complaint.complaintType?.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(priority)}`}>
                            {priority}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                          {complaint.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(complaint.status)}
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                              {complaint.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            #{complaint.complaintId}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                          </div>
                          {complaint.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{complaint.location}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => router.push(`/studentscorner/complaints/${complaint.complaintId}`)}
                            className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors text-sm"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
                          </button>
                          
                          {canUpdateStatus(complaint) && (
                            <select
                              value={complaint.status}
                              onChange={(e) => handleStatusUpdate(complaint.complaintId, e.target.value)}
                              disabled={updating[complaint.complaintId]}
                              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-600 dark:text-white disabled:opacity-50"
                            >
                              <option value={complaint.status}>
                                {complaint.status.replace('_', ' ').toUpperCase()}
                              </option>
                              {getAvailableStatuses(complaint.status).map(status => (
                                <option key={status} value={status}>
                                  {status.replace('_', ' ').toUpperCase()}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                // List View
                <div className="divide-y divide-gray-200 dark:divide-gray-600">
                  {filteredComplaints.map((complaint) => {
                    const priority = getPriorityLevel(complaint)
                    return (
                      <div key={complaint.complaintId} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              {getTypeIcon(complaint.complaintType)}
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {complaint.title}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(complaint.complaintType)}`}>
                                {complaint.complaintType?.replace('_', ' ').toUpperCase()}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(priority)}`}>
                                {priority} PRIORITY
                              </span>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(complaint.status)}
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                                  {complaint.status.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                              {complaint.description}
                            </p>
                            
                            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                              </div>
                              {complaint.location && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{complaint.location}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>#{complaint.complaintId}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => router.push(`/studentscorner/complaints/${complaint.complaintId}`)}
                              className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View</span>
                            </button>
                            
                            {canUpdateStatus(complaint) && (
                              <div className="flex items-center space-x-2">
                                <select
                                  value={complaint.status}
                                  onChange={(e) => handleStatusUpdate(complaint.complaintId, e.target.value)}
                                  disabled={updating[complaint.complaintId]}
                                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
                                >
                                  <option value={complaint.status}>
                                    {complaint.status.replace('_', ' ').toUpperCase()}
                                  </option>
                                  {getAvailableStatuses(complaint.status).map(status => (
                                    <option key={status} value={status}>
                                      {status.replace('_', ' ').toUpperCase()}
                                    </option>
                                  ))}
                                </select>
                                {updating[complaint.complaintId] && (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
