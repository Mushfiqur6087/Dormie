"use client"

import { useState } from "react"
import * as XLSX from "xlsx"
import { Upload, FileText, Home, CheckCircle, AlertCircle, Download, Loader } from "lucide-react"
import { createApiUrl } from "../../../lib/api"

export default function AdminRoomBatchUpload() {
  const [file, setFile] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [successfulRecords, setSuccessfulRecords] = useState(0)
  const [failedRecords, setFailedRecords] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")

  const handleFileChange = (e) => {
    setErrorMessage("") // Clear previous errors
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (
        selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.name.endsWith(".xlsx")
      ) {
        setFile(selectedFile)
        // Reset results when a new file is selected
        setResults([])
        setTotalRecords(0)
        setSuccessfulRecords(0)
        setFailedRecords(0)
      } else {
        setErrorMessage("Please upload a valid .xlsx Excel file.")
        setFile(null)
      }
    }
  }

  const processExcelFile = async () => {
    if (!file) {
      setErrorMessage("Please select a file first.")
      return
    }

    setProcessing(true)
    setResults([]) // Clear previous results
    setTotalRecords(0)
    setSuccessfulRecords(0)
    setFailedRecords(0)
    setErrorMessage("")

    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0] // Assuming data is in the first sheet
        const worksheet = workbook.Sheets[sheetName]

        // Convert sheet to JSON, reading headers from the first row
        // header: 1 means the first row is used as headers, subsequent rows are data
        const jsonRows = XLSX.utils.sheet_to_json(worksheet)

        if (jsonRows.length === 0) {
          setErrorMessage("Excel file is empty or contains no data rows after headers.")
          setProcessing(false)
          return
        }

        setTotalRecords(jsonRows.length)

        const currentResults = []
        let successCount = 0
        let failCount = 0

        // Get the Admin's JWT token from localStorage
        const adminToken = localStorage.getItem("jwtToken") || 
                          localStorage.getItem("accessToken") || 
                          localStorage.getItem("token") || 
                          localStorage.getItem("authToken")
        
        console.log("Available localStorage keys:", Object.keys(localStorage))
        console.log("Admin Token found:", !!adminToken)
        console.log("Token length:", adminToken ? adminToken.length : 0)
        
        if (!adminToken) {
          setErrorMessage("Admin not logged in. Please log in first.")
          setProcessing(false)
          return
        }

        // Loop through each row and send to backend
        for (const [index, row] of jsonRows.entries()) {
          const rowIndex = index + 2 // +2 because sheet_to_json is 0-indexed for data, +1 for header, +1 for 1-based display

          // --- Map Excel column names to Room data fields ---
          // Use the exact column headers: Room No, Current Student, Total Capacity
          const roomNoFromExcel = row["Room No"]
          const currentStudentFromExcel = row["Current Student"]
          const totalCapacityFromExcel = row["Total Capacity"]

          const roomData = {
            roomNo: roomNoFromExcel,
            currentStudent: currentStudentFromExcel || 0, // Default to 0 if not provided
            totalCapacity: parseInt(totalCapacityFromExcel), // Convert to integer
          }

          // Basic client-side validation for critical fields before sending to backend
          // Frontend should validate required types/formats as much as possible
          let rowFailed = false
          let rowMessage = ""

          if (!roomData.roomNo || String(roomData.roomNo).trim() === "") {
            rowFailed = true
            rowMessage = "Missing or invalid Room No"
          } else if (roomData.currentStudent < 0 || isNaN(Number(roomData.currentStudent))) {
            // Check if currentStudent is not a valid number or negative
            rowFailed = true
            rowMessage = "Invalid Current Student count (must be a non-negative number)"
          } else if (!roomData.totalCapacity || isNaN(Number(roomData.totalCapacity)) || roomData.totalCapacity <= 0) {
            rowFailed = true
            rowMessage = "Missing or invalid Total Capacity (must be a positive number)"
          } else if (roomData.currentStudent > roomData.totalCapacity) {
            rowFailed = true
            rowMessage = "Current Student count cannot exceed Total Capacity"
          }

          if (rowFailed) {
            failCount++
            currentResults.push({ row: rowIndex, status: "Failed", message: rowMessage, data: roomData })
            setFailedRecords(failCount)
            setResults([...currentResults]) // Update UI immediately
            continue // Skip to next row
          }

          try {
            console.log(`Processing row ${rowIndex}: Sending request with token: ${adminToken ? adminToken.substring(0, 20) + '...' : 'NO TOKEN'}`)
            
            const response = await fetch(createApiUrl("/api/rooms/set-room"), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${adminToken}`,
              },
              body: JSON.stringify(roomData),
            })

            console.log(`Row ${rowIndex} - Response status:`, response.status)
            console.log(`Row ${rowIndex} - Response headers:`, response.headers)

            const responseData = await response.json() // Backend sends response or error
            console.log(`Row ${rowIndex} - Response data:`, responseData)

            if (response.ok) {
              successCount++
              currentResults.push({
                row: rowIndex,
                status: "Success",
                message: responseData.message || "Room data submitted successfully!",
                data: roomData,
              })
            } else {
              failCount++
              currentResults.push({
                row: rowIndex,
                status: "Failed",
                message: responseData.message || "Server error occurred",
                data: roomData,
              })
            }
          } catch (error) {
            failCount++
            currentResults.push({
              row: rowIndex,
              status: "Failed",
              message: `Network error: ${error.message}`,
              data: roomData,
            })
          }

          setSuccessfulRecords(successCount)
          setFailedRecords(failCount)
          setResults([...currentResults]) // Update UI immediately after each row
        }
      } catch (error) {
        setErrorMessage(`Error processing file: ${error.message}`)
        console.error("Error processing Excel:", error)
      } finally {
        setProcessing(false)
      }
    }

    reader.readAsArrayBuffer(file) // Read the file
  }

  const downloadTemplate = () => {
    const templateData = [
      { "Room No": "101", "Current Student": 2, "Total Capacity": 4 },
      { "Room No": "102", "Current Student": 1, "Total Capacity": 3 },
      { "Room No": "103", "Current Student": 0, "Total Capacity": 2 },
    ]

    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Rooms")
    XLSX.writeFile(wb, "room_template.xlsx")
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Home className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Batch Room Upload</h1>
            <p className="text-red-100 text-lg">Upload multiple room data from Excel file</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Upload Instructions</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Required Excel Format</h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-300 dark:border-gray-600">
                      <th className="text-left py-2 px-1 font-medium text-gray-700 dark:text-gray-300">Room No</th>
                      <th className="text-left py-2 px-1 font-medium text-gray-700 dark:text-gray-300">Current Student</th>
                      <th className="text-left py-2 px-1 font-medium text-gray-700 dark:text-gray-300">Total Capacity</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-1">
                    <tr>
                      <td className="py-1 px-1 text-gray-600 dark:text-gray-400">101</td>
                      <td className="py-1 px-1 text-gray-600 dark:text-gray-400">2</td>
                      <td className="py-1 px-1 text-gray-600 dark:text-gray-400">4</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-1 text-gray-600 dark:text-gray-400">102</td>
                      <td className="py-1 px-1 text-gray-600 dark:text-gray-400">1</td>
                      <td className="py-1 px-1 text-gray-600 dark:text-gray-400">3</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-1 text-gray-600 dark:text-gray-400">103</td>
                      <td className="py-1 px-1 text-gray-600 dark:text-gray-400">0</td>
                      <td className="py-1 px-1 text-gray-600 dark:text-gray-400">2</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download Excel Template</span>
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Important Notes</h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <span>Room No can be alphanumeric (e.g., 101, A-201, B102)</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <span>Current Student must be a non-negative number</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <span>Total Capacity must be a positive number</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <span>Current Student count cannot exceed Total Capacity</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <span>Data will be sent to localhost:8080/api/rooms/set-room endpoint</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Upload Excel File</h2>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span className="text-red-700 dark:text-red-300">{errorMessage}</span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label
              htmlFor="excel-file-input"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"
            >
              Select Excel File (.xlsx)
            </label>
            <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              file 
                ? "border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-600" 
                : "border-gray-300 dark:border-gray-600 hover:border-red-400"
            }`}>
              {file ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-3">
                    <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                    <div className="text-left">
                      <p className="text-lg font-semibold text-green-700 dark:text-green-300">File Selected</p>
                      <p className="text-sm text-green-600 dark:text-green-400">Ready to upload</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setFile(null)
                          setResults([])
                          setTotalRecords(0)
                          setSuccessfulRecords(0)
                          setFailedRecords(0)
                          setErrorMessage("")
                        }}
                        disabled={processing}
                        className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Remove file"
                      >
                        <AlertCircle className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <input
                    id="excel-file-input"
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileChange}
                    disabled={processing}
                    className="hidden"
                  />
                  <label 
                    htmlFor="excel-file-input" 
                    className="inline-flex items-center space-x-2 cursor-pointer text-red-600 hover:text-red-700 font-medium transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Choose Different File</span>
                  </label>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <input
                    id="excel-file-input"
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileChange}
                    disabled={processing}
                    className="hidden"
                  />
                  <label htmlFor="excel-file-input" className="cursor-pointer text-red-600 hover:text-red-700 font-medium">
                    Click to select Excel file
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Only .xlsx files are supported</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={processExcelFile}
            disabled={!file || processing}
            className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-3 ${
              !file || processing
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            }`}
          >
            {processing ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Processing Rooms...</span>
              </>
            ) : (
              <>
                <FileText className="h-5 w-5" />
                <span>Upload & Submit Room Data</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      {totalRecords > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Upload Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Records</p>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{totalRecords}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Successful</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-300">{successfulRecords}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Failed</p>
                  <p className="text-3xl font-bold text-red-700 dark:text-red-300">{failedRecords}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>{Math.round(((successfulRecords + failedRecords) / totalRecords) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((successfulRecords + failedRecords) / totalRecords) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Results */}
      {results.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Processing Details</h2>
          <div className="max-h-96 overflow-y-auto space-y-3">
            {results.map((res, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${
                  res.status === "Success"
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {res.status === "Success" ? (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Row {res.row}: {res.status}
                      </p>
                      <p
                        className={`text-sm ${
                          res.status === "Success"
                            ? "text-green-700 dark:text-green-300"
                            : "text-red-700 dark:text-red-300"
                        }`}
                      >
                        {res.message}
                      </p>
                      {res.data && (
                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          <p>Room No: {res.data.roomNo}</p>
                          <p>Current Student: {res.data.currentStudent}</p>
                          <p>Total Capacity: {res.data.totalCapacity}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
