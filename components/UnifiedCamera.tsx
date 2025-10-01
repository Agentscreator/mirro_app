"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"

interface UnifiedCameraProps {
  onCapture: (data: string, type: "photo" | "video") => void
  onClose: () => void
}

export default function UnifiedCamera({ onCapture, onClose }: UnifiedCameraProps) {
  const [mode, setMode] = useState<"photo" | "video">("video")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const [selectedEffect, setSelectedEffect] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording, isPaused])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: mode === "video",
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      alert("Unable to access camera. Please check permissions.")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
  }

  const handleCapture = () => {
    if (mode === "photo") {
      capturePhoto()
    } else {
      if (isRecording) {
        stopRecording()
      } else {
        startRecording()
      }
    }
  }

  const capturePhoto = async () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        
        try {
          // Convert canvas to blob and upload to R2
          canvas.toBlob(async (blob) => {
            if (blob) {
              const formData = new FormData()
              formData.append('file', blob, 'photo.jpg')
              formData.append('type', 'image')
              
              const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData
              })
              
              if (uploadResponse.ok) {
                const { url } = await uploadResponse.json()
                onCapture(url, "photo")
              } else {
                // Fallback to data URL
                const dataUrl = canvas.toDataURL("image/jpeg")
                onCapture(dataUrl, "photo")
              }
            }
          }, 'image/jpeg', 0.9)
        } catch (error) {
          console.error('Photo upload error:', error)
          // Fallback to data URL
          const dataUrl = canvas.toDataURL("image/jpeg")
          onCapture(dataUrl, "photo")
        }
        
        stopCamera()
      }
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" })
        
        try {
          // Upload video to R2 storage
          const formData = new FormData()
          formData.append('file', blob, 'video.webm')
          formData.append('type', 'video')
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })
          
          if (uploadResponse.ok) {
            const { url } = await uploadResponse.json()
            onCapture(url, "video")
          } else {
            console.error('Upload failed')
            // Fallback to data URL if upload fails
            const reader = new FileReader()
            reader.onload = () => {
              const dataUrl = reader.result as string
              onCapture(dataUrl, "video")
            }
            reader.readAsDataURL(blob)
          }
        } catch (error) {
          console.error('Upload error:', error)
          // Fallback to data URL if upload fails
          const reader = new FileReader()
          reader.onload = () => {
            const dataUrl = reader.result as string
            onCapture(dataUrl, "video")
          }
          reader.readAsDataURL(blob)
        }
        
        stopCamera()
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
    } catch (err) {
      console.error("Error starting recording:", err)
      alert("Unable to start recording. Please check permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
    }
  }

  const togglePause = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
      } else {
        mediaRecorderRef.current.pause()
      }
      setIsPaused(!isPaused)
    }
  }

  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', file.type.startsWith("video/") ? "video" : "image")
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json()
          const type = file.type.startsWith("video/") ? "video" : "photo"
          onCapture(url, type)
        } else {
          // Fallback to data URL
          const reader = new FileReader()
          reader.onload = (e) => {
            const data = e.target?.result as string
            const type = file.type.startsWith("video/") ? "video" : "photo"
            onCapture(data, type)
          }
          reader.readAsDataURL(file)
        }
      } catch (error) {
        console.error('File upload error:', error)
        // Fallback to data URL
        const reader = new FileReader()
        reader.onload = (e) => {
          const data = e.target?.result as string
          const type = file.type.startsWith("video/") ? "video" : "photo"
          onCapture(data, type)
        }
        reader.readAsDataURL(file)
      }
      
      stopCamera()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const effects = [
    { 
      id: "greenscreen", 
      name: "Green Screen", 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      id: "filter", 
      name: "Filters", 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      )
    },
    { 
      id: "timer", 
      name: "Timer", 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-cream-100">
      {/* Camera View */}
      <div className="relative w-full h-full">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

        {/* Green Screen Effect Overlay */}
        {selectedEffect === "greenscreen" && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-green-500 opacity-20"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
              <p className="text-sm font-medium bg-black/50 px-4 py-2 rounded-full">Green Screen Active</p>
            </div>
          </div>
        )}

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/40 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Mode Toggle - Subtle */}
          <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2">
            <button
              onClick={() => setMode("photo")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                mode === "photo" ? "bg-white text-text-primary" : "text-white/70"
              }`}
            >
              Photo
            </button>
            <button
              onClick={() => setMode("video")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                mode === "video" ? "bg-white text-text-primary" : "text-white/70"
              }`}
            >
              Video
            </button>
          </div>

          <div className="w-10"></div>
        </div>

        {/* Recording Timer */}
        {isRecording && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
            <div className="bg-red-500 text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg">
              <div className={`w-3 h-3 rounded-full bg-white ${isPaused ? "" : "animate-pulse"}`}></div>
              <span className="font-medium">{formatTime(recordingTime)}</span>
            </div>
          </div>
        )}

        {/* Side Panel - Effects */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 space-y-3">
          {effects.map((effect) => (
            <button
              key={effect.id}
              onClick={() => setSelectedEffect(selectedEffect === effect.id ? null : effect.id)}
              className={`w-16 h-16 rounded-2xl backdrop-blur-md flex flex-col items-center justify-center transition-all duration-200 ${
                selectedEffect === effect.id
                  ? "bg-white/95 scale-105 text-text-primary shadow-xl border-2 border-sand-300"
                  : "bg-black/20 hover:bg-black/30 text-white/90 hover:text-white border border-white/20"
              }`}
            >
              <div className="mb-1">{effect.icon}</div>
              <span className="text-[9px] font-medium leading-tight text-center">{effect.name}</span>
            </button>
          ))}
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-8 pb-12">
          <div className="flex items-center justify-center space-x-8">
            {/* Upload Button */}
            <button
              onClick={handleUpload}
              className="flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm hover:bg-white transition-all shadow-lg rounded-2xl px-4 py-3 min-w-[80px]"
            >
              <svg className="w-6 h-6 text-text-primary mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs font-medium text-text-primary">Upload</span>
            </button>

            {/* Record/Capture Button - Darker Beige/Red */}
            <button
              onClick={handleCapture}
              className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all hover:scale-105"
              style={{ backgroundColor: "#A67C6D" }}
            >
              {mode === "photo" ? (
                <div className="w-16 h-16 rounded-full bg-white"></div>
              ) : isRecording ? (
                <div className="w-8 h-8 rounded bg-white"></div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-white"></div>
              )}
            </button>

            {/* Pause Button (only visible when recording) */}
            {isRecording && (
              <button
                onClick={togglePause}
                className="w-14 h-14 rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-lg"
              >
                {isPaused ? (
                  <svg className="w-7 h-7 text-text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7 text-text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                )}
              </button>
            )}
            {!isRecording && <div className="w-14"></div>}
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />
    </div>
  )
}
