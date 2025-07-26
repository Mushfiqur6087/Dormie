'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Calendar, Clock } from "lucide-react"
import { useRouter } from 'next/navigation'
import { createApiUrl } from '../../../../lib/api'

export default function MessManagerDashboard() {
    const [calls, setCalls] = useState([])
    const [activeCalls, setActiveCalls] = useState([])
    const [activeManagers, setActiveManagers] = useState([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token')
            
            // Fetch all calls
            const callsResponse = await fetch(createApiUrl('/api/mess-manager-calls'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (callsResponse.ok) {
                const callsData = await callsResponse.json()
                setCalls(callsData)
            }

            // Fetch active calls
            const activeCallsResponse = await fetch(createApiUrl('/api/mess-manager-calls/active'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (activeCallsResponse.ok) {
                const activeCallsData = await activeCallsResponse.json()
                setActiveCalls(activeCallsData)
            }

            // Fetch active managers
            const managersResponse = await fetch(createApiUrl('/api/mess-managers/active'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (managersResponse.ok) {
                const managersData = await managersResponse.json()
                setActiveManagers(managersData)
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        const colors = {
            'ACTIVE': 'bg-green-500',
            'CLOSED': 'bg-red-500',
            'SELECTION_COMPLETE': 'bg-blue-500'
        }
        return (
            <Badge className={`${colors[status] || 'bg-gray-500'} text-white`}>
                {status}
            </Badge>
        )
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
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Mess Manager Management</h1>
                <Button 
                    onClick={() => router.push('/authoritycorner/provost/mess-manager/create-call')}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Call
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{calls.length}</div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Calls</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCalls.length}</div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Managers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeManagers.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                    variant="outline" 
                    onClick={() => router.push('/authoritycorner/provost/mess-manager/calls')}
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                    <Calendar className="w-6 h-6" />
                    <span>View All Calls</span>
                </Button>
                
                <Button 
                    variant="outline" 
                    onClick={() => router.push('/authoritycorner/provost/mess-manager/applications')}
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                    <Users className="w-6 h-6" />
                    <span>View Applications</span>
                </Button>
                
                <Button 
                    variant="outline" 
                    onClick={() => router.push('/authoritycorner/provost/mess-manager/managers')}
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                    <Users className="w-6 h-6" />
                    <span>Manage Managers</span>
                </Button>
                
                <Button 
                    variant="outline" 
                    onClick={() => router.push('/authoritycorner/provost/mess-manager/fund-requests')}
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                    <Calendar className="w-6 h-6" />
                    <span>Fund Requests</span>
                </Button>
            </div>

            {/* Recent Active Calls */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Active Calls</CardTitle>
                    <CardDescription>Currently open mess manager calls</CardDescription>
                </CardHeader>
                <CardContent>
                    {activeCalls.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No active calls found</p>
                    ) : (
                        <div className="space-y-4">
                            {activeCalls.slice(0, 5).map((call) => (
                                <div key={call.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <h3 className="font-semibold">{call.title}</h3>
                                        <p className="text-sm text-gray-600">{call.month} {call.year}</p>
                                        <p className="text-sm text-gray-500">Deadline: {new Date(call.deadline).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {getStatusBadge(call.status)}
                                        <span className="text-sm text-gray-500">{call.totalApplications} applications</span>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => router.push(`/authoritycorner/provost/mess-manager/calls/${call.id}`)}
                                        >
                                            View
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Current Active Managers */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Active Mess Managers</CardTitle>
                    <CardDescription>Students currently assigned as mess managers</CardDescription>
                </CardHeader>
                <CardContent>
                    {activeManagers.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No active mess managers found</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeManagers.map((manager) => (
                                <div key={manager.id} className="p-4 border rounded-lg">
                                    <h3 className="font-semibold">{manager.studentName || manager.userName}</h3>
                                    <p className="text-sm text-gray-600">{manager.month} {manager.year}</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(manager.startDate).toLocaleDateString()} - {new Date(manager.endDate).toLocaleDateString()}
                                    </p>
                                    <Badge className="mt-2 bg-green-500 text-white">
                                        {manager.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
