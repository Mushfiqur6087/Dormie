"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createApiUrl } from "../../../lib/api"
import { 
  Shield, 
  Users, 
  Home, 
  Eye, 
  AlertCircle, 
  TrendingUp,
  UserCheck,
  Building,
  Calendar,
  BarChart3
} from "lucide-react"

export default function ProvostDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0
  })
  const [students, setStudents] = useState([])
  const [residentStudents, setResidentStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
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
      // Fetch students data
      const studentsResponse = await fetch(createApiUrl("/api/students"), { headers })

      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json()
        
        setStudents(studentsData)
        
        // Filter resident students and fetch their room assignments
        const residentStudentsList = studentsData.filter(student => student.residencyStatus === 'resident')
        
        // Fetch room assignments for each resident student
        const residentWithRooms = await Promise.all(
          residentStudentsList.map(async (student) => {
            try {
              const roomResponse = await fetch(createApiUrl(`/api/rooms/student-room/${student.studentId}`), { headers })
              let roomNumber = "Not Assigned"
              
              if (roomResponse.ok) {
                const roomData = await roomResponse.text()
                roomNumber = roomData || "Not Assigned"
              }
              
              return {
                ...student,
                roomNumber: roomNumber
              }
            } catch (error) {
              console.error(`Error fetching room for student ${student.studentId}:`, error)
              return {
                ...student,
                roomNumber: "Not Assigned"
              }
            }
          })
        )
        
        setResidentStudents(residentWithRooms)
        
        // Calculate statistics
        setStats({
          totalStudents: studentsData.length
        })
      } else {
        setError("Failed to fetch dashboard data")
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError("An unexpected error occurred while fetching dashboard data.")
    } finally {
      setLoading(false)
    }
  }

  const navigateToStudentDetails = () => {
    router.push("/authoritycorner/provost/student-details")
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Provost Dashboard</h1>
            <p className="text-purple-100 text-lg">Hall Management Overview</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading dashboard...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Students Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalStudents}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>Active registrations</span>
              </div>
            </div>

            {/* Resident Students Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Resident Students</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{students.filter(s => s.residencyStatus === 'resident').length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Home className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-blue-600">
                <UserCheck className="h-4 w-4 mr-1" />
                <span>Living in dormitory</span>
              </div>
            </div>

            {/* Attached Students Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Attached Students</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{students.filter(s => s.residencyStatus === 'attached').length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-purple-600">
                <Calendar className="h-4 w-4 mr-1" />
                <span>External students</span>
              </div>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 gap-8">
            {/* Students Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Users className="h-6 w-6 mr-3 text-blue-600" />
                  Students Overview
                </h2>
                <button
                  onClick={navigateToStudentDetails}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Total Registered Students</span>
                  <span className="font-bold text-blue-600">{stats.totalStudents}</span>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Recent Students</h3>
                  {students.slice(0, 3).map((student, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {`${student.firstName || ''} ${student.lastName || ''}`.trim() || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ID: {student.studentId || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Resident Students with Room Assignments */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Home className="h-6 w-6 mr-3 text-green-600" />
                Resident Students & Room Assignments
              </h2>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">{residentStudents.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Resident Students</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {residentStudents.length === 0 ? (
                <div className="text-center py-8">
                  <Home className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Resident Students</h3>
                  <p className="text-gray-500 dark:text-gray-400">No students are currently registered as residents.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {residentStudents.map((student, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {`${student.firstName || ''} ${student.lastName || ''}`.trim() || 'N/A'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {student.studentId || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Home className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Room</span>
                          </div>
                          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                            student.roomNumber && student.roomNumber !== 'Not Assigned'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {student.roomNumber || 'Not Assigned'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Department</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {student.department || 'N/A'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Batch</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {student.batch || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
