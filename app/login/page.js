'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

     try {
      const res = await fetch('http://localhost:8080/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password }), // Corrected payload
      });

      const data = await res.json(); // Parse the JSON response

          console.log("Login Response Status:", res.status);
      console.log("Login Response Data:", data);
      console.log("Does data contain .jwt property?", 'jwt' in data);
      if ('jwt' in data) {
          console.log("Value of data.jwt:", data.jwt);
      }
      if (res.ok) {
        setMessage('Login successful!');
        
        localStorage.setItem('jwtToken', data.accessToken);
        localStorage.setItem('userName', data.username);
        localStorage.setItem('userId', data.id);
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('userRoles', JSON.stringify(data.roles)); // Store roles array as JSON string

        // --- IMPROVED REDIRECTION LOGIC BASED ON ROLES ARRAY ---
        const roles = data.roles || []; // Ensure roles is an array, default to empty if null/undefined

        if (roles.includes('ROLE_ADMIN')) {
          router.push('/admincorner'); // Prioritize admin
        } else if (roles.includes('ROLE_HALL_MANAGER')) { // Assuming 'HALL_MANAGER' is a role
          router.push('/authority/hallmanagercorner'); // Example for Hall Manager
        } else if (roles.includes('ROLE_PROVOST')) { // Assuming 'PROVOST' is a role
          router.push('/authoritycorner/provost'); // Example for Provost
        } else if (roles.includes('ROLE_SUPERVISOR')) { // Assuming 'SUPERVISOR' is a role
          router.push('/authority/supervisorcorner'); // Example for Supervisor
        } else if (roles.includes('ROLE_STUDENT')) {
          router.push('/studentscorner'); // Student dashboard
        } else {
          router.push('/unknownrole'); // Fallback for roles not explicitly handled
        }
        // --- END IMPROVED REDIRECTION ---

      } else {
        // Login failed (e.g., bad credentials, validation errors from backend)
        setError(data.message || 'Login failed. Please check your credentials.');
        console.error('Login failed details:', data);
      }
    } catch (err) {
      // Network or other unexpected errors
      setError('A network error occurred. Please try again.');
      console.error('Network error during login:', err);
    } finally {
      setLoading(false); // Always reset loading state
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md space-y-4 w-96"
      >
        <h2 className="text-2xl font-bold text-center">Login</h2>

        <input
          type="text"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Login
        </button>

        {message && (
          <p className="text-center text-sm text-gray-700">{message}</p>
        )}
      </form>
    </div>
  );
}
