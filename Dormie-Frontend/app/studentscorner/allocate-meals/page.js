"use client"

import { useState, useEffect } from "react"
import { createApiUrl } from "../../../lib/api"
import {
  ChefHat,
  Calendar,
  Users,
  Clock,
  AlertTriangle,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Check,
  X,
} from "lucide-react"

export default function AllocateMeals() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to today's date
    const today = new Date()
    return today.toISOString().split('T')[0]
  })

  // Meal types for the day (removed breakfast as requested)
  const mealTypes = [
    { id: 'lunch', name: 'Lunch', time: '12:00 PM - 2:00 PM' },
    { id: 'dinner', name: 'Dinner', time: '7:00 PM - 9:00 PM' }
  ]

  const [mealPlans, setMealPlans] = useState({
    lunch: { items: [''], cost: 0 },
    dinner: { items: [''], cost: 0 }
  })

  useEffect(() => {
    fetchMealPlans()
  }, [selectedDate])

  const fetchMealPlans = async () => {
    setLoading(true)
    setError("")

    const jwtToken = localStorage.getItem("jwtToken")
    const studentId = localStorage.getItem("userId")

    if (!jwtToken || !studentId) {
      setError("You are not logged in. Please log in to access meal allocation.")
      setLoading(false)
      return
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    }

    try {
      // Fetch existing meal plans for the selected date
      const response = await fetch(createApiUrl(`/api/meal-plans/date/${selectedDate}`), {
        method: "GET",
        headers,
      })

      if (response.ok) {
        const existingPlans = await response.json()
        
        // Initialize meal plans
        const newMealPlans = {
          lunch: { items: [''], cost: 0 },
          dinner: { items: [''], cost: 0 }
        }

        // Populate with existing data if available
        existingPlans.forEach(plan => {
          if (plan.mealType === 'lunch' || plan.mealType === 'dinner') {
            newMealPlans[plan.mealType] = {
              items: plan.mealItems && plan.mealItems.length > 0 ? plan.mealItems : [''],
              cost: plan.costPerPerson || 0
            }
          }
        })

        setMealPlans(newMealPlans)
      } else if (response.status === 403) {
        setError("Meal planning is only available for resident students. Please contact the administration if you need to change your residency status.")
        // Use default structure on access denied
        setMealPlans({
          lunch: { items: [''], cost: 0 },
          dinner: { items: [''], cost: 0 }
        })
      } else {
        // If no existing plans, use default empty structure
        setMealPlans({
          lunch: { items: [''], cost: 0 },
          dinner: { items: [''], cost: 0 }
        })
      }
    } catch (err) {
      console.error("Error fetching meal plans:", err)
      if (err.message && err.message.includes("resident students")) {
        setError(err.message)
      } else {
        setError("Failed to fetch meal plans. Please try again.")
      }
      // Use default structure on error
      setMealPlans({
        lunch: { items: [''], cost: 0 },
        dinner: { items: [''], cost: 0 }
      })
    } finally {
      setLoading(false)
    }
  }

  const addMenuItem = (mealType) => {
    setMealPlans(prev => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        items: [...prev[mealType].items, '']
      }
    }))
  }

  const removeMenuItem = (mealType, index) => {
    setMealPlans(prev => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        items: prev[mealType].items.filter((_, i) => i !== index)
      }
    }))
  }

  const updateMenuItem = (mealType, index, value) => {
    setMealPlans(prev => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        items: prev[mealType].items.map((item, i) => i === index ? value : item)
      }
    }))
  }

  const updateMealCost = (mealType, cost) => {
    setMealPlans(prev => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        cost: parseFloat(cost) || 0
      }
    }))
  }

  const saveMealPlans = async () => {
    setSaving(true)
    setError("")
    setSuccess("")

    const jwtToken = localStorage.getItem("jwtToken")
    const studentId = localStorage.getItem("userId")

    if (!jwtToken || !studentId) {
      setError("You are not logged in. Please log in to save meal plans.")
      setSaving(false)
      return
    }

    // Validate meal plans - at least one meal should have items and cost
    const hasValidMeals = Object.entries(mealPlans).some(([mealType, meal]) => 
      meal.items.some(item => item.trim().length > 0) && meal.cost > 0
    )

    if (!hasValidMeals) {
      setError("Please add at least one meal item with a valid cost.")
      setSaving(false)
      return
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    }

    try {
      // Save each meal type separately
      const savePromises = Object.entries(mealPlans).map(async ([mealType, meal]) => {
        // Only save meals that have items and cost
        const validItems = meal.items.filter(item => item.trim().length > 0)
        if (validItems.length === 0 || meal.cost <= 0) {
          return null // Skip this meal
        }

        const mealData = {
          messManagerId: parseInt(studentId),
          mealDate: selectedDate,
          mealType: mealType,
          costPerPerson: parseFloat(meal.cost),
          mealItems: validItems
        }

        const response = await fetch(createApiUrl("/api/meal-plans"), {
          method: "POST",
          headers,
          body: JSON.stringify(mealData),
        })

        if (response.status === 403) {
          throw new Error("Meal planning is only available for resident students. Please contact the administration if you need to change your residency status.")
        } else if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Failed to save ${mealType}`)
        }

        return await response.json()
      })

      // Wait for all saves to complete
      const results = await Promise.all(savePromises)
      const successfulSaves = results.filter(result => result !== null)

      if (successfulSaves.length > 0) {
        setSuccess(`Meal plans for ${selectedDate} saved successfully! (${successfulSaves.length} meal(s) saved)`)
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000)
        
        // Refresh the data
        fetchMealPlans()
      } else {
        setError("No valid meals to save. Please ensure at least one meal has items and cost.")
      }
    } catch (err) {
      console.error("Error saving meal plans:", err)
      setError(err.message || "Failed to save meal plans. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const getTotalCost = () => {
    return Object.values(mealPlans).reduce((total, meal) => total + meal.cost, 0)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <ChefHat className="h-8 w-8 text-orange-600 mr-4" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Allocate Meals</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Plan and allocate meals for dormitory students
            </p>
          </div>
        </div>

        {/* Date Selection */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Date
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]} // Can't select past dates
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(selectedDate)}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800 dark:text-green-200">{success}</p>
          </div>
        </div>
      )}

      {/* Meal Planning */}
      <div className="grid gap-8">
        {mealTypes.map((mealType) => (
          <div
            key={mealType.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{mealType.name}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{mealType.time}</p>
                </div>
                <button
                  onClick={() => addMenuItem(mealType.id)}
                  className="flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </button>
              </div>

              {/* Menu Items */}
              <div className="space-y-3 mb-4">
                {mealPlans[mealType.id].items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateMenuItem(mealType.id, index, e.target.value)}
                      placeholder="Enter menu item (e.g., Rice, Dal, Curry)"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    {mealPlans[mealType.id].items.length > 1 && (
                      <button
                        onClick={() => removeMenuItem(mealType.id, index)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Cost Input */}
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cost per person:
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-1">৳</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={mealPlans[mealType.id].cost}
                    onChange={(e) => updateMealCost(mealType.id, e.target.value)}
                    placeholder="0.00"
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary and Save */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Daily Summary</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total cost per student for {formatDate(selectedDate)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">৳{getTotalCost().toFixed(2)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">per student</div>
            </div>
          </div>

          <button
            onClick={saveMealPlans}
            disabled={saving || loading}
            className="w-full flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            {saving ? "Saving..." : "Save Meal Plans"}
          </button>
        </div>
      </div>
    </div>
  )
}
