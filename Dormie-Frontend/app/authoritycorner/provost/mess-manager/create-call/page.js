'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, ArrowLeft } from "lucide-react"
import { useRouter } from 'next/navigation'
import { createApiUrl } from '../../../../../lib/api'

export default function CreateMessManagerCall() {
    const [formData, setFormData] = useState({
        title: '',
        purpose: '',
        description: '',
        month: '',
        year: new Date().getFullYear(),
        deadline: '',
        requirements: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [authDebug, setAuthDebug] = useState('')
    const router = useRouter()

    // Debug authentication on component mount
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('jwtToken')
            const roles = localStorage.getItem('userRoles')
            const userId = localStorage.getItem('userId')
            
            console.log('Auth Debug:')
            console.log('Token exists:', !!token)
            console.log('Token length:', token ? token.length : 0)
            console.log('User roles:', roles)
            console.log('User ID:', userId)
            
            if (token) {
                setAuthDebug(`Token: ${token.substring(0, 20)}... | Roles: ${roles} | UserID: ${userId}`)
            } else {
                setAuthDebug('No token found - user not logged in')
                setError('You need to be logged in as a Provost to access this page')
            }
        }
        
        checkAuth()
    }, [])

    // Test API call function
    const testApiCall = async () => {
        try {
            const token = localStorage.getItem('jwtToken')
            console.log('Testing API call with token:', token ? token.substring(0, 20) + '...' : 'No token')
            
            const response = await fetch(createApiUrl('/api/mess-manager-calls/active'), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            
            console.log('Test API Response Status:', response.status)
            console.log('Test API Response Headers:', response.headers)
            
            if (response.ok) {
                const data = await response.json()
                console.log('Test API Success:', data)
                setAuthDebug(prev => prev + ' | API Test: SUCCESS')
            } else {
                const errorText = await response.text()
                console.log('Test API Error:', errorText)
                setAuthDebug(prev => prev + ` | API Test: FAILED (${response.status})`)
            }
        } catch (error) {
            console.error('Test API Error:', error)
            setAuthDebug(prev => prev + ' | API Test: NETWORK ERROR')
        }
    }

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Validation
        if (!formData.title || !formData.purpose || !formData.month || !formData.deadline) {
            setError('Please fill in all required fields')
            setLoading(false)
            return
        }

        // Check if deadline is in the future
        const deadlineDate = new Date(formData.deadline)
        if (deadlineDate <= new Date()) {
            setError('Deadline must be in the future')
            setLoading(false)
            return
        }

        try {
            const token = localStorage.getItem('jwtToken')
            const response = await fetch(createApiUrl('/api/mess-manager-calls'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    purpose: formData.purpose,
                    description: formData.description,
                    month: formData.month,
                    year: parseInt(formData.year),
                    deadline: formData.deadline,
                    requirements: formData.requirements
                })
            })

            if (response.ok) {
                const result = await response.json()
                router.push(`/authoritycorner/provost/mess-manager/calls/${result.id}`)
            } else {
                const errorData = await response.json()
                setError(errorData.message || 'Failed to create mess manager call')
            }
        } catch (error) {
            console.error('Error creating call:', error)
            setError('An error occurred while creating the call')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <div className="flex items-center space-x-4 mb-6">
                <Button 
                    variant="outline" 
                    onClick={() => router.back()}
                    className="flex items-center space-x-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">Create Mess Manager Call</h1>
            </div>

            {/* Debug Authentication Info */}
            {authDebug && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-700">
                        <strong>Auth Debug:</strong> {authDebug}
                    </p>
                    <Button 
                        onClick={testApiCall} 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                    >
                        Test API Call
                    </Button>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5" />
                        <span>New Mess Manager Call</span>
                    </CardTitle>
                    <CardDescription>
                        Create a new call for mess manager applications
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="e.g., Mess Manager Call for January 2024"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="purpose">Purpose *</Label>
                            <Input
                                id="purpose"
                                value={formData.purpose}
                                onChange={(e) => handleInputChange('purpose', e.target.value)}
                                placeholder="e.g., Monthly mess manager recruitment"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Detailed description of the mess manager role and responsibilities..."
                                rows={4}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="month">Month *</Label>
                                <Select value={formData.month} onValueChange={(value) => handleInputChange('month', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map((month) => (
                                            <SelectItem key={month} value={month}>
                                                {month}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="year">Year *</Label>
                                <Input
                                    id="year"
                                    type="number"
                                    value={formData.year}
                                    onChange={(e) => handleInputChange('year', e.target.value)}
                                    min={new Date().getFullYear()}
                                    max={new Date().getFullYear() + 2}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="deadline">Application Deadline *</Label>
                            <Input
                                id="deadline"
                                type="datetime-local"
                                value={formData.deadline}
                                onChange={(e) => handleInputChange('deadline', e.target.value)}
                                min={new Date().toISOString().slice(0, 16)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="requirements">Requirements</Label>
                            <Textarea
                                id="requirements"
                                value={formData.requirements}
                                onChange={(e) => handleInputChange('requirements', e.target.value)}
                                placeholder="Specific requirements for mess manager applicants..."
                                rows={3}
                            />
                        </div>

                        <div className="flex space-x-4">
                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {loading ? 'Creating...' : 'Create Call'}
                            </Button>
                            <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
