'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Upload, Play, Pause, Download, Image } from 'lucide-react'

interface SimpleGreenScreenProps {
  className?: string
}

export function SimpleGreenScreen({ className }: SimpleGreenScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const backgroundImageRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const backgroundInputRef = useRef<HTMLInputElement>(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)
  const [threshold, setThreshold] = useState(0.4)
  
  const animationFrameRef = useRef<number>()

  const processFrame = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const backgroundImage = backgroundImageRef.current
    
    if (!video || !canvas || !backgroundImage) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

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
      const greenness = g - Math.max(r, b)
      const normalizedGreenness = greenness / 255
      
      // If pixel is green enough, replace with background
      if (normalizedGreenness > threshold) {
        data[i] = bgData[i]         // R
        data[i + 1] = bgData[i + 1] // G
        data[i + 2] = bgData[i + 2] // B
        data[i + 3] = bgData[i + 3] // A
      }
    }

    // Put processed image data back
    ctx.putImageData(imageData, 0, 0)

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(processFrame)
    }
  }

  useEffect(() => {
    if (isPlaying && videoLoaded && backgroundLoaded) {
      processFrame()
    }
  }, [isPlaying, videoLoaded, backgroundLoaded, threshold])

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && videoRef.current) {
      const url = URL.createObjectURL(file)
      videoRef.current.src = url
      videoRef.current.onloadeddata = () => setVideoLoaded(true)
    }
  }

  const handleBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && backgroundImageRef.current) {
      const url = URL.createObjectURL(file)
      backgroundImageRef.current.src = url
      backgroundImageRef.current.onload = () => setBackgroundLoaded(true)
    }
  }

  const togglePlayback = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    } else {
      video.play()
    }
    
    setIsPlaying(!isPlaying)
  }

  const downloadProcessedVideo = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // For downloading, we need to record the canvas
    const stream = canvas.captureStream(30)
    const mediaRecorder = new MediaRecorder(stream, { 
      mimeType: 'video/webm;codecs=vp9' 
    })
    const chunks: Blob[] = []

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'green-screen-result.webm'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    // Start recording
    mediaRecorder.start()
    
    // Play the video and record
    const video = videoRef.current
    if (video) {
      video.currentTime = 0
      video.play()
      setIsPlaying(true)
      
      video.onended = () => {
        mediaRecorder.stop()
        setIsPlaying(false)
      }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Simple Green Screen Processor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="video-upload">Upload Green Screen Video</Label>
              <input
                ref={fileInputRef}
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full mt-2"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Video File
              </Button>
            </div>
            
            <div>
              <Label htmlFor="background-upload">Upload Background Image</Label>
              <input
                ref={backgroundInputRef}
                id="background-upload"
                type="file"
                accept="image/*"
                onChange={handleBackgroundUpload}
                className="hidden"
              />
              <Button
                onClick={() => backgroundInputRef.current?.click()}
                variant="outline"
                className="w-full mt-2"
              >
                <Image className="w-4 h-4 mr-2" />
                Choose Background Image
              </Button>
            </div>
          </div>

          {/* Video Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <Label>Original Video</Label>
              <video
                ref={videoRef}
                className="w-full h-auto border rounded"
                muted
                loop
                controls
              />
            </div>
            
            <div>
              <Label>Background Image</Label>
              <img
                ref={backgroundImageRef}
                className="w-full h-auto border rounded object-cover"
                alt="Background"
              />
            </div>
            
            <div>
              <Label>Processed Result</Label>
              <canvas
                ref={canvasRef}
                className="w-full h-auto border rounded bg-black"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={togglePlayback}
                disabled={!videoLoaded || !backgroundLoaded}
                variant="default"
              >
                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              
              <Button
                onClick={downloadProcessedVideo}
                disabled={!videoLoaded || !backgroundLoaded}
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Record & Download
              </Button>
            </div>

            {/* Threshold Control */}
            <div>
              <Label>Green Screen Threshold: {threshold.toFixed(2)}</Label>
              <Slider
                value={[threshold]}
                onValueChange={([value]) => setThreshold(value)}
                min={0}
                max={1}
                step={0.01}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Adjust to fine-tune green screen detection
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden elements for processing */}
      <img ref={backgroundImageRef} className="hidden" alt="" />
    </div>
  )
}