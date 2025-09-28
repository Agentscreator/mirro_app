"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"

interface AuthPageProps {
  onAuthSuccess: () => void
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!isLogin && !formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    } else if (formData.username.length < 8) {
      newErrors.username = "Username must be at least 8 characters"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Store user session (you might want to use a more secure method)
        localStorage.setItem('user', JSON.stringify(data.user))
        onAuthSuccess()
      } else {
        setErrors({ general: data.error || 'Authentication failed' })
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="px-6 py-8 pb-24">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 glass-card rounded-full mx-auto mb-6 flex items-center justify-center soft-shadow">
          <svg className="w-10 h-10 text-taupe-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-normal text-text-primary mb-3">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-text-secondary font-normal">
          {isLogin ? "Sign in to continue to your events" : "Join us to start creating amazing events"}
        </p>
      </div>

      {/* Auth Toggle */}
      <div className="glass-card rounded-2xl p-1 mb-8 soft-shadow">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
              isLogin
                ? "gradient-primary text-white shadow-md"
                : "text-text-secondary hover:bg-white/40"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
              !isLogin
                ? "gradient-primary text-white shadow-md"
                : "text-text-secondary hover:bg-white/40"
            }`}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium mb-3 text-text-secondary">Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              className={`w-full px-5 py-4 text-base rounded-2xl border glass-card focus:ring-2 focus:ring-taupe-400 focus:border-transparent transition-all duration-200 text-text-primary placeholder-text-light ${
                errors.name ? "border-red-400" : "border-cream-300"
              }`}
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
            {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name}</p>}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-3 text-text-secondary">Username</label>
          <input
            type="text"
            placeholder="Choose a username"
            className={`w-full px-5 py-4 text-base rounded-2xl border glass-card focus:ring-2 focus:ring-taupe-400 focus:border-transparent transition-all duration-200 text-text-primary placeholder-text-light ${
              errors.username ? "border-red-400" : "border-cream-300"
            }`}
            value={formData.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
          />
          {errors.username && <p className="text-red-500 text-sm mt-2">{errors.username}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 text-text-secondary">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className={`w-full px-5 py-4 text-base rounded-2xl border glass-card focus:ring-2 focus:ring-taupe-400 focus:border-transparent transition-all duration-200 text-text-primary placeholder-text-light ${
              errors.password ? "border-red-400" : "border-cream-300"
            }`}
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
          />
          {errors.password && <p className="text-red-500 text-sm mt-2">{errors.password}</p>}
        </div>

        {!isLogin && (
          <div>
            <label className="block text-sm font-medium mb-3 text-text-secondary">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              className={`w-full px-5 py-4 text-base rounded-2xl border glass-card focus:ring-2 focus:ring-taupe-400 focus:border-transparent transition-all duration-200 text-text-primary placeholder-text-light ${
                errors.confirmPassword ? "border-red-400" : "border-cream-300"
              }`}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-2">{errors.confirmPassword}</p>}
          </div>
        )}

        {errors.general && (
          <div className="glass-card rounded-2xl p-4 border border-red-300">
            <p className="text-red-600 text-sm text-center">{errors.general}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full gradient-primary text-white py-4 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isLogin ? "Signing In..." : "Creating Account..."}
            </div>
          ) : (
            isLogin ? "Sign In" : "Create Account"
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="text-center mt-8">
        <p className="text-text-muted text-sm">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-taupe-600 font-medium hover:text-taupe-700 transition-colors"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  )
}