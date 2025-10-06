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
  const [greenScreenActive, setGreenScreenActive] = useState(false)
  const [greenScreenThreshold, setGreenScreenThreshold] = useState(0.4)
  const [backgroundImageLoaded, setBackgroundImageLoaded] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const greenScreenCanvasRef = useRef<HTMLCanvasElement>(null)
  const backgroundImageRef = useRef<HTMLImageElement>(null)
  const backgroundImageInputRef = useRef<HTMLInputElement>(null)
  const greenScreenAnimationRef = useRef<number>()

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

  // Green screen processing effect
  useEffect(() => {
    if (greenScreenActive && backgroundImageLoaded && selectedEffect === "greenscreen") {
      processGreenScreen()
    } else {
      if (greenScreenAnimationRef.current) {
        cancelAnimationFrame(greenScreenAnimationRef.current)
      }
    }
    return () => {
      if (greenScreenAnimationRef.current) {
        cancelAnimationFrame(greenScreenAnimationRef.current)
      }
    }
  }, [greenScreenActive, backgroundImageLoaded, selectedEffect, greenScreenThreshold])

  const processGreenScreen = () => {
    const video = videoRef.current
    const canvas = greenScreenCanvasRef.current
    const backgroundImage = backgroundImageRef.current
    
    if (!video || !canvas || !backgroundImage) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match video
    canvas.width = video.videoWidth || video.clientWidth
    canvas.height = video.videoHeight || video.clientHeight

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Create background canvas
    const bgCanvas = document.createElement('canvas')
    bgCanvas.width = canvas.width
    bgCanvas.height = canvas.height
    const bgCtx = bgCanvas.getContext('2d')
    if (!bgCtx) return

    bgCtx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height)
    const bgImageData = bgCtx.getImageData(0, 0, canvas.width, canvas.height)
    const bgData = bgImageData.data

    // Process pixels for chroma keying
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      
      // Calculate green screen detection
      const greenness = (g - Math.max(r, b)) / 255
      
      // If pixel is green enough, replace with background
      if (greenness > greenScreenThreshold) {
        data[i] = bgData[i]         // R
        data[i + 1] = bgData[i + 1] // G
        data[i + 2] = bgData[i + 2] // B
        data[i + 3] = bgData[i + 3] // A
      }
    }

    // Put processed image data back
    ctx.putImageData(imageData, 0, 0)

    // Continue processing
    greenScreenAnimationRef.current = requestAnimationFrame(processGreenScreen)
  }

  const handleBackgroundImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && backgroundImageRef.current) {
      const url = URL.createObjectURL(file)
      backgroundImageRef.current.src = url
      backgroundImageRef.current.onload = () => {
        setBackgroundImageLoaded(true)
        if (greenScreenActive) {
          processGreenScreen()
        }
      }
    }
  }

  const startCamera = async () => {
    // Check if video recording is supported
    if (!supportsVideoRecording()) {
      alert("Video recording is not supported on this device or browser.");
      return;
    }

    const result = await requestCameraPermission(mode === "video");
    
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
    const sourceCanvas = greenScreenActive && backgroundImageLoaded && selectedEffect === "greenscreen" 
      ? greenScreenCanvasRef.current 
      : null
    
    if (videoRef.current || sourceCanvas) {
      const canvas = document.createElement("canvas")
      
      if (sourceCanvas) {
        // Use processed green screen canvas
        canvas.width = sourceCanvas.width
        canvas.height = sourceCanvas.height
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(sourceCanvas, 0, 0)
        }
      } else if (videoRef.current) {
        // Use regular video
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0)
        }
      }
      
      const ctx = canvas.getContext("2d")
      if (ctx) {
        
        try {
          // Convert canvas to blob and upload to Vercel Blob
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
      // Determine which stream to use
      let recordingStream: MediaStream
      
      if (greenScreenActive && backgroundImageLoaded && selectedEffect === "greenscreen" && greenScreenCanvasRef.current) {
        // Use green screen processed canvas stream
        recordingStream = greenScreenCanvasRef.current.captureStream(30)
      } else {
        // Use existing camera stream if available, otherwise start new one
        let stream = streamRef.current
        if (!stream) {
          const result = await requestCameraPermission(true);
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
        recordingStream = stream
      }

      // Get optimal MIME type for this device
      const mimeType = getOptimalVideoMimeType();
      const device = detectDevice();
      
      console.log('Device type:', device);
      console.log('Using MIME type:', mimeType);
      console.log('Recording with green screen:', greenScreenActive && backgroundImageLoaded);

      const mediaRecorder = new MediaRecorder(recordingStream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        
        // Check file size (limit to 50MB for better upload reliability)
        const maxSize = 50 * 1024 * 1024 // 50MB
        if (blob.size > maxSize) {
          alert('Video file is too large. Please record a shorter video.')
          return
        }
        
        try {
          console.log('Video blob size:', blob.size, 'bytes')
          console.log('Video blob type:', blob.type)
          
          // Upload video to Vercel Blob storage with retry logic
          const formData = new FormData()
          // Always use webm extension since that's what we're recording
          formData.append('file', blob, 'video.webm')
          formData.append('type', 'video')
          
          console.log('Uploading video to Vercel Blob...')
          
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
      const maxSize = 50 * 1024 * 1024 // 50MB
      if (file.size > maxSize) {
        alert('File is too large. Please select a file smaller than 50MB.')
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
    <div className="fixed inset-0 z-50 bg-cream-100 camera-view">
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid #10b981;
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid #10b981;
        }
      `}</style>
      {/* Camera View */}
      <div className="relative w-full h-full video-container">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          webkit-playsinline="true"
          className="w-full h-full object-cover" 
        />

        {/* Green Screen Processing Canvas */}
        {selectedEffect === "greenscreen" && (
          <div className="absolute inset-0 pointer-events-none">
            <canvas 
              ref={greenScreenCanvasRef}
              className="w-full h-full object-cover"
              style={{ display: greenScreenActive ? 'block' : 'none' }}
            />
            <div className="absolute top-4 left-4 right-4 pointer-events-auto">
              <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium">Green Screen</span>
                  <button
                    onClick={() => setGreenScreenActive(!greenScreenActive)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      greenScreenActive 
                        ? 'bg-green-500 text-white' 
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {greenScreenActive ? 'ON' : 'OFF'}
                  </button>
                </div>
                {greenScreenActive && (
                  <>
                    <div className="space-y-1">
                      <label className="text-white text-xs">Threshold: {greenScreenThreshold.toFixed(2)}</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={greenScreenThreshold}
                        onChange={(e) => setGreenScreenThreshold(parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/20 rounded-lg appearance-none slider"
                      />
                    </div>
                    <button
                      onClick={() => backgroundImageInputRef.current?.click()}
                      className="w-full px-3 py-2 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg transition-all"
                    >
                      {backgroundImageLoaded ? 'Change Background' : 'Select Background'}
                    </button>
                  </>
                )}
              </div>
            </div>
            {!backgroundImageLoaded && greenScreenActive && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white text-center">
                <p className="text-sm font-medium bg-black/50 px-4 py-2 rounded-full">
                  Select a background image to enable green screen
                </p>
              </div>
            )}
          </div>
        )}

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between camera-header camera-controls">
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
        <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 camera-footer camera-controls">
          <div className="flex items-center justify-center space-x-8">
            {/* Upload Button */}
            <button
              onClick={handleUpload}
              className="flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm hover:bg-white transition-all shadow-lg rounded-2xl px-4 py-3 min-w-[80px] camera-button touch-target"
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
              className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all hover:scale-105 record-button touch-target"
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

      {/* Hidden File Inputs */}
      <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />
      <input 
        ref={backgroundImageInputRef} 
        type="file" 
        accept="image/*" 
        onChange={handleBackgroundImageUpload} 
        className="hidden" 
      />
      
      {/* Hidden background image for processing */}
      <img ref={backgroundImageRef} className="hidden" alt="" />
    </div>
  )
}
