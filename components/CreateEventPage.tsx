"use client"
import { useState } from "react"
import UnifiedCamera from "./UnifiedCamera"
import AIGenerationStep from "./AIGenerationStep"
import AIPromptInput from "./AIPromptInput"
import { compressVideo, compressImage, formatFileSize } from "@/lib/media-utils"
import { prepareEventData } from "@/lib/event-upload-utils"


interface CreateEventPageProps {
  onEventCreated?: () => void
}

export default function CreateEventPage({ onEventCreated }: CreateEventPageProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedMedia, setSelectedMedia] = useState<{ type: string; data: string } | null>(null)
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null) // Separate thumbnail
  const [showCamera, setShowCamera] = useState(true) // Open camera immediately
  const [showUploadSuccess, setShowUploadSuccess] = useState(false)
  const [aiMethod, setAiMethod] = useState<string | null>(null)
  const [aiGeneratedContent, setAiGeneratedContent] = useState<string | null>(null)
  const [aiPromptInput, setAiPromptInput] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false)
  const [isGeneratingBackground, setIsGeneratingBackground] = useState(false)
  const [hasGeneratedThumbnail, setHasGeneratedThumbnail] = useState(false) // Track if thumbnail was generated
  const [hasGeneratedBackground, setHasGeneratedBackground] = useState(false) // Track if background was generated
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null) // Separate background
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    visualStyling: null as any,
  })


  // State preservation for step navigation
  const [stepStates, setStepStates] = useState({
    step1: { completed: false },
    step2: { completed: false, method: null as string | null, input: "" },
    step3: { completed: false }
  })

  const handleStepClick = (step: number) => {
    // Allow navigation to any step that has been reached or is the next logical step
    const maxReachableStep = getMaxReachableStep()
    
    if (step <= maxReachableStep) {
      // Save current step state before navigating
      saveCurrentStepState()
      
      // Navigate to new step
      setCurrentStep(step)
      
      // Restore state for the target step
      restoreStepState(step)
    }
  }

  const saveCurrentStepState = () => {
    const newStepStates = { ...stepStates }
    
    switch (currentStep) {
      case 1:
        newStepStates.step1.completed = !!selectedMedia
        break
      case 2:
        newStepStates.step2.completed = !!aiGeneratedContent
        newStepStates.step2.method = aiMethod
        newStepStates.step2.input = aiPromptInput
        break
      case 3:
        newStepStates.step3.completed = !!(eventData.title && eventData.description && eventData.date && eventData.time && eventData.location)
        break
    }
    
    setStepStates(newStepStates)
  }

  const restoreStepState = (step: number) => {
    switch (step) {
      case 2:
        // Restore AI method and input if returning to step 2
        if (stepStates.step2.method && !aiGeneratedContent) {
          setAiMethod(stepStates.step2.method)
          setAiPromptInput(stepStates.step2.input)
        } else if (aiGeneratedContent) {
          // If AI content exists, don't reset the method
          // This allows users to see their previous choice
        } else {
          // Fresh start on step 2
          setAiMethod(null)
          setAiPromptInput("")
        }
        break
      case 3:
        // Step 3 state is already preserved in eventData
        break
    }
  }

  const getMaxReachableStep = () => {
    // Step 1 is always reachable
    let maxStep = 1
    
    // Step 2 is reachable if media is selected
    if (selectedMedia) {
      maxStep = 2
    }
    
    // Step 3 is reachable if AI content has been generated
    if (aiGeneratedContent) {
      maxStep = 3
    }
    
    return maxStep
  }

  const handleMediaStep = () => {
    setShowCamera(true)
  }

  const handleCameraCapture = (data: string, type: "photo" | "video") => {
    setSelectedMedia({ type: type === "photo" ? "image" : "video", data })
    setShowCamera(false)
    
    // Show success message for 2.5 seconds before moving to AI generation step
    setShowUploadSuccess(true)
    setTimeout(() => {
      setShowUploadSuccess(false)
      setCurrentStep(2)
    }, 2500)
  }

  const handleAIMethodSelect = (method: string) => {
    setAiMethod(method)
  }

  // Function to generate AI thumbnail (separate from media)
  const generateAIThumbnail = async (title: string, description: string, location: string) => {
    // Prevent multiple simultaneous generations
    if (isGeneratingThumbnail || hasGeneratedThumbnail) {
      return false
    }

    setIsGeneratingThumbnail(true)
    try {
      console.log('Generating AI thumbnail for:', title)
      const response = await fetch('/api/generate-event-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          location,
          type: 'thumbnail',
          visualStyling: eventData.visualStyling
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setThumbnailImage(data.imageUrl)
        setHasGeneratedThumbnail(true)
        console.log('Thumbnail generated successfully')
        return true
      } else {
        console.error('Failed to generate AI thumbnail')
        return false
      }
    } catch (error) {
      console.error('Error generating AI thumbnail:', error)
      return false
    } finally {
      setIsGeneratingThumbnail(false)
    }
  }

  // Function to generate AI background (for event preview modal)
  const generateAIBackground = async (title: string, description: string, location: string) => {
    // Prevent multiple simultaneous generations
    if (isGeneratingBackground || hasGeneratedBackground) {
      return false
    }

    setIsGeneratingBackground(true)
    try {
      console.log('Generating AI background for:', title)
      const response = await fetch('/api/generate-event-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          location,
          type: 'background',
          visualStyling: eventData.visualStyling
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setBackgroundImage(data.imageUrl)
        setHasGeneratedBackground(true)
        console.log('Background generated successfully')
        return true
      } else {
        console.error('Failed to generate AI background')
        return false
      }
    } catch (error) {
      console.error('Error generating AI background:', error)
      return false
    } finally {
      setIsGeneratingBackground(false)
    }
  }

  const handleAIGenerate = async (content: string, input: string) => {
    setAiGeneratedContent(content)
    setAiPromptInput(input)
    const parsed = JSON.parse(content)
    
    // Set all extracted data including date, time, location, and visual styling
    setEventData({
      title: parsed.title || "",
      description: parsed.description || "",
      date: parsed.date || "",
      time: parsed.time || "",
      location: parsed.location || "",
      visualStyling: parsed.visualStyling || null,
    })
    
    // Update step state
    setStepStates(prev => ({
      ...prev,
      step2: { ...prev.step2, completed: true, input }
    }))
    
    // Go directly to step 3 (edit) after AI generation
    setCurrentStep(3)

    // Generate AI thumbnail and background in background (only once each)
    if (!hasGeneratedThumbnail && parsed.title) {
      setTimeout(() => {
        generateAIThumbnail(parsed.title, parsed.description, parsed.location)
      }, 500)
    }
    if (!hasGeneratedBackground && parsed.title) {
      setTimeout(() => {
        generateAIBackground(parsed.title, parsed.description, parsed.location)
      }, 1000) // Stagger to avoid hitting rate limits
    }
  }

  const handlePublish = async () => {
    if (!eventData.title || !eventData.description || !eventData.date || !eventData.time || !eventData.location) {
      alert("Please fill in all required fields")
      return
    }

    setIsPublishing(true)

    try {
      // Get user from localStorage
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        alert("Please log in to create events")
        setIsPublishing(false)
        return
      }

      const user = JSON.parse(storedUser)
      
      // Handle media upload - ALWAYS upload data URLs to avoid 413 errors
      let mediaUrl = selectedMedia?.data
      let mediaType = selectedMedia?.type
      
      if (selectedMedia && selectedMedia.data.startsWith('data:')) {
        setIsUploading(true)
        console.log('Processing media for upload...')
        
        try {
          // Convert data URL to blob
          const response = await fetch(selectedMedia.data)
          let blob = await response.blob()
          
          console.log(`Original ${selectedMedia.type} file size: ${formatFileSize(blob.size)}`)
          
          // Convert blob to File for compression
          const originalFile = new File([blob], `media.${selectedMedia.type === 'video' ? 'webm' : 'jpg'}`, {
            type: blob.type,
            lastModified: Date.now()
          })
          
          // Compress if needed
          let finalFile = originalFile
          if (blob.size > 5 * 1024 * 1024) { // 5MB threshold
            console.log('File is large, compressing...')
            try {
              if (selectedMedia.type === 'video') {
                finalFile = await compressVideo(originalFile, 4) // Target 4MB
              } else {
                finalFile = await compressImage(originalFile, 2, 0.7) // Target 2MB, 70% quality
              }
              console.log(`Compressed file size: ${formatFileSize(finalFile.size)}`)
            } catch (compressionError) {
              console.warn('Compression failed, using original:', compressionError)
              // Continue with original file
            }
          }
          
          // Final size check
          if (finalFile.size > 10 * 1024 * 1024) {
            alert(`Media file is still too large (${formatFileSize(finalFile.size)}). Maximum size is 10MB. Please try a shorter video or smaller image.`)
            setIsUploading(false)
            setIsPublishing(false)
            return
          }
          
          console.log(`Uploading ${selectedMedia.type} file (${formatFileSize(finalFile.size)})...`)
          
          // Upload to server
          const formData = new FormData()
          formData.append('file', finalFile)
          formData.append('type', selectedMedia.type)
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })
          
          setIsUploading(false)
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json()
            mediaUrl = uploadResult.url
            console.log('Successfully uploaded media:', mediaUrl)
          } else {
            const errorText = await uploadResponse.text()
            console.error('Upload failed:', uploadResponse.status, errorText)
            
            if (uploadResponse.status === 413) {
              alert("Media file is too large. Please try a smaller file or shorter video.")
            } else if (uploadResponse.status === 404) {
              alert("Upload service is not available. Please try again later.")
            } else {
              alert("Failed to upload media. Please try again.")
            }
            setIsPublishing(false)
            return
          }
        } catch (uploadError) {
          console.error('Error uploading media:', uploadError)
          alert("Failed to upload media. Please check your connection and try again.")
          setIsUploading(false)
          setIsPublishing(false)
          return
        }
      }
      
      // Prepare event data with Vercel Blob storage for large content
      const rawEventPayload = {
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        icon: undefined,
        gradient: eventData.visualStyling?.styling?.gradient || 'bg-gray-50',
        mediaUrl: mediaUrl, // Now using R2 URLs instead of data URLs
        mediaType: mediaType,
        thumbnailUrl: thumbnailImage, // AI-generated thumbnail for event cards
        backgroundUrl: backgroundImage, // AI-generated background for event preview modal
        createdBy: user.id,
        visualStyling: eventData.visualStyling,
      }

      // Use the new utility to handle large data automatically
      const eventPayload = await prepareEventData(rawEventPayload)

      // Log payload size for debugging
      const payloadSize = JSON.stringify(eventPayload).length
      const payloadSizeKB = (payloadSize / 1024).toFixed(2)
      console.log(`Creating event with payload size: ${payloadSizeKB} KB`)

      // Payload should be small now since media is uploaded to R2 separately
      if (payloadSize > 1 * 1024 * 1024) { // 1MB warning
        console.warn(`Payload is large: ${payloadSizeKB} KB`)
      }
      
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventPayload),
      })

      if (response.ok) {
        alert("Event published successfully!")
        // Reset form
        setCurrentStep(1)
        setSelectedMedia(null)
        setThumbnailImage(null)
        setBackgroundImage(null)
        setHasGeneratedThumbnail(false)
        setHasGeneratedBackground(false)
        setAiMethod(null)
        setAiGeneratedContent(null)
        setEventData({ title: "", description: "", date: "", time: "", location: "", visualStyling: null })

        // Notify parent component to refresh events
        if (onEventCreated) {
          onEventCreated()
        }
      } else {
        const errorText = await response.text()
        console.error('Event creation failed:', response.status, errorText)
        
        // Try to parse as JSON for better error message
        try {
          const errorData = JSON.parse(errorText)
          alert(`Failed to create event: ${errorData.error}`)
        } catch {
          if (response.status === 413) {
            alert("Event data is too large. Please reduce the content size.")
          } else if (response.status === 404) {
            alert("Event service is not available. Please try again later.")
          } else {
            alert(`Failed to create event. Server returned: ${response.status}`)
          }
        }
      }
    } catch (error) {
      console.error('Error creating event:', error)
      alert("Failed to create event. Please check your connection and try again.")
    } finally {
      setIsPublishing(false)
      setIsUploading(false)
    }
  }

  return (
    <>
      <div className="px-6 py-6 pb-32">
        {/* Step Navigation */}
        <div className="mb-10">
          {/* Step Indicators */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((step, index) => {
                const maxReachableStep = getMaxReachableStep()
                const isClickable = step <= maxReachableStep
                const isActive = currentStep >= step
                const isCompleted = currentStep > step && (step === 1 ? selectedMedia : step === 2 ? aiGeneratedContent : false)
                
                return (
                  <div key={step} className="flex items-center">
                    <div
                      onClick={() => isClickable && handleStepClick(step)}
                      className={`step-indicator ${isActive ? "active" : ""} w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                        isClickable 
                          ? "cursor-pointer hover:scale-105 hover:shadow-md" 
                          : "cursor-not-allowed opacity-50"
                      } ${currentStep === step ? "ring-2 ring-taupe-300 ring-offset-2" : ""}`}
                      title={isClickable ? `Go to step ${step}` : `Complete previous steps to unlock step ${step}`}
                    >
                      {isCompleted ? "✓" : step}
                    </div>
                    {index < 2 && (
                      <div className={`w-8 h-1 step-indicator ${currentStep > step ? "active" : ""} rounded-full transition-all duration-200`}></div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Step Navigation Breadcrumbs */}
          <div className="flex items-center justify-center space-x-2 text-sm">
            {[
              { 
                step: 1, 
                title: "Add Media", 
                isClickable: getMaxReachableStep() >= 1
              },
              { 
                step: 2, 
                title: "AI Generation", 
                isClickable: getMaxReachableStep() >= 2
              },
              { 
                step: 3, 
                title: "Preview & Edit", 
                isClickable: getMaxReachableStep() >= 3
              }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => item.isClickable && handleStepClick(item.step)}
                    className={`px-3 py-1 rounded-lg transition-all duration-200 ${
                      currentStep === item.step
                        ? "bg-taupe-100 text-taupe-700 font-medium"
                        : item.isClickable
                        ? "text-text-secondary hover:text-text-primary hover:bg-cream-100"
                        : "text-text-light cursor-not-allowed"
                    }`}
                    disabled={!item.isClickable}
                  >
                    {item.title}
                  </button>
                </div>
                {index < 2 && (
                  <svg className="w-4 h-4 mx-2 text-text-light" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>



        {/* Step 1: Media Upload */}
        {currentStep === 1 && (
          <div>
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-normal text-text-primary mb-3">Add Media</h2>
              <p className="text-text-secondary font-normal">Capture or upload media for your event</p>
            </div>

            {!selectedMedia && (
              <button
                onClick={handleMediaStep}
                className="w-full glass-card rounded-3xl p-12 text-center hover:bg-white/60 transition-all duration-200 soft-shadow hover-lift"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-taupe-400 to-taupe-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-md">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
                <h3 className="font-medium mb-2 text-text-primary text-lg">Open Camera</h3>
                <p className="text-sm text-text-secondary font-normal">
                  Capture photos or videos, or upload from gallery
                </p>
              </button>
            )}

            {selectedMedia && (
              <div className="glass-card rounded-3xl p-6 soft-shadow">
                <div className="text-center">
                  {selectedMedia.type === "image" && (
                    <img
                      src={selectedMedia.data || "/placeholder.svg"}
                      className="media-preview rounded-2xl mx-auto mb-4"
                      alt="Preview"
                    />
                  )}
                  {selectedMedia.type === "video" && (
                    <video src={selectedMedia.data} className="media-preview rounded-2xl mx-auto mb-4" controls />
                  )}
                  <p className="text-sm text-text-secondary mb-6 font-normal">Media selected successfully!</p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setSelectedMedia(null)
                        setShowCamera(false)
                      }}
                      className="flex-1 glass-card text-text-secondary py-4 rounded-2xl font-medium hover:bg-white/60 transition-all duration-200"
                    >
                      Change Media
                    </button>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 gradient-primary text-white py-4 rounded-2xl font-medium hover:shadow-lg transition-all duration-200"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: AI Generation */}
        {currentStep === 2 && !aiMethod && <AIGenerationStep onSelect={handleAIMethodSelect} />}

        {currentStep === 2 && aiMethod && (
          <AIPromptInput 
            method={aiMethod} 
            onGenerate={handleAIGenerate} 
            onBack={() => setAiMethod(null)}
            initialInput={aiPromptInput}
          />
        )}

        {currentStep === 3 && (
          <div className="space-y-4">






            {/* Event Preview Card */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl">
              {/* Media Section (User's actual photo/video) */}
              <div className="relative h-64 overflow-hidden">
                {selectedMedia && selectedMedia.type === "image" ? (
                  <img
                    src={selectedMedia.data || "/placeholder.svg"}
                    className="w-full h-full object-cover"
                    alt="Event media"
                  />
                ) : selectedMedia && selectedMedia.type === "video" ? (
                  <video src={selectedMedia.data} className="w-full h-full object-cover" controls />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                    <div className="text-center text-white">
                      <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm font-medium">No media added</p>
                      <p className="text-xs opacity-75 mt-1">Optional: Add photo or video</p>
                    </div>
                  </div>
                )}
                
                {/* Add/Replace Media Button */}
                <div className="absolute top-4 right-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCamera(true)
                    }}
                    className="p-2.5 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-all duration-200 shadow-lg"
                    title={selectedMedia ? "Replace media" : "Add media"}
                  >
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 space-y-5">
                {/* Title Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Event Title</label>
                  <input
                    type="text"
                    placeholder="Enter event title"
                    required
                    className="w-full px-4 py-3 text-lg font-semibold rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 text-gray-900 placeholder-gray-400"
                    value={eventData.title}
                    onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                  />
                </div>

                {/* Date, Time, Location - Compact Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2.5 text-sm rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 text-gray-900"
                      value={eventData.date}
                      onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Time</label>
                    <input
                      type="time"
                      required
                      className="w-full px-3 py-2.5 text-sm rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 text-gray-900"
                      value={eventData.time}
                      onChange={(e) => setEventData({ ...eventData, time: e.target.value })}
                    />
                  </div>
                </div>

                {/* Location Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="Enter event location"
                    required
                    className="w-full px-4 py-3 text-sm rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 text-gray-900 placeholder-gray-400"
                    value={eventData.location}
                    onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    placeholder="Describe your event..."
                    rows={4}
                    required
                    className="w-full px-4 py-3 text-sm rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 resize-none text-gray-900 placeholder-gray-400"
                    value={eventData.description}
                    onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                  />
                </div>

                {/* Publish Button */}
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isPublishing || isUploading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-2xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : isPublishing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Publishing Event...</span>
                    </div>
                  ) : (
                    "Publish Event"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCamera && <UnifiedCamera onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />}
      
      {/* Upload Success Modal */}
      {showUploadSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-gradient-to-b from-cream-50 to-cream-100 rounded-3xl p-8 max-w-sm mx-4 shadow-2xl animate-slide-up">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-light text-text-primary mb-2">Media Uploaded!</h3>
              <p className="text-text-secondary text-sm">Your {selectedMedia?.type} has been uploaded successfully</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
