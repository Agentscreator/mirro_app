"use client"

interface BottomNavigationProps {
  currentPage: "profile" | "create"
  onPageChange: (page: "profile" | "create") => void
}

export default function BottomNavigation({ currentPage, onPageChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md">
      <div className="mx-6 mb-6 px-8 py-3 bg-taupe-800/95 backdrop-blur-md rounded-full shadow-xl">
        <div className="flex items-center justify-around">
          <button
            onClick={() => onPageChange("profile")}
            className={`p-3 rounded-full transition-all duration-300 ${
              currentPage === "profile"
                ? "bg-white text-taupe-800"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </button>

          <button
            onClick={() => onPageChange("create")}
            className={`p-3 rounded-full transition-all duration-300 ${
              currentPage === "create"
                ? "bg-white text-taupe-800"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}
