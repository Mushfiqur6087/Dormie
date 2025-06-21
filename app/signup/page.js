// pages/signup.jsx (Pages Router example)
'use client'
import { useState } from 'react';

export default function Signup() {
  const [formData, setFormData] = useState({
    studentId:'',
    username: '',
    password_hash: '',
    email: '',
  });

   const [showPassword, setShowPassword] = useState(false); // <-- toggle state
    function togglePassword() {
    setShowPassword((prev) => !prev);
  }


  // Handle input changes
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

async function handleSubmit(e) {
  e.preventDefault();

  try {
    const response = await fetch('http://localhost:8080/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId: formData.studentId, // assuming you have a student ID field
        username: formData.username,
        password_hash: formData.password_hash, // assuming you're sending hash directly
        email: formData.email,
      }),
    });

    if (response.ok) {
      alert('Signup successful!');
      setFormData({
        studentId: '',
        username: '',
        password_hash: '',
        email: '',
      });
    } else {
      const errorData = await response.json();
      alert('Signup failed: ' + (errorData.message || 'Unknown error'));
    }
  } catch (error) {
    alert('Network error: ' + error.message);
  }
}


  return (
    <div className='bg-[#F9DC8C]'> 
    <div className="max-w-md mx-auto p-4 mt-10  rounded shadow bg-[#E2FF8E]">
      <h1 className="text-2xl font-bold mb-4">Signup</h1>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label htmlFor="username" className="block mb-1 font-semibold">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>

         <div>
          <label htmlFor="studentId" className="block mb-1 font-semibold">Student ID</label>
          <input
            type="number"
            id="studentId"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>

        <div>
          <label htmlFor="password_hash" className="block mb-1 font-semibold">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password_hash"
              name="password_hash"
              value={formData.password_hash}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded pr-10"
              required
            />
            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-2 top-2 text-gray-600 hover:text-gray-900"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {/* Simple eye icon SVG */}
              {showPassword ? (
                // Eye open icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              ) : (
                // Eye closed icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.251-3.613m1.137-1.38A9.953 9.953 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.968 9.968 0 01-1.69 2.922M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3l18 18"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block mb-1 font-semibold">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Signup
        </button>
      </form>
    </div>

    </div>
    
    
  );
}
