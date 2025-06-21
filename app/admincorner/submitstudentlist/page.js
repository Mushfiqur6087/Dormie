// app/admin/student-upload/page.jsx
// or components/AdminStudentBatchUpload.jsx if you prefer to import it into a page

'use client'; // This is essential for client-side functionality in Next.js App Router

import React, { useState } from 'react';
import * as XLSX from 'xlsx'; // Import the xlsx library

export default function AdminStudentBatchUpload() {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [successfulRecords, setSuccessfulRecords] = useState(0);
  const [failedRecords, setFailedRecords] = useState(0);
  const [errorMessage, setErrorMessage] = useState(''); // To show general errors

  // Common password for all new students - from environment variable
  const COMMON_PASSWORD = process.env.NEXT_PUBLIC_DEFAULT_STUDENT_PASSWORD || "12345678";
  // All students created via this endpoint will have the "STUDENT" role - from environment variable
  const DEFAULT_ROLE = process.env.NEXT_PUBLIC_DEFAULT_STUDENT_ROLE || "STUDENT"; 

  const handleFileChange = (e) => {
    setErrorMessage(''); // Clear previous errors
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          selectedFile.name.endsWith(".xlsx")) {
        setFile(selectedFile);
        // Reset results when a new file is selected
        setResults([]); 
        setTotalRecords(0);
        setSuccessfulRecords(0);
        setFailedRecords(0);
      } else {
        setErrorMessage("Please upload a valid .xlsx Excel file.");
        setFile(null);
      }
    }
  };

  const processExcelFile = async () => {
    if (!file) {
      setErrorMessage("Please select a file first.");
      return;
    }

    setProcessing(true);
    setResults([]); // Clear previous results
    setTotalRecords(0);
    setSuccessfulRecords(0);
    setFailedRecords(0);
    setErrorMessage('');

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert sheet to JSON, reading headers from the first row
        // header: 1 means the first row is used as headers, subsequent rows are data
        const jsonRows = XLSX.utils.sheet_to_json(worksheet);

        if (jsonRows.length === 0) {
          setErrorMessage("Excel file is empty or contains no data rows after headers.");
          setProcessing(false);
          return;
        }

        setTotalRecords(jsonRows.length);

        const currentResults = [];
        let successCount = 0;
        let failCount = 0;

        // Get the Admin's JWT token from localStorage
        const adminToken = localStorage.getItem('jwtToken'); 
        if (!adminToken) {
          setErrorMessage("Admin not logged in. Please log in first.");
          setProcessing(false);
          return;
        }

        // Loop through each row and send to backend
        for (const [index, row] of jsonRows.entries()) {
          const rowIndex = index + 2; // +2 because sheet_to_json is 0-indexed for data, +1 for header, +1 for 1-based display

          // --- Map Excel column names to SignupRequest DTO fields ---
          // Use the exact column headers from your screenshot: StudentId, Username, Email
          const studentIdFromExcel = row["StudentId"];
          const usernameFromExcel = row["Username"];
          const emailFromExcel = row["Email"];

          const signupData = {
            username: usernameFromExcel,
            email: emailFromExcel,
            password: COMMON_PASSWORD, // Hardcoded common password
            studentId: studentIdFromExcel,
            role: DEFAULT_ROLE, // Hardcoded default role
          };

          // Basic client-side validation for critical fields before sending to backend
          // Frontend should validate required types/formats as much as possible
          let rowFailed = false;
          let rowMessage = '';

          if (!signupData.username || String(signupData.username).trim() === '') {
            rowFailed = true;
            rowMessage = 'Missing or empty Username';
          } else if (!signupData.email || String(signupData.email).trim() === '') {
            rowFailed = true;
            rowMessage = 'Missing or empty Email';
          } else if (!signupData.studentId || isNaN(Number(signupData.studentId))) { // Check if studentId is not a number
            rowFailed = true;
            rowMessage = 'Missing or invalid StudentId (must be a number)';
          }

          if (rowFailed) {
            failCount++;
            currentResults.push({ row: rowIndex, status: 'Failed', message: rowMessage, data: signupData });
            setFailedRecords(failCount);
            setResults([...currentResults]); // Update UI immediately
            continue; // Skip to next row
          }

          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin/signup`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`,
              },
              body: JSON.stringify(signupData),
            });

            const responseData = await response.json(); // Backend sends MessageResponse or error

            if (response.ok) {
              successCount++;
              currentResults.push({ row: rowIndex, status: 'Success', message: responseData.message || 'Student user created successfully!', data: signupData });
            } else {
              failCount++;
              currentResults.push({ row: rowIndex, status: 'Failed', message: responseData.message || 'Server error occurred', data: signupData });
            }
          } catch (error) {
            failCount++;
            currentResults.push({ row: rowIndex, status: 'Failed', message: `Network error: ${error.message}`, data: signupData });
          }

          setSuccessfulRecords(successCount);
          setFailedRecords(failCount);
          setResults([...currentResults]); // Update UI immediately after each row
        }

      } catch (error) {
        setErrorMessage(`Error processing file: ${error.message}`);
        console.error("Error processing Excel:", error);
      } finally {
        setProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file); // Read the file
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Admin: Batch Student Upload</h2>
        
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="excel-file-input" className="block text-sm font-medium text-gray-700 mb-2">
            Upload Student Excel File (.xlsx)
          </label>
          <input 
            id="excel-file-input"
            type="file" 
            accept=".xlsx" 
            onChange={handleFileChange} 
            disabled={processing} 
            className="block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
          />
        </div>

        <button 
          onClick={processExcelFile} 
          disabled={!file || processing}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {processing ? 'Processing Students...' : 'Upload & Create Students'}
        </button>

        {totalRecords > 0 && (
          <div className="mt-6 p-4 border rounded-md bg-gray-50">
            <p className="text-lg font-semibold">Overall Progress:</p>
            <p>Total Records: <span className="font-bold">{totalRecords}</span></p>
            <p>Successful: <span className="font-bold text-green-600">{successfulRecords}</span></p>
            <p>Failed: <span className="font-bold text-red-600">{failedRecords}</span></p>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md w-full max-w-lg max-h-96 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Individual Processing Details:</h2>
          <ul>
            {results.map((res, idx) => (
              <li key={idx} className={`mb-2 p-3 border rounded-md ${res.status === 'Success' ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                <span className="font-bold">Row {res.row}:</span>{' '}
                <span className={`font-semibold ${res.status === 'Success' ? 'text-green-700' : 'text-red-700'}`}>
                  {res.status}
                </span>{' '}
                - {res.message}
                {res.data && (
                    <div className="text-gray-600 text-sm mt-1">
                        <p>Username: {res.data.username}</p>
                        <p>Email: {res.data.email}</p>
                        <p>Student ID: {res.data.studentId}</p>
                    </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}