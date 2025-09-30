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
              <svg className="w-8 h-8 text-taupe-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
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
              <svg className="w-8 h-8 text-taupe-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
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
              <svg className="w-8 h-8 text-taupe-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-2 text-text-primary text-lg">Import</h3>
              <p className="text-sm text-text-secondary font-normal leading-relaxed">
                Upload a file, link, or image to polish into an event.
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
