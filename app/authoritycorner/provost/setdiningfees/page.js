// components/SetDiningFees.js
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

export default function SetDiningFees() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data) => {
    setError('');
    setMessage('');
    setLoading(true);

    const jwtToken = localStorage.getItem('jwtToken');
    if (!jwtToken) {
      setError('You are not logged in. Please log in as an Admin or Hall Manager.');
      setLoading(false);
      router.push('/login');
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`,
    };

    try {
      const diningFeeData = {
        type: "resident", // Hardcoded as per DiningFee entity/DTO logic
        year: Number(data.year),
        startDate: data.startDate, // HTML date input provides YYYY-MM-DD string
        endDate: data.endDate,     // HTML date input provides YYYY-MM-DD string
        fee: Number(data.fee),
      };

      console.log('Sending Dining Fee:', diningFeeData);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dining-fees`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(diningFeeData),
      });

      const responseData = await res.json(); // Backend returns DiningFeeDTO or error message

      if (res.ok) {
        setMessage(`Dining Fee for ${responseData.year} (${responseData.startDate} to ${responseData.endDate}) set successfully: ${responseData.fee} BDT!`);
        reset(); // Clear the form
      } else {
        // Backend's HallFeeController returns badRequest().build() which has no body,
        // so we try to parse it if it's there, otherwise use statusText
        const errorMessage = responseData.message || responseData.error || res.statusText || 'Unknown error';
        setError(`Failed to set Dining Fee: ${errorMessage}`);
      }

    } catch (err) {
      console.error('Error setting dining fees:', err);
      setError(err.message || 'An unexpected network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear(); // For pre-filling year

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Set Dining Fee</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Year Input */}
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
            <input
              type="number"
              id="year"
              defaultValue={currentYear}
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

          {/* Start Date Input */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              id="startDate"
              {...register('startDate', {
                required: 'Start Date is required'
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>}
          </div>

          {/* End Date Input */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              id="endDate"
              {...register('endDate', {
                required: 'End Date is required',
                // Optional: Add custom validation to ensure end date is after start date
                validate: (value, formValues) => 
                  formValues.startDate && value >= formValues.startDate || 'End Date must be after Start Date'
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>}
          </div>

          {/* Fee Input */}
          <div>
            <label htmlFor="fee" className="block text-sm font-medium text-gray-700">Fee (BDT)</label>
            <input
              type="number"
              id="fee"
              step="0.01" // Allow decimal values
              {...register('fee', {
                required: 'Fee is required',
                min: { value: 0.01, message: 'Fee must be greater than 0' },
                max: { value: 999999.99, message: 'Fee must be less than 1,000,000' },
                valueAsNumber: true
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.fee && <p className="mt-1 text-sm text-red-600">{errors.fee.message}</p>}
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting Fee...' : 'Set Dining Fee'}
          </button>
        </form>
      </div>
    </div>
  );
}