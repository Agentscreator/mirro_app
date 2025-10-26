"use client"

import { useRef, useState, useEffect } from "react"

interface VideoRecorderProps {
    onComplete: (data: string) => void
    onClose: () => void
}

export default function VideoRecorder({ onComplete, onClose }: VideoRecorderProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])

    const [stream, setStream] = useState<MediaStream | null>(null)
    const [isRecording, setIsRecording] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const [recordedVideo, setRecordedVideo] = useState<string | null>(null)
    const [isPaused, setIsPaused] = useState(false)
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user")

    useEffect(() => {
        startCamera()
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop())
            }
        }
    }, [])

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isRecording && !isPaused) {
            interval = setInterval(() => {
                setRecordingTime((prev) => prev + 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [isRecording, isPaused])

    const startCamera = async () => {
        try {
            const constraints = {
                video: { 
                    facingMode: facingMode,
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                    frameRate: { ideal: 30, max: 30 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
            }
            
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
            setStream(mediaStream)
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
                videoRef.current.playsInline = true
                videoRef.current.muted = true
            }
        } catch (err) {
            console.error("Error accessing camera:", err)
            // Try fallback with basic constraints
            try {
                const fallbackStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                })
                setStream(fallbackStream)
                if (videoRef.current) {
                    videoRef.current.srcObject = fallbackStream
                    videoRef.current.playsInline = true
                    videoRef.current.muted = true
                }
            } catch (fallbackErr) {
                console.error("Fallback camera access failed:", fallbackErr)
                alert("Unable to access camera. Please check permissions and try again.")
            }
        }
    }

    const startRecording = () => {
        if (stream) {
            chunksRef.current = []
            
            // Enhanced MIME type detection for mobile compatibility
            let mimeType = 'video/webm'
            
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
            const isAndroid = /Android/.test(navigator.userAgent)
            
            if (isIOS) {
                // iOS Safari preferences
                if (MediaRecorder.isTypeSupported('video/mp4')) {
                    mimeType = 'video/mp4'
                } else if (MediaRecorder.isTypeSupported('video/webm')) {
                    mimeType = 'video/webm'
                }
            } else if (isAndroid) {
                // Android Chrome preferences
                if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
                    mimeType = 'video/webm;codecs=vp8'
                } else if (MediaRecorder.isTypeSupported('video/webm')) {
                    mimeType = 'video/webm'
                }
            } else {
                // Desktop preferences
                if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
                    mimeType = 'video/webm;codecs=vp9'
                } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
                    mimeType = 'video/webm;codecs=vp8'
                }
            }
            
            console.log('VideoRecord device type:', { isIOS, isAndroid })
            console.log('VideoRecord using MIME type:', mimeType)
            
            const mediaRecorder = new MediaRecorder(stream, { mimeType })

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data)
                }
            }

            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: mimeType })
                console.log('VideoRecord blob created:', blob.size, 'bytes')
                
                try {
                    // Try to upload to R2 first
                    const formData = new FormData()
                    formData.append('file', blob, 'video.webm')
                    formData.append('type', 'video')
                    
                    const uploadResponse = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    })
                    
                    if (uploadResponse.ok) {
                        const result = await uploadResponse.json()
                        console.log('VideoRecord upload successful:', result.url)
                        setRecordedVideo(result.url)
                    } else {
                        throw new Error('Upload failed')
                    }
                } catch (error) {
                    console.error('VideoRecord upload error, using fallback:', error)
                    // Fallback to data URL
                    const reader = new FileReader()
                    reader.onload = () => {
                        const dataUrl = reader.result as string
                        setRecordedVideo(dataUrl)
                    }
                    reader.readAsDataURL(blob)
                }
            }

            mediaRecorderRef.current = mediaRecorder
            // Use different chunk sizes for different platforms
            const chunkSize = isIOS ? 100 : 1000 // iOS works better with smaller chunks
            mediaRecorder.start(chunkSize)
            setIsRecording(true)
            setIsPaused(false)
        }
    }

    const pauseRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            if (isPaused) {
                mediaRecorderRef.current.resume()
                setIsPaused(false)
            } else {
                mediaRecorderRef.current.pause()
                setIsPaused(true)
            }
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            setIsPaused(false)
            if (stream) {
                stream.getTracks().forEach((track) => track.stop())
            }
        }
    }

    const handleUseVideo = () => {
        if (recordedVideo) {
            onComplete(recordedVideo)
        }
    }

    const handleRetake = () => {
        setRecordedVideo(null)
        setRecordingTime(0)
        startCamera()
    }

    const switchCamera = async () => {
        if (isRecording) return // Don't switch during recording
        
        // Stop current stream
        if (stream) {
            stream.getTracks().forEach((track) => track.stop())
        }
        
        // Toggle facing mode
        const newFacingMode = facingMode === "user" ? "environment" : "user"
        setFacingMode(newFacingMode)
        
        // Restart camera with new facing mode
        try {
            const constraints = {
                video: { 
                    facingMode: newFacingMode,
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                    frameRate: { ideal: 30, max: 30 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
            }
            
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
            setStream(mediaStream)
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
                videoRef.current.playsInline = true
                videoRef.current.muted = true
            }
        } catch (err) {
            console.error("Error switching camera:", err)
            // Revert to previous facing mode if switch fails
            setFacingMode(facingMode)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    return (
        <div className="fixed inset-0 bg-cream-100 z-50 flex flex-col">
            {/* Header - TikTok Studio Style */}
            <div className="flex items-center justify-between p-4 glass-card">
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-white/60 transition-all"
                >
                    <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 className="text-lg font-medium text-text-primary">Record Video</h2>
                <div className="w-10"></div>
            </div>

            {/* Video View */}
            <div className="flex-1 relative bg-black">
                {!recordedVideo ? (
                    <>
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            webkit-playsinline="true"
                            className="w-full h-full object-cover"
                            style={{
                                transform: facingMode === "environment" ? "scaleX(-1)" : "none"
                            }}
                        />

                        {/* Recording Timer Overlay */}
                        {isRecording && (
                            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full glass-card backdrop-blur-md">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`w-3 h-3 rounded-full ${isPaused ? "bg-yellow-500" : "bg-red-500 animate-pulse"}`}
                                    ></div>
                                    <span className="text-text-primary font-medium text-lg">{formatTime(recordingTime)}</span>
                                </div>
                            </div>
                        )}

                        {/* Side Controls - TikTok Style */}
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-6">
                            <button 
                                onClick={switchCamera}
                                disabled={isRecording}
                                className="w-12 h-12 rounded-full glass-card backdrop-blur-md flex items-center justify-center hover:bg-white/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                            </button>
                            <button className="w-12 h-12 rounded-full glass-card backdrop-blur-md flex items-center justify-center hover:bg-white/60 transition-all">
                                <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                                    />
                                </svg>
                            </button>
                            <button className="w-12 h-12 rounded-full glass-card backdrop-blur-md flex items-center justify-center hover:bg-white/60 transition-all">
                                <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </>
                ) : (
                    <video src={recordedVideo} controls className="w-full h-full object-cover" />
                )}
            </div>

            {/* Bottom Controls - TikTok Studio Style */}
            <div className="p-6 glass-card">
                {!recordedVideo ? (
                    <div className="flex items-center justify-center gap-6">
                        {isRecording && (
                            <button
                                onClick={pauseRecording}
                                className="w-14 h-14 rounded-full glass-card flex items-center justify-center hover:bg-white/60 transition-all"
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

                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-105 ${isRecording
                                    ? "bg-white border-4 border-red-500"
                                    : "bg-white border-4 border-sand-400 hover:border-sand-500"
                                }`}
                        >
                            {isRecording ? (
                                <div className="w-8 h-8 bg-red-500 rounded-sm"></div>
                            ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-sand-400 to-taupe-400"></div>
                            )}
                        </button>

                        {isRecording && <div className="w-14"></div>}
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
                            onClick={handleUseVideo}
                            className="flex-1 py-4 rounded-2xl gradient-primary text-white font-medium hover:shadow-lg transition-all"
                        >
                            Use Video
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
