"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createApiUrl } from "../../../../lib/api"
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Eye,
  AlertTriangle,
  Package,
  Edit,
  BarChart3,
  Shield
} from "lucide-react"

export default function ProvostComplaintsPage() {
  const router = useRouter()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all") // all, ragging, lost_and_found
  const [statusFilter, setStatusFilter] = useState("all") // all, open, in_progress, resolved, closed
  const [searchTerm, setSearchTerm] = useState("")
  const [statistics, setStatistics] = useState({})

  useEffect(() => {
    fetchComplaints()
    fetchStatistics()
  }, [filter])

  const fetchComplaints = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("jwtToken")
      if (!token) {
        setError("Authentication token not found. Please log in again.")
        return
      }

      let url = "/api/complaints"
      if (filter !== "all") {
        url = `/api/complaints/type/${filter}`
      }

      const response = await fetch(createApiUrl(url), {
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
    } catch (err) {
      console.error("Error fetching complaints:", err)
      setError("Failed to load complaints")
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem("jwtToken")
      if (!token) return

      const response = await fetch(createApiUrl("/api/complaints/statistics"), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStatistics(data)
      }
    } catch (err) {
      console.error("Error fetching statistics:", err)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchComplaints()
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("jwtToken")
      const response = await fetch(createApiUrl(`/api/complaints/search?query=${encodeURIComponent(searchTerm)}`), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setComplaints(data)
      }
    } catch (err) {
      console.error("Error searching complaints:", err)
    } finally {
      setLoading(false)
    }
  }

  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      const token = localStorage.getItem("jwtToken")
      const response = await fetch(createApiUrl(`/api/complaints/${complaintId}/status`), {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        // Refresh complaints list
        fetchComplaints()
        fetchStatistics()
      } else {
        throw new Error("Failed to update complaint status")
      }
    } catch (err) {
      console.error("Error updating complaint status:", err)
      setError("Failed to update complaint status")
    }
  }

  const filteredComplaints = complaints.filter(complaint => {
    if (statusFilter !== "all" && complaint.status.toLowerCase() !== statusFilter) {
      return false
    }
    return true
  })

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
    switch (type.toLowerCase()) {
      case "ragging":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "lost_and_found":
        return <Package className="h-5 w-5 text-blue-500" />
      default:
        return <MessageSquare className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityLevel = (complaint) => {
    if (complaint.complaintType === 'RAGGING') return 'CRITICAL'
    if (complaint.status === 'OPEN' && 
        new Date() - new Date(complaint.createdAt) > 7 * 24 * 60 * 60 * 1000) return 'HIGH'
    return 'NORMAL'
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Filter ragging complaints for special attention
  const raggingComplaints = filteredComplaints.filter(c => c.complaintType === 'RAGGING')
  const otherComplaints = filteredComplaints.filter(c => c.complaintType !== 'RAGGING')

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
          <p className="text-lg font-semibold mb-4">Error Loading Complaints</p>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null)
              fetchComplaints()
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
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Provost Complaint Review</h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">Student welfare and disciplinary oversight</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push("/authoritycorner/provost/complaints/analytics")}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <BarChart3 className="h-5 w-5" />
                <span>Analytics</span>
              </button>
            </div>
          </div>

          {/* Statistics Dashboard */}
          {Object.keys(statistics).length > 0 && (
            <div className="mt-8">
              {/* Critical Alerts */}
              {statistics.raggingComplaints > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                    <div>
                      <h3 className="text-lg font-bold text-red-800 dark:text-red-300">Critical Attention Required</h3>
                      <p className="text-red-700 dark:text-red-400">
                        {statistics.raggingComplaints} ragging complaint{statistics.raggingComplaints > 1 ? 's' : ''} requiring immediate review
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{statistics.totalComplaints || 0}</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Total</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{statistics.raggingComplaints || 0}</div>
                  <div className="text-sm text-red-600 dark:text-red-400">Ragging</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{statistics.openComplaints || 0}</div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">Open</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{statistics.inProgressComplaints || 0}</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">In Progress</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{statistics.resolvedComplaints || 0}</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Resolved</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{statistics.lostAndFoundComplaints || 0}</div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">Lost & Found</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="ragging">⚠️ Ragging (Priority)</option>
                  <option value="lost_and_found">Lost & Found</option>
                </select>
              </div>
              <select
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
          </div>
        </div>

        {/* Critical Ragging Complaints */}
        {raggingComplaints.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl mb-8">
            <div className="p-6 border-b border-red-200 dark:border-red-700">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <h2 className="text-xl font-bold text-red-800 dark:text-red-300">Critical: Ragging Complaints</h2>
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {raggingComplaints.length} Active
                </span>
              </div>
              <p className="text-red-700 dark:text-red-400 mt-2">
                These complaints require immediate attention and confidential handling.
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-red-100 dark:bg-red-900/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-red-800 dark:text-red-300 uppercase tracking-wider">
                      Complaint Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-red-800 dark:text-red-300 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-red-800 dark:text-red-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-red-800 dark:text-red-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-red-800 dark:text-red-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-200 dark:divide-red-700">
                  {raggingComplaints.map((complaint) => (
                    <tr key={complaint.complaintId} className="hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          <Shield className="h-5 w-5 text-red-600 mt-0.5" />
                          <div>
                            <h3 className="text-sm font-semibold text-red-900 dark:text-red-200 line-clamp-1">
                              {complaint.title}
                            </h3>
                            <p className="text-sm text-red-700 dark:text-red-300 line-clamp-2 mt-1">
                              {complaint.description}
                            </p>
                            {complaint.location && (
                              <div className="flex items-center space-x-1 mt-1">
                                <MapPin className="h-3 w-3 text-red-500" />
                                <span className="text-xs text-red-600">{complaint.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-red-500" />
                          <div>
                            <p className="text-sm font-medium text-red-900 dark:text-red-200">
                              {complaint.studentName || 'Confidential'}
                            </p>
                            <p className="text-xs text-red-600">#{complaint.complaintId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(complaint.status)}
                          <select
                            value={complaint.status}
                            onChange={(e) => updateComplaintStatus(complaint.complaintId, e.target.value)}
                            className="text-xs font-medium border rounded-full px-2 py-1 bg-red-100 text-red-800 border-red-200"
                          >
                            <option value="OPEN">OPEN</option>
                            <option value="IN_PROGRESS">IN PROGRESS</option>
                            <option value="RESOLVED">RESOLVED</option>
                            <option value="CLOSED">CLOSED</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-900 dark:text-red-200">
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => router.push(`/authoritycorner/provost/complaints/${complaint.complaintId}`)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Regular Complaints List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">All Complaints</h2>
          </div>
          
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Complaints Found</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {searchTerm ? "No complaints match your search criteria." : "No complaints have been submitted yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Complaint
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {filteredComplaints.map((complaint) => {
                      const priority = getPriorityLevel(complaint)
                      return (
                        <tr key={complaint.complaintId} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-start space-x-3">
                              {getTypeIcon(complaint.complaintType)}
                              <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                                  {complaint.title}
                                  {complaint.complaintType === 'RAGGING' && (
                                    <span className="ml-2 inline-flex items-center text-xs">
                                      <Shield className="h-3 w-3 text-red-500" />
                                    </span>
                                  )}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">
                                  {complaint.description}
                                </p>
                                {complaint.location && (
                                  <div className="flex items-center space-x-1 mt-1">
                                    <MapPin className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">{complaint.location}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {complaint.studentName || (complaint.complaintType === 'RAGGING' ? 'Confidential' : 'Anonymous')}
                                </p>
                                <p className="text-xs text-gray-500">#{complaint.complaintId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              complaint.complaintType === 'RAGGING' 
                                ? 'bg-red-100 text-red-800 border-red-200' 
                                : 'bg-blue-100 text-blue-800 border-blue-200'
                            }`}>
                              {complaint.complaintType === 'RAGGING' && <Shield className="h-3 w-3 mr-1" />}
                              {complaint.complaintType.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(complaint.status)}
                              <select
                                value={complaint.status}
                                onChange={(e) => updateComplaintStatus(complaint.complaintId, e.target.value)}
                                className={`text-xs font-medium border rounded-full px-2 py-1 ${getStatusColor(complaint.status)}`}
                              >
                                <option value="OPEN">OPEN</option>
                                <option value="IN_PROGRESS">IN PROGRESS</option>
                                <option value="RESOLVED">RESOLVED</option>
                                <option value="CLOSED">CLOSED</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(priority)}`}>
                              {priority}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900 dark:text-white">
                                {new Date(complaint.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => router.push(`/authoritycorner/provost/complaints/${complaint.complaintId}`)}
                              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium text-sm transition-colors flex items-center space-x-1"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Review</span>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
