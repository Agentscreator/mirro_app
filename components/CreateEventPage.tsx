"use client"
import { useState } from "react"
import UnifiedCamera from "./UnifiedCamera"
import AIPromptInput from "./AIPromptInput"
import MediaGalleryManager, { MediaItem } from "./MediaGalleryManager"
import { compressVideo, compressImage, formatFileSize } from "@/lib/media-utils"
import { prepareEventData } from "@/lib/event-upload-utils"


interface CreateEventPageProps {
  onEventCreated?: () => void
}

export default function CreateEventPage({ onEventCreated }: CreateEventPageProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedMedia, setSelectedMedia] = useState<{ type: string; data: string } | null>(null)
  const [mediaGallery, setMediaGallery] = useState<MediaItem[]>([]) // NEW: Multiple media support
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null) // Separate thumbnail
  const [showCamera, setShowCamera] = useState(true) // Open camera immediately
  const [showUploadSuccess, setShowUploadSuccess] = useState(false)
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
    step2: { completed: false, input: "" },
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
        newStepStates.step1.completed = mediaGallery.length > 0
        break
      case 2:
        newStepStates.step2.completed = !!aiGeneratedContent
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
        // Restore AI input if returning to step 2
        if (!aiGeneratedContent && stepStates.step2.input) {
          setAiPromptInput(stepStates.step2.input)
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
    if (mediaGallery.length > 0) {
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
    const mediaType = type === "photo" ? "image" : "video"
    
    // Add to gallery
    const newMediaItem: MediaItem = {
      id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: mediaType,
      data: data,
      uploadedAt: new Date().toISOString()
    }
    
    setMediaGallery(prev => [...prev, newMediaItem])
    setSelectedMedia({ type: mediaType, data }) // Keep for backward compatibility
    setShowCamera(false)
    
    // Show success message briefly
    setShowUploadSuccess(true)
    setTimeout(() => {
      setShowUploadSuccess(false)
    }, 2000)
  }
  
  const handleAddMoreMedia = () => {
    setShowCamera(true)
  }
  
  const handleRemoveMedia = (id: string) => {
    setMediaGallery(prev => prev.filter(item => item.id !== id))
    // Update selectedMedia to the first remaining item or null
    const remaining = mediaGallery.filter(item => item.id !== id)
    if (remaining.length > 0) {
      setSelectedMedia({ type: remaining[0].type, data: remaining[0].data })
    } else {
      setSelectedMedia(null)
    }
  }
  
  const handleReorderMedia = (reorderedMedia: MediaItem[]) => {
    setMediaGallery(reorderedMedia)
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
      
      // Handle media gallery upload - Upload all media items
      setIsUploading(true)
      const uploadedGallery: any[] = []
      
      for (const mediaItem of mediaGallery) {
        try {
          // Skip if already uploaded (has URL)
          if (mediaItem.data.startsWith('http')) {
            uploadedGallery.push({
              url: mediaItem.data,
              type: mediaItem.type,
              uploadedAt: mediaItem.uploadedAt,
              uploadedBy: user.id
            })
            continue
          }
          
          // Upload data URL
          console.log(`Processing ${mediaItem.type} for upload...`)
          
          // Convert data URL to blob
          const response = await fetch(mediaItem.data)
          let blob = await response.blob()
          
          console.log(`Original ${mediaItem.type} file size: ${formatFileSize(blob.size)}`)
          
          // Convert blob to File for compression
          const originalFile = new File([blob], `media.${mediaItem.type === 'video' ? 'webm' : 'jpg'}`, {
            type: blob.type,
            lastModified: Date.now()
          })
          
          // Compress if needed
          let finalFile = originalFile
          if (blob.size > 5 * 1024 * 1024) { // 5MB threshold
            console.log('File is large, compressing...')
            try {
              if (mediaItem.type === 'video') {
                finalFile = await compressVideo(originalFile, 4) // Target 4MB
              } else {
                finalFile = await compressImage(originalFile, 2, 0.7) // Target 2MB, 70% quality
              }
              console.log(`Compressed file size: ${formatFileSize(finalFile.size)}`)
            } catch (compressionError) {
              console.warn('Compression failed, using original:', compressionError)
            }
          }
          
          // Final size check
          if (finalFile.size > 10 * 1024 * 1024) {
            alert(`Media file is too large (${formatFileSize(finalFile.size)}). Maximum size is 10MB.`)
            setIsUploading(false)
            setIsPublishing(false)
            return
          }
          
          console.log(`Uploading ${mediaItem.type} file (${formatFileSize(finalFile.size)})...`)
          
          // Upload to server
          const formData = new FormData()
          formData.append('file', finalFile)
          formData.append('type', mediaItem.type)
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json()
            uploadedGallery.push({
              url: uploadResult.url,
              type: mediaItem.type,
              uploadedAt: mediaItem.uploadedAt,
              uploadedBy: user.id
            })
            console.log('Successfully uploaded media:', uploadResult.url)
          } else {
            const errorText = await uploadResponse.text()
            console.error('Upload failed:', uploadResponse.status, errorText)
            
            if (uploadResponse.status === 413) {
              alert("Media file is too large. Please try a smaller file.")
            } else {
              alert("Failed to upload media. Please try again.")
            }
            setIsUploading(false)
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
      
      setIsUploading(false)
      
      // Keep backward compatibility - use first media item as primary
      const mediaUrl = uploadedGallery.length > 0 ? uploadedGallery[0].url : null
      const mediaType = uploadedGallery.length > 0 ? uploadedGallery[0].type : null
      
      // Prepare event data with Vercel Blob storage for large content
      const rawEventPayload = {
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        icon: undefined,
        gradient: eventData.visualStyling?.styling?.gradient || 'bg-gray-50',
        mediaUrl: mediaUrl, // Now using R2 URLs instead of data URLs (backward compatibility)
        mediaType: mediaType,
        mediaGallery: uploadedGallery.length > 0 ? JSON.stringify(uploadedGallery) : null, // NEW: Multi-media support
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
        // Reset ALL form state completely
        setCurrentStep(1)
        setSelectedMedia(null)
        setMediaGallery([])
        setThumbnailImage(null)
        setBackgroundImage(null)
        setHasGeneratedThumbnail(false)
        setHasGeneratedBackground(false)
        setAiGeneratedContent(null)
        setAiPromptInput("")
        setShowCamera(true)
        setShowUploadSuccess(false)
        setEventData({ title: "", description: "", date: "", time: "", location: "", visualStyling: null })
        
        // Reset step states
        setStepStates({
          step1: { completed: false },
          step2: { completed: false, input: "" },
          step3: { completed: false }
        })

        // Notify parent component to refresh events
        if (onEventCreated) {
          onEventCreated()
        }
      } else{
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
                const isCompleted = currentStep > step && (step === 1 ? mediaGallery.length > 0 : step === 2 ? aiGeneratedContent : false)
                
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
                title: "Describe Event", 
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
              <p className="text-text-secondary font-normal">Capture or upload photos and videos for your event</p>
            </div>

            {mediaGallery.length === 0 ? (
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
            ) : (
              <div className="glass-card rounded-3xl p-6 soft-shadow space-y-4">
                {/* Media Gallery Manager */}
                <MediaGalleryManager
                  media={mediaGallery}
                  onAddMedia={handleAddMoreMedia}
                  onRemoveMedia={handleRemoveMedia}
                  onReorder={handleReorderMedia}
                  maxItems={10}
                />
                
                {/* Continue Button */}
                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full gradient-primary text-white py-4 rounded-2xl font-medium hover:shadow-lg transition-all duration-200"
                >
                  Continue to AI Generation
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: AI Generation */}
        {currentStep === 2 && (
          <AIPromptInput 
            method="ai-generate" 
            onGenerate={handleAIGenerate} 
            onBack={() => setCurrentStep(1)}
            initialInput={aiPromptInput}
          />
        )}

        {currentStep === 3 && (
          <div className="relative rounded-3xl max-w-sm w-full h-[85vh] overflow-hidden shadow-2xl mx-auto">
            {/* Background - Show AI-generated background or gradient */}
            {backgroundImage ? (
              <div className="absolute inset-0 z-0">
                <img
                  src={backgroundImage}
                  alt="Event background"
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>
              </div>
            ) : isGeneratingBackground ? (
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-taupe-400 via-taupe-500 to-taupe-600">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-white/80 text-sm">Generating background...</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`absolute inset-0 z-0 ${eventData.visualStyling?.styling?.gradient || 'bg-gradient-to-br from-taupe-400 via-taupe-500 to-taupe-600'}`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
            )}

            {/* Back Button */}
            <button
              onClick={() => setCurrentStep(2)}
              className="absolute top-5 left-5 z-50 w-11 h-11 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all duration-200 shadow-xl active:scale-95 ring-1 ring-white/20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Regenerate Background Button */}
            {backgroundImage && !isGeneratingBackground && (
              <button
                onClick={async () => {
                  setHasGeneratedBackground(false)
                  await generateAIBackground(eventData.title, eventData.description, eventData.location)
                }}
                className="absolute top-5 right-5 z-50 px-3 py-2 bg-black/40 backdrop-blur-xl rounded-full flex items-center gap-2 text-white text-xs hover:bg-black/60 transition-all duration-200 shadow-xl active:scale-95 ring-1 ring-white/20"
                title="Regenerate background"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>New BG</span>
              </button>
            )}

            {/* Content Section - Full height, scrollable */}
            <div className="relative h-full overflow-y-auto z-10">
              <div className="relative pt-20 px-6 pb-6 flex flex-col min-h-full">
                {/* Event Title */}
                <input
                  type="text"
                  placeholder="Event Title"
                  required
                  className="text-4xl font-bold text-white tracking-tight mb-4 bg-transparent border-none outline-none placeholder-white/50 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                  value={eventData.title}
                  onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                />

                {/* Date, Location, Time */}
                <div className="flex items-start gap-3 mb-5">
                  {/* Date Box */}
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3.5 text-center shadow-lg relative ring-1 ring-white/30 flex-shrink-0">
                    <input
                      type="date"
                      required
                      className="bg-transparent border-none text-white text-center text-sm font-semibold outline-none w-20"
                      value={eventData.date}
                      onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                    />
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start gap-1.5">
                      <svg className="w-4 h-4 text-white/90 mt-0.5 flex-shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Location"
                        required
                        className="flex-1 bg-transparent border-none text-sm text-white font-semibold outline-none placeholder-white/60 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
                        value={eventData.location}
                        onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-white/90 flex-shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <input
                        type="time"
                        required
                        className="bg-transparent border-none text-sm text-white/95 font-medium outline-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
                        value={eventData.time}
                        onChange={(e) => setEventData({ ...eventData, time: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-5 bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-lg">
                  <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">About</h3>
                  <textarea
                    placeholder="Describe your event..."
                    rows={4}
                    required
                    className="w-full bg-transparent border-none text-sm text-white/95 leading-relaxed outline-none resize-none placeholder-white/50 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                    value={eventData.description}
                    onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                  />
                </div>

                {/* Media Gallery Preview */}
                {mediaGallery.length > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        Event Photos & Videos ({mediaGallery.length})
                      </h3>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="text-xs text-white/80 hover:text-white font-medium underline"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
                      {mediaGallery.map((item, index) => (
                        <div
                          key={index}
                          className="relative flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden shadow-md snap-start"
                        >
                          {item.type === 'image' ? (
                            <img src={item.data} alt="Gallery" className="w-full h-full object-cover" />
                          ) : (
                            <video src={item.data} className="w-full h-full object-cover" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Publish Button */}
                <div className="mt-auto sticky bottom-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent backdrop-blur-md pt-5 -mx-6 px-6 pb-3">
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isPublishing || isUploading}
                    className="w-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-gray-900 py-3.5 rounded-xl font-semibold text-base hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isUploading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : isPublishing ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        <span>Publishing...</span>
                      </div>
                    ) : (
                      "Publish Event"
                    )}
                  </button>
                </div>
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
