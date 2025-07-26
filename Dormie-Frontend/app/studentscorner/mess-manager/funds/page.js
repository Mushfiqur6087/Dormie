'use client'

import { useState, useEffect } from 'react'
import { createApiUrl } from '../../../../lib/api'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Plus, FileText, Clock, CheckCircle, XCircle, X, Save } from "lucide-react"

export default function FundRequestManagement() {
    const [fundRequests, setFundRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [formData, setFormData] = useState({
        purpose: '',
        amount: '',
        description: '',
        urgency: 'MEDIUM'
    })

    useEffect(() => {
        fetchFundRequests()
    }, [])

    const fetchFundRequests = async () => {
        try {
            const token = localStorage.getItem('jwtToken')
            const response = await fetch(createApiUrl('/api/fund-requests/my-requests'), {
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

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!formData.purpose || !formData.amount) {
            alert('Please fill in all required fields')
            return
        }

        try {
            const token = localStorage.getItem('jwtToken')
            const response = await fetch(createApiUrl('/api/fund-requests'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount)
                })
            })

            if (response.ok) {
                fetchFundRequests()
                resetForm()
            } else {
                const errorData = await response.json()
                alert(errorData.message || 'Failed to create fund request')
            }
        } catch (error) {
            console.error('Error creating fund request:', error)
            alert('An error occurred while creating the fund request')
        }
    }

    const resetForm = () => {
        setFormData({
            purpose: '',
            amount: '',
            description: '',
            urgency: 'MEDIUM'
        })
        setShowCreateForm(false)
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

    const pendingRequests = fundRequests.filter(req => req.status === 'PENDING' || req.status === 'UNDER_REVIEW')
    const approvedRequests = fundRequests.filter(req => req.status === 'APPROVED')
    const rejectedRequests = fundRequests.filter(req => req.status === 'REJECTED')

    const totalRequestedAmount = fundRequests.reduce((sum, req) => sum + req.amount, 0)
    const approvedAmount = approvedRequests.reduce((sum, req) => sum + req.amount, 0)

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
                <h1 className="text-3xl font-bold text-gray-900">Fund Request Management</h1>
                <Button 
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Request
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{fundRequests.length}</div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingRequests.length}</div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Requested</CardTitle>
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
                            <CardDescription>Requests awaiting review and approval</CardDescription>
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
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-500">
                                                        <span>Amount: ₹{request.amount.toLocaleString()}</span>
                                                        <span>Requested: {new Date(request.requestedAt).toLocaleDateString()}</span>
                                                        <span>Urgency: {request.urgency}</span>
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
                                                        <span>Requested: {new Date(request.requestedAt).toLocaleDateString()}</span>
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
                                                        <span>Requested: {new Date(request.requestedAt).toLocaleDateString()}</span>
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

            {/* Create Request Form Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Create Fund Request</CardTitle>
                                <Button variant="ghost" size="sm" onClick={resetForm}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <CardDescription>
                                Submit a new fund request for mess expenses
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="purpose">Purpose *</Label>
                                    <Input
                                        id="purpose"
                                        value={formData.purpose}
                                        onChange={(e) => handleInputChange('purpose', e.target.value)}
                                        placeholder="e.g., Grocery purchase, Kitchen equipment"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount (₹) *</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.amount}
                                        onChange={(e) => handleInputChange('amount', e.target.value)}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="urgency">Urgency</Label>
                                    <select
                                        id="urgency"
                                        value={formData.urgency}
                                        onChange={(e) => handleInputChange('urgency', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Detailed description of what the funds will be used for..."
                                        rows={3}
                                    />
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <Button type="button" variant="outline" onClick={resetForm}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                        <Save className="w-4 h-4 mr-2" />
                                        Submit Request
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
