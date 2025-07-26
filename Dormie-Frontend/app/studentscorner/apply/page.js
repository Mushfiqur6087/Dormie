"use client" // This directive is essential for client-side functionality in Next.js App Router

import { useForm } from "react-hook-form"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation" // Import useRouter for redirection
import { createApiUrl } from "../../../lib/api"
import {
  User,
  GraduationCap,
  MapPin,
  FileText,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  Home,
  DollarSign,
  Mail,
  Building,
  XCircle,
} from "lucide-react"

export default function ApplyForm() {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm()
  const router = useRouter() // Initialize useRouter for potential redirection

  // State for District dropdown (fetched from external API)
  const [districts, setDistricts] = useState([])
  const [loadingDistricts, setLoadingDistricts] = useState(true)
  const [errorDistricts, setErrorDistricts] = useState(null)

  // States for College dropdown functionality
  const [allColleges, setAllColleges] = useState([]) // Master list of all colleges
  const [loadingColleges, setLoadingColleges] = useState(true) // Loading state for college data
  const [errorColleges, setErrorColleges] = useState(null) // Error state for college data fetching

  // --- New States for Form Submission Status and Feedback ---
  const [isSubmitting, setIsSubmitting] = useState(false) // To disable button during submission
  const [submissionMessage, setSubmissionMessage] = useState("") // Success message
  const [submissionError, setSubmissionError] = useState("") // Error message
  // --- END New States ---

  // --- States for Allocation Status Check ---
  const [allocationStatus, setAllocationStatus] = useState(null)
  const [loadingAllocationStatus, setLoadingAllocationStatus] = useState(true)
  const [allocationStatusError, setAllocationStatusError] = useState(null)
  // --- END Allocation Status States ---

  // --- States for Application Status Check ---
  const [applicationStatus, setApplicationStatus] = useState(null)
  const [loadingApplicationStatus, setLoadingApplicationStatus] = useState(true)
  const [applicationStatusError, setApplicationStatusError] = useState(null)
  // --- END Application Status States ---

  // --- Watch the radio button for conditional rendering ---
  // This will store "yes" or "no" (defaulting to "no" if not yet selected)
  const hasLocalRelative = watch("hasLocalRelative", "no")

  // --- useEffect for fetching Districts ---
  // Runs once on component mount to populate the Districts dropdown.
  useEffect(() => {
    async function fetchDistricts() {
      try {
        setLoadingDistricts(true)
        const response = await fetch("https://bdapi.vercel.app/api/v.1/district")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const responseData = await response.json()

        if (responseData && Array.isArray(responseData.data)) {
          // Sort districts alphabetically by name for better UX
          const sortedDistricts = [...responseData.data].sort((a, b) => {
            const nameA = a.name.toLowerCase()
            const nameB = b.name.toLowerCase()
            if (nameA < nameB) return -1
            if (nameA > nameB) return 1
            return 0
          })
          setDistricts(sortedDistricts)
        } else {
          throw new Error("API response for districts did not contain an array under 'data' key.")
        }
      } catch (error) {
        console.error("Failed to fetch districts:", error)
        setErrorDistricts("Failed to load districts. Please try again.")
      } finally {
        setLoadingDistricts(false)
      }
    }
    fetchDistricts()
  }, []) // Empty dependency array ensures this runs once on mount

  // --- useEffect for loading College data from public JSON file ---
  // Runs once on component mount to load the full list of colleges for autocomplete.
  useEffect(() => {
    async function fetchColleges() {
      try {
        setLoadingColleges(true)
        const response = await fetch("/data/colleges.json")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setAllColleges(data) // Load data from the fetched JSON file
        setLoadingColleges(false) // Set loading to false once data is loaded
      } catch (error) {
        console.error("Failed to load colleges from JSON:", error)
        setErrorColleges("Failed to load colleges data.")
        setLoadingColleges(false)
      }
    }
    fetchColleges()
  }, []) // Empty dependency array ensures this runs once on mount

  // --- useEffect for fetching Allocation Status ---
  // Runs once on component mount to check if student is "attached" and can apply for seat
  useEffect(() => {
    async function fetchAllocationStatus() {
      const jwtToken = localStorage.getItem("jwtToken")
      if (!jwtToken) {
        setAllocationStatusError("Authentication required. Please log in.")
        setLoadingAllocationStatus(false)
        return
      }

      try {
        setLoadingAllocationStatus(true)
        setAllocationStatusError(null)

        const response = await fetch(createApiUrl("/api/rooms/allocation-status"), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log("Allocation status API response:", data)

        if (data && data.message) {
          setAllocationStatus(data.message)
        } else {
          throw new Error("Invalid response format from allocation status API")
        }
      } catch (error) {
        console.error("Error fetching allocation status:", error)
        setAllocationStatusError("Failed to check allocation status. Please try again.")
      } finally {
        setLoadingAllocationStatus(false)
      }
    }

    fetchAllocationStatus()
  }, []) // Empty dependency array ensures this runs once on mount

  // --- useEffect for fetching Application Status ---
  // Runs once on component mount to check if student has a pending application
  useEffect(() => {
    async function fetchApplicationStatus() {
      const jwtToken = localStorage.getItem("jwtToken")
      if (!jwtToken) {
        setApplicationStatusError("Authentication required. Please log in.")
        setLoadingApplicationStatus(false)
        return
      }

      try {
        setLoadingApplicationStatus(true)
        setApplicationStatusError(null)

        const response = await fetch(createApiUrl("/api/applications/getstatus"), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log("Application status API response:", data)
        console.log("Application status message:", data.message)

        if (data && data.message) {
          setApplicationStatus(data.message)
          console.log("Set applicationStatus to:", data.message)
        } else {
          throw new Error("Invalid response format from application status API")
        }
      } catch (error) {
        console.error("Error fetching application status:", error)
        setApplicationStatusError("Failed to check application status. Please try again.")
      } finally {
        setLoadingApplicationStatus(false)
      }
    }

    fetchApplicationStatus()
  }, []) // Empty dependency array ensures this runs once on mount

  // --- Handle Form Submission ---
  const onSubmit = async (data) => {
    // --- Frontend Debouncing: Prevent multiple submissions ---
    if (isSubmitting) return // If already submitting, do nothing
    setIsSubmitting(true) // Set submitting state to true
    setSubmissionMessage("") // Clear previous messages
    setSubmissionError("") // Clear previous errors
    // --- END Frontend Debouncing ---

    // Prepare JSON payload for the backend
    // Extract college location from the college selection (format: "College Name, Location")
    const collegeLocation = data.college ? data.college.split(", ").pop() : ""
    
    const applicationData = {
      college: data.college,
      collegeLocation: collegeLocation,
      familyIncome: data.familyIncome,
      district: data.district,
      postcode: data.postcode,
      hasLocalRelative: data.hasLocalRelative,
    }

    // Conditionally add local relative address if 'yes' was selected and address is provided
    if (data.hasLocalRelative === "yes" && data.localRelativeAddress) {
      applicationData.localRelativeAddress = data.localRelativeAddress
    }

    // --- Backend API Call ---
    const jwtToken = localStorage.getItem("jwtToken") // Get JWT from localStorage (assuming student is logged in)
    if (!jwtToken) {
      setSubmissionError("Authentication required to submit application. Please log in.")
      setIsSubmitting(false) // Re-enable button
      // Optionally redirect the user to the login page
      router.push("/login")
      return // Stop submission if no token
    }

    try {
      // Send JSON data to the backend endpoint
      const response = await fetch(createApiUrl("/api/applications/seat"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Send as JSON instead of multipart/form-data
          Authorization: `Bearer ${jwtToken}`, // Attach JWT for authentication
        },
        body: JSON.stringify(applicationData), // Send JSON data
      })

      // Handle HTTP errors first (e.g., 400 Bad Request, 401 Unauthorized, 500 Internal Server Error)
      if (!response.ok) {
        // Attempt to parse error message from JSON body if available, otherwise use statusText
        const errorData = await response.json()
        throw new Error(errorData.message || response.statusText || "Unknown server error")
      }

      // If response.ok is true (HTTP 200 OK)
      const result = await response.json() // Assuming backend returns JSON success response { message: "..." }

      setSubmissionMessage(result.message || "Application submitted successfully!")
      // Optionally reset the form fields after successful submission
      reset() // Resets all fields managed by react-hook-form to their default values (or empty)
      
      // Refresh the application status after 1 second to show the updated status
      setTimeout(async () => {
        const jwtToken = localStorage.getItem("jwtToken")
        if (jwtToken) {
          try {
            const response = await fetch(createApiUrl("/api/applications/getstatus"), {
              method: "GET",
              headers: {
                Authorization: `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
              },
            })
            if (response.ok) {
              const data = await response.json()
              if (data && data.message) {
                setApplicationStatus(data.message)
                console.log("Refreshed applicationStatus to:", data.message)
              }
            }
          } catch (error) {
            console.error("Error refreshing application status:", error)
            // Fallback to page reload if API call fails
            window.location.reload()
          }
        }
      }, 1000)
    } catch (error) {
      console.error("Error submitting application:", error)
      setSubmissionError("Application submission failed: " + (error.message || "Please try again."))
    } finally {
      setIsSubmitting(false) // Re-enable the submit button in all cases
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-6">
            <FileText className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Apply for Student Hall Seat</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Fill out the application form below to apply for a dormitory seat. Please ensure all information is accurate
            and complete.
          </p>
        </div>

        {/* Loading Allocation Status */}
        {(loadingAllocationStatus || loadingApplicationStatus) && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {loadingAllocationStatus ? "Checking your allocation status..." : "Checking your application status..."}
            </p>
          </div>
        )}

        {/* Allocation Status Error */}
        {(allocationStatusError || applicationStatusError) && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-red-200 dark:border-red-800 text-center">
            <div className="flex items-center justify-center mb-4">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              {allocationStatusError || applicationStatusError}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        )}

        {/* Show form only if student is "attached" and has no pending application */}
        {!loadingAllocationStatus && !loadingApplicationStatus && !allocationStatusError && !applicationStatusError && (
          <>
            {allocationStatus === "attached" ? (
              <>
                {/* Check if student has pending application */}
                {applicationStatus && (applicationStatus.includes("Application status: PENDING") || applicationStatus.includes("PENDING")) ? (
                  // Show message that student already applied and is waiting
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-orange-200 dark:border-orange-800 text-center">
                    <div className="flex items-center justify-center mb-6">
                      <AlertCircle className="h-16 w-16 text-orange-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Application Already Submitted</h2>
                    <div className="space-y-4 text-lg text-gray-600 dark:text-gray-300">
                      <p className="mb-4">You have already submitted a hall seat application.</p>
                      <p className="font-semibold text-orange-600 dark:text-orange-400">
                        Status: PENDING
                      </p>
                      <p className="mt-4">
                        Please wait for the Provost to review and approve or reject your application. 
                        You cannot submit another application while one is pending.
                      </p>
                    </div>
                    <div className="mt-8">
                      <button
                        onClick={() => router.push("/studentscorner")}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200"
                      >
                        Return to Dashboard
                      </button>
                    </div>
                  </div>
                ) : (
                  // Show the full application form for no application, rejected, or other statuses
                  <div>
                    {/* Show rejection notice if applicable */}
                    {applicationStatus && (applicationStatus.includes("Application status: REJECTED") || applicationStatus.includes("REJECTED")) && (
                      <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl flex items-center">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-yellow-800 dark:text-yellow-300 font-medium">Previous Application Rejected</p>
                          <p className="text-yellow-700 dark:text-yellow-400 text-sm">Your previous application was rejected. You can submit a new application below.</p>
                        </div>
                      </div>
                    )}

                    {/* Status Messages */}
                    {submissionMessage && (
                      <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center animate-fade-in">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 flex-shrink-0" />
                        <span className="text-green-800 dark:text-green-300 font-medium">{submissionMessage}</span>
                      </div>
                    )}

                    {submissionError && (
                      <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center animate-fade-in">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" />
                        <span className="text-red-800 dark:text-red-300 font-medium">{submissionError}</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                <User className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Family Income */}
              <div className="space-y-2">
                <label
                  htmlFor="familyIncome"
                  className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                  Family Income (BDT) *
                </label>
                <input
                  type="number"
                  id="familyIncome"
                  {...register("familyIncome", {
                    required: "Family income is required",
                    min: { value: 0, message: "Family income cannot be negative" },
                    valueAsNumber: true,
                  })}
                  className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.familyIncome ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="Enter family income"
                />
                {errors.familyIncome && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.familyIncome.message}
                  </p>
                )}
              </div>

              {/* District */}
              <div className="space-y-2">
                <label
                  htmlFor="district"
                  className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  <MapPin className="h-4 w-4 mr-2 text-purple-500" />
                  District *
                </label>
                {loadingDistricts && (
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading districts...
                  </div>
                )}
                {errorDistricts && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errorDistricts}
                  </p>
                )}
                {!loadingDistricts && !errorDistricts && (
                  <select
                    id="district"
                    {...register("district", { required: "District is required" })}
                    className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.district ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  >
                    <option value="">Select your District</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.name}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                )}
                {errors.district && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.district.message}
                  </p>
                )}
              </div>

              {/* Postcode */}
              <div className="space-y-2">
                <label
                  htmlFor="postcode"
                  className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  <Mail className="h-4 w-4 mr-2 text-orange-500" />
                  Postcode *
                </label>
                <input
                  type="text"
                  id="postcode"
                  {...register("postcode", {
                    required: "Postcode is required",
                    pattern: { value: /^[0-9]{4}$/, message: "Postcode must be 4 digits" },
                  })}
                  className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.postcode ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="Enter 4-digit postcode"
                />
                {errors.postcode && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.postcode.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Academic Information Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Academic Information</h2>
            </div>

            {/* College Dropdown */}
            <div className="space-y-2">
              <label
                htmlFor="college"
                className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                <Building className="h-4 w-4 mr-2 text-blue-500" />
                College Name *
              </label>
              {loadingColleges && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading colleges...
                </div>
              )}
              {errorColleges && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errorColleges}
                </p>
              )}
              {!loadingColleges && !errorColleges && (
                <select
                  id="college"
                  {...register("college", { required: "College is required" })}
                  className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.college ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                >
                  <option value="">Select your College</option>
                  {allColleges.map((college, index) => (
                    <option key={`${college.id}-${index}`} value={`${college.name}, ${college.location}`}>
                      {college.name}, {college.location}
                    </option>
                  ))}
                </select>
              )}
              {errors.college && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.college.message}
                </p>
              )}
            </div>
          </div>

          {/* Family Information Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Family Information</h2>
            </div>

            <div className="space-y-6">
              {/* Has Local Relative Radio Buttons */}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Home className="h-4 w-4 mr-2 text-blue-500" />
                  Do you have a local relative? *
                </label>
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      {...register("hasLocalRelative", { required: "Please select an option" })}
                      value="yes"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      {...register("hasLocalRelative", { required: "Please select an option" })}
                      value="no"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">No</span>
                  </label>
                </div>
                {errors.hasLocalRelative && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.hasLocalRelative.message}
                  </p>
                )}
              </div>

              {/* Conditional Local Relative Address Field */}
              {hasLocalRelative === "yes" && (
                <div className="space-y-2 animate-fade-in">
                  <label
                    htmlFor="localRelativeAddress"
                    className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    <MapPin className="h-4 w-4 mr-2 text-green-500" />
                    Local Relative Address *
                  </label>
                  <textarea
                    id="localRelativeAddress"
                    {...register("localRelativeAddress", {
                      required: "Local relative address is required if you selected Yes",
                    })}
                    rows="4"
                    className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.localRelativeAddress ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    placeholder="Enter your local relative's complete address"
                  />
                  {errors.localRelativeAddress && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.localRelativeAddress.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full max-w-md mx-auto flex justify-center items-center py-4 px-8 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-xl ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed transform-none shadow-md"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Submitting Application...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Apply for Seat
                </>
              )}
            </button>
          </div>
                    </form>
                  </div>
                )}
              </>
            ) : (
              // Show message when student is not "attached"
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-yellow-200 dark:border-yellow-800 text-center">
                <div className="flex items-center justify-center mb-6">
                  <XCircle className="h-16 w-16 text-yellow-500" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Application Not Available</h2>
                <div className="space-y-4 text-lg text-gray-600 dark:text-gray-300">
                  {allocationStatus && allocationStatus.includes("room assigned to") ? (
                    <div>
                      <p className="mb-4">You have already been assigned a room.</p>
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        {allocationStatus}
                      </p>
                      <p className="mt-4">You cannot apply for a new seat as you already have a room assignment.</p>
                    </div>
                  ) : allocationStatus === "room not assigned" ? (
                    <div>
                      <p className="mb-4">Your room has not been assigned yet.</p>
                      <p className="text-blue-600 dark:text-blue-400">
                        Please wait for the administration to assign rooms. You will be notified once your room is ready.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="mb-4">The seat application function is currently not available for your account.</p>
                      <p className="text-gray-500 dark:text-gray-400">
                        Status: {allocationStatus || "Unknown"}
                      </p>
                      <p className="mt-4">
                        Please contact the administration if you believe this is an error.
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-8">
                  <button
                    onClick={() => router.push("/studentscorner")}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
