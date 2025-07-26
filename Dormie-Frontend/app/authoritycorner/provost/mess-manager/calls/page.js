'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Filter, Eye, Plus, Search } from "lucide-react"
import { useRouter } from 'next/navigation'
import { createApiUrl } from '../../../../../lib/api'

export default function MessManagerCalls() {
    const [calls, setCalls] = useState([])
    const [filteredCalls, setFilteredCalls] = useState([])
    const [loading, setLoading] = useState(true)
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
        fetchCalls()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [calls, filters])

    const fetchCalls = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(createApiUrl('/api/mess-manager-calls'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setCalls(data)
            }
        } catch (error) {
            console.error('Error fetching calls:', error)
        } finally {
            setLoading(false)
        }
    }

    const applyFilters = () => {
        let filtered = [...calls]

        // Apply status filter
        if (filters.status && filters.status !== 'ALL') {
            filtered = filtered.filter(call => call.status === filters.status)
        }

        // Apply month filter
        if (filters.month && filters.month !== 'ALL') {
            filtered = filtered.filter(call => call.month === filters.month)
        }

        // Apply year filter
        if (filters.year && filters.year !== 'ALL') {
            filtered = filtered.filter(call => call.year.toString() === filters.year)
        }

        // Apply search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            filtered = filtered.filter(call => 
                call.title.toLowerCase().includes(searchLower) ||
                call.purpose.toLowerCase().includes(searchLower) ||
                (call.description && call.description.toLowerCase().includes(searchLower))
            )
        }

        setFilteredCalls(filtered)
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

    const handleCloseCall = async (callId) => {
        if (!confirm('Are you sure you want to close this call? This action cannot be undone.')) {
            return
        }

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(createApiUrl(`/api/mess-manager-calls/${callId}/close`), {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                fetchCalls() // Refresh the list
            } else {
                alert('Failed to close the call')
            }
        } catch (error) {
            console.error('Error closing call:', error)
            alert('An error occurred while closing the call')
        }
    }

    const uniqueYears = [...new Set(calls.map(call => call.year))].sort((a, b) => b - a)

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
                <h1 className="text-3xl font-bold text-gray-900">Mess Manager Calls</h1>
                <Button 
                    onClick={() => router.push('/authoritycorner/provost/mess-manager/create-call')}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Call
                </Button>
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
                                    placeholder="Search calls..."
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
                                    <SelectItem value="CLOSED">Closed</SelectItem>
                                    <SelectItem value="SELECTION_COMPLETE">Selection Complete</SelectItem>
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

            {/* Calls List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Calls ({filteredCalls.length})</CardTitle>
                    <CardDescription>
                        Manage mess manager recruitment calls
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredCalls.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No calls found matching your criteria</p>
                            {Object.values(filters).some(f => f) && (
                                <Button variant="outline" onClick={clearFilters} className="mt-2">
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredCalls.map((call) => (
                                <div key={call.id} className="border rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-semibold">{call.title}</h3>
                                                {getStatusBadge(call.status)}
                                            </div>
                                            <p className="text-gray-600 mb-2">{call.purpose}</p>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-500">
                                                <span>Period: {call.month} {call.year}</span>
                                                <span>Deadline: {new Date(call.deadline).toLocaleDateString()}</span>
                                                <span>Applications: {call.totalApplications || 0}</span>
                                                <span>Created: {new Date(call.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {call.description && (
                                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{call.description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2 ml-4">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => router.push(`/authoritycorner/provost/mess-manager/calls/${call.id}`)}
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                View
                                            </Button>
                                            {call.status === 'ACTIVE' && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => handleCloseCall(call.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    Close
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
        </div>
    )
}
