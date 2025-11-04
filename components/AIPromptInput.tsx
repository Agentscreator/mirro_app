"use client"
import { useState, useRef } from "react"

interface AIPromptInputProps {
  method: string
  onGenerate: (content: string, input: string) => void
  onBack: () => void
  initialInput?: string
}

export default function AIPromptInput({ method, onGenerate, onBack, initialInput = "" }: AIPromptInputProps) {
  const [input, setInput] = useState(initialInput)
  const [isGenerating, setIsGenerating] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState("")
  const [isExtracting, setIsExtracting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadedFile(file)
    setIsExtracting(true)

    try {
      // For text files, read directly
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const text = await file.text()
        setExtractedText(text)
        setInput("") // Clear input to show the new placeholder
      }
      // For images, use OCR API to extract text
      else if (file.type.startsWith('image/')) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/extract-text', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Failed to extract text from image')
        }

        const result = await response.json()
        setExtractedText(result.text)
        setInput("") // Clear input to show the new placeholder
      }
      // For Word, PowerPoint, and PDF files, use document extraction API
      else if (file.type.includes('word') || file.type.includes('powerpoint') || file.type === 'application/pdf' ||
               file.name.endsWith('.doc') || file.name.endsWith('.docx') || 
               file.name.endsWith('.ppt') || file.name.endsWith('.pptx') || file.name.endsWith('.pdf')) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/extract-text', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Failed to extract text from document')
        }

        const result = await response.json()
        setExtractedText(result.text)
        setInput("") // Clear input to show the new placeholder
      }
      // For other document types, show a message
      else {
        alert('Please upload a supported file type: images, text files, Word documents, PowerPoint presentations, or PDF files.')
        setUploadedFile(null)
      }
    } catch (error) {
      console.error('Error extracting text:', error)
      alert('Failed to extract text from file. Please try again.')
      setUploadedFile(null)
    } finally {
      setIsExtracting(false)
    }
  }

  const handleGenerate = async () => {
    const textToUse = input.trim()
    if (!textToUse) return

    setIsGenerating(true)

    try {
      const response = await fetch('/api/generate-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: textToUse,
          method: method,
          generateImage: false, // Don't generate image initially for speed
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate event')
      }

      const eventData = await response.json()
      onGenerate(JSON.stringify(eventData), textToUse)
    } catch (error) {
      console.error('Error generating event:', error)
      alert(error instanceof Error ? error.message : 'Failed to generate event. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const getPlaceholder = () => {
    return "e.g., 'Coffee meetup downtown on Saturday at 3pm' or 'Three-day music festival starting June 15th' or 'Weekly yoga class every Tuesday at 6pm'"
  }

  const getTitle = () => {
    return "Describe Your Event"
  }

  const getDescription = () => {
    return "Tell us about your event - single day, multi-day, or repeating. Include dates, times, and location if you know them."
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-6 flex items-center text-text-secondary hover:text-text-primary transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Media
      </button>

      <div className="mb-10 text-center">
        <h2 className="text-2xl font-normal text-text-primary mb-3">{getTitle()}</h2>
        <p className="text-text-secondary font-normal">{getDescription()}</p>
      </div>

      <div className="space-y-6">
        <div>
          <textarea
            placeholder={getPlaceholder()}
            rows={6}
            className="w-full px-5 py-4 text-base rounded-2xl border border-cream-300 glass-card focus:ring-2 focus:ring-taupe-400 focus:border-transparent transition-all duration-200 resize-none text-text-primary placeholder-text-light"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <p className="text-xs text-text-light mt-2">
            Be as detailed or brief as you'd like - AI will fill in the gaps
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!input.trim() || isGenerating}
          className="w-full gradient-primary text-white py-4 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
              Generate with AI
            </>
          )}
        </button>
      </div>
    </div>
  )
}
