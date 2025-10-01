"use client"

interface EventViewToggleProps {
  viewMode: 'all' | 'created' | 'joined'
  isManageMode: boolean
  onViewModeChange: (mode: 'all' | 'created' | 'joined') => void
  onManageModeToggle: (enabled: boolean) => void
}

export default function EventViewToggle({ 
  viewMode, 
  isManageMode, 
  onViewModeChange, 
  onManageModeToggle 
}: EventViewToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      {/* View Mode Selector */}
      <div className="flex glass-card rounded-full p-1">
        <button
          onClick={() => onViewModeChange('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
            viewMode === 'all' && !isManageMode
              ? 'bg-gradient-to-r from-sand-400 to-sand-500 text-white shadow-sm'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          All
        </button>
        <button
          onClick={() => onViewModeChange('joined')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
            viewMode === 'joined' && !isManageMode
              ? 'bg-gradient-to-r from-sand-400 to-sand-500 text-white shadow-sm'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          Joined
        </button>
        <button
          onClick={() => onViewModeChange('created')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
            viewMode === 'created' && !isManageMode
              ? 'bg-gradient-to-r from-sand-400 to-sand-500 text-white shadow-sm'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          Created
        </button>
      </div>

      {/* Manage Mode Toggle - only show for created events */}
      {viewMode === 'created' && (
        <button
          onClick={() => onManageModeToggle(!isManageMode)}
          className={`
            relative inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
            transition-all duration-300 hover-lift
            ${isManageMode ? "gradient-primary text-white shadow-lg" : "glass-card text-text-secondary hover:bg-white/60"}
          `}
        >
          <svg
            className={`w-3 h-3 mr-1 transition-transform duration-300 ${isManageMode ? "rotate-180" : ""}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
          </svg>
          {isManageMode ? "Exit" : "Manage"}
        </button>
      )}
    </div>
  )
}