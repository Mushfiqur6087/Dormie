// app/authoritycorner/provost/applications/[id]/page.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Ensure useParams is imported

// --- FIX START ---
// Remove 'params' from the function arguments
export default function ProvostApplicationDetailPage() {
// --- FIX END ---
  const router = useRouter();
  // Get the application ID using the useParams hook
  const { id } = useParams(); // <--- This is the correct way for client components

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const IMAGE_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/uploads/`;

  const fetchApplicationDetails = useCallback(async () => {
    // Only attempt to fetch if ID is available (useParams might return undefined initially)
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const jwtToken = localStorage.getItem('jwtToken');
    if (!jwtToken) {
      setError('Authentication required. Please log in as Provost or Admin.');
      setLoading(false);
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Application not found.');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }

      const data = await response.json();
      setApplication(data);
    } catch (err) {
      console.error("Error fetching application details:", err);
      setError(err.message || 'Failed to load application details.');
    } finally {
      setLoading(false);
    }
  }, [id, router]); // Depend on 'id' from useParams

  useEffect(() => {
    fetchApplicationDetails();
  }, [fetchApplicationDetails]);

  const handleApplicationAction = useCallback(async (actionType) => {
    setIsProcessing(true);
    setError(null);

    const jwtToken = localStorage.getItem('jwtToken');
    if (!jwtToken) {
      setError('Authentication required. Please log in.');
      setIsProcessing(false);
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications/${id}/${actionType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }

      const result = await response.json();
      alert(result.message);
      router.push('/authoritycorner/provost/applications');
    } catch (err) {
      console.error(`Error ${actionType}ing application:`, err);
      setError(err.message || `Failed to ${actionType} application.`);
    } finally {
      setIsProcessing(false);
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-700">Loading application details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-md shadow-lg">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
          <button
            onClick={() => router.push('/authoritycorner/provost/applications')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-md shadow-lg">
          <p>Application not found.</p>
          <button
            onClick={() => router.push('/authoritycorner/provost/applications')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
          Application Details
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Image Section */}
          <div className="flex justify-center items-center p-4 bg-gray-50 rounded-lg shadow-inner">
            {application.studentImagePath ? (
              <img
                src={`${IMAGE_BASE_URL}${application.studentImagePath}`}
                alt={`Student ${application.studentIdNo} Image`}
                className="max-w-full h-auto max-h-80 object-contain rounded-md border border-gray-300"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/200x200/cccccc/000000?text=Image+Not+Found';
                  console.error('Image failed to load:', e.target.src);
                }}
              />
            ) : (
              <div className="w-64 h-64 bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-md border border-gray-300">
                No Student Image
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">Applicant Information</h2>
            <DetailItem label="Application ID" value={application.applicationId} />
            <DetailItem label="Student ID" value={application.studentIdNo} />
            <DetailItem label="User ID" value={application.userId} />
            <DetailItem label="College" value={`${application.college} (${application.collegeLocation})`} />
            <DetailItem label="District" value={application.district} />
            <DetailItem label="Postcode" value={application.postcode} />
            <DetailItem label="Family Income" value={`৳${application.familyIncome.toFixed(2)}`} />
            <DetailItem 
                label="Distance to Hall" 
                value={application.distanceFromHallKm ? `${application.distanceFromHallKm.toFixed(2)} km` : 'N/A'} 
            />
            <DetailItem label="Local Relative" value={application.hasLocalRelative ? 'Yes' : 'No'} />
            {application.hasLocalRelative && application.localRelativeAddress && (
              <DetailItem label="Relative Address" value={application.localRelativeAddress} />
            )}
            <DetailItem label="Application Date" value={new Date(application.applicationDate).toLocaleString()} />
            <DetailItem 
              label="Status" 
              value={application.applicationStatus} 
              status={application.applicationStatus} 
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => handleApplicationAction('accept')}
            disabled={isProcessing || application.applicationStatus !== 'PENDING'}
            className={`px-8 py-3 rounded-lg text-white font-semibold transition ${
              isProcessing || application.applicationStatus !== 'PENDING'
                ? 'bg-green-300 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 shadow-lg'
            }`}
          >
            {isProcessing ? 'Accepting...' : 'Accept'}
          </button>
          <button
            onClick={() => handleApplicationAction('reject')}
            disabled={isProcessing || application.applicationStatus !== 'PENDING'}
            className={`px-8 py-3 rounded-lg text-white font-semibold transition ${
              isProcessing || application.applicationStatus !== 'PENDING'
                ? 'bg-red-300 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 shadow-lg'
            }`}
          >
            {isProcessing ? 'Rejecting...' : 'Reject'}
          </button>
          <button
            onClick={() => router.push('/authoritycorner/provost/applications')}
            disabled={isProcessing}
            className="px-8 py-3 rounded-lg bg-gray-600 text-white font-semibold hover:bg-gray-700 transition-colors shadow-lg"
          >
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper component for displaying detail items (already provided)
function DetailItem({ label, value, status }) {
    let statusClass = '';
    if (status) {
        if (status === 'PENDING') statusClass = 'text-yellow-700 bg-yellow-100 px-2 py-1 rounded-md';
        else if (status === 'APPROVED') statusClass = 'text-green-700 bg-green-100 px-2 py-1 rounded-md';
        else if (status === 'REJECTED') statusClass = 'text-red-700 bg-red-100 px-2 py-1 rounded-md';
    }
    return (
        <p className="text-gray-800">
            <span className="font-semibold text-gray-600">{label}:</span>{' '}
            {status ? <span className={statusClass}>{value}</span> : value}
        </p>
    );
}