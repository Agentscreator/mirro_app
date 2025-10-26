"use client"

interface BottomNavigationProps {
  currentPage: "profile" | "create"
  onPageChange: (page: "profile" | "create") => void
}

export default function BottomNavigation({ currentPage, onPageChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md z-40">
      {/* Elegant gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cream-100 via-cream-100/80 to-transparent pointer-events-none" />
      
      {/* Navigation bar - minimal and elegant */}
      <div className="relative px-6 pb-6">
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-full px-2 py-2 shadow-sm">
          <div className="flex items-center justify-around gap-2">
            <button
              onClick={() => onPageChange("create")}
              className={`flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${
                currentPage === "create"
                  ? "bg-taupe-700 text-white scale-105"
                  : "text-taupe-400 hover:text-taupe-600 hover:bg-white/50 active:scale-95"
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>

            <button
              onClick={() => onPageChange("profile")}
              className={`flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${
                currentPage === "profile"
                  ? "bg-taupe-700 text-white scale-105"
                  : "text-taupe-400 hover:text-taupe-600 hover:bg-white/50 active:scale-95"
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
