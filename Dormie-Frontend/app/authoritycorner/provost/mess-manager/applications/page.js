'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Filter, Search, CheckCircle, XCircle, Clock, UserCheck, Eye } from "lucide-react"
import { useRouter } from 'next/navigation'

export default function ApplicationManagement() {
    const [applications, setApplications] = useState([])
    const [filteredApplications, setFilteredApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [filters, setFilters] = useState({
        status: 'ALL',
        month: 'ALL',
        year: 'ALL',
        search: ''
    })
    const router = useRouter()

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    useEffect(() => {
        fetchApplications()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [applications, filters])

    const fetchApplications = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('/api/mess-manager-applications', {
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

    const applyFilters = () => {
        let filtered = [...applications]

        // Apply status filter
        if (filters.status && filters.status !== 'ALL') {
            filtered = filtered.filter(app => app.status === filters.status)
        }

        // Apply month filter
        if (filters.month && filters.month !== 'ALL') {
            filtered = filtered.filter(app => app.month === filters.month)
        }

        // Apply year filter
        if (filters.year && filters.year !== 'ALL') {
            filtered = filtered.filter(app => app.year.toString() === filters.year)
        }

        // Apply search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            filtered = filtered.filter(app => 
                (app.studentName && app.studentName.toLowerCase().includes(searchLower)) ||
                (app.userName && app.userName.toLowerCase().includes(searchLower)) ||
                (app.callTitle && app.callTitle.toLowerCase().includes(searchLower)) ||
                (app.motivation && app.motivation.toLowerCase().includes(searchLower))
            )
        }

        setFilteredApplications(filtered)
    }

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const clearFilters = () => {
        setFilters({
            status: 'ALL',
            month: 'ALL',
            year: 'ALL',
            search: ''
        })
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

    const getStatusBadge = (status) => {
        const colors = {
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

    const uniqueYears = [...new Set(applications.map(app => app.year))].sort((a, b) => b - a)
    
    const pendingApplications = filteredApplications.filter(app => app.status === 'PENDING')
    const approvedApplications = filteredApplications.filter(app => app.status === 'APPROVED')
    const rejectedApplications = filteredApplications.filter(app => app.status === 'REJECTED')

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Application Management</h1>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{applications.length}</div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingApplications.length}</div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{approvedApplications.length}</div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{rejectedApplications.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Filter className="w-5 h-5" />
                        <span>Filters</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search applications..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All statuses</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Month</label>
                            <Select value={filters.month} onValueChange={(value) => handleFilterChange('month', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All months" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All months</SelectItem>
                                    {months.map((month) => (
                                        <SelectItem key={month} value={month}>
                                            {month}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Year</label>
                            <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All years" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All years</SelectItem>
                                    {uniqueYears.map((year) => (
                                        <SelectItem key={year} value={year.toString()}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end mt-4">
                        <Button variant="outline" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Applications Tabs */}
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Applications</CardTitle>
                            <CardDescription>Applications awaiting your review</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pendingApplications.length === 0 ? (
                                <div className="text-center py-8">
                                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No pending applications</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pendingApplications.map((app) => (
                                        <div key={app.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="font-semibold">{app.studentName || app.userName}</h3>
                                                        {getApplicationIcon(app.status)}
                                                        {getStatusBadge(app.status)}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">{app.callTitle}</p>
                                                    <p className="text-gray-700 mb-2">{app.motivation}</p>
                                                    <div className="text-xs text-gray-500 space-y-1">
                                                        <p>Period: {app.month} {app.year}</p>
                                                        <p>Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2 ml-4">
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
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="approved" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Approved Applications</CardTitle>
                            <CardDescription>Successfully approved applications</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {approvedApplications.length === 0 ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No approved applications</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {approvedApplications.map((app) => (
                                        <div key={app.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="font-semibold">{app.studentName || app.userName}</h3>
                                                        {getApplicationIcon(app.status)}
                                                        {getStatusBadge(app.status)}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">{app.callTitle}</p>
                                                    <p className="text-gray-700 mb-2">{app.motivation}</p>
                                                    <div className="text-xs text-gray-500 space-y-1">
                                                        <p>Period: {app.month} {app.year}</p>
                                                        <p>Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
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

                <TabsContent value="rejected" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Rejected Applications</CardTitle>
                            <CardDescription>Applications that were not approved</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {rejectedApplications.length === 0 ? (
                                <div className="text-center py-8">
                                    <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No rejected applications</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {rejectedApplications.map((app) => (
                                        <div key={app.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="font-semibold">{app.studentName || app.userName}</h3>
                                                        {getApplicationIcon(app.status)}
                                                        {getStatusBadge(app.status)}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">{app.callTitle}</p>
                                                    <p className="text-gray-700 mb-2">{app.motivation}</p>
                                                    <div className="text-xs text-gray-500 space-y-1">
                                                        <p>Period: {app.month} {app.year}</p>
                                                        <p>Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
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
            </Tabs>
        </div>
    )
}
