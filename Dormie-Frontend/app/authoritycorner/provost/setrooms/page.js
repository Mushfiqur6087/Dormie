"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Home, AlertCircle, Users, Building, Eye, UserPlus, ArrowRight } from "lucide-react"

export default function SetRooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [displayedRooms, setDisplayedRooms] = useState(10)
  const [unassignedStudents, setUnassignedStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState("")
  const [selectedRoom, setSelectedRoom] = useState("")
  const [assigning, setAssigning] = useState(false)
  const [assignmentMessage, setAssignmentMessage] = useState("")
  const router = useRouter()

  const fetchUnassignedStudents = useCallback(async () => {
    setStudentsLoading(true)
    
    const jwtToken = localStorage.getItem("jwtToken")
    if (!jwtToken) return

    const authHeaders = {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    }

    try {
      const response = await fetch("http://localhost:8080/api/rooms/unassigned-students", {
        method: "GET",
        headers: authHeaders,
      })

      if (response.ok) {
        const studentsData = await response.json()
        setUnassignedStudents(Array.isArray(studentsData) ? studentsData : [])
      } else {
        console.error("Failed to fetch unassigned students")
      }
    } catch (err) {
      console.error("Error fetching unassigned students:", err)
    } finally {
      setStudentsLoading(false)
    }
  }, [])

  const fetchRooms = useCallback(async () => {
    setLoading(true)
    setError(null)

    const jwtToken = localStorage.getItem("jwtToken")

    if (!jwtToken) {
      setError("Authentication required. Please log in.")
      router.push("/login")
      return
    }

    const authHeaders = {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    }

    try {
      const response = await fetch("http://localhost:8080/api/rooms", {
        method: "GET",
        headers: authHeaders,
      })

      if (response.ok) {
        const roomsData = await response.json()
        setRooms(Array.isArray(roomsData) ? roomsData : [])
      } else {
        const errorText = await response.text()
        setError(`Failed to load rooms: ${errorText || response.statusText}`)
      }
    } catch (err) {
      setError(`Network error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchRooms()
    fetchUnassignedStudents()
  }, [fetchRooms, fetchUnassignedStudents])

  const handleShowMore = () => {
    setDisplayedRooms(prev => prev + 10)
  }

  const handleHideRooms = () => {
    setDisplayedRooms(prev => Math.max(0, prev - 10))
  }

  const handleAssignRoom = async () => {
    if (!selectedStudent || !selectedRoom) {
      setAssignmentMessage("Please select both a student and a room.")
      return
    }

    setAssigning(true)
    setAssignmentMessage("")

    const jwtToken = localStorage.getItem("jwtToken")
    if (!jwtToken) {
      setAssignmentMessage("Authentication required. Please log in.")
      setAssigning(false)
      return
    }

    // Find the selected student data
    const studentData = unassignedStudents.find(student => student.userId.toString() === selectedStudent)
    if (!studentData) {
      setAssignmentMessage("Selected student data not found.")
      setAssigning(false)
      return
    }

    const requestBody = {
      userId: studentData.userId,
      studentId: studentData.studentId,
      roomNo: selectedRoom
    }

    const authHeaders = {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    }

    try {
      const response = await fetch("http://localhost:8080/api/rooms/assign-room", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        setAssignmentMessage("Room assigned successfully!")
        setSelectedStudent("")
        setSelectedRoom("")
        // Refresh data
        fetchRooms()
        fetchUnassignedStudents()
      } else {
        const errorText = await response.text()
        setAssignmentMessage(`Failed to assign room: ${errorText || response.statusText}`)
      }
    } catch (err) {
      setAssignmentMessage(`Network error: ${err.message}`)
    } finally {
      setAssigning(false)
    }
  }

  const visibleRooms = rooms.slice(0, displayedRooms)
  const hasMoreRooms = displayedRooms < rooms.length
  const canHideRooms = displayedRooms > 0
  
  // Get available rooms (rooms with current < total capacity)
  const availableRooms = rooms.filter(room => room.currentStudent < room.totalCapacity)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Home className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Set Rooms</h1>
            <p className="text-purple-100 text-lg">Manage room allocations and capacity</p>
          </div>
        </div>
      </div>

      {/* See Rooms Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <Eye className="h-6 w-6 mr-3 text-purple-600" />
          All Rooms
        </h2>

        {loading && (
          <div className="flex items-center justify-center space-x-3 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Loading rooms...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-3 text-red-600 py-4">
            <AlertCircle className="h-6 w-6" />
            <p className="font-semibold">Error: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {rooms.length === 0 ? (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">No rooms found</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">Rooms will appear here once they are added to the system</p>
              </div>
            ) : (
              <>
                {/* Rooms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                  {visibleRooms.map((room, index) => (
                    <div
                      key={room.roomNo}
                      className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Home className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          <span className="font-bold text-lg text-gray-900 dark:text-white">Room {room.roomNo}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Current Students:</span>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="font-semibold text-blue-600 dark:text-blue-400">{room.currentStudent}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total Capacity:</span>
                          <div className="flex items-center space-x-1">
                            <Building className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="font-semibold text-green-600 dark:text-green-400">{room.totalCapacity}</span>
                          </div>
                        </div>

                        {/* Occupancy Bar */}
                        <div className="mt-4">
                          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                            <span>Occupancy</span>
                            <span>{Math.round((room.currentStudent / room.totalCapacity) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                room.currentStudent === room.totalCapacity
                                  ? "bg-red-500"
                                  : room.currentStudent > room.totalCapacity * 0.8
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{ width: `${Math.min((room.currentStudent / room.totalCapacity) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="mt-3">
                          {room.currentStudent >= room.totalCapacity ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                              Full
                            </span>
                          ) : room.currentStudent === 0 ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              Empty
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              Available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show More / Hide Rooms Buttons */}
                {(hasMoreRooms || canHideRooms) && (
                  <div className="text-center space-x-4">
                    {canHideRooms && (
                      <button
                        onClick={handleHideRooms}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 inline-flex items-center space-x-2"
                      >
                        <span>Hide Rooms</span>
                        <span className="bg-gray-500 text-white text-sm px-2 py-1 rounded-full">
                          -{Math.min(10, displayedRooms)}
                        </span>
                      </button>
                    )}
                    
                    {hasMoreRooms && (
                      <button
                        onClick={handleShowMore}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 inline-flex items-center space-x-2"
                      >
                        <span>Show More Rooms</span>
                        <span className="bg-purple-500 text-white text-sm px-2 py-1 rounded-full">
                          +{Math.min(10, rooms.length - displayedRooms)}
                        </span>
                      </button>
                    )}
                  </div>
                )}

                {/* Summary Stats */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Rooms</p>
                        <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{rooms.length}</p>
                      </div>
                      <Building className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Students</p>
                        <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                          {rooms.reduce((sum, room) => sum + room.currentStudent, 0)}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Capacity</p>
                        <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                          {rooms.reduce((sum, room) => sum + room.totalCapacity, 0)}
                        </p>
                      </div>
                      <Home className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Assign Room Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <UserPlus className="h-6 w-6 mr-3 text-green-600" />
          Assign Room
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Select Student */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Student</h3>
            <div className="space-y-3">
              {studentsLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                  <span className="text-gray-600 dark:text-gray-300">Loading students...</span>
                </div>
              ) : (
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select a student...</option>
                  {unassignedStudents.map((student) => (
                    <option key={student.userId} value={student.userId}>
                      Student ID: {student.studentId}
                    </option>
                  ))}
                </select>
              )}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {unassignedStudents.length} unassigned students available
              </div>
            </div>
          </div>

          {/* Select Room */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Room</h3>
            <div className="space-y-3">
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select a room...</option>
                {availableRooms.map((room) => (
                  <option key={room.roomNo} value={room.roomNo}>
                    Room {room.roomNo} ({room.currentStudent}/{room.totalCapacity})
                  </option>
                ))}
              </select>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {availableRooms.length} rooms with available space
              </div>
            </div>
          </div>

          {/* Assign Button */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assign</h3>
            <div className="space-y-3">
              <button
                onClick={handleAssignRoom}
                disabled={!selectedStudent || !selectedRoom || assigning}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                  !selectedStudent || !selectedRoom || assigning
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                {assigning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Assigning...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Assign Room</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
              
              {assignmentMessage && (
                <div className={`p-3 rounded-lg text-sm ${
                  assignmentMessage.includes("successfully") 
                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                    : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                }`}>
                  {assignmentMessage}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Assignment Preview */}
        {selectedStudent && selectedRoom && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Assignment Preview:</h4>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              Student ID: <strong>{unassignedStudents.find(s => s.userId.toString() === selectedStudent)?.studentId}</strong> will be assigned to Room <strong>{selectedRoom}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
