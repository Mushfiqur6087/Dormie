'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, Users, CheckCircle, XCircle, Clock, UserCheck } from "lucide-react"
import { useRouter, useParams } from 'next/navigation'

export default function CallDetails() {
    const [call, setCall] = useState(null)
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const router = useRouter()
    const params = useParams()
    const callId = params.id

    useEffect(() => {
        if (callId) {
            fetchCallDetails()
            fetchApplications()
        }
    }, [callId])

    const fetchCallDetails = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`/api/mess-manager-calls/${callId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setCall(data)
            }
        } catch (error) {
            console.error('Error fetching call details:', error)
        }
    }

    const fetchApplications = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`/api/mess-manager-applications/call/${callId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setApplications(data)
            }
        } catch (error) {
            console.error('Error fetching applications:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApplicationAction = async (applicationId, action) => {
        setActionLoading(true)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`/api/mess-manager-applications/${applicationId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: action })
            })

            if (response.ok) {
                fetchApplications() // Refresh applications
                if (action === 'APPROVED') {
                    // Also assign as mess manager
                    await assignMessManager(applicationId)
                }
            } else {
                alert(`Failed to ${action.toLowerCase()} application`)
            }
        } catch (error) {
            console.error(`Error ${action.toLowerCase()} application:`, error)
            alert('An error occurred')
        } finally {
            setActionLoading(false)
        }
    }

    const assignMessManager = async (applicationId) => {
        try {
            const token = localStorage.getItem('token')
            await fetch('/api/mess-managers/assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ applicationId })
            })
        } catch (error) {
            console.error('Error assigning mess manager:', error)
        }
    }

    const closeCall = async () => {
        if (!confirm('Are you sure you want to close this call?')) return

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`/api/mess-manager-calls/${callId}/close`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                fetchCallDetails()
            }
        } catch (error) {
            console.error('Error closing call:', error)
        }
    }

    const getStatusBadge = (status) => {
        const colors = {
            'ACTIVE': 'bg-green-500',
            'CLOSED': 'bg-red-500',
            'SELECTION_COMPLETE': 'bg-blue-500',
            'PENDING': 'bg-yellow-500',
            'APPROVED': 'bg-green-500',
            'REJECTED': 'bg-red-500'
        }
        return (
            <Badge className={`${colors[status] || 'bg-gray-500'} text-white`}>
                {status}
            </Badge>
        )
    }

    const getApplicationIcon = (status) => {
        switch (status) {
            case 'APPROVED':
                return <CheckCircle className="w-5 h-5 text-green-500" />
            case 'REJECTED':
                return <XCircle className="w-5 h-5 text-red-500" />
            default:
                return <Clock className="w-5 h-5 text-yellow-500" />
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    if (!call) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Call Not Found</h1>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </div>
            </div>
        )
    }

    const pendingApplications = applications.filter(app => app.status === 'PENDING')
    const approvedApplications = applications.filter(app => app.status === 'APPROVED')
    const rejectedApplications = applications.filter(app => app.status === 'REJECTED')

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center space-x-4 mb-6">
                <Button 
                    variant="outline" 
                    onClick={() => router.back()}
                    className="flex items-center space-x-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">Call Details</h1>
            </div>

            {/* Call Information */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="flex items-center space-x-2">
                                <Calendar className="w-5 h-5" />
                                <span>{call.title}</span>
                            </CardTitle>
                            <CardDescription className="mt-2">
                                {call.purpose}
                            </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                            {getStatusBadge(call.status)}
                            {call.status === 'ACTIVE' && (
                                <Button 
                                    variant="outline" 
                                    onClick={closeCall}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    Close Call
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                            <p className="text-sm text-gray-500">Period</p>
                            <p className="font-semibold">{call.month} {call.year}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Deadline</p>
                            <p className="font-semibold">{new Date(call.deadline).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Applications</p>
                            <p className="font-semibold">{applications.length}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Created</p>
                            <p className="font-semibold">{new Date(call.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {call.description && (
                        <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-2">Description</p>
                            <p className="text-gray-700">{call.description}</p>
                        </div>
                    )}

                    {call.requirements && (
                        <div>
                            <p className="text-sm text-gray-500 mb-2">Requirements</p>
                            <p className="text-gray-700">{call.requirements}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Applications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Users className="w-5 h-5" />
                        <span>Applications ({applications.length})</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="pending" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="pending" className="flex items-center space-x-2">
                                <Clock className="w-4 h-4" />
                                <span>Pending ({pendingApplications.length})</span>
                            </TabsTrigger>
                            <TabsTrigger value="approved" className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4" />
                                <span>Approved ({approvedApplications.length})</span>
                            </TabsTrigger>
                            <TabsTrigger value="rejected" className="flex items-center space-x-2">
                                <XCircle className="w-4 h-4" />
                                <span>Rejected ({rejectedApplications.length})</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="pending" className="space-y-4">
                            {pendingApplications.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No pending applications</p>
                            ) : (
                                pendingApplications.map((app) => (
                                    <div key={app.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold">{app.studentName || app.userName}</h4>
                                                <p className="text-sm text-gray-600">{app.motivation}</p>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Applied: {new Date(app.appliedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {getApplicationIcon(app.status)}
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => handleApplicationAction(app.id, 'APPROVED')}
                                                    disabled={actionLoading}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <UserCheck className="w-4 h-4 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => handleApplicationAction(app.id, 'REJECTED')}
                                                    disabled={actionLoading}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <XCircle className="w-4 h-4 mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="approved" className="space-y-4">
                            {approvedApplications.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No approved applications</p>
                            ) : (
                                approvedApplications.map((app) => (
                                    <div key={app.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold">{app.studentName || app.userName}</h4>
                                                <p className="text-sm text-gray-600">{app.motivation}</p>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Applied: {new Date(app.appliedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {getApplicationIcon(app.status)}
                                                {getStatusBadge(app.status)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="rejected" className="space-y-4">
                            {rejectedApplications.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No rejected applications</p>
                            ) : (
                                rejectedApplications.map((app) => (
                                    <div key={app.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold">{app.studentName || app.userName}</h4>
                                                <p className="text-sm text-gray-600">{app.motivation}</p>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Applied: {new Date(app.appliedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {getApplicationIcon(app.status)}
                                                {getStatusBadge(app.status)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
