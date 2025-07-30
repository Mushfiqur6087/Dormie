// app/authoritycorner/provost/applications/page.jsx
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // useRouter for navigation, useSearchParams for sort params
import Link from 'next/link'; // For linking to detail page

function ProvostApplicationList() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get sort parameters from URL or set defaults
  const sortBy = searchParams.get('sortBy') || 'applicationDate';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  // Function to fetch applications with sorting
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);

    const jwtToken = localStorage.getItem('jwtToken');
    if (!jwtToken) {
      setError('Authentication required. Please log in as Provost or Admin.');
      setLoading(false);
      router.push('/login'); // Redirect to login if not authenticated
      return;
    }

    try {
      const response = await fetch(
        `http://172.187.160.142:8080/api/applications/all-summaries?sortBy=${sortBy}&sortOrder=${sortOrder}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }

      const data = await response.json();
      setApplications(data);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError(err.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }, [sortBy, sortOrder, router]); // Re-fetch when sort parameters change

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]); // Call fetchApplications when component mounts or fetchApplications changes

  // Function to handle sort change
  const handleSortChange = (newSortBy) => {
    let newSortOrder = 'asc';
    if (sortBy === newSortBy) {
      // Toggle sort order if clicking the same column
      newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }
    // Update URL query parameters to trigger re-fetch
    router.push(`/authoritycorner/provost/applications?sortBy=${newSortBy}&sortOrder=${newSortOrder}`);
  };

  const getSortIndicator = (columnName) => {
    if (sortBy === columnName) {
      return sortOrder === 'asc' ? ' ▲' : ' ▼';
    }
    return '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-700">Loading applications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-md shadow-lg">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
          Hall Seat Applications
        </h1>

        <div className="mb-6 flex justify-end space-x-4">
          <button
            onClick={() => handleSortChange('familyIncome')}
            className="px-4 py-2 rounded-lg bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-colors shadow"
          >
            Sort by Income{getSortIndicator('familyIncome')}
          </button>
          <button
            onClick={() => handleSortChange('distanceFromHallKm')}
            className="px-4 py-2 rounded-lg bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-colors shadow"
          >
            Sort by Distance{getSortIndicator('distanceFromHallKm')}
          </button>
          <button
            onClick={() => handleSortChange('applicationDate')}
            className="px-4 py-2 rounded-lg bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-colors shadow"
          >
            Sort by Date{getSortIndicator('applicationDate')}
          </button>
        </div>

        {applications.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">No pending applications found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Family Income (BDT)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance (KM)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app.applicationId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {app.applicationId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {app.studentIdNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {app.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      ৳{app.familyIncome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {app.distanceFromHallKm ? `${app.distanceFromHallKm.toFixed(2)} km` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          app.applicationStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          app.applicationStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {app.applicationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/authoritycorner/provost/applications/${app.applicationId}`} passHref>
                        <button className="text-indigo-600 hover:text-indigo-900 transition-colors">
                          View Details
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function ApplicationsLoading() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-xl font-semibold text-gray-700">Loading applications...</div>
    </div>
  );
}

// Main component wrapped with Suspense
export default function ProvostApplicationListPage() {
  return (
    <Suspense fallback={<ApplicationsLoading />}>
      <ProvostApplicationList />
    </Suspense>
  );
}
