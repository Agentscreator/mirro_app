"use client"

import { useState, useRef } from "react"

export default function VideoUploadDiagnostic() {
  const [logs, setLogs] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `${timestamp}: ${message}`
    setLogs(prev => [...prev, logMessage])
    console.log(logMessage)
  }

  const startCamera = async () => {
    try {
      addLog('Requesting camera access...')
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" }, 
        audio: true 
      })
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      addLog('Camera access granted')
      
      // Test MediaRecorder support
      addLog(`MediaRecorder supported: ${typeof MediaRecorder !== 'undefined'}`)
      
      if (typeof MediaRecorder !== 'undefined') {
        const types = [
          'video/webm',
          'video/webm;codecs=vp9',
          'video/webm;codecs=vp8',
          'video/mp4'
        ]
        
        types.forEach(type => {
          addLog(`${type}: ${MediaRecorder.isTypeSupported(type)}`)
        })
      }
      
    } catch (error) {
      addLog(`Camera error: ${error.message}`)
    }
  }

  const startRecording = () => {
    if (!streamRef.current) {
      addLog('No stream available')
      return
    }

    chunksRef.current = []
    
    let mimeType = 'video/webm'
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      mimeType = 'video/webm;codecs=vp9'
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
      mimeType = 'video/webm;codecs=vp8'
    }
    
    addLog(`Starting recording with MIME type: ${mimeType}`)
    
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
    
    mediaRecorder.start(1000)
    setIsRecording(true)
    addLog('Recording started')
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
      addLog('Preparing upload...')
      const formData = new FormData()
      formData.append('file', recordedBlob, 'diagnostic-video.webm')
      formData.append('type', 'video')
      
      addLog('Sending upload request...')
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
      addLog(`Upload error: ${error.message}`)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Video Upload Diagnostic</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Video Preview</h3>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-48 bg-gray-200 rounded"
          />
          
          <div className="mt-4 space-x-2">
            <button 
              onClick={startCamera}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Start Camera
            </button>
            <button 
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!streamRef.current}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            <button 
              onClick={testUpload}
              disabled={!recordedBlob}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              Test Upload
            </button>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Diagnostic Logs</h3>
            <button 
              onClick={clearLogs}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Clear
            </button>
          </div>
          <div className="bg-gray-100 p-4 rounded h-64 overflow-y-auto font-mono text-sm">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
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