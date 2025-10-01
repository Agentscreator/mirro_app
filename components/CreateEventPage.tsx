"use client"
import { useState } from "react"
import UnifiedCamera from "./UnifiedCamera"
import AIGenerationStep from "./AIGenerationStep"
import AIPromptInput from "./AIPromptInput"

interface CreateEventPageProps {
  onEventCreated?: () => void
}

export default function CreateEventPage({ onEventCreated }: CreateEventPageProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedMedia, setSelectedMedia] = useState<{ type: string; data: string } | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [aiMethod, setAiMethod] = useState<string | null>(null)
  const [aiGeneratedContent, setAiGeneratedContent] = useState<string | null>(null)
  const [aiPromptInput, setAiPromptInput] = useState<string>("")
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
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
  }

  const handleAIMethodSelect = (method: string) => {
    setAiMethod(method)
  }

  const handleAIGenerate = (content: string, input: string) => {
    setAiGeneratedContent(content)
    setAiPromptInput(input)
    const parsed = JSON.parse(content)
    setEventData({ ...eventData, title: parsed.title, description: parsed.description })
    
    // Update step state
    setStepStates(prev => ({
      ...prev,
      step2: { ...prev.step2, completed: true, input }
    }))
    
    setCurrentStep(3)
  }

  const handlePublish = async () => {
    if (!eventData.title || !eventData.description || !eventData.date || !eventData.time || !eventData.location) {
      alert("Please fill in all required fields")
      return
    }

    try {
      // Get user from localStorage
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        alert("Please log in to create events")
        return
      }

      const user = JSON.parse(storedUser)
      
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          time: eventData.time,
          location: eventData.location,
          icon: 'calendar', // Default icon
          gradient: 'from-taupe-400 to-taupe-500', // Default gradient
          createdBy: user.id,
        }),
      })

      if (response.ok) {
        alert("Event published successfully!")
        // Reset form
        setCurrentStep(1)
        setSelectedMedia(null)
        setAiMethod(null)
        setAiGeneratedContent(null)
        setEventData({ title: "", description: "", date: "", time: "", location: "" })
        
        // Notify parent component to refresh events
        if (onEventCreated) {
          onEventCreated()
        }
      } else {
        const errorData = await response.json()
        alert(`Failed to create event: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error creating event:', error)
      alert("Failed to create event. Please try again.")
    }
  }

  return (
    <>
      <div className="px-6 py-6 pb-24">
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
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="w-full gradient-primary text-white py-4 rounded-2xl font-medium hover:shadow-lg transition-all duration-200"
                  >
                    Continue
                  </button>
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
          <div>
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-normal text-text-primary mb-3">Preview & Edit Details</h2>
              <p className="text-text-secondary font-normal">Review and finalize your event</p>
            </div>

            {/* Media Preview */}
            <div className="glass-card rounded-3xl p-6 mb-6 soft-shadow">
              {selectedMedia && selectedMedia.type === "image" && (
                <img
                  src={selectedMedia.data || "/placeholder.svg"}
                  className="w-full h-48 object-cover rounded-xl mb-4"
                  alt="Event"
                />
              )}
              {selectedMedia && selectedMedia.type === "video" && (
                <video src={selectedMedia.data} className="w-full h-48 object-cover rounded-xl mb-4" controls />
              )}
            </div>

            {/* Editable Event Details */}
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault()
                handlePublish()
              }}
            >
              <div>
                <label className="block text-sm font-medium mb-3 text-text-secondary">Event Title *</label>
                <input
                  type="text"
                  placeholder="Enter event title"
                  required
                  className="w-full px-5 py-4 text-base rounded-2xl border border-cream-300 glass-card focus:ring-2 focus:ring-taupe-400 focus:border-transparent transition-all duration-200 text-text-primary placeholder-text-light"
                  value={eventData.title}
                  onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-text-secondary">Description *</label>
                <textarea
                  placeholder="Describe your event..."
                  rows={6}
                  required
                  className="w-full px-5 py-4 text-base rounded-2xl border border-cream-300 glass-card focus:ring-2 focus:ring-taupe-400 focus:border-transparent transition-all duration-200 resize-none text-text-primary placeholder-text-light"
                  value={eventData.description}
                  onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-3 text-text-secondary">Date *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 text-sm rounded-xl border border-cream-300 glass-card focus:ring-2 focus:ring-taupe-400 focus:border-transparent transition-all duration-200 text-text-primary"
                    value={eventData.date}
                    onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3 text-text-secondary">Time *</label>
                  <input
                    type="time"
                    required
                    className="w-full px-4 py-3 text-sm rounded-xl border border-cream-300 glass-card focus:ring-2 focus:ring-taupe-400 focus:border-transparent transition-all duration-200 text-text-primary"
                    value={eventData.time}
                    onChange={(e) => setEventData({ ...eventData, time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-text-secondary">Location *</label>
                <input
                  type="text"
                  placeholder="Enter event location"
                  required
                  className="w-full px-4 py-3 text-sm rounded-xl border border-cream-300 glass-card focus:ring-2 focus:ring-taupe-400 focus:border-transparent transition-all duration-200 text-text-primary placeholder-text-light"
                  value={eventData.location}
                  onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="w-full gradient-primary text-white py-4 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 mt-8"
              >
                Publish Event
              </button>
            </form>
          </div>
        )}
      </div>

      {showCamera && <UnifiedCamera onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />}
    </>
  )
}
