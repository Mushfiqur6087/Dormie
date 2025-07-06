"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import {
  Utensils,
  Save,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
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
  const router = useRouter()

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
      const res = await fetch("http://localhost:8080/api/dining-fees", {
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

        <div className="max-w-2xl mx-auto">
          {/* Set Dining Fee Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
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
                  Year
                </label>
                <input
                  type="number"
                  id="year"
                  defaultValue={currentYear}
                  {...register("year", {
                    required: "Year is required",
                    min: { value: 2020, message: "Year must be 2020 or later" },
                    max: { value: 2030, message: "Year must be 2030 or earlier" },
                    valueAsNumber: true,
                  })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                />
                {errors.year && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.year.message}
                  </p>
                )}
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
                  {...register("startDate", {
                    required: "Start Date is required",
                  })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                />
                {errors.startDate && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.startDate.message}
                  </p>
                )}
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
                  {...register("endDate", {
                    required: "End Date is required",
                    validate: (value, formValues) =>
                      (formValues.startDate && value >= formValues.startDate) || "End Date must be after Start Date",
                  })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                />
                {errors.endDate && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.endDate.message}
                  </p>
                )}
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
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Utensils className="h-5 w-5 mr-2 text-orange-600" />
            Important Information
          </h3>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
              Please ensure all fee details are accurate before submission. Changes to dining fees will affect all students for the specified period.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
