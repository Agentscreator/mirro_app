"use client"

interface ManageEventsToggleProps {
  isManageMode: boolean
  onToggle: (enabled: boolean) => void
}

export default function ManageEventsToggle({ isManageMode, onToggle }: ManageEventsToggleProps) {
  return (
    <button
      onClick={() => onToggle(!isManageMode)}
      className={`
        relative inline-flex items-center px-4 py-2 rounded-full text-sm font-medium
        transition-all duration-300 hover-lift
        ${isManageMode ? "gradient-primary text-white shadow-lg" : "glass-card text-text-secondary hover:bg-white/60"}
      `}
    >
      <svg
        className={`w-4 h-4 mr-2 transition-transform duration-300 ${isManageMode ? "rotate-180" : ""}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
      </svg>
      {isManageMode ? "Exit Manage" : "Manage Events"}
    </button>
  )
}
