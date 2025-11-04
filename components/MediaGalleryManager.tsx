"use client"

import { useState } from "react"

export interface MediaItem {
  id: string
  type: 'image' | 'video'
  data: string // base64 or URL
  thumbnail?: string
  aspectRatio?: number
  uploadedAt: string
}

interface MediaGalleryManagerProps {
  media: MediaItem[]
  onAddMedia: () => void
  onRemoveMedia: (id: string) => void
  onReorder?: (media: MediaItem[]) => void
  maxItems?: number
  className?: string
}

export default function MediaGalleryManager({
  media,
  onAddMedia,
  onRemoveMedia,
  onReorder,
  maxItems = 10,
  className = ""
}: MediaGalleryManagerProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  const handleDragStart = (id: string) => {
    setDraggedItem(id)
  }

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedItem || draggedItem === targetId || !onReorder) return

    const draggedIndex = media.findIndex(m => m.id === draggedItem)
    const targetIndex = media.findIndex(m => m.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newMedia = [...media]
    const [removed] = newMedia.splice(draggedIndex, 1)
    newMedia.splice(targetIndex, 0, removed)

    onReorder(newMedia)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  const canAddMore = media.length < maxItems

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-taupe-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-sm font-semibold text-text-primary">
            Media Gallery ({media.length}/{maxItems})
          </h3>
        </div>
        
        {canAddMore && (
          <button
            onClick={onAddMedia}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-taupe-600 text-white text-xs font-medium rounded-lg hover:bg-taupe-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add More
          </button>
        )}
      </div>

      {/* Media Grid */}
      {media.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {media.map((item, index) => (
            <div
              key={item.id}
              draggable={!!onReorder}
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDragEnd={handleDragEnd}
              className={`relative aspect-square rounded-xl overflow-hidden bg-gray-100 group cursor-move ${
                draggedItem === item.id ? 'opacity-50' : ''
              }`}
            >
              {/* Media Preview */}
              {item.type === 'image' ? (
                <img
                  src={item.data}
                  alt={`Media ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={item.data}
                  className="w-full h-full object-cover"
                  muted
                />
              )}

              {/* Overlay with controls */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                <button
                  onClick={() => onRemoveMedia(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Media type badge */}
              <div className="absolute top-1.5 right-1.5 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full">
                {item.type === 'video' ? (
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                    Video
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    Photo
                  </div>
                )}
              </div>

              {/* Order number */}
              <div className="absolute bottom-1.5 left-1.5 w-6 h-6 bg-white/90 backdrop-blur-sm text-taupe-700 text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                {index + 1}
              </div>
            </div>
          ))}

          {/* Add more button in grid */}
          {canAddMore && (
            <button
              onClick={onAddMedia}
              className="aspect-square rounded-xl border-2 border-dashed border-taupe-300 hover:border-taupe-500 bg-taupe-50 hover:bg-taupe-100 transition-all duration-200 flex flex-col items-center justify-center gap-2 text-taupe-600 hover:text-taupe-700"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs font-medium">Add</span>
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-8 px-4 bg-taupe-50 rounded-xl border-2 border-dashed border-taupe-200">
          <svg className="w-12 h-12 mx-auto mb-3 text-taupe-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-medium text-taupe-600 mb-1">No media added yet</p>
          <p className="text-xs text-taupe-500 mb-3">Add photos or videos to create your event</p>
          <button
            onClick={onAddMedia}
            className="px-4 py-2 bg-taupe-600 text-white text-sm font-medium rounded-lg hover:bg-taupe-700 transition-all duration-200"
          >
            Add First Media
          </button>
        </div>
      )}
    </div>
  )
}
