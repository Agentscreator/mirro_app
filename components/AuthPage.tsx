"use client"

import React, { useState } from "react"
import Image from "next/image"

interface AuthPageProps {
  onAuthSuccess: () => void
  sharedEventTitle?: string
}

export default function AuthPage({ onAuthSuccess, sharedEventTitle }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [ageVerified, setAgeVerified] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!isLogin && !formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    }

    if (!isLogin && !formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!isLogin && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!isLogin && !ageVerified) {
      newErrors.ageVerified = "You must verify that you are at least 13 years old"
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
    <div className="min-h-screen flex flex-col lg:flex-row lg:items-center lg:justify-center">
      {/* Black Top Section with Logo */}
      <div className="bg-black pt-16 pb-20 px-6 lg:flex-1 lg:min-h-screen lg:flex lg:flex-col lg:items-center lg:justify-center animate-fade-in" style={{ background: 'linear-gradient(to bottom, #000000 0%, #0a0a0a 70%, transparent 100%)' }}>
        {/* App Icon - Seamlessly integrated with black background */}
        <div className="mb-8 relative animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <div className="w-28 h-28 lg:w-40 lg:h-40 mx-auto relative">
            <Image
              src="/app-icon.png"
              alt="App Logo"
              width={160}
              height={160}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </div>

        {/* Elegant Welcome Text */}
        <div className="text-center max-w-sm mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-4xl lg:text-6xl font-extralight tracking-tight text-white mb-2 letterspacing-tight">
            {isLogin ? "Welcome" : "Let's Get Started"}
          </h1>
          {sharedEventTitle && (
            <p className="text-sm lg:text-base text-gray-300 font-light leading-relaxed mt-3">
              {isLogin ? "Sign in" : "Create an account"} to join "{sharedEventTitle}"
            </p>
          )}
        </div>
      </div>

      {/* Beige Form Section with Curved Top */}
      <div className="flex-1 bg-gradient-to-b from-cream-100 to-cream-200 -mt-10 lg:mt-0 lg:rounded-none rounded-t-[3rem] px-6 lg:px-12 pt-12 pb-8 lg:min-h-screen lg:flex lg:flex-col lg:justify-center animate-slide-up-delayed">
        {/* Minimalist Auth Toggle */}
        <div className="mb-10 flex items-center justify-center space-x-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <button
            type="button"
            onClick={() => {
              setIsLogin(true)
              setErrors({})
              setAgeVerified(false)
            }}
            className={`text-sm font-light tracking-wider transition-all duration-300 pb-2 ${
              isLogin
                ? "text-text-primary border-b border-taupe-700"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false)
              setErrors({})
              setAgeVerified(false)
            }}
            className={`text-sm font-light tracking-wider transition-all duration-300 pb-2 ${
              !isLogin
                ? "text-text-primary border-b border-taupe-700"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            SIGN UP
          </button>
        </div>

        {/* Elegant Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm lg:max-w-md mx-auto space-y-6">
        {!isLogin && (
          <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <input
              type="text"
              placeholder="Full Name"
              className={`w-full px-0 py-3 text-base bg-transparent border-0 border-b-2 focus:outline-none focus:ring-0 transition-all duration-300 text-text-primary placeholder-text-light font-light ${
                errors.name ? "border-red-400" : "border-taupe-300 focus:border-taupe-600"
              }`}
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1 font-light">{errors.name}</p>}
          </div>
        )}

        <div className="animate-slide-up" style={{ animationDelay: isLogin ? '0.5s' : '0.6s' }}>
          <input
            type="text"
            placeholder="Username"
            className={`w-full px-0 py-3 text-base bg-transparent border-0 border-b-2 focus:outline-none focus:ring-0 transition-all duration-300 text-text-primary placeholder-text-light font-light ${
              errors.username ? "border-red-400" : "border-taupe-300 focus:border-taupe-600"
            }`}
            value={formData.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
          />
          {errors.username && <p className="text-red-500 text-xs mt-1 font-light">{errors.username}</p>}
        </div>

        {!isLogin && (
          <div className="animate-slide-up" style={{ animationDelay: '0.7s' }}>
            <input
              type="email"
              placeholder="Email"
              className={`w-full px-0 py-3 text-base bg-transparent border-0 border-b-2 focus:outline-none focus:ring-0 transition-all duration-300 text-text-primary placeholder-text-light font-light ${
                errors.email ? "border-red-400" : "border-taupe-300 focus:border-taupe-600"
              }`}
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 font-light">{errors.email}</p>}
          </div>
        )}

        <div className="animate-slide-up" style={{ animationDelay: isLogin ? '0.6s' : '0.8s' }}>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className={`w-full px-0 py-3 pr-10 text-base bg-transparent border-0 border-b-2 focus:outline-none focus:ring-0 transition-all duration-300 text-text-primary placeholder-text-light font-light ${
                errors.password ? "border-red-400" : "border-taupe-300 focus:border-taupe-600"
              }`}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-text-light hover:text-text-secondary transition-colors duration-200"
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m6.121-6.121L21 21m-3.879-6.121l-4.242-4.242" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1 font-light">{errors.password}</p>}
        </div>

        {!isLogin && (
          <div className="animate-slide-up" style={{ animationDelay: '0.9s' }}>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className={`w-full px-0 py-3 pr-10 text-base bg-transparent border-0 border-b-2 focus:outline-none focus:ring-0 transition-all duration-300 text-text-primary placeholder-text-light font-light ${
                  errors.confirmPassword ? "border-red-400" : "border-taupe-300 focus:border-taupe-600"
                }`}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-text-light hover:text-text-secondary transition-colors duration-200"
              >
                {showConfirmPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m6.121-6.121L21 21m-3.879-6.121l-4.242-4.242" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-light">{errors.confirmPassword}</p>}
          </div>
        )}

        {!isLogin && (
          <div className="mt-6 animate-slide-up" style={{ animationDelay: '1s' }}>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="ageVerification"
                checked={ageVerified}
                onChange={(e) => {
                  setAgeVerified(e.target.checked)
                  if (errors.ageVerified) {
                    setErrors(prev => ({ ...prev, ageVerified: '' }))
                  }
                }}
                className={`w-4 h-4 text-taupe-600 border-2 rounded focus:ring-0 focus:ring-offset-0 transition-all ${
                  errors.ageVerified ? "border-red-400" : "border-taupe-400"
                }`}
              />
              <label htmlFor="ageVerification" className="text-xs text-text-muted font-light leading-relaxed">
                I verify that I am at least 13 years old
              </label>
            </div>
            {errors.ageVerified && <p className="text-red-500 text-xs mt-1 font-light">{errors.ageVerified}</p>}
          </div>
        )}

        {errors.general && (
          <div className="mt-4 p-3 bg-red-50/50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-xs text-center font-light">{errors.general}</p>
          </div>
        )}

          {/* Elegant Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-12 py-4 bg-gray-900 text-white text-sm font-light tracking-widest uppercase rounded-full hover:bg-black hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl animate-slide-up"
            style={{ animationDelay: isLogin ? '0.7s' : '1.1s' }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

        {/* Forgot Password Link */}
        {isLogin && (
          <div className="text-center mt-6 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <button
              type="button"
              onClick={() => window.location.href = '/forgot-password'}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors font-light"
            >
              Forgot Password?
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 max-w-sm mx-auto animate-fade-in" style={{ animationDelay: isLogin ? '0.9s' : '1.2s' }}>
          <p className="text-text-muted text-xs font-light">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setErrors({})
                setAgeVerified(false)
              }}
              className="text-taupe-600 hover:text-taupe-700 transition-colors underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
          
          {/* Support Link */}
          <div className="mt-8 pb-8">
            <button
              type="button"
              onClick={() => window.location.href = '/support'}
              className="inline-flex items-center text-text-muted hover:text-text-secondary transition-colors text-xs font-light"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Need Help?
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}