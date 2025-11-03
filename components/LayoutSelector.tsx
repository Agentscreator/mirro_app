"use client"

import { useState, useEffect } from 'react'
import { generateAndScoreLayouts, LayoutVariant, LayoutScore } from '@/lib/pytorch-aesthetic-scorer'

interface LayoutSelectorProps {
  eventData: {
    title: string
    description: string
    location: string
    visualStyling?: any
  }
  onSelectLayout: (variant: LayoutVariant) => void
  currentLayout?: LayoutVariant
}

export default function LayoutSelector({ 
  eventData, 
  onSelectLayout,
  currentLayout 
}: LayoutSelectorProps) {
  const [variants, setVariants] = useState<LayoutVariant[]>([])
  const [scores, setScores] = useState<LayoutScore[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    loadLayouts()
  }, [eventData.title, eventData.description])

  const loadLayouts = async () => {
    setIsLoading(true)
    try {
      const result = await generateAndScoreLayouts(eventData)
      setVariants(result.variants)
      setScores(result.scores)
      
      // Auto-select the best layout
      if (result.variants.length > 0 && !selectedId) {
        setSelectedId(result.variants[0].id)
        onSelectLayout(result.variants[0])
      }
    } catch (error) {
      console.error('Error loading layouts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectLayout = (variant: LayoutVariant) => {
    setSelectedId(variant.id)
    onSelectLayout(variant)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">AI Layout Scoring</h3>
          <div className="flex items-center space-x-2 text-purple-600">
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm font-medium">Analyzing layouts...</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[3/4] bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Choose Your Layout</h3>
          <p className="text-xs text-gray-500 mt-1">
            Powered by PyTorch aesthetic scoring
          </p>
        </div>
        <div className="flex items-center space-x-2 text-purple-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"/>
          </svg>
          <span className="text-sm font-medium">AI Scored</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {variants.slice(0, 6).map((variant, index) => {
          const score = scores[index]
          const isSelected = selectedId === variant.id
          const isBest = index === 0

          return (
            <button
              key={variant.id}
              onClick={() => handleSelectLayout(variant)}
              className={`relative aspect-[3/4] rounded-xl overflow-hidden transition-all duration-200 ${
                isSelected 
                  ? 'ring-4 ring-purple-500 scale-105 shadow-xl' 
                  : 'hover:scale-102 hover:shadow-lg'
              }`}
            >
              {/* Layout Preview */}
              <div className={`w-full h-full ${variant.gradient} p-3 flex flex-col justify-between`}>
                {/* Mini title preview */}
                <div className={`${variant.font} text-white text-xs leading-tight line-clamp-2`}>
                  {eventData.title}
                </div>
                
                {/* Mini date box */}
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1.5 w-fit">
                  <div className="text-white text-xs font-bold">15</div>
                  <div className="text-white text-[8px] font-medium">NOV</div>
                </div>
              </div>

              {/* Score Badge */}
              <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${
                score.aestheticScore >= 85 
                  ? 'bg-green-500 text-white' 
                  : score.aestheticScore >= 75 
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-500 text-white'
              }`}>
                {score.aestheticScore}
              </div>

              {/* Best Badge */}
              {isBest && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-[10px] font-bold flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>Best</span>
                </div>
              )}

              {/* Selected Checkmark */}
              {isSelected && (
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Score Details for Selected Layout */}
      {selectedId && scores.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-sm font-semibold text-gray-800">Layout Quality Analysis</h4>
              <p className="text-xs text-gray-600 mt-1">
                {scores.find(s => s.layoutId === selectedId)?.reasoning}
              </p>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {scores.find(s => s.layoutId === selectedId)?.aestheticScore}
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Composition', value: scores.find(s => s.layoutId === selectedId)?.compositionScore },
              { label: 'Color Harmony', value: scores.find(s => s.layoutId === selectedId)?.colorHarmonyScore },
              { label: 'Balance', value: scores.find(s => s.layoutId === selectedId)?.balanceScore },
            ].map((metric) => (
              <div key={metric.label} className="bg-white rounded-lg p-2">
                <div className="text-xs text-gray-600 mb-1">{metric.label}</div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{metric.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
