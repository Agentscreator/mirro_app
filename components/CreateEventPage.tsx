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
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
  })

  const handleStepClick = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step)
      if (step === 2) {
        setAiMethod(null)
      }
    }
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

  const handleAIGenerate = (content: string) => {
    setAiGeneratedContent(content)
    const parsed = JSON.parse(content)
    setEventData({ ...eventData, title: parsed.title, description: parsed.description })
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
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center space-x-2">
            <div
              onClick={() => handleStepClick(1)}
              className={`step-indicator ${currentStep >= 1 ? "active" : ""} w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-medium cursor-pointer hover:scale-105 transition-transform duration-200`}
            >
              {currentStep > 1 ? "✓" : "1"}
            </div>
            <div className={`w-8 h-1 step-indicator ${currentStep >= 2 ? "active" : ""} rounded-full`}></div>
            <div
              onClick={() => handleStepClick(2)}
              className={`step-indicator ${currentStep >= 2 ? "active" : ""} w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-medium ${currentStep >= 2 ? "cursor-pointer hover:scale-105" : "cursor-not-allowed opacity-50"} transition-transform duration-200`}
            >
              {currentStep > 2 ? "✓" : "2"}
            </div>
            <div className={`w-8 h-1 step-indicator ${currentStep >= 3 ? "active" : ""} rounded-full`}></div>
            <div
              onClick={() => handleStepClick(3)}
              className={`step-indicator ${currentStep >= 3 ? "active" : ""} w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-medium ${currentStep >= 3 ? "cursor-pointer hover:scale-105" : "cursor-not-allowed opacity-50"} transition-transform duration-200`}
            >
              3
            </div>
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
          <AIPromptInput method={aiMethod} onGenerate={handleAIGenerate} onBack={() => setAiMethod(null)} />
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
