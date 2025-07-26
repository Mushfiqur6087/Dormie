'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Send, Calendar, Clock, Users } from "lucide-react"
import { useRouter, useParams } from 'next/navigation'
import { createApiUrl } from '../../../../../lib/api'

export default function ApplyToCall() {
    const [call, setCall] = useState(null)
    const [motivation, setMotivation] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const params = useParams()
    const callId = params.id

    useEffect(() => {
        if (callId) {
            fetchCallDetails()
        }
    }, [callId])

    const fetchCallDetails = async () => {
        try {
            const token = localStorage.getItem('jwtToken')
            const response = await fetch(createApiUrl(`/api/mess-manager-calls/${callId}`), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setCall(data)
            } else {
                setError('Failed to load call details')
            }
        } catch (error) {
            console.error('Error fetching call details:', error)
            setError('An error occurred while loading call details')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!motivation.trim()) {
            setError('Please provide your motivation for applying')
            return
        }

        setSubmitting(true)
        setError('')

        try {
            const token = localStorage.getItem('jwtToken')
            const response = await fetch(createApiUrl(`/api/mess-manager-applications/call/${callId}`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    motivation: motivation.trim()
                })
            })

            if (response.ok) {
                setSuccess(true)
                setTimeout(() => {
                    router.push('/studentscorner/mess-manager')
                }, 2000)
            } else {
                const errorData = await response.json()
                setError(errorData.message || 'Failed to submit application')
            }
        } catch (error) {
            console.error('Error submitting application:', error)
            setError('An error occurred while submitting your application')
        } finally {
            setSubmitting(false)
        }
    }

    const isDeadlinePassed = (deadline) => {
        return new Date(deadline) <= new Date()
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

    if (success) {
        return (
            <div className="container mx-auto p-6">
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardContent className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
                            <p className="text-gray-600 mb-4">
                                Your application for "{call.title}" has been submitted successfully.
                            </p>
                            <p className="text-sm text-gray-500">
                                You will be redirected to the dashboard shortly...
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    if (call.status !== 'ACTIVE' || isDeadlinePassed(call.deadline)) {
        return (
            <div className="container mx-auto p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center space-x-4 mb-6">
                        <Button 
                            variant="outline" 
                            onClick={() => router.back()}
                            className="flex items-center space-x-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </Button>
                        <h1 className="text-3xl font-bold text-gray-900">Apply to Mess Manager Call</h1>
                    </div>
                    
                    <Card>
                        <CardContent className="text-center py-8">
                            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Closed</h2>
                            <p className="text-gray-600">
                                This call is no longer accepting applications.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center space-x-4 mb-6">
                    <Button 
                        variant="outline" 
                        onClick={() => router.back()}
                        className="flex items-center space-x-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">Apply to Mess Manager Call</h1>
                </div>

                {/* Call Information */}
                <Card className="mb-6">
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
                            {getStatusBadge(call.status)}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-gray-500">Period</p>
                                <p className="font-semibold">{call.month} {call.year}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Application Deadline</p>
                                <p className="font-semibold">{new Date(call.deadline).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Current Applications</p>
                                <p className="font-semibold">{call.totalApplications || 0}</p>
                            </div>
                        </div>

                        {call.description && (
                            <div className="mb-4">
                                <p className="text-sm text-gray-500 mb-2">Description</p>
                                <p className="text-gray-700">{call.description}</p>
                            </div>
                        )}

                        {call.requirements && (
                            <div className="mb-4">
                                <p className="text-sm text-gray-500 mb-2">Requirements</p>
                                <p className="text-gray-700">{call.requirements}</p>
                            </div>
                        )}

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <Users className="w-5 h-5 text-blue-600" />
                                <h4 className="font-semibold text-blue-900">Mess Manager Responsibilities</h4>
                            </div>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Plan and coordinate daily mess meals</li>
                                <li>• Manage food procurement and inventory</li>
                                <li>• Submit fund requests for mess expenses</li>
                                <li>• Ensure food quality and hygiene standards</li>
                                <li>• Coordinate with mess staff and students</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Application Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Send className="w-5 h-5" />
                            <span>Submit Your Application</span>
                        </CardTitle>
                        <CardDescription>
                            Tell us why you want to be a mess manager for this period
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
                                <Label htmlFor="motivation">Motivation *</Label>
                                <Textarea
                                    id="motivation"
                                    value={motivation}
                                    onChange={(e) => setMotivation(e.target.value)}
                                    placeholder="Explain why you want to be the mess manager for this period. Include your relevant experience, ideas for improving the mess, and your commitment to the role..."
                                    rows={6}
                                    required
                                />
                                <p className="text-sm text-gray-500">
                                    Provide a detailed motivation explaining your interest and qualifications
                                </p>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h4 className="font-semibold text-yellow-900 mb-2">Before you apply:</h4>
                                <ul className="text-sm text-yellow-800 space-y-1">
                                    <li>• Ensure you can commit to the full period ({call.month} {call.year})</li>
                                    <li>• You will be responsible for daily meal planning and coordination</li>
                                    <li>• Budget management and expense tracking will be required</li>
                                    <li>• Regular communication with provost office is expected</li>
                                </ul>
                            </div>

                            <div className="flex space-x-4">
                                <Button 
                                    type="submit" 
                                    disabled={submitting || !motivation.trim()}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Submit Application
                                        </>
                                    )}
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
