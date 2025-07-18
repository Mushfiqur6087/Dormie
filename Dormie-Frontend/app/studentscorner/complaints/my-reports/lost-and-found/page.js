"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createApiUrl } from "../../../../../lib/api"
import { 
  Package, 
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
  ArrowLeft,
  MapPinIcon
} from "lucide-react"

export default function MyLostAndFoundPage() {
  const router = useRouter()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [updating, setUpdating] = useState({})

  useEffect(() => {
    fetchMyLostAndFoundComplaints()
  }, [])

  const fetchMyLostAndFoundComplaints = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("jwtToken")
      if (!token) {
        setError("Authentication token not found. Please log in again.")
        return
      }

      const response = await fetch(createApiUrl("/api/complaints/my-reports/lost_and_found"), {
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
      console.error("Error fetching lost and found complaints:", err)
      setError("Failed to load your lost and found reports")
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
        // Update the complaint in the local state
        setComplaints(prev => prev.map(complaint => 
          complaint.complaintId === complaintId 
            ? { ...complaint, status: newStatus }
            : complaint
        ))
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

  const handleSearch = () => {
    // Filter by search term on frontend
    if (!searchTerm.trim()) {
      return complaints
    }
    
    return complaints.filter(complaint => 
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const filteredComplaints = handleSearch().filter(complaint => {
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

  const getAvailableStatuses = (currentStatus) => {
    const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]
    return statuses.filter(status => status.toLowerCase() !== currentStatus.toLowerCase())
  }

  const getItemTypeIcon = (description) => {
    const lowerDesc = description.toLowerCase()
    if (lowerDesc.includes("phone") || lowerDesc.includes("mobile")) {
      return "📱"
    } else if (lowerDesc.includes("laptop") || lowerDesc.includes("computer")) {
      return "💻"
    } else if (lowerDesc.includes("book") || lowerDesc.includes("textbook")) {
      return "📚"
    } else if (lowerDesc.includes("wallet") || lowerDesc.includes("purse")) {
      return "👛"
    } else if (lowerDesc.includes("key") || lowerDesc.includes("keys")) {
      return "🔑"
    } else if (lowerDesc.includes("watch")) {
      return "⌚"
    } else if (lowerDesc.includes("bag") || lowerDesc.includes("backpack")) {
      return "🎒"
    } else if (lowerDesc.includes("glasses")) {
      return "👓"
    } else if (lowerDesc.includes("jewelry") || lowerDesc.includes("ring")) {
      return "💍"
    } else if (lowerDesc.includes("card")) {
      return "💳"
    }
    return "📦"
  }

  if (loading && complaints.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-8 py-6 rounded-xl shadow-lg max-w-md text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p className="text-lg font-semibold mb-4">Error Loading Reports</p>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null)
              fetchMyLostAndFoundComplaints()
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/studentscorner/complaints/my-reports")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">My Lost & Found</h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">Track your lost and found items</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push("/studentscorner/complaints/create")}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Plus className="h-5 w-5" />
                <span>Report Item</span>
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{complaints.length}</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Total Items</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {complaints.filter(c => c.status.toLowerCase() === "open").length}
              </div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400">Still Lost</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {complaints.filter(c => c.status.toLowerCase() === "resolved").length}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Found</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {complaints.filter(c => c.status.toLowerCase() === "in_progress").length}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">In Progress</div>
            </div>
          </div>
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
                  placeholder="Search lost items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="open">Lost</option>
                <option value="in_progress">Being Searched</option>
                <option value="resolved">Found</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Lost Items Found</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
                {searchTerm ? "No items match your search criteria." : "You haven't reported any lost items yet."}
              </p>
              <button
                onClick={() => router.push("/studentscorner/complaints/create")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Report Lost Item
              </button>
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredComplaints.map((complaint) => (
                  <div key={complaint.complaintId} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="text-2xl">{getItemTypeIcon(complaint.description)}</div>
                          <Package className="h-5 w-5 text-blue-500" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {complaint.title}
                          </h3>
                          <span className="px-3 py-1 rounded-full text-xs font-medium border bg-blue-50 border-blue-200 text-blue-800">
                            LOST & FOUND
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

                        {/* Contact Information */}
                        {complaint.contactInfo && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-400">
                              <User className="h-4 w-4" />
                              <span className="text-sm font-medium">Contact Info: {complaint.contactInfo}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => router.push(`/studentscorner/complaints/${complaint.complaintId}`)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                        
                        {/* Status Update Dropdown */}
                        {complaint.status.toLowerCase() !== "closed" && (
                          <div className="flex items-center space-x-2">
                            <select
                              value={complaint.status}
                              onChange={(e) => handleStatusUpdate(complaint.complaintId, e.target.value)}
                              disabled={updating[complaint.complaintId]}
                              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
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
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
