"use client"

import { useRef, useState, useEffect } from "react"

interface CameraCaptureProps {
  onCapture: (data: string, type: "photo" | "video") => void
  onClose: () => void
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  useEffect(() => {
    startCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      alert("Unable to access camera. Please check permissions.")
    }
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        const imageData = canvas.toDataURL("image/jpeg")
        setCapturedImage(imageData)
      }
    }
  }

  const handleUsePhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage, "photo")
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }

  const handleRetake = () => {
    setCapturedImage(null)
  }

  return (
    <div className="fixed inset-0 bg-cream-100 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 glass-card">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-white/60 transition-all"
        >
          <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-lg font-medium text-text-primary">Take Photo</h2>
        <div className="w-10"></div>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative bg-black">
        {!capturedImage ? (
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        ) : (
          <img src={capturedImage || "/placeholder.svg"} alt="Captured" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Controls */}
      <div className="p-6 glass-card">
        {!capturedImage ? (
          <div className="flex items-center justify-center">
            <button
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full bg-white border-4 border-sand-400 hover:border-sand-500 transition-all shadow-lg hover:scale-105"
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-sand-400 to-taupe-400"></div>
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleRetake}
              className="flex-1 py-4 rounded-2xl glass-card font-medium text-text-primary hover:bg-white/60 transition-all"
            >
              Retake
            </button>
            <button
              onClick={handleUsePhoto}
              className="flex-1 py-4 rounded-2xl gradient-primary text-white font-medium hover:shadow-lg transition-all"
            >
              Use Photo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
