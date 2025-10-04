"use client"

import { useState, useRef, useEffect } from "react"
import { 
  detectDevice, 
  getVideoConstraints, 
  getOptimalVideoMimeType, 
  getOptimalChunkSize,
  requestCameraPermission,
  setupVideoElement,
  supportsVideoRecording
} from "@/lib/mobile-utils"

export default function MobileVideoTest() {
  const [logs, setLogs] = useState<string[]>([])
  const [deviceInfo, setDeviceInfo] = useState<any>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const device = detectDevice()
    setDeviceInfo(device)
    addLog(`Device detected: ${JSON.stringify(device)}`)
    addLog(`Video recording supported: ${supportsVideoRecording()}`)
    addLog(`Optimal MIME type: ${getOptimalVideoMimeType()}`)
    addLog(`Optimal chunk size: ${getOptimalChunkSize()}`)
  }, [])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `${timestamp}: ${message}`
    setLogs(prev => [...prev, logMessage])
    console.log(logMessage)
  }

  const testCameraAccess = async () => {
    addLog('Testing camera access...')
    const result = await requestCameraPermission(true)
    
    if (result.success && result.stream) {
      streamRef.current = result.stream
      if (videoRef.current) {
        videoRef.current.srcObject = result.stream
        setupVideoElement(videoRef.current)
      }
      addLog('Camera access successful')
    } else {
      addLog(`Camera access failed: ${result.error}`)
    }
  }

  const startRecording = async () => {
    if (!streamRef.current) {
      addLog('No stream available, requesting camera access...')
      await testCameraAccess()
      if (!streamRef.current) return
    }

    chunksRef.current = []
    const mimeType = getOptimalVideoMimeType()
    const chunkSize = getOptimalChunkSize()
    
    addLog(`Starting recording with MIME type: ${mimeType}, chunk size: ${chunkSize}`)
    
    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
          addLog(`Data chunk received: ${event.data.size} bytes`)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        setRecordedBlob(blob)
        addLog(`Recording stopped. Blob created: ${blob.size} bytes, type: ${blob.type}`)
      }
      
      mediaRecorder.onerror = (event) => {
        addLog(`MediaRecorder error: ${event.error}`)
      }
      
      mediaRecorder.start(chunkSize)
      setIsRecording(true)
      addLog('Recording started successfully')
    } catch (error) {
      addLog(`Recording start failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      addLog('Stopping recording...')
    }
  }

  const testUpload = async () => {
    if (!recordedBlob) {
      addLog('No recorded video to upload')
      return
    }

    try {
      addLog('Testing upload...')
      const formData = new FormData()
      formData.append('file', recordedBlob, 'mobile-test-video.webm')
      formData.append('type', 'video')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      addLog(`Upload response status: ${response.status}`)
      
      if (response.ok) {
        const result = await response.json()
        addLog(`Upload successful: ${JSON.stringify(result)}`)
      } else {
        const errorText = await response.text()
        addLog(`Upload failed: ${errorText}`)
      }
    } catch (error) {
      addLog(`Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Mobile Video Recording Test</h2>
      
      {deviceInfo && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">Device Information</h3>
          <div className="text-sm space-y-1">
            <div>iOS: {deviceInfo.isIOS ? 'Yes' : 'No'}</div>
            <div>Android: {deviceInfo.isAndroid ? 'Yes' : 'No'}</div>
            <div>Mobile: {deviceInfo.isMobile ? 'Yes' : 'No'}</div>
            <div>Safari: {deviceInfo.isSafari ? 'Yes' : 'No'}</div>
            <div>Chrome: {deviceInfo.isChrome ? 'Yes' : 'No'}</div>
            <div>User Agent: {navigator.userAgent}</div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Video Preview</h3>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-48 bg-gray-200 rounded android-video-fix"
          />
          
          <div className="mt-4 space-y-2">
            <button 
              onClick={testCameraAccess}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 camera-button touch-target"
            >
              Test Camera Access
            </button>
            <button 
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!streamRef.current}
              className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 camera-button touch-target"
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            <button 
              onClick={testUpload}
              disabled={!recordedBlob}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 camera-button touch-target"
            >
              Test Upload
            </button>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Test Logs</h3>
            <button 
              onClick={clearLogs}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 touch-target"
            >
              Clear
            </button>
          </div>
          <div className="bg-gray-100 p-4 rounded h-64 overflow-y-auto font-mono text-xs">
            {logs.map((log, index) => (
              <div key={index} className="mb-1 break-words">{log}</div>
            ))}
            {logs.length === 0 && (
              <div className="text-gray-500">No logs yet...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}