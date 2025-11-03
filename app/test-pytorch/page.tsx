"use client"

import { useState } from 'react'
import LayoutSelector from '@/components/LayoutSelector'

export default function TestPyTorchPage() {
  const [eventData, setEventData] = useState({
    title: 'Summer Music Festival',
    description: 'Join us for an amazing outdoor concert featuring top artists',
    location: 'Central Park, New York',
    visualStyling: { theme: 'celebration' }
  })

  const [selectedLayout, setSelectedLayout] = useState<any>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            PyTorch Layout Scoring Demo
          </h1>
          <p className="text-gray-600">
            AI-powered aesthetic evaluation for event layouts
          </p>
        </div>

        {/* Event Data Input */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Event Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title
              </label>
              <input
                type="text"
                value={eventData.title}
                onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={eventData.description}
                onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
                placeholder="Enter event description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={eventData.location}
                onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <select
                value={eventData.visualStyling.theme}
                onChange={(e) => setEventData({ 
                  ...eventData, 
                  visualStyling: { theme: e.target.value } 
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="professional">Professional</option>
                <option value="creative">Creative</option>
                <option value="social">Social</option>
                <option value="celebration">Celebration</option>
                <option value="outdoor">Outdoor</option>
                <option value="formal">Formal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout Selector */}
        <LayoutSelector
          eventData={eventData}
          onSelectLayout={setSelectedLayout}
        />

        {/* Selected Layout Preview */}
        {selectedLayout && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Selected Layout Preview
            </h2>
            
            <div className="aspect-[3/4] max-w-sm mx-auto rounded-2xl overflow-hidden shadow-xl">
              <div className={`w-full h-full ${selectedLayout.gradient} p-6 flex flex-col justify-between`}>
                {/* Title */}
                <div className={`${selectedLayout.font} text-white text-3xl leading-tight mb-4`}>
                  {eventData.title}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-white">
                    <p className="text-sm mb-3">{eventData.description}</p>
                    <div className="flex items-center space-x-2 text-xs">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span>{eventData.location}</span>
                    </div>
                  </div>
                </div>

                {/* Date Box */}
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center w-fit">
                  <div className="text-3xl font-bold text-white">15</div>
                  <div className="text-sm font-medium text-white">NOV</div>
                </div>
              </div>
            </div>

            {/* Layout Details */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-600 mb-1">Gradient</div>
                <div className="text-sm font-medium text-gray-900">{selectedLayout.gradient}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-600 mb-1">Font</div>
                <div className="text-sm font-medium text-gray-900">{selectedLayout.font}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-600 mb-1">Layout</div>
                <div className="text-sm font-medium text-gray-900">{selectedLayout.layout}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-600 mb-1">Theme</div>
                <div className="text-sm font-medium text-gray-900">{selectedLayout.theme}</div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 mt-6 border border-purple-100">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"/>
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                How PyTorch Scoring Works
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Generates 9 layout variants based on your event theme</li>
                <li>• Scores each on composition, color harmony, balance, and typography</li>
                <li>• Ranks them from best to worst (0-100 scale)</li>
                <li>• Automatically selects the highest-scoring layout</li>
                <li>• You can choose any alternative if you prefer</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
