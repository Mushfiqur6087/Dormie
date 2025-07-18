"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createApiUrl } from "../../../../lib/api"
import { 
  MessageSquare, 
  Upload, 
  X, 
  AlertTriangle, 
  Package, 
  MapPin, 
  FileText, 
  Image as ImageIcon,
  ArrowLeft
} from "lucide-react"

export default function CreateComplaintPage() {
  const router = useRouter()
  const fileInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    complaintType: "LOST_AND_FOUND",
    location: "",
  })
  
  const [selectedImages, setSelectedImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (error) setError(null)
  }

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Please select only image files')
        return false
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image files must be smaller than 5MB')
        return false
      }
      return true
    })

    // Limit to 5 images total
    const currentCount = selectedImages.length
    const newFiles = validFiles.slice(0, 5 - currentCount)
    
    if (validFiles.length > newFiles.length) {
      setError('You can only upload up to 5 images')
    }

    setSelectedImages(prev => [...prev, ...newFiles])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (indexToRemove) => {
    setSelectedImages(prev => prev.filter((_, index) => index !== indexToRemove))
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Please enter a title for your complaint')
      return false
    }
    if (!formData.description.trim()) {
      setError('Please provide a description')
      return false
    }
    if (formData.complaintType === 'LOST_AND_FOUND' && selectedImages.length === 0) {
      setError('Please upload at least one image for Lost & Found complaints')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("jwtToken")
      if (!token) {
        setError("Authentication token not found. Please log in again.")
        return
      }

      // Create FormData for file upload
      const submitData = new FormData()
      
      // Add form fields
      submitData.append('title', formData.title.trim())
      submitData.append('description', formData.description.trim())
      submitData.append('complaintType', formData.complaintType)
      if (formData.location.trim()) {
        submitData.append('location', formData.location.trim())
      }
      
      // Add images
      selectedImages.forEach((file, index) => {
        submitData.append('images', file)
      })

      const response = await fetch(createApiUrl('/api/complaints'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: submitData
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to create complaint: ${errorText}`)
      }

      const newComplaint = await response.json()
      setSuccess('Complaint submitted successfully!')
      
      // Redirect after success
      setTimeout(() => {
        router.push('/studentscorner/complaints')
      }, 2000)

    } catch (err) {
      console.error('Error creating complaint:', err)
      setError(err.message || 'Failed to submit complaint. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="w-12 h-12 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Create Complaint</h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">Submit a new complaint or report</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-6 py-4 rounded-xl mb-6 flex items-center space-x-3">
            <div className="w-6 h-6 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-medium">{success}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl mb-6 flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* Complaint Type */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Complaint Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.complaintType === 'LOST_AND_FOUND'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, complaintType: 'LOST_AND_FOUND' }))}
                >
                  <input
                    type="radio"
                    name="complaintType"
                    value="LOST_AND_FOUND"
                    checked={formData.complaintType === 'LOST_AND_FOUND'}
                    onChange={handleInputChange}
                    className="absolute top-4 right-4"
                  />
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lost & Found</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Report lost items or found items</p>
                    </div>
                  </div>
                </div>

                <div
                  className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.complaintType === 'RAGGING'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, complaintType: 'RAGGING' }))}
                >
                  <input
                    type="radio"
                    name="complaintType"
                    value="RAGGING"
                    checked={formData.complaintType === 'RAGGING'}
                    onChange={handleInputChange}
                    className="absolute top-4 right-4"
                  />
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ragging</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Report ragging incidents (confidential)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Title *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter a descriptive title for your complaint"
                  className="w-full pl-10 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide detailed information about your complaint..."
                rows={6}
                className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg resize-none"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Location (Optional)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Where did this incident occur?"
                  className="w-full pl-10 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Images {formData.complaintType === 'LOST_AND_FOUND' && '*'}
              </label>
              
              {/* Upload Area */}
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Upload Images
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Click to select images or drag and drop here
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Maximum 5 images, up to 5MB each. Supports JPG, PNG, GIF.
                </p>
              </div>

              {/* Selected Images */}
              {selectedImages.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                    Selected Images ({selectedImages.length}/5)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {selectedImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 truncate">
                          {file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                }`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Submit Complaint'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
