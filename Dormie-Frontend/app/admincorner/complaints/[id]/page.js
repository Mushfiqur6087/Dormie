"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createApiUrl } from "../../../../lib/api"
import { 
  MessageSquare, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Package,
  Image as ImageIcon,
  Download,
  Eye,
  X,
  Edit,
  Save,
  Shield
} from "lucide-react"

export default function AdminComplaintDetailPage() {
  const router = useRouter()
  const params = useParams()
  const complaintId = params.id

  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editStatus, setEditStatus] = useState("")
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (complaintId) {
      fetchComplaint()
    }
  }, [complaintId])

  const fetchComplaint = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("jwtToken")
      if (!token) {
        setError("Authentication token not found. Please log in again.")
        return
      }

      const response = await fetch(createApiUrl(`/api/complaints/${complaintId}`), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          setError("Complaint not found.")
        } else if (response.status === 403) {
          setError("You don't have permission to view this complaint.")
        } else {
          const errorText = await response.text()
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }
        return
      }

      const data = await response.json()
      setComplaint(data)
      setEditStatus(data.status)
    } catch (err) {
      console.error("Error fetching complaint:", err)
      setError("Failed to load complaint details")
    } finally {
      setLoading(false)
    }
  }

  const updateComplaintStatus = async () => {
    setUpdating(true)
    try {
      const token = localStorage.getItem("jwtToken")
      const response = await fetch(createApiUrl(`/api/complaints/${complaintId}/status`), {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: editStatus })
      })

      if (response.ok) {
        const updatedComplaint = await response.json()
        setComplaint(updatedComplaint)
        setIsEditing(false)
        setError(null)
      } else {
        throw new Error("Failed to update complaint status")
      }
    } catch (err) {
      console.error("Error updating complaint status:", err)
      setError("Failed to update complaint status")
    } finally {
      setUpdating(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "resolved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "closed":
        return <CheckCircle className="h-5 w-5 text-gray-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
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
      case "ragging":
        return <AlertTriangle className="h-6 w-6 text-red-500" />
      case "lost_and_found":
        return <Package className="h-6 w-6 text-blue-500" />
      default:
        return <MessageSquare className="h-6 w-6 text-gray-500" />
    }
  }

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "ragging":
        return "bg-red-100 text-red-800 border-red-200"
      case "lost_and_found":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityLevel = (complaint) => {
    if (complaint?.complaintType === 'RAGGING') return 'HIGH'
    if (complaint?.status === 'OPEN' && 
        new Date() - new Date(complaint.createdAt) > 7 * 24 * 60 * 60 * 1000) return 'MEDIUM'
    return 'NORMAL'
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'MEDIUM':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
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
          <p className="text-lg font-semibold mb-4">Error Loading Complaint</p>
          <p className="mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => router.back()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => {
                setError(null)
                fetchComplaint()
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Complaint Not Found</h2>
          <button
            onClick={() => router.back()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const priority = getPriorityLevel(complaint)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="w-12 h-12 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                {getTypeIcon(complaint.complaintType)}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Complaint Management</h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">#{complaint.complaintId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(priority)}`}>
                {priority} PRIORITY
              </span>
              {!isEditing ? (
                <div className="flex items-center space-x-2">
                  {getStatusIcon(complaint.status)}
                  <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(complaint.status)}`}>
                    {complaint.status?.replace('_', ' ').toUpperCase()}
                  </span>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="ml-2 p-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                  <button
                    onClick={updateComplaintStatus}
                    disabled={updating}
                    className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>{updating ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditStatus(complaint.status)
                    }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Complaint Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-6">
                {getTypeIcon(complaint.complaintType)}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{complaint.title}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(complaint.complaintType)}`}>
                      {complaint.complaintType?.replace('_', ' ')}
                    </span>
                    {complaint.complaintType === 'RAGGING' && (
                      <span className="flex items-center space-x-1 text-red-600 text-xs">
                        <Shield className="h-3 w-3" />
                        <span>CONFIDENTIAL</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </div>
            </div>

            {/* Images */}
            {complaint.images && complaint.images.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                  <ImageIcon className="h-6 w-6" />
                  <span>Evidence ({complaint.images.length})</span>
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {complaint.images.map((image, index) => (
                    <div 
                      key={index} 
                      className="relative group cursor-pointer"
                      onClick={() => setSelectedImage(image)}
                    >
                      <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
                        <img
                          src={`data:image/jpeg;base64,${image}`}
                          alt={`Evidence ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-xl transition-all duration-300 flex items-center justify-center">
                        <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Student Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Student Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Student Name</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {complaint.studentName || 'Anonymous'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Student ID</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {complaint.studentId || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Complaint Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Complaint Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {formatDate(complaint.createdAt)}
                    </p>
                  </div>
                </div>
                
                {complaint.updatedAt && complaint.updatedAt !== complaint.createdAt && (
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {formatDate(complaint.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}
                
                {complaint.location && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {complaint.location}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/admincorner/complaints')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to All Complaints</span>
                </button>
                
                {complaint.complaintType === 'LOST_AND_FOUND' && (
                  <button
                    onClick={() => router.push('/admincorner/complaints?filter=lost_and_found')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <Package className="h-4 w-4" />
                    <span>View All Lost & Found</span>
                  </button>
                )}
                
                {complaint.complaintType === 'RAGGING' && (
                  <button
                    onClick={() => router.push('/admincorner/complaints?filter=ragging')}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span>View All Ragging Reports</span>
                  </button>
                )}
              </div>
            </div>

            {/* Sensitivity Notice */}
            {complaint.complaintType === 'RAGGING' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Shield className="h-6 w-6 text-red-600" />
                  <h3 className="text-lg font-bold text-red-800 dark:text-red-300">Confidential Report</h3>
                </div>
                <p className="text-red-700 dark:text-red-400 text-sm mb-3">
                  This ragging complaint is highly sensitive and confidential. Handle with appropriate care and follow institutional protocols.
                </p>
                <ul className="text-red-700 dark:text-red-400 text-xs space-y-1">
                  <li>• Only visible to administrators and provost</li>
                  <li>• Student identity must be protected</li>
                  <li>• Follow up promptly and discreetly</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={`data:image/jpeg;base64,${selectedImage}`}
              alt="Full size evidence"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}
