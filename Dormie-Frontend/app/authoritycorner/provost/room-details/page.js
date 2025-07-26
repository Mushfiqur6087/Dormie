"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createApiUrl } from "../../../../lib/api"
import { 
  Building, 
  ArrowLeft, 
  Search, 
  Filter, 
  Home,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Bed,
  Hash,
  MapPin
} from "lucide-react"

export default function RoomDetails() {
  const [rooms, setRooms] = useState([])
  const [filteredRooms, setFilteredRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all") // all, occupied, available
  const router = useRouter()

  useEffect(() => {
    fetchRooms()
  }, [])

  useEffect(() => {
    filterRooms()
  }, [rooms, searchTerm, filterStatus])

  const fetchRooms = async () => {
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
      const response = await fetch(createApiUrl("/api/rooms"), { headers })
      
      if (response.ok) {
        const roomsData = await response.json()
        setRooms(roomsData)
      } else {
        setError("Failed to fetch rooms data")
      }
    } catch (err) {
      console.error("Error fetching rooms:", err)
      setError("An unexpected error occurred while fetching rooms.")
    } finally {
      setLoading(false)
    }
  }

  const filterRooms = () => {
    let filtered = rooms

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(room => 
        (room.roomNumber && room.roomNumber.toString().includes(searchTerm)) ||
        (room.building && room.building.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (room.floor && room.floor.toString().includes(searchTerm))
      )
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(room => {
        if (filterStatus === "occupied") return room.occupied
        if (filterStatus === "available") return !room.occupied
        return true
      })
    }

    setFilteredRooms(filtered)
  }

  const goBack = () => {
    router.push("/authoritycorner/provost")
  }

  const getOccupancyRate = () => {
    if (rooms.length === 0) return 0
    const occupiedCount = rooms.filter(room => room.occupied).length
    return ((occupiedCount / rooms.length) * 100).toFixed(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={goBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Room Details</h1>
                <p className="text-gray-600 dark:text-gray-400">Comprehensive room management</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">{rooms.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Rooms</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{rooms.length}</p>
            </div>
            <Building className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Occupied</p>
              <p className="text-2xl font-bold text-red-600">{rooms.filter(r => r.occupied).length}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Available</p>
              <p className="text-2xl font-bold text-green-600">{rooms.filter(r => !r.occupied).length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Occupancy Rate</p>
              <p className="text-2xl font-bold text-blue-600">{getOccupancyRate()}%</p>
            </div>
            <Eye className="h-8 w-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by room number, building, or floor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Rooms</option>
              <option value="occupied">Occupied</option>
              <option value="available">Available</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <span>Showing {filteredRooms.length} of {rooms.length} rooms</span>
        </div>
      </div>

      {/* Rooms List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading rooms...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          {filteredRooms.length === 0 ? (
            <div className="p-12 text-center">
              <Building className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No rooms found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || filterStatus !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "No rooms are available in the system yet."
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredRooms.map((room, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        room.occupied 
                          ? 'bg-red-100 dark:bg-red-900/30' 
                          : 'bg-green-100 dark:bg-green-900/30'
                      }`}>
                        <Home className={`h-5 w-5 ${
                          room.occupied ? 'text-red-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Room {room.roomNumber || 'N/A'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {room.building || 'Unknown Building'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      room.occupied 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {room.occupied ? 'Occupied' : 'Available'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Floor</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {room.floor || 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Capacity</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {room.capacity || 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bed className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Type</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {room.type || 'Standard'}
                      </span>
                    </div>

                    {room.occupied && room.occupants && (
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="h-4 w-4 text-blue-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Occupants</span>
                        </div>
                        <div className="space-y-1">
                          {room.occupants.slice(0, 2).map((occupant, idx) => (
                            <p key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                              {occupant.name || 'Unknown'} ({occupant.studentId || 'N/A'})
                            </p>
                          ))}
                          {room.occupants.length > 2 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              +{room.occupants.length - 2} more
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
