"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import {
  DollarSign,
  Save,
  Calendar,
  Home,
  Users,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

export default function SetHallFees() {
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

    let attachedFeeSuccess = false
    let residentFeeSuccess = false

    try {
      // Send request for ATTACHED fee
      const attachedFeeData = {
        type: "attached",
        year: Number(data.year),
        fee: Number(data.attachedFee),
      }

      console.log("Sending Attached Fee:", attachedFeeData)
      const attachedRes = await fetch("http://localhost:8080/api/hall-fees", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(attachedFeeData),
      })

      if (attachedRes.ok) {
        attachedFeeSuccess = true
        console.log("Attached Fee set successfully!")
      } else {
        const errorData = await attachedRes.json()
        throw new Error(`Attached Fee failed: ${errorData.message || attachedRes.statusText}`)
      }

      // Send request for RESIDENT fee
      const residentFeeData = {
        type: "resident",
        year: Number(data.year),
        fee: Number(data.residentFee),
      }

      console.log("Sending Resident Fee:", residentFeeData)
      const residentRes = await fetch("http://localhost:8080/api/hall-fees", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(residentFeeData),
      })

      if (residentRes.ok) {
        residentFeeSuccess = true
        console.log("Resident Fee set successfully!")
      } else {
        const errorData = await residentRes.json()
        throw new Error(`Resident Fee failed: ${errorData.message || residentRes.statusText}`)
      }

      if (attachedFeeSuccess && residentFeeSuccess) {
        setMessage("Hall fees (Attached & Resident) set successfully for the year!")
        reset()
      } else {
        setError("Partial success or unexpected error setting fees.")
      }
    } catch (err) {
      console.error("Error setting hall fees:", err)
      setError(err.message || "An unexpected error occurred while setting fees.")
    } finally {
      setLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <DollarSign className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Set Hall Fees</h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg mt-2">
                Configure dormitory accommodation fees for residents and attached students
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Important Notice */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <AlertCircle className="h-6 w-6 mr-3 text-amber-600" />
              Important Notice
            </h2>
            <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <p className="text-amber-800 dark:text-amber-200 leading-relaxed">
                Hall fees are set annually and apply to all students in the dormitory system. 
                Resident students receive full accommodation services, while attached students 
                have access to partial services. Please ensure fees are updated before the 
                start of each academic year.
              </p>
            </div>
          </div>

          {/* Set Hall Fees Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <DollarSign className="h-6 w-6 mr-3 text-green-600" />
              Set New Hall Fees
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Year Input */}
              <div>
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"
                >
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  Academic Year
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                />
                {errors.year && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.year.message}
                  </p>
                )}
              </div>

              {/* Attached Fee Input */}
              <div>
                <label
                  htmlFor="attachedFee"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"
                >
                  <Users className="h-4 w-4 mr-2 text-green-500" />
                  Attached Student Fee (BDT)
                </label>
                <input
                  type="number"
                  id="attachedFee"
                  step="0.01"
                  {...register("attachedFee", {
                    required: "Attached Fee is required",
                    min: { value: 0.01, message: "Fee must be greater than 0" },
                    max: { value: 999999.99, message: "Fee must be less than 1,000,000" },
                    valueAsNumber: true,
                  })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="Enter attached student fee"
                />
                {errors.attachedFee && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.attachedFee.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Fee for students with partial hall services
                </p>
              </div>

              {/* Resident Fee Input */}
              <div>
                <label
                  htmlFor="residentFee"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"
                >
                  <Home className="h-4 w-4 mr-2 text-blue-500" />
                  Resident Student Fee (BDT)
                </label>
                <input
                  type="number"
                  id="residentFee"
                  step="0.01"
                  {...register("residentFee", {
                    required: "Resident Fee is required",
                    min: { value: 0.01, message: "Fee must be greater than 0" },
                    max: { value: 999999.99, message: "Fee must be less than 1,000,000" },
                    valueAsNumber: true,
                  })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="Enter resident student fee"
                />
                {errors.residentFee && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.residentFee.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Fee for students with full accommodation
                </p>
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
                    ? "bg-green-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                } text-white`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Setting Fees...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Set Hall Fees</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
