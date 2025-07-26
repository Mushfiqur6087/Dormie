'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Users, Send, Clock, CheckCircle, XCircle, ChefHat, DollarSign } from "lucide-react"
import { useRouter } from 'next/navigation'
import { createApiUrl } from '../../../lib/api'

export default function StudentMessManagerDashboard() {
    const [activeCalls, setActiveCalls] = useState([])
    const [myApplications, setMyApplications] = useState([])
    const [myAssignments, setMyAssignments] = useState([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('jwtToken')
            console.log('JWT Token found:', !!token)
            console.log('Token length:', token ? token.length : 0)
            
            // Fetch active calls
            const callsUrl = createApiUrl('/api/mess-manager-calls/active')
            console.log('Fetching calls from:', callsUrl)
            
            const callsResponse = await fetch(callsUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            
            console.log('Calls response status:', callsResponse.status)
            console.log('Calls response headers:', callsResponse.headers)
            
            if (callsResponse.ok) {
                const callsData = await callsResponse.json()
                console.log('Calls data:', callsData)
                setActiveCalls(callsData)
            } else {
                const errorText = await callsResponse.text()
                console.error('Calls error response:', errorText)
            }

            // Fetch my applications
            const appsUrl = createApiUrl('/api/mess-manager-applications/my-applications')
            console.log('Fetching applications from:', appsUrl)
            
            const appsResponse = await fetch(appsUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            
            console.log('Apps response status:', appsResponse.status)
            
            if (appsResponse.ok) {
                const appsData = await appsResponse.json()
                console.log('Apps data:', appsData)
                setMyApplications(appsData)
            } else {
                const errorText = await appsResponse.text()
                console.error('Apps error response:', errorText)
            }

            // Fetch my assignments (when I'm a mess manager)
            const assignmentsUrl = createApiUrl('/api/mess-managers/my-assignments')
            console.log('Fetching assignments from:', assignmentsUrl)
            
            const assignmentsResponse = await fetch(assignmentsUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            
            console.log('Assignments response status:', assignmentsResponse.status)
            
            if (assignmentsResponse.ok) {
                const assignmentsData = await assignmentsResponse.json()
                console.log('Assignments data:', assignmentsData)
                setMyAssignments(assignmentsData)
            } else {
                const errorText = await assignmentsResponse.text()
                console.error('Assignments error response:', errorText)
            }
        } catch (error) {
            console.error('Error fetching data:', error)
            console.error('Error stack:', error.stack)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        const colors = {
            'ACTIVE': 'bg-green-500',
            'CLOSED': 'bg-red-500',
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

    const hasAppliedToCall = (callId) => {
        return myApplications.some(app => app.callId === callId)
    }

    const isDeadlinePassed = (deadline) => {
        return new Date(deadline) <= new Date()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Mess Manager</h1>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available Calls</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCalls.length}</div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">My Applications</CardTitle>
                        <Send className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{myApplications.length}</div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{myAssignments.filter(a => a.status === 'ACTIVE').length}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="calls" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="calls">Available Calls</TabsTrigger>
                    <TabsTrigger value="applications">My Applications</TabsTrigger>
                    <TabsTrigger value="assignments">My Assignments</TabsTrigger>
                </TabsList>

                {/* Available Calls Tab */}
                <TabsContent value="calls" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Available Mess Manager Calls</CardTitle>
                            <CardDescription>Apply to become a mess manager for the upcoming months</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {activeCalls.length === 0 ? (
                                <div className="text-center py-8">
                                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No active calls available at the moment</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activeCalls.map((call) => (
                                        <div key={call.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="text-lg font-semibold">{call.title}</h3>
                                                        {getStatusBadge(call.status)}
                                                    </div>
                                                    <p className="text-gray-600 mb-2">{call.purpose}</p>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-500 mb-2">
                                                        <span>Period: {call.month} {call.year}</span>
                                                        <span>Deadline: {new Date(call.deadline).toLocaleDateString()}</span>
                                                        <span>Applications: {call.totalApplications || 0}</span>
                                                    </div>
                                                    {call.description && (
                                                        <p className="text-sm text-gray-600 line-clamp-2">{call.description}</p>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    {hasAppliedToCall(call.id) ? (
                                                        <Badge className="bg-blue-500 text-white">Applied</Badge>
                                                    ) : isDeadlinePassed(call.deadline) ? (
                                                        <Badge className="bg-gray-500 text-white">Closed</Badge>
                                                    ) : (
                                                        <Button 
                                                            onClick={() => router.push(`/studentscorner/mess-manager/apply/${call.id}`)}
                                                            className="bg-blue-600 hover:bg-blue-700"
                                                        >
                                                            <Send className="w-4 h-4 mr-2" />
                                                            Apply
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* My Applications Tab */}
                <TabsContent value="applications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Applications</CardTitle>
                            <CardDescription>Track the status of your mess manager applications</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {myApplications.length === 0 ? (
                                <div className="text-center py-8">
                                    <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">You haven't applied to any calls yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {myApplications.map((app) => (
                                        <div key={app.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="font-semibold">{app.callTitle}</h3>
                                                        {getApplicationIcon(app.status)}
                                                        {getStatusBadge(app.status)}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">{app.motivation}</p>
                                                    <div className="text-xs text-gray-500">
                                                        <p>Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                                                        <p>Period: {app.month} {app.year}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* My Assignments Tab */}
                <TabsContent value="assignments" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Mess Manager Assignments</CardTitle>
                            <CardDescription>Manage your current and past mess manager duties</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {myAssignments.length === 0 ? (
                                <div className="text-center py-8">
                                    <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">You haven't been assigned as a mess manager yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {myAssignments.map((assignment) => (
                                        <div key={assignment.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="font-semibold">Mess Manager - {assignment.month} {assignment.year}</h3>
                                                        {getStatusBadge(assignment.status)}
                                                    </div>
                                                    <div className="text-sm text-gray-600 mb-2">
                                                        <p>Period: {new Date(assignment.startDate).toLocaleDateString()} - {new Date(assignment.endDate).toLocaleDateString()}</p>
                                                        <p>Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                {assignment.status === 'ACTIVE' && (
                                                    <div className="flex space-x-2">
                                                        <Button 
                                                            variant="outline"
                                                            onClick={() => router.push('/studentscorner/mess-manager/menu')}
                                                        >
                                                            <ChefHat className="w-4 h-4 mr-2" />
                                                            Manage Menu
                                                        </Button>
                                                        <Button 
                                                            variant="outline"
                                                            onClick={() => router.push('/studentscorner/mess-manager/funds')}
                                                        >
                                                            <DollarSign className="w-4 h-4 mr-2" />
                                                            Fund Requests
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
