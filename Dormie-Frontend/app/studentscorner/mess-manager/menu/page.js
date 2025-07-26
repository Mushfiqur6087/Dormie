'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChefHat, Plus, Calendar, Clock, Trash2, Edit, Save, X } from "lucide-react"
import { useRouter } from 'next/navigation'
import { createApiUrl } from '../../../../lib/api'

export default function MenuManagement() {
    const [menus, setMenus] = useState([])
    const [todayMenu, setTodayMenu] = useState(null)
    const [weekMenus, setWeekMenus] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingMenu, setEditingMenu] = useState(null)
    const [formData, setFormData] = useState({
        date: '',
        breakfast: '',
        lunch: '',
        dinner: '',
        specialNotes: ''
    })
    const router = useRouter()

    useEffect(() => {
        fetchMenus()
    }, [])

    const fetchMenus = async () => {
        try {
            const token = localStorage.getItem('jwtToken')
            
            // Fetch today's menu
            const todayResponse = await fetch(createApiUrl('/api/mess-menus/today'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (todayResponse.ok) {
                const todayData = await todayResponse.json()
                setTodayMenu(todayData)
            }

            // Fetch this week's menus
            const weekResponse = await fetch(createApiUrl('/api/mess-menus/week'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (weekResponse.ok) {
                const weekData = await weekResponse.json()
                setWeekMenus(weekData)
            }

            // Fetch all menus for current month
            const allResponse = await fetch(createApiUrl('/api/mess-menus'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (allResponse.ok) {
                const allData = await allResponse.json()
                setMenus(allData)
            }
        } catch (error) {
            console.error('Error fetching menus:', error)
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
        
        if (!formData.date) {
            alert('Please select a date')
            return
        }

        try {
            const token = localStorage.getItem('jwtToken')
            const url = editingMenu ? createApiUrl(`/api/mess-menus/${editingMenu.id}`) : createApiUrl('/api/mess-menus')
            const method = editingMenu ? 'PUT' : 'POST'
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                fetchMenus()
                resetForm()
            } else {
                const errorData = await response.json()
                alert(errorData.message || 'Failed to save menu')
            }
        } catch (error) {
            console.error('Error saving menu:', error)
            alert('An error occurred while saving the menu')
        }
    }

    const handleEdit = (menu) => {
        setEditingMenu(menu)
        setFormData({
            date: menu.date,
            breakfast: menu.breakfast || '',
            lunch: menu.lunch || '',
            dinner: menu.dinner || '',
            specialNotes: menu.specialNotes || ''
        })
        setShowAddForm(true)
    }

    const handleDelete = async (menuId) => {
        if (!confirm('Are you sure you want to delete this menu?')) return

        try {
            const token = localStorage.getItem('jwtToken')
            const response = await fetch(createApiUrl(`/api/mess-menus/${menuId}`), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                fetchMenus()
            } else {
                alert('Failed to delete menu')
            }
        } catch (error) {
            console.error('Error deleting menu:', error)
            alert('An error occurred while deleting the menu')
        }
    }

    const resetForm = () => {
        setFormData({
            date: '',
            breakfast: '',
            lunch: '',
            dinner: '',
            specialNotes: ''
        })
        setShowAddForm(false)
        setEditingMenu(null)
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getDayOfWeek = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short' })
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
                <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
                <Button 
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Menu
                </Button>
            </div>

            {/* Today's Menu */}
            {todayMenu && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <ChefHat className="w-5 h-5" />
                            <span>Today's Menu</span>
                            <Badge className="bg-green-500 text-white">
                                {formatDate(todayMenu.date)}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2">Breakfast</h4>
                                <p className="text-gray-600">{todayMenu.breakfast || 'Not set'}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2">Lunch</h4>
                                <p className="text-gray-600">{todayMenu.lunch || 'Not set'}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2">Dinner</h4>
                                <p className="text-gray-600">{todayMenu.dinner || 'Not set'}</p>
                            </div>
                        </div>
                        {todayMenu.specialNotes && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <h4 className="font-semibold text-yellow-800 mb-1">Special Notes</h4>
                                <p className="text-yellow-700">{todayMenu.specialNotes}</p>
                            </div>
                        )}
                        <div className="flex justify-end mt-4">
                            <Button 
                                variant="outline" 
                                onClick={() => handleEdit(todayMenu)}
                                size="sm"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Tabs defaultValue="week" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="week">This Week</TabsTrigger>
                    <TabsTrigger value="all">All Menus</TabsTrigger>
                </TabsList>

                <TabsContent value="week" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>This Week's Menus</CardTitle>
                            <CardDescription>Quick overview of the current week's meal plan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {weekMenus.length === 0 ? (
                                <div className="text-center py-8">
                                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No menus planned for this week</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {weekMenus.map((menu) => (
                                        <div key={menu.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center space-x-2">
                                                    <Badge variant="outline">
                                                        {getDayOfWeek(menu.date)}
                                                    </Badge>
                                                    <span className="text-sm text-gray-600">
                                                        {new Date(menu.date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleEdit(menu)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleDelete(menu.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium">Breakfast:</span>
                                                    <p className="text-gray-600">{menu.breakfast || 'Not set'}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Lunch:</span>
                                                    <p className="text-gray-600">{menu.lunch || 'Not set'}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Dinner:</span>
                                                    <p className="text-gray-600">{menu.dinner || 'Not set'}</p>
                                                </div>
                                            </div>
                                            {menu.specialNotes && (
                                                <div className="mt-2 text-sm">
                                                    <span className="font-medium">Notes:</span>
                                                    <p className="text-gray-600">{menu.specialNotes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="all" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Menus</CardTitle>
                            <CardDescription>Complete list of all planned menus</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {menus.length === 0 ? (
                                <div className="text-center py-8">
                                    <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No menus created yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {menus.map((menu) => (
                                        <div key={menu.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-semibold">{formatDate(menu.date)}</h4>
                                                    <p className="text-sm text-gray-500">
                                                        Created: {new Date(menu.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleEdit(menu)}
                                                    >
                                                        <Edit className="w-4 h-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleDelete(menu.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-1" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <span className="font-medium text-gray-700">Breakfast:</span>
                                                    <p className="text-gray-600">{menu.breakfast || 'Not set'}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Lunch:</span>
                                                    <p className="text-gray-600">{menu.lunch || 'Not set'}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Dinner:</span>
                                                    <p className="text-gray-600">{menu.dinner || 'Not set'}</p>
                                                </div>
                                            </div>
                                            {menu.specialNotes && (
                                                <div className="mt-3 p-2 bg-gray-50 rounded">
                                                    <span className="font-medium text-gray-700">Special Notes:</span>
                                                    <p className="text-gray-600">{menu.specialNotes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Add/Edit Menu Form */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>
                                    {editingMenu ? 'Edit Menu' : 'Add New Menu'}
                                </CardTitle>
                                <Button variant="ghost" size="sm" onClick={resetForm}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <CardDescription>
                                {editingMenu ? 'Update the menu details' : 'Create a new menu for a specific date'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date *</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => handleInputChange('date', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="breakfast">Breakfast</Label>
                                    <Textarea
                                        id="breakfast"
                                        value={formData.breakfast}
                                        onChange={(e) => handleInputChange('breakfast', e.target.value)}
                                        placeholder="Describe the breakfast menu..."
                                        rows={2}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lunch">Lunch</Label>
                                    <Textarea
                                        id="lunch"
                                        value={formData.lunch}
                                        onChange={(e) => handleInputChange('lunch', e.target.value)}
                                        placeholder="Describe the lunch menu..."
                                        rows={2}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dinner">Dinner</Label>
                                    <Textarea
                                        id="dinner"
                                        value={formData.dinner}
                                        onChange={(e) => handleInputChange('dinner', e.target.value)}
                                        placeholder="Describe the dinner menu..."
                                        rows={2}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="specialNotes">Special Notes</Label>
                                    <Textarea
                                        id="specialNotes"
                                        value={formData.specialNotes}
                                        onChange={(e) => handleInputChange('specialNotes', e.target.value)}
                                        placeholder="Any special notes, dietary information, or announcements..."
                                        rows={2}
                                    />
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <Button type="button" variant="outline" onClick={resetForm}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                        <Save className="w-4 h-4 mr-2" />
                                        {editingMenu ? 'Update Menu' : 'Save Menu'}
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
