'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Filter, Search, UserCheck, UserX, Calendar, Clock, ChefHat } from "lucide-react"
import { createApiUrl } from '../../../../../lib/api'

export default function ManagersManagement() {
    const [managers, setManagers] = useState([])
    const [filteredManagers, setFilteredManagers] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [filters, setFilters] = useState({
        status: 'ALL',
        month: 'ALL',
        year: 'ALL',
        search: ''
    })

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    useEffect(() => {
        fetchManagers()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [managers, filters])

    const fetchManagers = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(createApiUrl('/api/mess-managers'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setManagers(data)
            }
        } catch (error) {
            console.error('Error fetching managers:', error)
        } finally {
            setLoading(false)
        }
    }

    const applyFilters = () => {
        let filtered = [...managers]

        // Apply status filter
        if (filters.status && filters.status !== "ALL") {
            filtered = filtered.filter(manager => manager.status === filters.status)
        }

        // Apply month filter
        if (filters.month && filters.month !== "ALL") {
            filtered = filtered.filter(manager => manager.month === filters.month)
        }

        // Apply year filter
        if (filters.year && filters.year !== "ALL") {
            filtered = filtered.filter(manager => manager.year.toString() === filters.year)
        }

        // Apply search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            filtered = filtered.filter(manager => 
                (manager.studentName && manager.studentName.toLowerCase().includes(searchLower)) ||
                (manager.userName && manager.userName.toLowerCase().includes(searchLower))
            )
        }

        setFilteredManagers(filtered)
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

    const handleTerminateManager = async (managerId) => {
        if (!confirm('Are you sure you want to terminate this mess manager assignment?')) {
            return
        }

        setActionLoading(true)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(createApiUrl(`/api/mess-managers/${managerId}/terminate`), {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                fetchManagers()
            } else {
                alert('Failed to terminate manager assignment')
            }
        } catch (error) {
            console.error('Error terminating manager:', error)
            alert('An error occurred while terminating the assignment')
        } finally {
            setActionLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        const colors = {
            'ACTIVE': 'bg-green-500',
            'TERMINATED': 'bg-red-500',
            'COMPLETED': 'bg-blue-500'
        }
        return (
            <Badge className={`${colors[status] || 'bg-gray-500'} text-white`}>
                {status}
            </Badge>
        )
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ACTIVE':
                return <UserCheck className="w-5 h-5 text-green-500" />
            case 'TERMINATED':
                return <UserX className="w-5 h-5 text-red-500" />
            case 'COMPLETED':
                return <Calendar className="w-5 h-5 text-blue-500" />
            default:
                return <Clock className="w-5 h-5 text-gray-500" />
        }
    }

    const uniqueYears = [...new Set(managers.map(manager => manager.year))].sort((a, b) => b - a)
    
    const activeManagers = filteredManagers.filter(manager => manager.status === 'ACTIVE')
    const completedManagers = filteredManagers.filter(manager => manager.status === 'COMPLETED')
    const terminatedManagers = filteredManagers.filter(manager => manager.status === 'TERMINATED')

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Mess Managers</h1>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Managers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{managers.length}</div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Currently Active</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{activeManagers.length}</div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Terms</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedManagers.length}</div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Terminated</CardTitle>
                        <UserX className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{terminatedManagers.length}</div>
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
                                    placeholder="Search managers..."
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
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="TERMINATED">Terminated</SelectItem>
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

            {/* Managers Tabs */}
            <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="active" className="flex items-center space-x-2">
                        <UserCheck className="w-4 h-4" />
                        <span>Active ({activeManagers.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Completed ({completedManagers.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="terminated" className="flex items-center space-x-2">
                        <UserX className="w-4 h-4" />
                        <span>Terminated ({terminatedManagers.length})</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Mess Managers</CardTitle>
                            <CardDescription>Currently assigned mess managers</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {activeManagers.length === 0 ? (
                                <div className="text-center py-8">
                                    <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No active mess managers</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activeManagers.map((manager) => (
                                        <div key={manager.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="font-semibold">{manager.studentName || manager.userName}</h3>
                                                        {getStatusIcon(manager.status)}
                                                        {getStatusBadge(manager.status)}
                                                    </div>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-500 mb-2">
                                                        <span>Period: {manager.month} {manager.year}</span>
                                                        <span>Start: {new Date(manager.startDate).toLocaleDateString()}</span>
                                                        <span>End: {new Date(manager.endDate).toLocaleDateString()}</span>
                                                        <span>Assigned: {new Date(manager.assignedAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2 ml-4">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleTerminateManager(manager.id)}
                                                        disabled={actionLoading}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <UserX className="w-4 h-4 mr-1" />
                                                        Terminate
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

                <TabsContent value="completed" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Completed Assignments</CardTitle>
                            <CardDescription>Mess managers who completed their terms</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {completedManagers.length === 0 ? (
                                <div className="text-center py-8">
                                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No completed assignments</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {completedManagers.map((manager) => (
                                        <div key={manager.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="font-semibold">{manager.studentName || manager.userName}</h3>
                                                        {getStatusIcon(manager.status)}
                                                        {getStatusBadge(manager.status)}
                                                    </div>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-500">
                                                        <span>Period: {manager.month} {manager.year}</span>
                                                        <span>Start: {new Date(manager.startDate).toLocaleDateString()}</span>
                                                        <span>End: {new Date(manager.endDate).toLocaleDateString()}</span>
                                                        <span>Assigned: {new Date(manager.assignedAt).toLocaleDateString()}</span>
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

                <TabsContent value="terminated" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Terminated Assignments</CardTitle>
                            <CardDescription>Mess managers whose assignments were terminated</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {terminatedManagers.length === 0 ? (
                                <div className="text-center py-8">
                                    <UserX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No terminated assignments</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {terminatedManagers.map((manager) => (
                                        <div key={manager.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="font-semibold">{manager.studentName || manager.userName}</h3>
                                                        {getStatusIcon(manager.status)}
                                                        {getStatusBadge(manager.status)}
                                                    </div>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-500">
                                                        <span>Period: {manager.month} {manager.year}</span>
                                                        <span>Start: {new Date(manager.startDate).toLocaleDateString()}</span>
                                                        <span>End: {new Date(manager.endDate).toLocaleDateString()}</span>
                                                        <span>Terminated: {manager.terminatedAt ? new Date(manager.terminatedAt).toLocaleDateString() : 'N/A'}</span>
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
