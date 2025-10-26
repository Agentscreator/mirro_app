"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  detectDevice,
  getOptimalVideoMimeType,
  getOptimalChunkSize,
  requestCameraPermission,
  setupVideoElement,
  supportsVideoRecording
} from "@/lib/mobile-utils"

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
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [additionalFilter, setAdditionalFilter] = useState<string>('')
  const [timerDelay, setTimerDelay] = useState<number>(0)
  const [countdown, setCountdown] = useState<number>(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null)

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
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current)
        countdownTimerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1
          // Auto-stop recording if timer is set and duration reached
          if (timerDelay > 0 && newTime >= timerDelay) {
            stopRecording()
          }
          return newTime
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRecording, isPaused, timerDelay])





  const flipCamera = async () => {
    setIsFlipping(true)
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user'
    
    // Start new camera before stopping old one to prevent white flash
    const result = await requestCameraPermission(mode === "video", newFacingMode);

    if (result.success && result.stream) {
      // Stop old camera only after new one is ready
      stopCamera()
      
      streamRef.current = result.stream;
      setFacingMode(newFacingMode)
      
      if (videoRef.current) {
        videoRef.current.srcObject = result.stream;
        setupVideoElement(videoRef.current);
        
        // Wait for video to be ready before removing flip overlay
        videoRef.current.onloadedmetadata = () => {
          setTimeout(() => {
            setIsFlipping(false)
          }, 100)
        }
      }
    } else {
      alert(result.error || "Unable to access camera.");
      setIsFlipping(false)
    }
  }

  const startCamera = async () => {
    // Check if video recording is supported
    if (!supportsVideoRecording()) {
      alert("Video recording is not supported on this device or browser.");
      return;
    }

    const result = await requestCameraPermission(mode === "video", facingMode);

    if (result.success && result.stream) {
      streamRef.current = result.stream;
      if (videoRef.current) {
        videoRef.current.srcObject = result.stream;
        setupVideoElement(videoRef.current);
      }
    } else {
      alert(result.error || "Unable to access camera.");
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
        // Apply beauty filter + additional filter
        const baseFilter = 'brightness(1.05) contrast(1.05) saturate(1.1) blur(0.3px)'
        ctx.filter = additionalFilter ? `${baseFilter} ${additionalFilter}` : baseFilter

        // Flip the captured image only for front-facing camera to correct the mirrored preview
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0)
          ctx.scale(-1, 1)
        }

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
      // Use existing camera stream if available, otherwise start new one
      let stream = streamRef.current
      if (!stream) {
        const result = await requestCameraPermission(true, facingMode);
        if (!result.success || !result.stream) {
          alert(result.error || "Unable to access camera for recording.");
          return;
        }
        stream = result.stream;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setupVideoElement(videoRef.current);
        }
      }

      // Get optimal MIME type for this device
      const mimeType = getOptimalVideoMimeType();
      const device = detectDevice();

      console.log('Device type:', device);
      console.log('Using MIME type:', mimeType);
      console.log('Recording with camera facing:', facingMode);

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })

        // Check file size (limit to 1000MB for better upload reliability)
        const maxSize = 1000 * 1024 * 1024 // 1000MB
        if (blob.size > maxSize) {
          alert('Video file is too large. Please record a shorter video.')
          return
        }

        try {
          console.log('Video blob size:', blob.size, 'bytes')
          console.log('Video blob type:', blob.type)

          // Upload video to R2 storage with retry logic
          const formData = new FormData()
          // Always use webm extension since that's what we're recording
          formData.append('file', blob, 'video.webm')
          formData.append('type', 'video')

          console.log('Uploading video to R2...')

          // Retry upload up to 3 times
          let uploadSuccess = false
          let lastError = null

          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData
              })

              console.log(`Upload attempt ${attempt} response status:`, uploadResponse.status)

              if (uploadResponse.ok) {
                const result = await uploadResponse.json()
                console.log('Upload successful:', result)
                onCapture(result.url, "video")
                uploadSuccess = true
                break
              } else {
                const errorText = await uploadResponse.text()
                lastError = `Status ${uploadResponse.status}: ${errorText}`
                console.error(`Upload attempt ${attempt} failed:`, lastError)

                if (uploadResponse.status === 413) {
                  // Don't retry on 413 errors
                  break
                }

                // Wait before retry (except on last attempt)
                if (attempt < 3) {
                  await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
                }
              }
            } catch (error) {
              lastError = error instanceof Error ? error.message : 'Unknown error'
              console.error(`Upload attempt ${attempt} error:`, lastError)

              // Wait before retry (except on last attempt)
              if (attempt < 3) {
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
              }
            }
          }

          if (!uploadSuccess) {
            console.error('All upload attempts failed, using fallback data URL')
            alert(`Upload failed after 3 attempts. Using local video data. Error: ${lastError}`)

            // Fallback to data URL if all uploads fail
            const reader = new FileReader()
            reader.onload = () => {
              const dataUrl = reader.result as string
              console.log('Using fallback data URL for video')
              onCapture(dataUrl, "video")
            }
            reader.readAsDataURL(blob)
          }
        } catch (error) {
          console.error('Upload error:', error)
          alert(`Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`)

          // Fallback to data URL if upload fails
          const reader = new FileReader()
          reader.onload = () => {
            const dataUrl = reader.result as string
            console.log('Using fallback data URL for video due to error')
            onCapture(dataUrl, "video")
          }
          reader.readAsDataURL(blob)
        }

        stopCamera()
      }

      // Use optimal chunk size for this device
      const chunkSize = getOptimalChunkSize();
      mediaRecorder.start(chunkSize)
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
      setRecordingTime(0)
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
      // Check file size before upload
      const maxSize = 1000 * 1024 * 1024 // 1000MB
      if (file.size > maxSize) {
        alert('File is too large. Please select a file smaller than 1000MB.')
        return
      }

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', file.type.startsWith("video/") ? "video" : "image")

        console.log('Uploading file:', file.name, 'Size:', file.size, 'bytes')

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json()
          const type = file.type.startsWith("video/") ? "video" : "photo"
          console.log('File upload successful:', url)
          onCapture(url, type)
        } else {
          const errorText = await uploadResponse.text()
          console.error('File upload failed:', uploadResponse.status, errorText)

          if (uploadResponse.status === 413) {
            alert('File is too large for upload. Please select a smaller file.')
          } else {
            alert(`Upload failed: ${errorText}`)
          }

          // Fallback to data URL
          const reader = new FileReader()
          reader.onload = (e) => {
            const data = e.target?.result as string
            const type = file.type.startsWith("video/") ? "video" : "photo"
            console.log('Using fallback data URL for uploaded file')
            onCapture(data, type)
          }
          reader.readAsDataURL(file)
        }
      } catch (error) {
        console.error('File upload error:', error)
        alert(`Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`)

        // Fallback to data URL
        const reader = new FileReader()
        reader.onload = (e) => {
          const data = e.target?.result as string
          const type = file.type.startsWith("video/") ? "video" : "photo"
          console.log('Using fallback data URL for uploaded file due to error')
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

  const filters = [
    { id: 'none', name: 'None', filter: '' },
    { id: 'warm', name: 'Warm', filter: 'sepia(0.3) hue-rotate(-10deg)' },
    { id: 'cool', name: 'Cool', filter: 'hue-rotate(10deg) saturate(1.2)' },
    { id: 'vintage', name: 'Vintage', filter: 'sepia(0.5) contrast(0.9)' },
    { id: 'bw', name: 'B&W', filter: 'grayscale(1)' },
  ]

  const timerOptions = [
    { id: 'off', name: 'Off', seconds: 0 },
    { id: '15s', name: '15s', seconds: 15 },
    { id: '30s', name: '30s', seconds: 30 },
    { id: '60s', name: '60s', seconds: 60 },
  ]

  const effects = [
    {
      id: "flip",
      name: "Flip Camera",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    },
    {
      id: "filter",
      name: "Filters",
      icon: (
        <img src="/logo_1.png" alt="Filter" className="w-6 h-6" />
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
    <div className="fixed inset-0 z-50 bg-black camera-view">
      {/* Camera View */}
      <div className="relative w-full h-full video-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          webkit-playsinline="true"
          className="w-full h-full object-cover transition-opacity duration-200"
          style={{
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)',
            filter: additionalFilter
              ? `brightness(1.08) contrast(1.08) saturate(1.15) ${additionalFilter}`
              : 'brightness(1.08) contrast(1.08) saturate(1.15)',
            opacity: isFlipping ? 0 : 1
          }}
        />
        
        {/* Flip transition overlay */}
        {isFlipping && (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}



        {/* Top Bar - Professional Design */}
        <div className="absolute top-0 left-0 right-0 pt-14 px-5 pb-4 flex items-center justify-between z-10">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-all shadow-lg active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Mode Toggle - Sleek Design */}
          <div className="flex items-center bg-black/40 backdrop-blur-md rounded-full p-1 shadow-lg">
            <button
              onClick={() => setMode("photo")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                mode === "photo" 
                  ? "bg-white text-gray-900 shadow-md" 
                  : "text-white/80 hover:text-white"
              }`}
            >
              PHOTO
            </button>
            <button
              onClick={() => setMode("video")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                mode === "video" 
                  ? "bg-white text-gray-900 shadow-md" 
                  : "text-white/80 hover:text-white"
              }`}
            >
              VIDEO
            </button>
          </div>

          {/* Flash/Settings placeholder for balance */}
          <div className="w-11"></div>
        </div>

        {/* Recording Timer - Professional */}
        {isRecording && (
          <div className="absolute top-28 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-red-600 text-white px-5 py-2.5 rounded-full flex items-center space-x-2.5 shadow-xl backdrop-blur-sm">
              <div className={`w-2.5 h-2.5 rounded-full bg-white ${isPaused ? "" : "animate-pulse"}`}></div>
              <span className="font-mono font-semibold text-base tracking-wider">{formatTime(recordingTime)}</span>
            </div>
          </div>
        )}

        {/* Side Panel - Professional Controls */}
        <div className="absolute right-5 top-1/2 transform -translate-y-1/2 space-y-4 z-10">
          {effects.map((effect) => (
            <button
              key={effect.id}
              onClick={() => {
                if (effect.id === "flip") {
                  flipCamera()
                } else {
                  setSelectedEffect(selectedEffect === effect.id ? null : effect.id)
                }
              }}
              disabled={isFlipping && effect.id === "flip"}
              className={`w-14 h-14 rounded-2xl backdrop-blur-md flex flex-col items-center justify-center transition-all duration-200 active:scale-95 ${
                (effect.id === "flip" && facingMode === "environment") || (selectedEffect === effect.id && effect.id !== "flip")
                  ? "bg-white/95 text-gray-900 shadow-xl"
                  : "bg-black/40 hover:bg-black/50 text-white shadow-lg"
              } ${isFlipping && effect.id === "flip" ? "opacity-50" : ""}`}
            >
              <div className="scale-90">{effect.icon}</div>
            </button>
          ))}
        </div>

        {/* Filter Selection Panel - Professional */}
        {selectedEffect === "filter" && (
          <div className="absolute bottom-36 left-0 right-0 px-5 z-10">
            <div className="bg-black/50 backdrop-blur-xl rounded-3xl p-4 shadow-2xl">
              <div className="flex space-x-3 overflow-x-auto pb-1 scrollbar-hide">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setAdditionalFilter(filter.filter)}
                    className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all active:scale-95 ${
                      additionalFilter === filter.filter
                        ? "bg-white text-gray-900 shadow-lg"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    {filter.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Timer Selection Panel - Professional */}
        {selectedEffect === "timer" && (
          <div className="absolute bottom-36 left-0 right-0 px-5 z-10">
            <div className="bg-black/50 backdrop-blur-xl rounded-3xl p-4 shadow-2xl">
              <div className="flex space-x-3 overflow-x-auto pb-1 scrollbar-hide">
                {timerOptions.map((timer) => (
                  <button
                    key={timer.id}
                    onClick={() => setTimerDelay(timer.seconds)}
                    className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all active:scale-95 ${
                      timerDelay === timer.seconds
                        ? "bg-white text-gray-900 shadow-lg"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    {timer.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Countdown Display */}
        {countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="text-white text-9xl font-bold animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        {/* Bottom Controls - Professional Design */}
        <div className="absolute bottom-0 left-0 right-0 pb-10 pt-6 px-6 z-10">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {/* Gallery/Upload Button */}
            <button
              onClick={handleUpload}
              className="w-14 h-14 rounded-2xl bg-black/40 backdrop-blur-md hover:bg-black/50 transition-all shadow-lg flex items-center justify-center active:scale-95"
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>

            {/* Capture Button - Premium Design */}
            <button
              onClick={handleCapture}
              className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-2xl"
              style={{ 
                background: isRecording 
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                  : 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
                border: '4px solid rgba(0, 0, 0, 0.3)'
              }}
            >
              {mode === "photo" ? (
                <div className="w-16 h-16 rounded-full bg-white shadow-inner"></div>
              ) : isRecording ? (
                <div className="w-7 h-7 rounded-md bg-white shadow-inner"></div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-red-600 shadow-inner"></div>
              )}
            </button>

            {/* Pause/Placeholder Button */}
            {isRecording ? (
              <button
                onClick={togglePause}
                className="w-14 h-14 rounded-2xl bg-black/40 backdrop-blur-md hover:bg-black/50 transition-all shadow-lg flex items-center justify-center active:scale-95"
              >
                {isPaused ? (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                )}
              </button>
            ) : (
              <div className="w-14"></div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />
    </div>
  )
}
