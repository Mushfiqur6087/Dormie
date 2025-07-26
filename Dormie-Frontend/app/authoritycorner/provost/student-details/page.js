"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createApiUrl } from "../../../../lib/api"
import { 
  Users, 
  ArrowLeft, 
  Search, 
  Filter,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Hash,
  User,
  Home,
  Eye,
  Download
} from "lucide-react"

export default function StudentDetails() {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all") // all, resident, attached
  const router = useRouter()

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [students, searchTerm, filterType])

  const fetchStudents = async () => {
    setLoading(true)
    setError("")

    const jwtToken = localStorage.getItem("jwtToken")
    if (!jwtToken) {
      setError("You are not logged in. Please log in as Provost.")
      setLoading(false)
      return
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    }

    try {
      const response = await fetch(createApiUrl("/api/students"), { headers })
      
      if (response.ok) {
        const studentsData = await response.json()
        setStudents(studentsData)
      } else {
        setError("Failed to fetch students data")
      }
    } catch (err) {
      console.error("Error fetching students:", err)
      setError("An unexpected error occurred while fetching students data.")
    } finally {
      setLoading(false)
    }
  }

  const filterStudents = () => {
    let filtered = students

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(student => {
        const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim()
        return (
          (fullName && fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (student.studentId && student.studentId.toString().includes(searchTerm)) ||
          (student.regNo && student.regNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (student.department && student.department.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      })
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(student => student.residencyStatus === filterType)
    }

    setFilteredStudents(filtered)
  }

  const goBack = () => {
    router.back()
  }

  const exportStudentData = () => {
    // Create CSV content
    const headers = ["Name", "Student ID", "Contact", "Department", "Batch", "Residency Status"]
    const csvContent = [
      headers.join(","),
      ...filteredStudents.map(student => [
        `${student.firstName || ''} ${student.lastName || ''}`.trim() || "N/A",
        student.studentId || "N/A", 
        student.contactNo || "N/A",
        student.department || "N/A",
        student.batch || "N/A",
        student.residencyStatus || "N/A"
      ].join(","))
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={goBack}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Users className="h-6 w-6 mr-3 text-blue-600" />
                Student Details
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Complete list of registered students</p>
            </div>
          </div>
          <button
            onClick={exportStudentData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, student ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Students</option>
              <option value="resident">Resident</option>
              <option value="attached">Attached</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredStudents.length}</span> of <span className="font-semibold text-gray-900 dark:text-white">{students.length}</span> students
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <span className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Resident: {students.filter(s => s.residencyStatus === 'resident').length}</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Attached: {students.filter(s => s.residencyStatus === 'attached').length}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Student List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading students...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
          </div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-100 dark:border-gray-700">
          <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Students Found</h3>
          <p className="text-gray-600 dark:text-gray-400">No students match your current search criteria.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredStudents.map((student, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      student.type === 'resident' 
                        ? 'bg-blue-100 dark:bg-blue-900/30' 
                        : 'bg-green-100 dark:bg-green-900/30'
                    }`}>
                      <User className={`h-6 w-6 ${
                        student.type === 'resident' ? 'text-blue-600' : 'text-green-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {`${student.firstName || ''} ${student.lastName || ''}`.trim() || 'N/A'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.residencyStatus === 'resident'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {student.residencyStatus || 'N/A'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <Hash className="h-4 w-4" />
                          <span>{student.studentId || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <User className="h-4 w-4" />
                          <span>{student.regNo || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <Phone className="h-4 w-4" />
                          <span>{student.contactNo || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4" />
                          <span>{student.department || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          <span>{student.batch || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <Home className="h-4 w-4" />
                          <span>{student.presentAddress || 'Not Provided'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
