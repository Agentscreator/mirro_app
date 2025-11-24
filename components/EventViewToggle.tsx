"use client"

interface EventViewToggleProps {
  isManageMode: boolean
  onManageModeToggle: (enabled: boolean) => void
  eventViewMode: 'upcoming' | 'all' | 'created'
  onEventViewModeChange: (mode: 'upcoming' | 'all' | 'created') => void
}

export default function EventViewToggle({ 
  isManageMode, 
  onManageModeToggle,
  eventViewMode,
  onEventViewModeChange
}: EventViewToggleProps) {
  return (
    <div className="flex items-center space-x-4">
      {/* Event View Mode Toggle - More Spread Out */}
      <div className="flex items-center glass-card rounded-full p-1.5 gap-1">
        <button
          onClick={() => onEventViewModeChange('upcoming')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
            eventViewMode === 'upcoming' 
              ? 'gradient-primary text-white shadow-sm' 
              : 'text-text-secondary hover:bg-white/40'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => onEventViewModeChange('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
            eventViewMode === 'all' 
              ? 'gradient-primary text-white shadow-sm' 
              : 'text-text-secondary hover:bg-white/40'
          }`}
        >
          All
        </button>
        <button
          onClick={() => onEventViewModeChange('created')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
            eventViewMode === 'created' 
              ? 'gradient-primary text-white shadow-sm' 
              : 'text-text-secondary hover:bg-white/40'
          }`}
        >
          Created
        </button>
      </div>

      {/* Manage Mode Toggle */}
      <button
        onClick={() => onManageModeToggle(!isManageMode)}
        className={`
          relative inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium
          transition-all duration-300 hover-lift
          ${isManageMode ? "gradient-primary text-white shadow-lg" : "glass-card text-text-secondary hover:bg-white/60"}
        `}
      >
        <svg
          className={`w-3 h-3 mr-1.5 transition-transform duration-300 ${isManageMode ? "rotate-180" : ""}`}
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