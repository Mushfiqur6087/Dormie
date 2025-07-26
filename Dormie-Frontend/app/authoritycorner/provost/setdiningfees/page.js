"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { createApiUrl } from "../../../../lib/api"
import {
  Utensils,
  Save,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  List,
  Eye,
} from "lucide-react"

export default function SetDiningFees() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [existingFees, setExistingFees] = useState([])
  const [feesLoading, setFeesLoading] = useState(true)
  const [feesError, setFeesError] = useState("")
  const router = useRouter()

  // Fetch existing dining fees
  useEffect(() => {
    fetchExistingDiningFees()
  }, [])

  const fetchExistingDiningFees = async () => {
    setFeesLoading(true)
    setFeesError("")

    const jwtToken = localStorage.getItem("jwtToken")
    if (!jwtToken) {
      setFeesError("You are not logged in. Please log in as an Admin or Hall Manager.")
      setFeesLoading(false)
      return
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    }

    try {
      const response = await fetch(createApiUrl("/api/dining-fees"), {
        method: "GET",
        headers: headers,
      })

      if (response.ok) {
        const fees = await response.json()
        console.log("Fetched dining fees:", fees)
        setExistingFees(fees)
      } else {
        const errorText = await response.text()
        setFeesError(`Failed to fetch dining fees: ${errorText || response.statusText}`)
      }
    } catch (err) {
      console.error("Error fetching dining fees:", err)
      setFeesError("An unexpected error occurred while fetching dining fees.")
    } finally {
      setFeesLoading(false)
    }
  }

  const onSubmit = async (data) => {
    setError("")
    setMessage("")
    setLoading(true)

    const jwtToken = localStorage.getItem("jwtToken")
    if (!jwtToken) {
      setError("You are not logged in. Please log in as an Admin or Hall Manager.")
      setLoading(false)
      router.push("/login")
      return
    }

    // Validate current year only
    if (data.year !== currentYear) {
      setError(`Dining fees can only be set for the current academic year (${currentYear}). Please use ${currentYear} as the year.`)
      setLoading(false)
      return
    }

    // Date validations
    const currentDate = new Date()
    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)

    // Start date validation: cannot be less than current date - 10 days
    const minStartDate = new Date(currentDate)
    minStartDate.setDate(currentDate.getDate() - 10)
    
    if (startDate < minStartDate) {
      setError(`Start date cannot be more than 10 days in the past. Earliest allowed date: ${minStartDate.toLocaleDateString()}`)
      setLoading(false)
      return
    }

    // End date validation: cannot be more than current date + 2 months
    const maxEndDate = new Date(currentDate)
    maxEndDate.setMonth(currentDate.getMonth() + 2)
    
    if (endDate > maxEndDate) {
      setError(`End date cannot be more than 2 months in the future. Latest allowed date: ${maxEndDate.toLocaleDateString()}`)
      setLoading(false)
      return
    }

    // Check for date overlaps with existing dining fees
    const hasOverlap = existingFees.some(existingFee => {
      const existingStart = new Date(existingFee.startDate)
      const existingEnd = new Date(existingFee.endDate)
      
      // Check if new dates overlap with existing dates
      const overlapExists = (startDate <= existingEnd && endDate >= existingStart)
      
      if (overlapExists) {
        setError(`Date range overlaps with existing dining fee (${existingStart.toLocaleDateString()} - ${existingEnd.toLocaleDateString()}). Please choose non-overlapping dates.`)
        setLoading(false)
        return true
      }
      return false
    })

    if (hasOverlap) {
      return // Error already set in the loop
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    }

    try {
      const diningFeeData = {
        type: "resident",
        year: Number(data.year),
        startDate: data.startDate,
        endDate: data.endDate,
        fee: Number(data.fee),
      }

      console.log("Sending Dining Fee:", diningFeeData)
      const res = await fetch(createApiUrl("/api/dining-fees"), {
        method: "POST",
        headers: headers,
        body: JSON.stringify(diningFeeData),
      })

      const responseData = await res.json()

      if (res.ok) {
        setMessage(
          `Dining Fee for ${responseData.year} (${responseData.startDate} to ${responseData.endDate}) set successfully: ${responseData.fee} BDT!`,
        )
        reset()
        // Refresh the existing fees list
        fetchExistingDiningFees()
      } else {
        const errorMessage = responseData.message || responseData.error || res.statusText || "Unknown error"
        setError(`Failed to set Dining Fee: ${errorMessage}`)
      }
    } catch (err) {
      console.error("Error setting dining fees:", err)
      setError(err.message || "An unexpected network error occurred.")
    } finally {
      setLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()
  
  // Calculate date constraints
  const currentDate = new Date()
  const minStartDate = new Date(currentDate)
  minStartDate.setDate(currentDate.getDate() - 10)
  const maxEndDate = new Date(currentDate)
  maxEndDate.setMonth(currentDate.getMonth() + 2)
  
  // Format dates for input min/max attributes
  const minStartDateString = minStartDate.toISOString().split('T')[0]
  const maxEndDateString = maxEndDate.toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Utensils className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Set Dining Fees</h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg mt-2">
                Configure dining hall meal pricing and schedules
              </p>
            </div>
          </div>
        </div>

        {/* Set Dining Fee Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <DollarSign className="h-6 w-6 mr-3 text-green-600" />
            Set New Dining Fee
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Year Input */}
              <div>
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"
                >
                  <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                  Academic Year (Current Year Only)
                </label>
                <input
                  type="number"
                  id="year"
                  value={currentYear}
                  readOnly
                  {...register("year", {
                    value: currentYear,
                  })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Dining fees can only be set for the current academic year
                </p>
              </div>

              {/* Start Date Input */}
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"
                >
                  <Clock className="h-4 w-4 mr-2 text-green-500" />
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  min={minStartDateString}
                  max={maxEndDateString}
                  {...register("startDate", {
                    required: "Start Date is required",
                    validate: (value) => {
                      const selectedDate = new Date(value)
                      if (selectedDate < minStartDate) {
                        return `Start date cannot be more than 10 days in the past (earliest: ${minStartDate.toLocaleDateString()})`
                      }
                      if (selectedDate > maxEndDate) {
                        return `Start date cannot be more than 2 months in the future (latest: ${maxEndDate.toLocaleDateString()})`
                      }
                      return true
                    }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                />
                {errors.startDate && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.startDate.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Cannot be more than 10 days in the past
                </p>
              </div>

              {/* End Date Input */}
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"
                >
                  <Clock className="h-4 w-4 mr-2 text-red-500" />
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  min={minStartDateString}
                  max={maxEndDateString}
                  {...register("endDate", {
                    required: "End Date is required",
                    validate: (value, formValues) => {
                      const selectedDate = new Date(value)
                      const startDate = formValues.startDate ? new Date(formValues.startDate) : null
                      
                      if (selectedDate < minStartDate) {
                        return `End date cannot be more than 10 days in the past (earliest: ${minStartDate.toLocaleDateString()})`
                      }
                      if (selectedDate > maxEndDate) {
                        return `End date cannot be more than 2 months in the future (latest: ${maxEndDate.toLocaleDateString()})`
                      }
                      if (startDate && selectedDate < startDate) {
                        return "End date must be after start date"
                      }
                      return true
                    }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                />
                {errors.endDate && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.endDate.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Cannot be more than 2 months in the future
                </p>
              </div>

              {/* Fee Input */}
              <div>
                <label
                  htmlFor="fee"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"
                >
                  <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                  Fee (BDT)
                </label>
                <input
                  type="number"
                  id="fee"
                  step="0.01"
                  {...register("fee", {
                    required: "Fee is required",
                    min: { value: 0.01, message: "Fee must be greater than 0" },
                    max: { value: 999999.99, message: "Fee must be less than 1,000,000" },
                    valueAsNumber: true,
                  })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="Enter fee amount"
                />
                {errors.fee && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.fee.message}
                  </p>
                )}
              </div>

              {/* Messages */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {message && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <p className="text-green-700 dark:text-green-400 font-medium">{message}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  loading
                    ? "bg-orange-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                } text-white`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Setting Fee...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Set Dining Fee</span>
                  </>
                )}
              </button>
            </form>
        </div>

        {/* Existing Dining Fees Display */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <List className="h-6 w-6 mr-3 text-orange-600" />
              Existing Dining Fees
            </h2>

            {feesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading fees...</span>
              </div>
            ) : feesError ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-red-700 dark:text-red-400 font-medium">{feesError}</p>
                </div>
              </div>
            ) : existingFees.length === 0 ? (
              <div className="text-center py-8">
                <Eye className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">No dining fees have been set yet.</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Set your first dining fees using the form.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {existingFees.map((fee) => {
                  const isCurrentYear = fee.year === currentYear
                  const feeStartDate = new Date(fee.startDate)
                  const feeEndDate = new Date(fee.endDate)
                  const currentDate = new Date()
                  const isActive = currentDate >= feeStartDate && currentDate <= feeEndDate
                  
                  return (
                    <div
                      key={fee.id}
                      className={`p-6 rounded-xl border ${
                        isCurrentYear && isActive
                          ? "bg-gradient-to-r from-green-100 to-orange-100 dark:from-green-900/30 dark:to-orange-900/30 border-green-300 dark:border-green-700 ring-2 ring-green-200 dark:ring-green-800"
                          : isCurrentYear
                          ? "bg-gradient-to-r from-blue-100 to-orange-100 dark:from-blue-900/30 dark:to-orange-900/30 border-blue-300 dark:border-blue-700"
                          : "bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Utensils className="h-5 w-5 text-orange-600" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Dining Fee {fee.year}
                          </h3>
                          {isCurrentYear && isActive && (
                            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
                              ACTIVE
                            </span>
                          )}
                          {isCurrentYear && !isActive && (
                            <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
                              CURRENT YEAR
                            </span>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isCurrentYear
                            ? "bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200"
                            : "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200"
                        }`}>
                          {fee.type.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Fee Amount</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            ৳{fee.fee.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Duration</p>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {feeStartDate.toLocaleDateString()} - {feeEndDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Start Date</p>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {feeStartDate.toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-red-500" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">End Date</p>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {feeEndDate.toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                
                {/* Summary Section */}
                <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-orange-50 dark:from-gray-800 dark:to-orange-900/20 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Summary</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Total fees configured: <span className="font-semibold text-gray-900 dark:text-white">{existingFees.length}</span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Years covered: <span className="font-semibold text-gray-900 dark:text-white">
                      {[...new Set(existingFees.map(fee => fee.year))].sort().join(", ")}
                    </span>
                  </p>
                  {existingFees.length > 0 && (
                    <p className="text-gray-600 dark:text-gray-400">
                      Total amount: <span className="font-semibold text-gray-900 dark:text-white">
                        ৳{existingFees.reduce((total, fee) => total + fee.fee, 0).toLocaleString()}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}
        </div>

        {/* Important Notice */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <AlertCircle className="h-6 w-6 mr-3 text-amber-600" />
            Important Notice
          </h2>
          <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800 mb-4">
            <p className="text-amber-800 dark:text-amber-200 leading-relaxed">
              Dining fees are set for specific date ranges and apply to all students using the dining services during that period. Each fee configuration must have non-overlapping dates.
            </p>
          </div>
          <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Date Policy ({currentYear})
            </h4>
            <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
              <li>• Fees can only be set for {currentYear}</li>
              <li>• Start date: Max 10 days in the past</li>
              <li>• End date: Max 2 months in the future</li>
              <li>• No overlapping date ranges allowed</li>
              <li>• End date must be after start date</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
