'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Upload, Play, Pause, Download } from 'lucide-react'

interface GreenScreenVideoProps {
  className?: string
  onProcessedVideo?: (blob: Blob) => void
}

export function GreenScreenVideo({ className, onProcessedVideo }: GreenScreenVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const backgroundVideoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const backgroundInputRef = useRef<HTMLInputElement>(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)
  const [chromaKey, setChromaKey] = useState({
    threshold: 0.4,
    smoothness: 0.1,
    spill: 0.1
  })
  
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const animationFrameRef = useRef<number>()

  // WebGL shader sources
  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = a_texCoord;
    }
  `

  const fragmentShaderSource = `
    precision mediump float;
    
    uniform sampler2D u_foregroundTexture;
    uniform sampler2D u_backgroundTexture;
    uniform float u_threshold;
    uniform float u_smoothness;
    uniform float u_spill;
    
    varying vec2 v_texCoord;
    
    void main() {
      vec4 foreground = texture2D(u_foregroundTexture, v_texCoord);
      vec4 background = texture2D(u_backgroundTexture, v_texCoord);
      
      // Convert to HSV for better chroma keying
      float r = foreground.r;
      float g = foreground.g;
      float b = foreground.b;
      
      // Calculate green screen mask
      float greenness = g - max(r, b);
      float alpha = smoothstep(u_threshold - u_smoothness, u_threshold + u_smoothness, greenness);
      
      // Spill suppression
      if (alpha < 1.0) {
        float spillAmount = max(0.0, greenness - u_spill);
        foreground.r = mix(foreground.r, foreground.r + spillAmount * 0.5, u_spill);
        foreground.b = mix(foreground.b, foreground.b + spillAmount * 0.5, u_spill);
      }
      
      // Composite foreground over background
      vec3 result = mix(background.rgb, foreground.rgb, 1.0 - alpha);
      gl_FragColor = vec4(result, 1.0);
    }
  `

  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl')
    if (!gl) {
      console.error('WebGL not supported')
      return
    }

    glRef.current = gl

    // Create shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
    
    if (!vertexShader || !fragmentShader) return

    // Create program
    const program = createProgram(gl, vertexShader, fragmentShader)
    if (!program) return

    programRef.current = program

    // Set up geometry
    const positions = new Float32Array([
      -1, -1,  0, 0,
       1, -1,  1, 0,
      -1,  1,  0, 1,
       1,  1,  1, 1,
    ])

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, 'a_position')
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord')

    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0)

    gl.enableVertexAttribArray(texCoordLocation)
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8)

    // Create textures
    const foregroundTexture = gl.createTexture()
    const backgroundTexture = gl.createTexture()

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, foregroundTexture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, backgroundTexture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

    gl.useProgram(program)
    gl.uniform1i(gl.getUniformLocation(program, 'u_foregroundTexture'), 0)
    gl.uniform1i(gl.getUniformLocation(program, 'u_backgroundTexture'), 1)
  }, [])

  const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type)
    if (!shader) return null

    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }

    return shader
  }

  const createProgram = (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
    const program = gl.createProgram()
    if (!program) return null

    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program))
      gl.deleteProgram(program)
      return null
    }

    return program
  }

  const renderFrame = useCallback(() => {
    const gl = glRef.current
    const program = programRef.current
    const video = videoRef.current
    const backgroundVideo = backgroundVideoRef.current
    const canvas = canvasRef.current

    if (!gl || !program || !video || !backgroundVideo || !canvas) return

    // Update canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    gl.viewport(0, 0, canvas.width, canvas.height)

    // Update textures
    gl.activeTexture(gl.TEXTURE0)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)

    gl.activeTexture(gl.TEXTURE1)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, backgroundVideo)

    // Update uniforms
    gl.uniform1f(gl.getUniformLocation(program, 'u_threshold'), chromaKey.threshold)
    gl.uniform1f(gl.getUniformLocation(program, 'u_smoothness'), chromaKey.smoothness)
    gl.uniform1f(gl.getUniformLocation(program, 'u_spill'), chromaKey.spill)

    // Draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(renderFrame)
    }
  }, [chromaKey, isPlaying])

  useEffect(() => {
    initWebGL()
  }, [initWebGL])

  useEffect(() => {
    if (isPlaying && videoLoaded && backgroundLoaded) {
      renderFrame()
    }
  }, [isPlaying, videoLoaded, backgroundLoaded, renderFrame])

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
    if (file && backgroundVideoRef.current) {
      const url = URL.createObjectURL(file)
      backgroundVideoRef.current.src = url
      backgroundVideoRef.current.onloadeddata = () => setBackgroundLoaded(true)
    }
  }

  const togglePlayback = () => {
    const video = videoRef.current
    const backgroundVideo = backgroundVideoRef.current
    
    if (!video || !backgroundVideo) return

    if (isPlaying) {
      video.pause()
      backgroundVideo.pause()
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    } else {
      video.play()
      backgroundVideo.play()
    }
    
    setIsPlaying(!isPlaying)
  }

  const downloadProcessedVideo = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const stream = canvas.captureStream(30)
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
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
      a.download = 'green-screen-processed.webm'
      a.click()
      
      if (onProcessedVideo) {
        onProcessedVideo(blob)
      }
    }

    mediaRecorder.start()
    
    // Record for the duration of the video
    const video = videoRef.current
    if (video) {
      setTimeout(() => {
        mediaRecorder.stop()
      }, video.duration * 1000)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Green Screen Video Processor</CardTitle>
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
              <Label htmlFor="background-upload">Upload Background Video</Label>
              <input
                ref={backgroundInputRef}
                id="background-upload"
                type="file"
                accept="video/*"
                onChange={handleBackgroundUpload}
                className="hidden"
              />
              <Button
                onClick={() => backgroundInputRef.current?.click()}
                variant="outline"
                className="w-full mt-2"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Background
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
              />
            </div>
            
            <div>
              <Label>Background Video</Label>
              <video
                ref={backgroundVideoRef}
                className="w-full h-auto border rounded"
                muted
                loop
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
                Download Result
              </Button>
            </div>

            {/* Chroma Key Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Threshold: {chromaKey.threshold.toFixed(2)}</Label>
                <Slider
                  value={[chromaKey.threshold]}
                  onValueChange={([value]) => setChromaKey(prev => ({ ...prev, threshold: value }))}
                  min={0}
                  max={1}
                  step={0.01}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Smoothness: {chromaKey.smoothness.toFixed(2)}</Label>
                <Slider
                  value={[chromaKey.smoothness]}
                  onValueChange={([value]) => setChromaKey(prev => ({ ...prev, smoothness: value }))}
                  min={0}
                  max={0.5}
                  step={0.01}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Spill Suppression: {chromaKey.spill.toFixed(2)}</Label>
                <Slider
                  value={[chromaKey.spill]}
                  onValueChange={([value]) => setChromaKey(prev => ({ ...prev, spill: value }))}
                  min={0}
                  max={0.5}
                  step={0.01}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}