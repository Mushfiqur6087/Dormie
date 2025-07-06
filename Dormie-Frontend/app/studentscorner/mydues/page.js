"use client"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Calendar, DollarSign, AlertCircle, CheckCircle, Wallet, TrendingUp, Receipt, History } from "lucide-react"
import { createApiUrl } from "../../../lib/api"

export default function MyDues() {
  const [dues, setDues] = useState({
    hallFeeDue: 0,
    diningFeeDue: 0,
    loading: true,
    error: null,
  })
  const [hallFeePayments, setHallFeePayments] = useState({
    data: [],
    loading: true,
    error: null,
  })
  const [diningFeePayments, setDiningFeePayments] = useState({
    data: [],
    loading: true,
    error: null,
  })
  const [isPaying, setIsPaying] = useState(false)
  const [selectedPaymentType, setSelectedPaymentType] = useState("all") // 'all', 'hall', 'dining'
  const router = useRouter()

  const fetchDues = useCallback(async () => {
    setDues((prev) => ({ ...prev, loading: true, error: null }))

    const jwtToken = localStorage.getItem("jwtToken")
    const userId = localStorage.getItem("userId")

    if (!jwtToken || !userId) {
      setDues({ hallFeeDue: 0, diningFeeDue: 0, loading: false, error: "Authentication required. Please log in." })
      router.push("/login")
      return
    }

    const authHeaders = {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    }

    // Initialize these to 0 here; they will be updated based on fetch results
    let currentHallFeeDue = 0
    let currentDiningFeeDue = 0
    let error = null

    try {
      // --- Step 1: Fetch Hall Fees for the authenticated user ---
      console.log("Fetching Hall Fees for userId:", userId)
      const hallFeesRes = await fetch(createApiUrl(`/api/student-hall-fees/user/${userId}`), {
        method: "GET",
        headers: authHeaders,
      })

      if (hallFeesRes.ok) {
        // Backend returns Optional<StudentHallFeeDTO>, which translates to StudentHallFeeDTO object or null
        const hallFeeData = await hallFeesRes.json()
        console.log("Backend response for Hall Fees (raw):", hallFeeData)

        // Correctly access dueAmount from the DTO
        if (hallFeeData && typeof hallFeeData === "object" && hallFeeData.dueAmount !== undefined) {
          currentHallFeeDue = hallFeeData.dueAmount
          console.log("Calculated Hall Fee Due:", currentHallFeeDue)
        } else {
          console.log("No active Hall Fee DTO found or dueAmount is undefined. Defaulting to 0.")
          // currentHallFeeDue remains 0
        }
      } else {
        const errorText = await hallFeesRes.text()
        // Log the error but don't stop execution, continue to fetch dining fees
        console.error(`Failed to fetch Hall Fees: ${errorText || hallFeesRes.statusText}`)
        error = `Failed to load Hall Fees: ${errorText || hallFeesRes.statusText}`
      }

      // --- Step 2: Fetch Dining Fees for the authenticated user ---
      console.log("Fetching Dining Fees for userId:", userId)
      const diningFeesRes = await fetch(createApiUrl(`/api/student-dining-fees/user/${userId}`), {
        method: "GET",
        headers: authHeaders,
      })

      if (diningFeesRes.ok) {
        // Backend returns List<StudentDiningFeeDTO>, which is an array
        const fetchedDiningFees = await diningFeesRes.json()
        // Print the backend response for dining fees
        console.log("[DEBUG] Dining Fees API response:", fetchedDiningFees)

        if (Array.isArray(fetchedDiningFees) && fetchedDiningFees.length > 0) {
          // Sum up the due amounts from all relevant dining fee records
          currentDiningFeeDue = fetchedDiningFees.reduce((sum, feeItem) => {
            // feeItem.dueAmount will be a number (BigDecimal converted to JS number by JSON parsing)
            // Use ?? 0 for nullish coalescing to handle potential undefined/null dueAmount gracefully
            return sum + (feeItem.dueAmount ?? 0)
          }, 0)
          console.log("Calculated Dining Fee Due:", currentDiningFeeDue)
        } else {
          console.log("No active Dining Fee DTOs found. Defaulting to 0.")
          // currentDiningFeeDue remains 0
        }
      } else {
        const errorText = await diningFeesRes.text()
        console.error(`Failed to fetch Dining Fees: ${errorText || diningFeesRes.statusText}`)
        // Append dining fee error to existing error, if any
        error = (error ? `${error}; ` : "") + `Failed to load Dining Fees: ${errorText || diningFeesRes.statusText}`
      }

      // --- Final Update of Dues State ---
      setDues({
        hallFeeDue: currentHallFeeDue,
        diningFeeDue: currentDiningFeeDue,
        loading: false,
        error: error, // Pass the error state that might have been set above
      })
    } catch (err) {
      // This catch block is for network errors or errors thrown by our code
      console.error("Critical error during dues fetch:", err)
      let displayError = err.message
      if (err.message.includes("401") || err.message.includes("403")) {
        displayError = "Authentication failed or unauthorized access. Please log in again."
        localStorage.removeItem("jwtToken")
        localStorage.removeItem("userId")
        router.push("/login")
      }
      setDues((prev) => ({ ...prev, loading: false, error: displayError }))
    }
  }, [router])

  const fetchHallFeePayments = useCallback(async () => {
    setHallFeePayments((prev) => ({ ...prev, loading: true, error: null }))

    const jwtToken = localStorage.getItem("jwtToken")
    const userId = localStorage.getItem("userId")

    if (!jwtToken || !userId) {
      setHallFeePayments({ data: [], loading: false, error: "Authentication required. Please log in." })
      return
    }

    const authHeaders = {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    }

    try {
      console.log("[DEBUG] JWT Token for Hall Fee Payments:", jwtToken)
      console.log("Fetching Hall Fee Payments for userId:", userId)
      const paymentsRes = await fetch(createApiUrl(`/api/student-hall-fees/payment/user/${userId}`), {
        method: "GET",
        headers: authHeaders,
      })

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json()
        console.log("Backend response for Hall Fee Payments:", paymentsData)
        
        setHallFeePayments({
          data: Array.isArray(paymentsData) ? paymentsData : [],
          loading: false,
          error: null,
        })
      } else {
        const errorText = await paymentsRes.text()
        console.error(`Failed to fetch Hall Fee Payments: ${errorText || paymentsRes.statusText}`)
        setHallFeePayments({
          data: [],
          loading: false,
          error: `Failed to load payment history: ${errorText || paymentsRes.statusText}`,
        })
      }
    } catch (err) {
      console.error("Error fetching Hall Fee Payments:", err)
      setHallFeePayments({
        data: [],
        loading: false,
        error: err.message || "An unexpected error occurred while fetching payment history.",
      })
    }
  }, [])

  const fetchDiningFeePayments = useCallback(async () => {
    setDiningFeePayments((prev) => ({ ...prev, loading: true, error: null }))

    const jwtToken = localStorage.getItem("jwtToken")
    const userId = localStorage.getItem("userId")

    if (!jwtToken || !userId) {
      setDiningFeePayments({ data: [], loading: false, error: "Authentication required. Please log in." })
      return
    }

    const authHeaders = {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    }

    try {
      console.log("[DEBUG] JWT Token for Dining Fee Payments:", jwtToken)
      console.log("Fetching Dining Fee Payments for userId:", userId)
      const paymentsRes = await fetch(createApiUrl(`/api/student-dining-fees/payment/user/${userId}`), {
        method: "GET",
        headers: authHeaders,
      })

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json()
        console.log("Backend response for Dining Fee Payments:", paymentsData)
        
        setDiningFeePayments({
          data: Array.isArray(paymentsData) ? paymentsData : [],
          loading: false,
          error: null,
        })
      } else {
        const errorText = await paymentsRes.text()
        console.error(`Failed to fetch Dining Fee Payments: ${errorText || paymentsRes.statusText}`)
        setDiningFeePayments({
          data: [],
          loading: false,
          error: `Failed to load dining payment history: ${errorText || paymentsRes.statusText}`,
        })
      }
    } catch (err) {
      console.error("Error fetching Dining Fee Payments:", err)
      setDiningFeePayments({
        data: [],
        loading: false,
        error: err.message || "An unexpected error occurred while fetching dining payment history.",
      })
    }
  }, [])

  useEffect(() => {
    fetchDues()
    fetchHallFeePayments()
    fetchDiningFeePayments()
  }, [fetchDues, fetchHallFeePayments, fetchDiningFeePayments])

  async function handleProceedToPay() {
    setIsPaying(true)
    try {
      const username = localStorage.getItem("userName") // Your payment API uses username
      const jwtToken = localStorage.getItem("jwtToken")

      if (!username || !jwtToken) {
        alert("Authentication information missing. Please login again.")
        setIsPaying(false)
        router.push("/login")
        return
      }

      const response = await fetch(createApiUrl("/api/payment/initiate"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ username }), // Ensure this matches payment API's DTO
      })

      const data = await response.json()

      if (response.ok && data.redirect_url) {
        window.location.href = data.redirect_url
      } else {
        alert("Failed to initiate payment: " + (data.failedreason || data.message || "Unknown error"))
      }
    } catch (err) {
      alert("Network error: " + err.message)
    } finally {
      setIsPaying(false)
    }
  }

  const { hallFeeDue, diningFeeDue, loading, error } = dues
  const totalDue = hallFeeDue + diningFeeDue

  const getPaymentAmount = () => {
    switch (selectedPaymentType) {
      case "hall":
        return hallFeeDue
      case "dining":
        return diningFeeDue
      default:
        return totalDue
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Dues</h1>
            <p className="text-red-100 text-lg">Manage your fee payments</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <div className="text-right">
              <p className="text-red-100 text-sm">Total Outstanding</p>
              <p className="text-3xl font-bold">৳{totalDue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Loading your dues...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-3 text-red-600">
            <AlertCircle className="h-6 w-6" />
            <p className="font-semibold">Error: {error}</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Dues Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hall Fees Due</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">৳{hallFeeDue.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dining Fees Due</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">৳{diningFeeDue.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Due</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">৳{totalDue.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Make Payment</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Payment Options */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Select Payment Type
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="radio"
                        name="paymentType"
                        value="all"
                        checked={selectedPaymentType === "all"}
                        onChange={(e) => setSelectedPaymentType(e.target.value)}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">Pay All Dues</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Hall + Dining Fees</p>
                      </div>
                      <span className="font-bold text-red-600 dark:text-red-400">৳{totalDue.toFixed(2)}</span>
                    </label>

                    <label className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="radio"
                        name="paymentType"
                        value="hall"
                        checked={selectedPaymentType === "hall"}
                        onChange={(e) => setSelectedPaymentType(e.target.value)}
                        className="text-red-600 focus:ring-red-500"
                        disabled={hallFeeDue <= 0}
                      />
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">Hall Fees Only</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Accommodation charges</p>
                      </div>
                      <span className="font-bold text-yellow-600 dark:text-yellow-400">৳{hallFeeDue.toFixed(2)}</span>
                    </label>

                    <label className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="radio"
                        name="paymentType"
                        value="dining"
                        checked={selectedPaymentType === "dining"}
                        onChange={(e) => setSelectedPaymentType(e.target.value)}
                        className="text-red-600 focus:ring-red-500"
                        disabled={diningFeeDue <= 0}
                      />
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">Dining Fees Only</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Meal charges</p>
                      </div>
                      <span className="font-bold text-green-600 dark:text-green-400">৳{diningFeeDue.toFixed(2)}</span>
                    </label>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-6 w-6 text-red-600 dark:text-red-400" />
                      <div>
                        <p className="font-semibold text-red-900 dark:text-red-100">Payment Amount</p>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          {selectedPaymentType === "all"
                            ? "All Dues"
                            : selectedPaymentType === "hall"
                              ? "Hall Fees Only"
                              : "Dining Fees Only"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        ৳{getPaymentAmount().toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToPay}
                    disabled={isPaying || getPaymentAmount() <= 0}
                    className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-3 ${
                      isPaying || getPaymentAmount() <= 0
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    }`}
                  >
                    <CreditCard className="h-5 w-5" />
                    <span>{isPaying ? "Processing Payment..." : "Proceed to Pay"}</span>
                  </button>
                </div>
              </div>

              {/* Payment Methods Info */}
              <div className="space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Accepted Payment Methods
                  </h3>
                  <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Mobile Banking (bKash, Nagad, Rocket)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Bank Transfer (All Major Banks)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Credit/Debit Card (Visa, MasterCard)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Cash Payment at Office</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Payment Information</h3>
                  <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                    <p>• Payments are processed securely</p>
                    <p>• Receipt will be sent to your email</p>
                    <p>• Payment confirmation within 24 hours</p>
                    <p>• Contact support for payment issues</p>
                  </div>
                </div>

                {totalDue <= 0 && (
                  <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-semibold text-green-900 dark:text-green-100">All Paid Up!</p>
                        <p className="text-sm text-green-700 dark:text-green-300">You have no outstanding dues</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hall Fee Payment History Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <History className="h-6 w-6 mr-3 text-blue-600" />
              Hall Fee Payment History
            </h2>

            {hallFeePayments.loading && (
              <div className="flex items-center justify-center space-x-3 py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 dark:text-gray-300">Loading payment history...</p>
              </div>
            )}

            {hallFeePayments.error && (
              <div className="flex items-center space-x-3 text-red-600 py-4">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">{hallFeePayments.error}</p>
              </div>
            )}

            {!hallFeePayments.loading && !hallFeePayments.error && (
              <>
                {hallFeePayments.data.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No payment history found</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm">Your payment records will appear here once you make payments</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Year</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Transaction ID</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Payment Method</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hallFeePayments.data.map((payment, index) => (
                          <tr 
                            key={`${payment.feeId}-${payment.tranId}`} 
                            className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="font-medium text-gray-900 dark:text-white">{payment.year}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-semibold text-blue-600 dark:text-blue-400">৳{payment.amount?.toFixed(2)}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-mono text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                {payment.tranId}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                <CreditCard className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-700 dark:text-gray-300">{payment.paymentMethod}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Dining Fee Payment History Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <History className="h-6 w-6 mr-3 text-green-600" />
              Dining Fee Payment History
            </h2>

            {diningFeePayments.loading && (
              <div className="flex items-center justify-center space-x-3 py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                <p className="text-gray-600 dark:text-gray-300">Loading dining payment history...</p>
              </div>
            )}

            {diningFeePayments.error && (
              <div className="flex items-center space-x-3 text-red-600 py-4">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">{diningFeePayments.error}</p>
              </div>
            )}

            {!diningFeePayments.loading && !diningFeePayments.error && (
              <>
                {diningFeePayments.data.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No dining payment history found</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm">Your dining payment records will appear here once you make payments</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Year</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Start Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">End Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Transaction ID</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Payment Method</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diningFeePayments.data.map((payment, index) => (
                          <tr 
                            key={`${payment.feeId}-${payment.tranId}`} 
                            className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="font-medium text-gray-900 dark:text-white">{payment.year}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-gray-700 dark:text-gray-300">{payment.feeStartDate}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-gray-700 dark:text-gray-300">{payment.feeEndDate}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-semibold text-green-600 dark:text-green-400">৳{payment.feeAmount?.toFixed(2)}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-mono text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                {payment.tranId}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                <CreditCard className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-700 dark:text-gray-300">{payment.paymentMethod}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
