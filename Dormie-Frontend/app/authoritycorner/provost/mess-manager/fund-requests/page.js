'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Filter, Search, CheckCircle, XCircle, Clock, FileText, Eye, X, MessageSquare } from "lucide-react"
import { createApiUrl } from '../../../../../lib/api'

export default function FundRequestManagement() {
    const [fundRequests, setFundRequests] = useState([])
    const [filteredRequests, setFilteredRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [reviewingRequest, setReviewingRequest] = useState(null)
    const [reviewComments, setReviewComments] = useState('')
    const [filters, setFilters] = useState({
        status: 'ALL',
        urgency: 'ALL',
        search: ''
    })

    useEffect(() => {
        fetchFundRequests()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [fundRequests, filters])

    const fetchFundRequests = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(createApiUrl('/api/fund-requests'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setFundRequests(data)
            }
        } catch (error) {
            console.error('Error fetching fund requests:', error)
        } finally {
            setLoading(false)
        }
    }

    const applyFilters = () => {
        let filtered = [...fundRequests]

        // Apply status filter
        if (filters.status && filters.status !== "ALL") {
            filtered = filtered.filter(req => req.status === filters.status)
        }

        // Apply urgency filter
        if (filters.urgency && filters.urgency !== "ALL") {
            filtered = filtered.filter(req => req.urgency === filters.urgency)
        }

        // Apply search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            filtered = filtered.filter(req => 
                req.purpose.toLowerCase().includes(searchLower) ||
                (req.description && req.description.toLowerCase().includes(searchLower)) ||
                (req.requestedBy && req.requestedBy.toLowerCase().includes(searchLower))
            )
        }

        setFilteredRequests(filtered)
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
            urgency: 'ALL',
            search: ''
        })
    }

    const handleReviewRequest = async (requestId, action) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(createApiUrl(`/api/fund-requests/${requestId}/review`), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: action,
                    comments: reviewComments.trim() || undefined
                })
            })

            if (response.ok) {
                fetchFundRequests()
                setReviewingRequest(null)
                setReviewComments('')
            } else {
                const errorData = await response.json()
                alert(errorData.message || `Failed to ${action.toLowerCase()} request`)
            }
        } catch (error) {
            console.error(`Error ${action.toLowerCase()} request:`, error)
            alert('An error occurred')
        }
    }

    const getStatusBadge = (status) => {
        const colors = {
            'PENDING': 'bg-yellow-500',
            'APPROVED': 'bg-green-500',
            'REJECTED': 'bg-red-500',
            'UNDER_REVIEW': 'bg-blue-500'
        }
        return (
            <Badge className={`${colors[status] || 'bg-gray-500'} text-white`}>
                {status.replace('_', ' ')}
            </Badge>
        )
    }

    const getUrgencyBadge = (urgency) => {
        const colors = {
            'LOW': 'bg-green-100 text-green-800',
            'MEDIUM': 'bg-yellow-100 text-yellow-800',
            'HIGH': 'bg-red-100 text-red-800'
        }
        return (
            <Badge className={colors[urgency] || 'bg-gray-100 text-gray-800'}>
                {urgency}
            </Badge>
        )
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED':
                return <CheckCircle className="w-5 h-5 text-green-500" />
            case 'REJECTED':
                return <XCircle className="w-5 h-5 text-red-500" />
            case 'UNDER_REVIEW':
                return <FileText className="w-5 h-5 text-blue-500" />
            default:
                return <Clock className="w-5 h-5 text-yellow-500" />
        }
    }

    const pendingRequests = filteredRequests.filter(req => req.status === 'PENDING' || req.status === 'UNDER_REVIEW')
    const approvedRequests = filteredRequests.filter(req => req.status === 'APPROVED')
    const rejectedRequests = filteredRequests.filter(req => req.status === 'REJECTED')

    const totalRequestedAmount = filteredRequests.reduce((sum, req) => sum + req.amount, 0)
    const approvedAmount = approvedRequests.reduce((sum, req) => sum + req.amount, 0)
    const pendingAmount = pendingRequests.reduce((sum, req) => sum + req.amount, 0)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Fund Request Management</h1>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredRequests.length}</div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingRequests.length}</div>
                        <p className="text-xs text-muted-foreground">₹{pendingAmount.toLocaleString()}</p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalRequestedAmount.toLocaleString()}</div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved Amount</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">₹{approvedAmount.toLocaleString()}</div>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search requests..."
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
                                    <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Urgency</label>
                            <Select value={filters.urgency} onValueChange={(value) => handleFilterChange('urgency', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All urgencies" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All urgencies</SelectItem>
                                    <SelectItem value="LOW">Low</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
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

            {/* Fund Requests Tabs */}
            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pending" className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Pending ({pendingRequests.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="approved" className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Approved ({approvedRequests.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="flex items-center space-x-2">
                        <XCircle className="w-4 h-4" />
                        <span>Rejected ({rejectedRequests.length})</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Fund Requests</CardTitle>
                            <CardDescription>Requests awaiting your review and approval</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pendingRequests.length === 0 ? (
                                <div className="text-center py-8">
                                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No pending requests</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pendingRequests.map((request) => (
                                        <div key={request.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="font-semibold">{request.purpose}</h3>
                                                        {getStatusIcon(request.status)}
                                                        {getStatusBadge(request.status)}
                                                        {getUrgencyBadge(request.urgency)}
                                                    </div>
                                                    <p className="text-gray-600 mb-2">{request.description}</p>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-500">
                                                        <span>Amount: ₹{request.amount.toLocaleString()}</span>
                                                        <span>Requested by: {request.requestedBy || 'N/A'}</span>
                                                        <span>Date: {new Date(request.requestedAt).toLocaleDateString()}</span>
                                                        <span>Urgency: {request.urgency}</span>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2 ml-4">
                                                    <Button 
                                                        size="sm" 
                                                        onClick={() => setReviewingRequest({ ...request, action: 'APPROVED' })}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => setReviewingRequest({ ...request, action: 'REJECTED' })}
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
                            <CardTitle>Approved Fund Requests</CardTitle>
                            <CardDescription>Successfully approved requests</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {approvedRequests.length === 0 ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No approved requests</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {approvedRequests.map((request) => (
                                        <div key={request.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="font-semibold">{request.purpose}</h3>
                                                        {getStatusIcon(request.status)}
                                                        {getStatusBadge(request.status)}
                                                    </div>
                                                    <p className="text-gray-600 mb-2">{request.description}</p>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-500">
                                                        <span>Amount: ₹{request.amount.toLocaleString()}</span>
                                                        <span>Requested by: {request.requestedBy || 'N/A'}</span>
                                                        <span>Approved: {request.reviewedAt ? new Date(request.reviewedAt).toLocaleDateString() : 'N/A'}</span>
                                                        <span>Reviewed by: {request.reviewedBy || 'N/A'}</span>
                                                    </div>
                                                    {request.reviewComments && (
                                                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                                                            <p className="text-sm text-green-800">
                                                                <strong>Comments:</strong> {request.reviewComments}
                                                            </p>
                                                        </div>
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

                <TabsContent value="rejected" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Rejected Fund Requests</CardTitle>
                            <CardDescription>Requests that were not approved</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {rejectedRequests.length === 0 ? (
                                <div className="text-center py-8">
                                    <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No rejected requests</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {rejectedRequests.map((request) => (
                                        <div key={request.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="font-semibold">{request.purpose}</h3>
                                                        {getStatusIcon(request.status)}
                                                        {getStatusBadge(request.status)}
                                                    </div>
                                                    <p className="text-gray-600 mb-2">{request.description}</p>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-500">
                                                        <span>Amount: ₹{request.amount.toLocaleString()}</span>
                                                        <span>Requested by: {request.requestedBy || 'N/A'}</span>
                                                        <span>Rejected: {request.reviewedAt ? new Date(request.reviewedAt).toLocaleDateString() : 'N/A'}</span>
                                                        <span>Reviewed by: {request.reviewedBy || 'N/A'}</span>
                                                    </div>
                                                    {request.reviewComments && (
                                                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                                            <p className="text-sm text-red-800">
                                                                <strong>Reason:</strong> {request.reviewComments}
                                                            </p>
                                                        </div>
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
            </Tabs>

            {/* Review Modal */}
            {reviewingRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>
                                    {reviewingRequest.action === 'APPROVED' ? 'Approve' : 'Reject'} Request
                                </CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => {
                                    setReviewingRequest(null)
                                    setReviewComments('')
                                }}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <CardDescription>
                                {reviewingRequest.purpose} - ₹{reviewingRequest.amount.toLocaleString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="comments">
                                    {reviewingRequest.action === 'APPROVED' ? 'Comments (Optional)' : 'Reason for Rejection'}
                                </Label>
                                <Textarea
                                    id="comments"
                                    value={reviewComments}
                                    onChange={(e) => setReviewComments(e.target.value)}
                                    placeholder={
                                        reviewingRequest.action === 'APPROVED' 
                                            ? 'Add any comments about the approval...'
                                            : 'Please provide a reason for rejection...'
                                    }
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setReviewingRequest(null)
                                        setReviewComments('')
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={() => handleReviewRequest(reviewingRequest.id, reviewingRequest.action)}
                                    className={reviewingRequest.action === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                                >
                                    {reviewingRequest.action === 'APPROVED' ? (
                                        <>
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Approve
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Reject
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
