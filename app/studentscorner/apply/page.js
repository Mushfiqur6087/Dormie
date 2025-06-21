// components/ApplyForm.jsx
'use client'; // This directive is essential for client-side functionality in Next.js App Router

import { useForm, Controller } from 'react-hook-form';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter for redirection

// --- IMPORTANT: Update this import path based on your actual file location ---
// This path assumes your 'public' folder is at the project root,
// and your ApplyForm.jsx is inside 'src/components/' or directly inside 'components/'.
// Adjust the number of '../' as needed to reach the project root, then go into public/data.
import allCollegesData from '../../../public/data/colleges.json';
// Example if ApplyForm.jsx is in 'src/app/forms/':
// import allCollegesData from '../../../../public/data/colleges.json';
// --- END IMPORTANT ---


export default function ApplyForm() {
  // useForm hook initialization
  // 'register' for basic inputs
  // 'handleSubmit' to wrap onSubmit function
  // 'setValue' to programmatically set form values (e.g., collegeLocation)
  // 'control' for Controller components (e.g., college autocomplete)
  // 'watch' to observe form field values for conditional rendering
  // 'formState: { errors }' to access validation errors
  // 'reset' to clear form fields after submission
  const { register, handleSubmit, setValue, control, watch, formState: { errors }, reset } = useForm();
  const router = useRouter(); // Initialize useRouter for potential redirection

  // State for District dropdown (fetched from external API)
  const [districts, setDistricts] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [errorDistricts, setErrorDistricts] = useState(null);

  // States for College Autocomplete functionality
  const [allColleges, setAllColleges] = useState([]); // Master list of all colleges
  const [filteredColleges, setFilteredColleges] = useState([]); // Colleges matching user input for suggestions
  const [collegeInput, setCollegeInput] = useState(''); // Local state for the college input field's displayed value
  const [loadingColleges, setLoadingColleges] = useState(true); // Loading state for college data
  const [errorColleges, setErrorColleges] = useState(null); // Error state for college data fetching
  const [isCollegeValidated, setIsCollegeValidated] = useState(true); // Tracks if current college input matches a valid college
  const suggestionsRef = useRef(null); // Ref for the suggestions dropdown list (for click outside detection)
  const inputRef = useRef(null); // Ref for the college input element (for keyboard focus)
  const [highlightedIndex, setHighlightedIndex] = useState(-1); // For keyboard navigation in suggestions

  // --- New States for Form Submission Status and Feedback ---
  const [isSubmitting, setIsSubmitting] = useState(false); // To disable button during submission
  const [submissionMessage, setSubmissionMessage] = useState(''); // Success message
  const [submissionError, setSubmissionError] = useState(''); // Error message
  // --- END New States ---

  // --- Watch the radio button for conditional rendering ---
  // This will store "yes" or "no" (defaulting to "no" if not yet selected)
  const hasLocalRelative = watch("hasLocalRelative", "no"); 

  // --- useEffect for fetching Districts ---
  // Runs once on component mount to populate the Districts dropdown.
  useEffect(() => {
    async function fetchDistricts() {
      try {
        setLoadingDistricts(true);
        const response = await fetch('https://bdapi.vercel.app/api/v.1/district');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = await response.json();
    
        if (responseData && Array.isArray(responseData.data)) {
          // Sort districts alphabetically by name for better UX
          const sortedDistricts = [...responseData.data].sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
          });
          setDistricts(sortedDistricts);
        } else {
          throw new Error("API response for districts did not contain an array under 'data' key.");
        }
      } catch (error) {
        console.error("Failed to fetch districts:", error);
        setErrorDistricts("Failed to load districts. Please try again.");
      } finally {
        setLoadingDistricts(false);
      }
    }
    fetchDistricts();
  }, []); // Empty dependency array ensures this runs once on mount

  // --- useEffect for loading College data from local JSON ---
  // Runs once on component mount to load the full list of colleges for autocomplete.
  useEffect(() => {
    try {
      setAllColleges(allCollegesData); // Load data from the imported JSON file
      setLoadingColleges(false); // Set loading to false once data is loaded
    } catch (error) {
      console.error("Failed to load colleges from local JSON:", error);
      setErrorColleges("Failed to load colleges data locally.");
      setLoadingColleges(false);
    }
  }, []); // Empty dependency array ensures this runs once on mount

  // --- Callback function to handle selection of a college from suggestions ---
  // Used by both mouse click and Enter key press.
  const selectCollege = useCallback((college, fieldOnChange) => {
    // Format the display value as "College Name, Location"
    const displayValue = `${college.name}, ${college.location}`;
    setCollegeInput(displayValue); // Update the input field's displayed value
    fieldOnChange(displayValue); // Update react-hook-form's internal value for 'college' field
    setValue('collegeLocation', college.location); // Set the separate 'collegeLocation' field
    setFilteredColleges([]); // Clear the suggestion list
    setHighlightedIndex(-1); // Reset keyboard highlight
    setIsCollegeValidated(true); // Mark the college input as validated
    inputRef.current?.focus(); // Keep focus on the input field after selection
  }, [setCollegeInput, setValue, setFilteredColleges, setHighlightedIndex, setIsCollegeValidated]);


  // --- Handle input changes for the College Name field ---
  // Filters college suggestions as the user types.
  const handleCollegeInputChange = (e, fieldOnChange) => {
    const value = e.target.value;
    setCollegeInput(value); // Update local state which controls the input's displayed value
    fieldOnChange(e); // Update react-hook-form's internal value and trigger its validation

    // Filter colleges for suggestions (only if input is not empty)
    if (value.length > 0) {
      const filtered = allColleges.filter(college =>
        // Case-insensitive check if college name starts with the typed value
        college.name.toLowerCase().startsWith(value.toLowerCase())
      ).slice(0, 10); // Limit to top 10 suggestions for performance/UI
      setFilteredColleges(filtered);
      setHighlightedIndex(filtered.length > 0 ? 0 : -1); // Highlight the first item if suggestions exist
    } else {
      setFilteredColleges([]); // Clear suggestions if input is empty
      setHighlightedIndex(-1);
    }
    setIsCollegeValidated(false); // Assume input is not yet fully validated until a selection or exact match
  };

  // --- Keyboard Navigation for College Suggestions ---
  // Handles ArrowUp, ArrowDown, and Enter keys within the college input field.
  const handleKeyDown = useCallback((e, fieldOnChange) => {
    if (filteredColleges.length === 0) return; // No suggestions, so no navigation

    if (e.key === 'ArrowDown') {
      e.preventDefault(); // Prevent cursor movement in the input field
      setHighlightedIndex(prevIndex => 
        (prevIndex + 1) % filteredColleges.length // Cycle through suggestions
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); // Prevent cursor movement in the input field
      setHighlightedIndex(prevIndex => 
        (prevIndex - 1 + filteredColleges.length) % filteredColleges.length // Cycle backwards
      );
    } else if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission when pressing Enter to select
      // If an item is highlighted, select it
      if (highlightedIndex !== -1 && filteredColleges[highlightedIndex]) {
        selectCollege(filteredColleges[highlightedIndex], fieldOnChange);
      }
    }
  }, [filteredColleges, highlightedIndex, selectCollege]);

  // --- useEffect to scroll highlighted suggestion into view ---
  // Improves UX for keyboard navigation in long suggestion lists.
  useEffect(() => {
    if (highlightedIndex !== -1 && suggestionsRef.current) {
      const highlightedElement = suggestionsRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  // --- Custom Validation for College Name on form submission ---
  const validateCollege = (value) => {
    if (!value) return 'College name is required';

    // Check if the input value matches an exact college name or "name, location" format
    const foundCollege = allColleges.find(college => 
        college.name === value || `${college.name}, ${college.location}` === value
    );
    
    if (foundCollege) {
      setValue('collegeLocation', foundCollege.location); // Set location if valid
      setIsCollegeValidated(true);
      return true; // College name is known and valid
    }
    
    setIsCollegeValidated(false); // Mark as unknown
    return 'College is unknown. Please select from suggestions or ensure correct name.';
  };

  // --- useEffect for handling clicks outside the suggestion list ---
  // Closes the suggestions dropdown when user clicks elsewhere on the page.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setFilteredColleges([]); // Clear suggestions
        setHighlightedIndex(-1); // Reset highlight
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- Handle Form Submission ---
  const onSubmit = async (data) => {
    // --- Frontend Debouncing: Prevent multiple submissions ---
    if (isSubmitting) return; // If already submitting, do nothing
    setIsSubmitting(true); // Set submitting state to true
    setSubmissionMessage(''); // Clear previous messages
    setSubmissionError('');   // Clear previous errors
    // --- END Frontend Debouncing ---

    console.log("Form Data Submitted:", data);
    
    // IMPORTANT: For file uploads (like studentImage), you must use FormData!
    // JSON cannot directly send File objects.
    const formData = new FormData();

    // Append all regular form fields from 'data' object to FormData
    // Ensure these names match the expected parameters/DTO fields in your backend.
    formData.append('studentId', data.studentId);
    formData.append('college', data.college);
    formData.append('collegeLocation', data.collegeLocation); 
    formData.append('familyIncome', data.familyIncome); // Note: Spring can convert String to BigDecimal
    formData.append('district', data.district);
    formData.append('postcode', data.postcode);
    formData.append('hasLocalRelative', data.hasLocalRelative); // "yes" or "no" (string)

    // Conditionally append local relative address if 'yes' was selected and address is provided
    if (data.hasLocalRelative === "yes" && data.localRelativeAddress) {
      formData.append('localRelativeAddress', data.localRelativeAddress);
    }

    // Append the image file if one was selected
    // data.studentImage is a FileList object (even for a single file input).
    // We append the actual File object (the first one in the FileList).
    if (data.studentImage && data.studentImage.length > 0) {
      formData.append('studentImage', data.studentImage[0]); 
    }

    // --- Backend API Call ---
    const jwtToken = localStorage.getItem('jwtToken'); // Get JWT from localStorage (assuming student is logged in)
    if (!jwtToken) {
      setSubmissionError("Authentication required to submit application. Please log in.");
      setIsSubmitting(false); // Re-enable button
      // Optionally redirect the user to the login page
      router.push('/login'); 
      return; // Stop submission if no token
    }

    try {
      // Replace with your actual backend URL and the new endpoint path
      const response = await fetch('http://localhost:8080/api/applications/seat', { // This is your new backend endpoint
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`, // Attach JWT for authentication
          // IMPORTANT: DO NOT set 'Content-Type': 'multipart/form-data'. The browser sets it automatically
          // when you send a FormData object. It correctly includes the boundary.
        },
        body: formData, // Send the FormData object
      });

      // Handle HTTP errors first (e.g., 400 Bad Request, 401 Unauthorized, 500 Internal Server Error)
      if (!response.ok) {
        // Attempt to parse error message from JSON body if available, otherwise use statusText
        const errorData = await response.json(); 
        throw new Error(errorData.message || response.statusText || 'Unknown server error'); 
      }

      // If response.ok is true (HTTP 200 OK)
      const result = await response.json(); // Assuming backend returns JSON success response { message: "..." }
      console.log('Application submission result:', result);
      
      setSubmissionMessage(result.message || 'Application submitted successfully!');
      // Optionally reset the form fields after successful submission
      reset(); // Resets all fields managed by react-hook-form to their default values (or empty)
      
    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmissionError('Application submission failed: ' + (error.message || 'Please try again.'));
    } finally {
      setIsSubmitting(false); // Re-enable the submit button in all cases
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Apply for Student Hall Seat</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Student ID */}
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Student ID</label>
            <input
              type="text"
              id="studentId"
              // Validation: required, and must be numbers only
              {...register('studentId', { 
                required: 'Student ID is required', 
                pattern: { value: /^[0-9]+$/, message: 'Student ID must be a number' } 
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.studentId && <p className="mt-1 text-sm text-red-600">{errors.studentId.message}</p>}
          </div>

          {/* College with Autocomplete */}
          <div className="relative">
            <label htmlFor="college" className="block text-sm font-medium text-gray-700">College Name</label>
            {loadingColleges && <p className="mt-1 text-sm text-gray-500">Loading colleges data...</p>}
            {errorColleges && <p className="mt-1 text-sm text-red-600">{errorColleges}</p>}
            {!loadingColleges && !errorColleges && (
              <Controller
                name="college"
                control={control}
                rules={{ 
                  required: 'College name is required',
                  validate: validateCollege 
                }}
                render={({ field, fieldState }) => (
                  <>
                    <input
                      type="text"
                      id="college"
                      // Assign both local ref (inputRef) and react-hook-form's ref (field.ref)
                      ref={(e) => { 
                        inputRef.current = e;
                        field.ref(e);
                      }}
                      value={collegeInput}
                      onChange={(e) => handleCollegeInputChange(e, field.onChange)}
                      onKeyDown={(e) => handleKeyDown(e, field.onChange)}
                      onBlur={() => { // Clear suggestions when input loses focus (unless clicking on a suggestion)
                          if (suggestionsRef.current && !suggestionsRef.current.contains(document.activeElement)) {
                              setFilteredColleges([]);
                              setHighlightedIndex(-1);
                          }
                          field.onBlur(); // Important: Call react-hook-form's onBlur
                      }}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        fieldState.error || (!isCollegeValidated && collegeInput) ? 'border-red-500' : 'border-gray-300'
                      }`}
                      autoComplete="off" // Disable browser's native autocomplete
                    />
                    {filteredColleges.length > 0 && (
                      <ul ref={suggestionsRef} className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                        {filteredColleges.map((college, index) => (
                          <li
                            key={college.id}
                            onClick={() => selectCollege(college, field.onChange)}
                            className={`p-2 cursor-pointer hover:bg-gray-100 text-sm ${
                                index === highlightedIndex ? 'bg-blue-100' : ''
                            }`}
                          >
                            {college.name} <span className="text-gray-500 text-xs">({college.location})</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              />
            )}
            {errors.college && <p className="mt-1 text-sm text-red-600">{errors.college.message}</p>}
            <input type="hidden" {...register('collegeLocation')} /> {/* Hidden field for college location */}
          </div>

          {/* Family Income */}
          <div>
            <label htmlFor="familyIncome" className="block text-sm font-medium text-gray-700">Family Income (BDT)</label>
            <input
              type="number"
              id="familyIncome"
              {...register('familyIncome', {
                required: 'Family income is required',
                min: { value: 0, message: 'Family income cannot be negative' },
                valueAsNumber: true // Converts input value to a number
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.familyIncome && <p className="mt-1 text-sm text-red-600">{errors.familyIncome.message}</p>}
          </div>

          {/* District */}
          <div>
            <label htmlFor="district" className="block text-sm font-medium text-gray-700">District</label>
            {loadingDistricts && <p className="mt-1 text-sm text-gray-500">Loading districts...</p>}
            {errorDistricts && <p className="mt-1 text-sm text-red-600">{errorDistricts}</p>}
            {!loadingDistricts && !errorDistricts && (
              <select
                id="district"
                {...register('district', { required: 'District is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select your District</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.name}>
                    {district.name}
                  </option>
                ))}
              </select>
            )}
            {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district.message}</p>}
          </div>

          {/* Postcode */}
          <div>
            <label htmlFor="postcode" className="block text-sm font-medium text-gray-700">Postcode</label>
            <input
              type="text"
              id="postcode"
              {...register('postcode', { required: 'Postcode is required', pattern: { value: /^[0-9]{4}$/, message: 'Postcode must be 4 digits' } })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.postcode && <p className="mt-1 text-sm text-red-600">{errors.postcode.message}</p>}
          </div>

          {/* New: Image Upload */}
          <div>
            <label htmlFor="studentImage" className="block text-sm font-medium text-gray-700">Upload Student Image</label>
            <input
              type="file"
              id="studentImage"
              {...register('studentImage', { required: 'Student image is required' })}
              accept="image/*" // Only allow image files
              className="mt-1 block w-full text-sm text-gray-500
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0
                         file:text-sm file:font-semibold
                         file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100"
            />
            {errors.studentImage && <p className="mt-1 text-sm text-red-600">{errors.studentImage.message}</p>}
          </div>

          {/* New: Has Local Relative Radio Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Do you have a local relative?</label>
            <div className="mt-1 flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  {...register('hasLocalRelative', { required: 'Please select an option' })}
                  value="yes"
                  className="form-radio text-blue-600"
                />
                <span className="ml-2 text-gray-700">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  {...register('hasLocalRelative', { required: 'Please select an option' })}
                  value="no"
                  className="form-radio text-blue-600"
                />
                <span className="ml-2 text-gray-700">No</span>
              </label>
            </div>
            {errors.hasLocalRelative && <p className="mt-1 text-sm text-red-600">{errors.hasLocalRelative.message}</p>}
          </div>

          {/* New: Conditional Local Relative Address Field */}
          {/* This field only appears if 'hasLocalRelative' is "yes" */}
          {hasLocalRelative === "yes" && (
            <div>
              <label htmlFor="localRelativeAddress" className="block text-sm font-medium text-gray-700">Local Relative Address</label>
              <textarea
                id="localRelativeAddress"
                // This field is required ONLY if hasLocalRelative is "yes"
                {...register('localRelativeAddress', { required: 'Local relative address is required if you selected Yes' })}
                rows="3" // Adjust rows as needed for address input
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              ></textarea>
              {errors.localRelativeAddress && <p className="mt-1 text-sm text-red-600">{errors.localRelativeAddress.message}</p>}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            // --- MODIFIED BUTTON PROPS ---
            disabled={isSubmitting} // Disable button while submitting
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed' // Grey out and change cursor if disabled
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            // --- END MODIFIED ---
          >
            {isSubmitting ? 'Submitting Application...' : 'Apply for Seat'}
          </button>
          
          {/* Submission Feedback Messages */}
          {submissionMessage && <p className="mt-4 text-sm text-center text-green-600">{submissionMessage}</p>}
          {submissionError && <p className="mt-4 text-sm text-center text-red-600">{submissionError}</p>}

        </form>
      </div>
    </div>
  );
}