"use client"

export default function AIGenerationStep({ onSelect }: { onSelect: (method: string) => void }) {
  return (
    <div>
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-normal text-text-primary mb-3">Create with AI</h2>
        <p className="text-text-secondary font-normal">How would you like to get started?</p>
      </div>

      <div className="space-y-4">
        {/* Generate Option */}
        <button
          onClick={() => onSelect("generate")}
          className="w-full glass-card rounded-3xl p-6 text-left hover:bg-white/60 transition-all duration-200 soft-shadow hover-lift"
        >
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cream-300 to-cream-400 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <svg className="w-8 h-8 text-taupe-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L19 7L17.74 13.09L24 12L17.74 10.91L19 17L13.09 15.74L12 22L10.91 15.74L5 17L6.26 10.91L0 12L6.26 13.09L5 7L10.91 8.26L12 2Z"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-2 text-text-primary text-lg">Generate</h3>
              <p className="text-sm text-text-secondary font-normal leading-relaxed">
                Turn a one-line idea into a full event instantly
              </p>
            </div>
          </div>
        </button>

        {/* Paste Text Option */}
        <button
          onClick={() => onSelect("paste")}
          className="w-full glass-card rounded-3xl p-6 text-left hover:bg-white/60 transition-all duration-200 soft-shadow hover-lift"
        >
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cream-300 to-cream-400 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <svg className="w-8 h-8 text-taupe-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                <path d="M8,12V14H16V12H8M8,16V18H13V16H8Z"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-2 text-text-primary text-lg">From Notes</h3>
              <p className="text-sm text-text-secondary font-normal leading-relaxed">
                Build an event from outlines, text, or drafts.
              </p>
            </div>
          </div>
        </button>

        {/* Import Option */}
        <button
          onClick={() => onSelect("import")}
          className="w-full glass-card rounded-3xl p-6 text-left hover:bg-white/60 transition-all duration-200 soft-shadow hover-lift"
        >
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cream-300 to-cream-400 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <svg className="w-8 h-8 text-taupe-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                <path d="M12,11L16,15H13V19H11V15H8L12,11Z"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-2 text-text-primary text-lg">Import</h3>
              <p className="text-sm text-text-secondary font-normal leading-relaxed">
                Upload a file to extract event details.
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
