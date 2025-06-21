// components/SetHallFees.js
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form'; // Import useForm
import { useRouter } from 'next/navigation'; // For redirection after setting fees

export default function SetHallFees() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm(); // Initialize useForm
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Initialize router

  const onSubmit = async (data) => {
    setError(''); // Clear previous errors
    setMessage(''); // Clear previous messages
    setLoading(true);

    const jwtToken = localStorage.getItem('jwtToken'); // Retrieve JWT token
    if (!jwtToken) {
      setError('You are not logged in. Please log in as an Admin or Hall Manager.');
      setLoading(false);
      router.push('/login'); // Redirect to login
      return;
    }

    // Prepare common headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`,
    };

    const currentYear = new Date().getFullYear(); // Get current year for default/validation suggestion

    let attachedFeeSuccess = false;
    let residentFeeSuccess = false;

    try {
      // --- 1. Send request for ATTACHED fee ---
      const attachedFeeData = {
        type: "attached",
        year: Number(data.year),
        fee: Number(data.attachedFee),
      };

      console.log('Sending Attached Fee:', attachedFeeData);
      const attachedRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hall-fees`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(attachedFeeData),
      });

      if (attachedRes.ok) {
        attachedFeeSuccess = true;
        console.log('Attached Fee set successfully!');
      } else {
        const errorData = await attachedRes.json();
        throw new Error(`Attached Fee failed: ${errorData.message || attachedRes.statusText}`);
      }

      // --- 2. Send request for RESIDENT fee ---
      const residentFeeData = {
        type: "resident",
        year: Number(data.year),
        fee: Number(data.residentFee),
      };

      console.log('Sending Resident Fee:', residentFeeData);
      const residentRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hall-fees`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(residentFeeData),
      });

      if (residentRes.ok) {
        residentFeeSuccess = true;
        console.log('Resident Fee set successfully!');
      } else {
        const errorData = await residentRes.json();
        throw new Error(`Resident Fee failed: ${errorData.message || residentRes.statusText}`);
      }

      // If both succeeded
      if (attachedFeeSuccess && residentFeeSuccess) {
        setMessage('Hall fees (Attached & Resident) set successfully for the year!');
        reset(); // Clear the form after successful submission
      } else {
        // This case should ideally be caught by the individual throws, but as a fallback
        setError('Partial success or unexpected error setting fees.');
      }

    } catch (err) {
      console.error('Error setting hall fees:', err);
      setError(err.message || 'An unexpected error occurred while setting fees.');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Set Hall Fees</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Year Input */}
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
            <input
              type="number"
              id="year"
              defaultValue={currentYear} // Pre-fill with current year
              {...register('year', { 
                required: 'Year is required', 
                min: { value: 2020, message: 'Year must be 2020 or later' }, 
                max: { value: 2030, message: 'Year must be 2030 or earlier' },
                valueAsNumber: true
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>}
          </div>

          {/* Attached Fee Input */}
          <div>
            <label htmlFor="attachedFee" className="block text-sm font-medium text-gray-700">Attached Fee (BDT)</label>
            <input
              type="number"
              id="attachedFee"
              step="0.01" // Allow decimal values
              {...register('attachedFee', { 
                required: 'Attached Fee is required', 
                min: { value: 0.01, message: 'Fee must be greater than 0' },
                max: { value: 999999.99, message: 'Fee must be less than 1,000,000' },
                valueAsNumber: true
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.attachedFee && <p className="mt-1 text-sm text-red-600">{errors.attachedFee.message}</p>}
          </div>

          {/* Resident Fee Input */}
          <div>
            <label htmlFor="residentFee" className="block text-sm font-medium text-gray-700">Resident Fee (BDT)</label>
            <input
              type="number"
              id="residentFee"
              step="0.01" // Allow decimal values
              {...register('residentFee', { 
                required: 'Resident Fee is required', 
                min: { value: 0.01, message: 'Fee must be greater than 0' },
                max: { value: 999999.99, message: 'Fee must be less than 1,000,000' },
                valueAsNumber: true
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.residentFee && <p className="mt-1 text-sm text-red-600">{errors.residentFee.message}</p>}
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting Fees...' : 'Set Hall Fees'}
          </button>
        </form>
      </div>
    </div>
  );
}