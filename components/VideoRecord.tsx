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
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" },
                audio: true,
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

    const startRecording = () => {
        if (stream) {
            chunksRef.current = []
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: "video/webm",
            })

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data)
                }
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "video/webm" })
                const videoUrl = URL.createObjectURL(blob)
                setRecordedVideo(videoUrl)
            }

            mediaRecorderRef.current = mediaRecorder
            mediaRecorder.start()
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
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

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
                            <button className="w-12 h-12 rounded-full glass-card backdrop-blur-md flex items-center justify-center hover:bg-white/60 transition-all">
                                <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
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
