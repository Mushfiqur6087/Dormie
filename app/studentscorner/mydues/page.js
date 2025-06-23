'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function MyDues() {
  const [dues, setDues] = useState({
    hallFeeDue: 0,
    diningFeeDue: 0,
    loading: true,
    error: null,
  });
  const [isPaying, setIsPaying] = useState(false);
  const router = useRouter();

  const fetchDues = useCallback(async () => {
    setDues(prev => ({ ...prev, loading: true, error: null }));

    const jwtToken = localStorage.getItem('jwtToken');
    const userId = localStorage.getItem('userId');

    if (!jwtToken || !userId) {
      setDues({ hallFeeDue: 0, diningFeeDue: 0, loading: false, error: 'Authentication required. Please log in.' });
      router.push('/login');
      return;
    }

    const authHeaders = {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json',
    };

    // Initialize these to 0 here; they will be updated based on fetch results
    let currentHallFeeDue = 0;
    let currentDiningFeeDue = 0;

    try {
      // --- Step 1: Fetch Hall Fees for the authenticated user ---
      console.log("Fetching Hall Fees for userId:", userId);
      const hallFeesRes = await fetch(`http://172.187.160.142:8080/api/student-hall-fees/user/${userId}`, {
        method: 'GET',
        headers: authHeaders,
      });

      if (hallFeesRes.ok) {
        // Backend returns Optional<StudentHallFeeDTO>, which translates to StudentHallFeeDTO object or null
        const hallFeeData = await hallFeesRes.json();
        console.log("Backend response for Hall Fees (raw):", hallFeeData); 
        
        // Correctly access dueAmount from the DTO
        if (hallFeeData && typeof hallFeeData === 'object' && hallFeeData.dueAmount !== undefined) {
          currentHallFeeDue = hallFeeData.dueAmount;
          console.log("Calculated Hall Fee Due:", currentHallFeeDue);
        } else {
          console.log("No active Hall Fee DTO found or dueAmount is undefined. Defaulting to 0.");
          // currentHallFeeDue remains 0
        }
      } else {
        const errorText = await hallFeesRes.text();
        // Log the error but don't stop execution, continue to fetch dining fees
        console.error(`Failed to fetch Hall Fees: ${errorText || hallFeesRes.statusText}`);
        setError(`Failed to load Hall Fees: ${errorText || hallFeesRes.statusText}`);
      }

      // --- Step 2: Fetch Dining Fees for the authenticated user ---
      console.log("Fetching Dining Fees for userId:", userId);
      const diningFeesRes = await fetch(`http://172.187.160.142:8080/api/student-dining-fees/user/${userId}`, {
        method: 'GET',
        headers: authHeaders,
      });

      if (diningFeesRes.ok) {
        // Backend returns List<StudentDiningFeeDTO>, which is an array
        const fetchedDiningFees = await diningFeesRes.json();
        console.log("Backend response for Dining Fees (raw):", fetchedDiningFees); 

        if (Array.isArray(fetchedDiningFees) && fetchedDiningFees.length > 0) {
          // Sum up the due amounts from all relevant dining fee records
          currentDiningFeeDue = fetchedDiningFees.reduce((sum, feeItem) => {
            // feeItem.dueAmount will be a number (BigDecimal converted to JS number by JSON parsing)
            // Use ?? 0 for nullish coalescing to handle potential undefined/null dueAmount gracefully
            return sum + (feeItem.dueAmount ?? 0); 
          }, 0);
          console.log("Calculated Dining Fee Due:", currentDiningFeeDue);
        } else {
          console.log("No active Dining Fee DTOs found. Defaulting to 0.");
          // currentDiningFeeDue remains 0
        }
      } else {
        const errorText = await diningFeesRes.text();
        console.error(`Failed to fetch Dining Fees: ${errorText || diningFeesRes.statusText}`);
        // Append dining fee error to existing error, if any
        setError(prevError => (prevError ? `${prevError}; ` : '') + `Failed to load Dining Fees: ${errorText || diningFeesRes.statusText}`);
      }

      // --- Final Update of Dues State ---
      setDues({
        hallFeeDue: currentHallFeeDue,
        diningFeeDue: currentDiningFeeDue,
        loading: false,
        error: error, // Pass the error state that might have been set above
      });

    } catch (err) { // This catch block is for network errors or errors thrown by our code
      console.error("Critical error during dues fetch:", err);
      let displayError = err.message;
      if (err.message.includes('401') || err.message.includes('403')) {
          displayError = "Authentication failed or unauthorized access. Please log in again.";
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('userId');
          router.push('/login');
      }
      setDues(prev => ({ ...prev, loading: false, error: displayError }));
    }
  }, [router]);


  useEffect(() => {
    fetchDues();
  }, [fetchDues]);


  async function handleProceedToPay() {
    setIsPaying(true);
    try {
      const username = localStorage.getItem('userName'); // Your payment API uses username
      const jwtToken = localStorage.getItem('jwtToken');

      if (!username || !jwtToken) {
        alert('Authentication information missing. Please login again.');
        setIsPaying(false);
        router.push('/login');
        return;
      }

      const response = await fetch(`http://172.187.160.142:8080/payment/initiate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ username }), // Ensure this matches payment API's DTO
      });

      const data = await response.json();

      if (response.ok && data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        alert('Failed to initiate payment: ' + (data.failedreason || data.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    } finally {
      setIsPaying(false);
    }
  }

  const { hallFeeDue, diningFeeDue, loading, error } = dues;
  const totalDue = hallFeeDue + diningFeeDue;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-md mt-12">
      <h1 className="text-3xl font-bold mb-6 text-center">My Dues</h1>

      {loading && <p className="text-center text-gray-600">Loading dues...</p>}

      {error && <p className="text-center text-red-600 font-semibold">Error: {error}</p>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-8">
            <div className="p-6 bg-yellow-100 rounded shadow hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-2">Hall Fees Due</h2>
              <p className="text-3xl font-bold text-yellow-700">৳{hallFeeDue.toFixed(2)}</p>
            </div>

            <div className="p-6 bg-green-100 rounded shadow hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-2">Dining Fees Due</h2>
              <p className="text-3xl font-bold text-green-700">৳{diningFeeDue.toFixed(2)}</p>
            </div>

            <div className="p-6 bg-red-100 rounded shadow hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-2">Total Due</h2>
              <p className="text-3xl font-bold text-red-700">৳{totalDue.toFixed(2)}</p>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleProceedToPay}
              disabled={isPaying || totalDue <= 0}
              className={`px-6 py-3 rounded text-white font-semibold transition ${
                isPaying || totalDue <= 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isPaying ? 'Processing...' : 'Proceed to Pay'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}