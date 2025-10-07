"use client"

interface EventViewToggleProps {
  isManageMode: boolean
  onManageModeToggle: (enabled: boolean) => void
  eventViewMode: 'created' | 'joined' | 'all'
  onEventViewModeChange: (mode: 'created' | 'joined' | 'all') => void
}

export default function EventViewToggle({ 
  isManageMode, 
  onManageModeToggle,
  eventViewMode,
  onEventViewModeChange
}: EventViewToggleProps) {
  return (
    <div className="flex items-center space-x-3">
      {/* Event View Mode Toggle */}
      <div className="flex items-center glass-card rounded-full p-1">
        <button
          onClick={() => onEventViewModeChange('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
            eventViewMode === 'all' 
              ? 'gradient-primary text-white shadow-sm' 
              : 'text-text-secondary hover:bg-white/40'
          }`}
        >
          All
        </button>
        <button
          onClick={() => onEventViewModeChange('created')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
            eventViewMode === 'created' 
              ? 'gradient-primary text-white shadow-sm' 
              : 'text-text-secondary hover:bg-white/40'
          }`}
        >
          Created
        </button>
        <button
          onClick={() => onEventViewModeChange('joined')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
            eventViewMode === 'joined' 
              ? 'gradient-primary text-white shadow-sm' 
              : 'text-text-secondary hover:bg-white/40'
          }`}
        >
          Joined
        </button>
      </div>

      {/* Manage Mode Toggle */}
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
    </div>
  )
}