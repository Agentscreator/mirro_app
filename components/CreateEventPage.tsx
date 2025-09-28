"use client"

import type React from "react"

import { useState } from "react"

export default function CreateEventPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedMedia, setSelectedMedia] = useState<{ type: string; data: string } | null>(null)
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedMedia({ type: "image", data: e.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVideoRecord = () => {
    setSelectedMedia({ type: "video", data: "simulated-video.mp4" })
  }

  const handleFormSubmit = () => {
    if (!eventData.title || !eventData.description || !eventData.date || !eventData.time || !eventData.location) {
      alert("Please fill in all fields")
      return
    }
    setCurrentStep(3)
  }

  const handlePublish = () => {
    alert("Event published successfully!")
    setCurrentStep(1)
    setSelectedMedia(null)
    setEventData({ title: "", description: "", date: "", time: "", location: "" })
  }

  return (
    <div className="px-6 py-6 pb-24">
      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-10">
        <div className="flex items-center space-x-3">
          <div
            className={`step-indicator ${currentStep >= 1 ? "active" : ""} w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-medium`}
          >
            {currentStep > 1 ? "✓" : "1"}
          </div>
          <div className={`w-12 h-1 step-indicator ${currentStep >= 2 ? "active" : ""} rounded-full`}></div>
          <div
            className={`step-indicator ${currentStep >= 2 ? "active" : ""} w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-medium`}
          >
            {currentStep > 2 ? "✓" : "2"}
          </div>
          <div className={`w-12 h-1 step-indicator ${currentStep >= 3 ? "active" : ""} rounded-full`}></div>
          <div
            className={`step-indicator ${currentStep >= 3 ? "active" : ""} w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-medium`}
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
            <p className="text-text-secondary font-normal">Upload a photo or record a video for your event</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleVideoRecord}
              className="w-full glass-card rounded-3xl p-8 text-center hover:bg-white/60 transition-all duration-200 soft-shadow hover-lift"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-sand-400 to-sand-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-md">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path>
                </svg>
              </div>
              <h3 className="font-medium mb-2 text-text-primary">Record Video</h3>
              <p className="text-sm text-text-secondary font-normal">Create a video to showcase your event</p>
            </button>

            <label className="w-full glass-card rounded-3xl p-8 text-center hover:bg-white/60 transition-all duration-200 cursor-pointer block soft-shadow hover-lift">
              <div className="w-16 h-16 bg-gradient-to-br from-taupe-400 to-taupe-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-md">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <h3 className="font-medium mb-2 text-text-primary">Upload Photo</h3>
              <p className="text-sm text-text-secondary font-normal">Choose an image from your device</p>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>

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
        </div>
      )}

      {/* Step 2: Event Details */}
      {currentStep === 2 && (
        <div>
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-normal text-text-primary mb-3">Event Details</h2>
            <p className="text-text-secondary font-normal">Add information about your event</p>
          </div>

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault()
              handleFormSubmit()
            }}
          >
            <div>
              <label className="block text-sm font-medium mb-3 text-text-secondary">Event Title</label>
              <input
                type="text"
                placeholder="Enter event title"
                className="w-full px-5 py-4 text-base rounded-2xl border border-cream-300 glass-card focus:ring-2 focus:ring-taupe-400 focus:border-transparent transition-all duration-200 text-text-primary placeholder-text-light"
                value={eventData.title}
                onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 text-text-secondary">Description</label>
              <textarea
                placeholder="Describe your event..."
                rows={4}
                className="w-full px-5 py-4 text-base rounded-2xl border border-cream-300 glass-card focus:ring-2 focus:ring-taupe-400 focus:border-transparent transition-all duration-200 resize-none text-text-primary placeholder-text-light"
                value={eventData.description}
                onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-3 text-text-secondary">Date</label>
                <input
                  type="date"
                  className="w-full px-5 py-4 text-base rounded-2xl border border-cream-300 glass-card focus:ring-2 focus:ring-taupe-400 focus:border-transparent transition-all duration-200 text-text-primary"
                  value={eventData.date}
                  onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-3 text-text-secondary">Time</label>
                <input
                  type="time"
                  className="w-full px-5 py-4 text-base rounded-2xl border border-cream-300 glass-card focus:ring-2 focus:ring-taupe-400 focus:border-transparent transition-all duration-200 text-text-primary"
                  value={eventData.time}
                  onChange={(e) => setEventData({ ...eventData, time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 text-text-secondary">Location</label>
              <input
                type="text"
                placeholder="Event location"
                className="w-full px-5 py-4 text-base rounded-2xl border border-cream-300 glass-card focus:ring-2 focus:ring-taupe-400 focus:border-transparent transition-all duration-200 text-text-primary placeholder-text-light"
                value={eventData.location}
                onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="w-full gradient-primary text-white py-4 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 mt-8"
            >
              Preview Event
            </button>
          </form>
        </div>
      )}

      {/* Step 3: Preview & Share */}
      {currentStep === 3 && (
        <div>
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-normal text-text-primary mb-3">Preview & Share</h2>
            <p className="text-text-secondary font-normal">Review your event and share it with others</p>
          </div>

          <div className="glass-card rounded-3xl p-6 mb-8 soft-shadow">
            {selectedMedia && selectedMedia.type === "image" && (
              <img
                src={selectedMedia.data || "/placeholder.svg"}
                className="w-full h-48 object-cover rounded-xl mb-4"
                alt="Event"
              />
            )}
            <h3 className="text-xl font-medium mb-2 text-text-primary">{eventData.title}</h3>
            <p className="text-text-secondary mb-4 font-normal leading-relaxed">{eventData.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-text-muted">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span>
                  {new Date(eventData.date).toLocaleDateString()} at {eventData.time}
                </span>
              </div>
              <div className="flex items-center text-text-muted">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span>{eventData.location}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handlePublish}
              className="w-full gradient-primary text-white py-4 rounded-2xl font-medium hover:shadow-lg transition-all duration-200"
            >
              Publish Event
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center px-4 py-3 gradient-secondary text-white rounded-2xl font-medium hover:shadow-lg transition-all duration-200">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
                Share
              </button>
              <button className="flex items-center justify-center px-4 py-3 glass-card rounded-2xl font-medium hover:bg-white/60 transition-all duration-200 text-text-secondary">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"></path>
                </svg>
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
