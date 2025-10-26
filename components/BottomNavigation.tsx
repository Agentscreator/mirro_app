"use client"

interface BottomNavigationProps {
  currentPage: "profile" | "create"
  onPageChange: (page: "profile" | "create") => void
}

export default function BottomNavigation({ currentPage, onPageChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md">
      <div className="glass-card mx-4 mb-4 rounded-3xl px-8 py-4 shadow-lg">
        <div className="flex items-center justify-around">
          <button
            onClick={() => onPageChange("create")}
            className={`flex flex-col items-center space-y-1 py-2 px-6 rounded-2xl transition-all duration-200 ${
              currentPage === "create"
                ? "bg-taupe-800 text-white shadow-md"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              ></path>
            </svg>
            <span className="text-xs font-light">Create</span>
          </button>

          <button
            onClick={() => onPageChange("profile")}
            className={`flex flex-col items-center space-y-1 py-2 px-6 rounded-2xl transition-all duration-200 ${
              currentPage === "profile"
                ? "bg-taupe-800 text-white shadow-md"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              ></path>
            </svg>
            <span className="text-xs font-light">Profile</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
