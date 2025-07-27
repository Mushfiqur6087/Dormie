"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from '@/hooks/use-toast'
import { createApiUrl } from '../../../lib/api'
import { Home, MapPin, FileText, Calendar, CheckCircle, XCircle, Clock, Loader2, Send, Trash2 } from 'lucide-react'

export default function RoomChangePage() {
  const [currentApplication, setCurrentApplication] = useState(null)
  const [currentRoom, setCurrentRoom] = useState(null)
  const [availableRooms, setAvailableRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  
  // Form state
  const [selectedRoom, setSelectedRoom] = useState('')
  const [reason, setReason] = useState('')

  useEffect(() => {
    fetchCurrentRoom()
    fetchCurrentApplication()
    fetchAvailableRooms()
  }, [])

  const fetchCurrentRoom = async () => {
    try {
      const token = localStorage.getItem('jwtToken')
      
      const response = await fetch(createApiUrl('/api/rooms/my-current-room'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.text()
        // The backend now returns just the room ID as a string
        if (data && data !== 'No room assignment found' && data.trim() !== '') {
          setCurrentRoom(data.replace(/['"]/g, '')) // Remove any quotes
        }
        // If it's "No room assignment found" or empty, currentRoom stays null
      } else {
        console.error('Failed to fetch current room:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching current room:', error)
    }
  }

  const fetchCurrentApplication = async () => {
    console.log('=== Fetching Current Application ===')
    try {
      const token = localStorage.getItem('jwtToken')
      console.log('JWT Token exists:', !!token)
      
      const response = await fetch(createApiUrl('/api/room-change/my-application'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('Fetch application response status:', response.status)

      if (response.ok) {
        try {
          // Get response as text first to see what we're getting
          const responseText = await response.text()
          console.log('Raw response text:', responseText)
          
          // Try to parse as JSON if it's not the "No application found" message
          if (responseText && responseText !== 'No room change application found') {
            try {
              const data = JSON.parse(responseText)
              console.log('Parsed application data:', data)
              
              // Check if the response is an actual application object
              if (data && typeof data === 'object' && data.applicationId) {
                setCurrentApplication(data)
                console.log('Current application set:', data)
              } else {
                console.log('Response is not a valid application object')
                setCurrentApplication(null)
              }
            } catch (parseError) {
              console.error('Failed to parse JSON:', parseError)
              setCurrentApplication(null)
            }
          } else {
            console.log('No application found message received')
            setCurrentApplication(null)
          }
        } catch (textError) {
          console.error('Failed to get response text:', textError)
          setCurrentApplication(null)
        }
      } else {
        console.error('Failed to fetch current application:', response.status, response.statusText)
        setCurrentApplication(null)
      }
    } catch (error) {
      console.error('Error fetching current application:', error)
      setCurrentApplication(null)
    }
    console.log('=== Fetch Current Application Complete ===')
  }

  const fetchAvailableRooms = async () => {
    try {
      const token = localStorage.getItem('jwtToken')
      
      const response = await fetch(createApiUrl('/api/rooms/available-for-change'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAvailableRooms(data)
      }
    } catch (error) {
      console.error('Error fetching available rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitApplication = async () => {
    console.log('=== Room Change Application Submission ===')
    console.log('Selected room:', selectedRoom)
    console.log('Reason:', reason)
    
    if (!selectedRoom || !reason.trim()) {
      console.log('Validation failed: missing room or reason')
      toast({
        title: "Error",
        description: "Please select a room and provide a reason for the change",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const token = localStorage.getItem('jwtToken')
      console.log('JWT Token exists:', !!token)
      
      const requestBody = {
        preferredRoom: selectedRoom,
        reason: reason.trim()
      }
      
      console.log('Request body:', requestBody)
      console.log('Submitting to:', createApiUrl('/api/room-change/apply'))
      
      const response = await fetch(createApiUrl('/api/room-change/apply'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log('Response received:')
      console.log('Status:', response.status)
      console.log('Status text:', response.statusText)
      console.log('Headers:', response.headers)
      
      if (response.ok) {
        const result = await response.text()
        console.log('Success response text:', result)
        
        toast({
          title: "Success",
          description: result || "Room change application submitted successfully",
        })
        
        // Reset form
        setSelectedRoom('')
        setReason('')
        
        console.log('Refreshing data...')
        // Refresh data to show the new application
        await fetchCurrentApplication()
        await fetchCurrentRoom() // In case room status changed
        console.log('Data refresh completed')
        
      } else {
        const errorText = await response.text()
        console.error('Error response:')
        console.error('Status:', response.status)
        console.error('Error text:', errorText)
        
        toast({
          title: "Error",
          description: errorText || "Failed to submit application",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Network/Exception error:', error)
      console.error('Error details:', error.message)
      console.error('Error stack:', error.stack)
      
      toast({
        title: "Error", 
        description: "Network error while submitting application: " + error.message,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
      console.log('=== Application submission completed ===')
    }
  }

  const handleCancelApplication = async () => {
    try {
      setCancelling(true)
      const token = localStorage.getItem('jwtToken')
      
      const response = await fetch(createApiUrl('/api/room-change/cancel'), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.text()
        toast({
          title: "Success",
          description: result || "Application cancelled successfully",
        })
        fetchCurrentApplication()
      } else {
        const errorText = await response.text()
        toast({
          title: "Error",
          description: errorText || "Failed to cancel application",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error cancelling application:', error)
      toast({
        title: "Error",
        description: "Network error while cancelling application",
        variant: "destructive",
      })
    } finally {
      setCancelling(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>
      case 'APPROVED':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'REJECTED':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading room change information...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Room Change Request</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Apply for a room change or manage your existing application
        </p>
      </div>

      {/* Current Room Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            Current Room Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentRoom ? (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-lg font-medium">Room {currentRoom}</span>
            </div>
          ) : (
            <p className="text-gray-500">No room currently assigned</p>
          )}
        </CardContent>
      </Card>

      {/* Current Application Status */}
      {currentApplication && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Current Application
              </span>
              {getStatusBadge(currentApplication.applicationStatus || 'UNKNOWN')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Requesting:</strong> {currentApplication.currentRoom} → {currentApplication.preferredRoom}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Applied on:</strong> {new Date(currentApplication.applicationDate).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                <div className="text-sm">
                  <strong>Reason:</strong>
                  <p className="text-gray-600 mt-1">{currentApplication.reason}</p>
                </div>
              </div>

              {currentApplication.applicationStatus && currentApplication.applicationStatus.toUpperCase() === 'PENDING' && (
                <div className="pt-3">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        disabled={cancelling}
                      >
                        {cancelling ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Cancel Application
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Room Change Application</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to cancel your room change application? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Application</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleCancelApplication}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Cancel Application
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Application Form */}
      {(!currentApplication || (currentApplication.applicationStatus && currentApplication.applicationStatus.toUpperCase() === 'REJECTED')) && currentRoom && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Submit Room Change Request
            </CardTitle>
            <CardDescription>
              Select your preferred room and provide a reason for the change request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="room-select">Preferred Room</Label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger id="room-select">
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.map((room) => (
                      <SelectItem key={room.roomNo} value={room.roomNo}>
                        Room {room.roomNo} ({room.getAvailableSpaces || room.totalCapacity - room.currentStudent} spaces available)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reason">Reason for Room Change</Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide a detailed reason for your room change request..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {reason.length}/1000 characters
                </p>
              </div>

              <Button 
                onClick={handleSubmitApplication}
                disabled={submitting || !selectedRoom || !reason.trim()}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Room Change Request
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No room assigned message */}
      {!currentRoom && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <Home className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">You need to have a current room assignment before applying for a room change.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Application status message */}
      {currentApplication && currentApplication.applicationStatus && currentApplication.applicationStatus.toUpperCase() === 'APPROVED' && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-gray-500">
                Your room change application has been approved! You have been moved to room {currentApplication.preferredRoom}.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
