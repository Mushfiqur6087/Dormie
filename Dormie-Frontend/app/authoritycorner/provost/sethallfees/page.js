"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { createApiUrl } from "../../../../lib/api"
import {
  DollarSign,
  Save,
  Calendar,
  Home,
  Users,
  CheckCircle,
  AlertCircle,
  List,
  Eye,
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
  const [existingFees, setExistingFees] = useState([])
  const [feesLoading, setFeesLoading] = useState(true)
  const [feesError, setFeesError] = useState("")
  const router = useRouter()

  // Fetch existing hall fees
  useEffect(() => {
    fetchExistingHallFees()
  }, [])

  const fetchExistingHallFees = async () => {
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
      const response = await fetch(createApiUrl("/api/hall-fees"), {
        method: "GET",
        headers: headers,
      })

      if (response.ok) {
        const fees = await response.json()
        console.log("Fetched hall fees:", fees)
        setExistingFees(fees)
      } else {
        const errorText = await response.text()
        setFeesError(`Failed to fetch hall fees: ${errorText || response.statusText}`)
      }
    } catch (err) {
      console.error("Error fetching hall fees:", err)
      setFeesError("An unexpected error occurred while fetching hall fees.")
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
      setError(`Hall fees can only be set for the current academic year (${currentYear}). Please use ${currentYear} as the year.`)
      setLoading(false)
      return
    }

    // Check if fees already exist for current year
    const existingAttachedFee = existingFees.find(fee => fee.year === currentYear && fee.type === "attached")
    const existingResidentFee = existingFees.find(fee => fee.year === currentYear && fee.type === "resident")

    if (existingAttachedFee && existingResidentFee) {
      setError(`Hall fees for ${currentYear} have already been set. Attached: ৳${existingAttachedFee.fee.toLocaleString()}, Resident: ৳${existingResidentFee.fee.toLocaleString()}.`)
      setLoading(false)
      return
    }

    if (existingAttachedFee) {
      setError(`Attached student hall fee for ${currentYear} has already been set (৳${existingAttachedFee.fee.toLocaleString()}). Cannot set fees again for the same year.`)
      setLoading(false)
      return
    }

    if (existingResidentFee) {
      setError(`Resident student hall fee for ${currentYear} has already been set (৳${existingResidentFee.fee.toLocaleString()}). Cannot set fees again for the same year.`)
      setLoading(false)
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
      const attachedRes = await fetch(createApiUrl("/api/hall-fees"), {
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
      const residentRes = await fetch(createApiUrl("/api/hall-fees"), {
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
        // Refresh the existing fees list
        fetchExistingHallFees()
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

        {/* Set Hall Fees Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 border border-gray-100 dark:border-gray-700">
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
                  Hall fees can only be set for the current academic year
                </p>
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

        {/* Existing Hall Fees Display */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <List className="h-6 w-6 mr-3 text-blue-600" />
              Existing Hall Fees
            </h2>

            {feesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
                <p className="text-gray-500 dark:text-gray-400 text-lg">No hall fees have been set yet.</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Set your first hall fees using the form.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {existingFees.map((fee) => (
                  <div
                    key={fee.id}
                    className={`p-6 rounded-xl border ${
                      fee.year === currentYear
                        ? "bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 border-green-300 dark:border-green-700 ring-2 ring-green-200 dark:ring-green-800"
                        : "bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-blue-200 dark:border-blue-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {fee.type === "resident" ? (
                          <Home className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Users className="h-5 w-5 text-green-600" />
                        )}
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                          {fee.type} Students
                        </h3>
                        {fee.year === currentYear && (
                          <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        fee.year === currentYear
                          ? "bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                      }`}>
                        {fee.year}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Fee Amount</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ৳{fee.fee.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Summary Section */}
                <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Summary</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Total fees configured: <span className="font-semibold text-gray-900 dark:text-white">{existingFees.length}</span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Years covered: <span className="font-semibold text-gray-900 dark:text-white">
                      {[...new Set(existingFees.map(fee => fee.year))].sort().join(", ")}
                    </span>
                  </p>
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
              Hall fees are set annually and apply to all students in the dormitory system. 
              Resident students receive full accommodation services, while attached students 
              have access to partial services.
            </p>
          </div>
          <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Current Year Policy
            </h4>
            <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
              <li>• Fees can only be set for {currentYear}</li>
              <li>• Each fee type can only be set once per year</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
