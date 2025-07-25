"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from '@/hooks/use-toast'
import { Calendar, User, MapPin, FileText, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'

export default function RoomChangeApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const [activeTab, setActiveTab] = useState('pending')

  // Fetch all applications on component mount
  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('jwtToken')
      
      const response = await fetch('http://localhost:8080/api/room-change/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch room change applications",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast({
        title: "Error",
        description: "Network error while fetching applications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (applicationId) => {
    try {
      setProcessingId(applicationId)
      const token = localStorage.getItem('jwtToken')
      
      const response = await fetch(`http://localhost:8080/api/room-change/approve/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.text()
        toast({
          title: "Success",
          description: result || "Application approved successfully",
        })
        fetchApplications() // Refresh the list
      } else {
        const errorText = await response.text()
        toast({
          title: "Error",
          description: errorText || "Failed to approve application",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error approving application:', error)
      toast({
        title: "Error",
        description: "Network error while approving application",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (applicationId) => {
    try {
      setProcessingId(applicationId)
      const token = localStorage.getItem('jwtToken')
      
      const response = await fetch(`http://localhost:8080/api/room-change/reject/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.text()
        toast({
          title: "Success",
          description: result || "Application rejected successfully",
        })
        fetchApplications() // Refresh the list
      } else {
        const errorText = await response.text()
        toast({
          title: "Error",
          description: errorText || "Failed to reject application",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error rejecting application:', error)
      toast({
        title: "Error",
        description: "Network error while rejecting application",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'APPROVED':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'REJECTED':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>
    }
  }

  const filterApplicationsByStatus = (status) => {
    return applications.filter(app => app.applicationStatus && app.applicationStatus.toUpperCase() === status.toUpperCase())
  }

  const ApplicationCard = ({ application }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {application.studentName}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Applied: {new Date(application.applicationDate).toLocaleDateString()}
              </span>
              <span>ID: {application.studentIdNo}</span>
            </CardDescription>
          </div>
          {getStatusBadge(application.applicationStatus)}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm">
              <strong>From:</strong> {application.currentRoom} → <strong>To:</strong> {application.preferredRoom}
            </span>
          </div>
          
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
            <div className="text-sm">
              <strong>Reason:</strong>
              <p className="text-gray-600 mt-1">{application.reason}</p>
            </div>
          </div>

          {application.applicationStatus && application.applicationStatus.toUpperCase() === 'PENDING' && (
            <div className="flex gap-2 pt-3">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="text-green-600 border-green-600 hover:bg-green-50"
                    disabled={processingId === application.applicationId}
                  >
                    {processingId === application.applicationId ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Approve
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Approve Room Change Application</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to approve this room change request? This will move {application.studentName} from {application.currentRoom} to {application.preferredRoom}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleApprove(application.applicationId)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    disabled={processingId === application.applicationId}
                  >
                    {processingId === application.applicationId ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Reject
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reject Room Change Application</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to reject this room change request from {application.studentName}?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleReject(application.applicationId)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Reject
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {application.applicationStatus && application.applicationStatus.toUpperCase() !== 'PENDING' && (
            <div className="text-sm text-gray-500 pt-2">
              Processed on: {new Date(application.processedDate || application.applicationDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading room change applications...</span>
        </div>
      </div>
    )
  }

  const pendingApplications = filterApplicationsByStatus('PENDING')
  const approvedApplications = filterApplicationsByStatus('APPROVED')
  const rejectedApplications = filterApplicationsByStatus('REJECTED')

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Room Change Applications</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Review and manage student room change requests
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending ({pendingApplications.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Approved ({approvedApplications.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Rejected ({rejectedApplications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingApplications.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-gray-500">No pending applications found</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {pendingApplications.map((application) => (
                <ApplicationCard key={application.applicationId} application={application} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          {approvedApplications.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-gray-500">No approved applications found</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {approvedApplications.map((application) => (
                <ApplicationCard key={application.applicationId} application={application} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {rejectedApplications.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-gray-500">No rejected applications found</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {rejectedApplications.map((application) => (
                <ApplicationCard key={application.applicationId} application={application} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
