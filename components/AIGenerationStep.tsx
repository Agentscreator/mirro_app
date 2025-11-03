"use client"

export default function AIGenerationStep({ onSelect }: { onSelect: (method: string) => void }) {
  return (
    <div>
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-normal text-text-primary mb-3">Create with AI</h2>
        <p className="text-text-secondary font-normal">Choose your event type</p>
      </div>

      <div className="space-y-4">
        {/* Single Day Event */}
        <button
          onClick={() => onSelect("single-day")}
          className="w-full glass-card rounded-3xl p-6 text-left hover:bg-white/60 transition-all duration-200 soft-shadow hover-lift group"
        >
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19,4H18V2H16V4H8V2H6V4H5C3.89,4 3,4.9 3,6V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V6A2,2 0 0,0 19,4M19,20H5V10H19V20M19,8H5V6H19V8M12,13H17V18H12V13Z"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2 text-text-primary text-lg">Single Day Event</h3>
              <p className="text-sm text-text-secondary font-normal leading-relaxed">
                Perfect for concerts, meetups, workshops, or one-time gatherings
              </p>
            </div>
          </div>
        </button>

        {/* Multi-Day Event */}
        <button
          onClick={() => onSelect("multi-day")}
          className="w-full glass-card rounded-3xl p-6 text-left hover:bg-white/60 transition-all duration-200 soft-shadow hover-lift group"
        >
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9,10H7V12H9V10M13,10H11V12H13V10M17,10H15V12H17V10M19,3H18V1H16V3H8V1H6V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2 text-text-primary text-lg">Multi-Day Event</h3>
              <p className="text-sm text-text-secondary font-normal leading-relaxed">
                Ideal for conferences, festivals, retreats, or week-long experiences
              </p>
            </div>
          </div>
        </button>

        {/* Repeating Event */}
        <button
          onClick={() => onSelect("repeating")}
          className="w-full glass-card rounded-3xl p-6 text-left hover:bg-white/60 transition-all duration-200 soft-shadow hover-lift group"
        >
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V13H7V11.5H11V7H12.5Z"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2 text-text-primary text-lg">Repeating Event</h3>
              <p className="text-sm text-text-secondary font-normal leading-relaxed">
                Great for weekly classes, recurring meetups, or ongoing programs
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
