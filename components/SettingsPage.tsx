"use client" 

import React, { useState } from "react"

interface SettingsPageProps {
  isOpen: boolean
  onClose: () => void
  onAccountDeleted?: () => void
  onEditProfile?: () => void
}

export default function SettingsPage({ isOpen, onClose, onAccountDeleted, onEditProfile }: SettingsPageProps) {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)
  const [showContactSupport, setShowContactSupport] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        alert('Please log in to delete your account')
        return
      }

      const user = JSON.parse(storedUser)

      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      })

      if (response.ok) {
        // Clear local storage
        localStorage.removeItem('user')
        
        // Close settings and trigger logout
        onClose()
        if (onAccountDeleted) {
          onAccountDeleted()
        }
        
        alert('Your account has been deleted successfully.')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to delete account. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Error deleting account. Please try again.')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirmation(false)
    }
  }

  if (!isOpen) return null

  const privacyPolicyContent = `Privacy Policy

Effective as of October 2025

This Privacy Policy describes how Gravity, Inc. processes personal information that we collect through our digital or online properties or services that link to this Privacy Policy (including as applicable, our website, mobile application, marketing activities, live events, and other activities described in this Privacy Policy (collectively, the "Service")). Mirro may provide additional or supplemental privacy policies to individuals for specific products or services that we offer at the time we collect personal information.

Mirro provides an AI-enhanced platform that generates and optimizes events in seconds. This Privacy Policy does not apply to information that we process on behalf of our business customers while providing the Mirro platform to them. Our use of information that we process on behalf of our business customers may be governed by our agreements with such customers. If you have concerns regarding your personal information that we process on behalf of a business customer, please direct your concerns to that enterprise customer.

NOTICE TO EUROPEAN USERS: Please see the Notice to European Users section for additional information for individuals located in the European Economic Area or United Kingdom below.

Personal Information We Collect

Information you provide to us. Personal information you may provide to us through the Service or otherwise includes:
• Contact data, such as your first and last name, email address, billing and mailing addresses, professional title, company name, and phone number.
• Demographic data, such as your city, state, country of residence, postal code, and age.
• Profile data, such as your username, password, and biographical information.
• Communications data based on our exchanges with you, including when you contact us through the Service, social media, or otherwise.
• Transactional data, such as information relating to or needed to complete your orders on or through the Service, including payment details, order numbers, and transaction history.
• Marketing data, such as your preferences for receiving our marketing communications and details about your engagement with them.
• Event data, such as event names, descriptions, venues, dates, attendees, and other information you provide when creating events through Mirro.
• User-generated content, such as photos, images, videos, event materials, presentations, and other content or information that you generate, transmit, or otherwise make available on the Service, as well as associated metadata.
• Contacts data, with your opt-in consent, you may choose to provide the Service with access to your contacts for event invitation purposes.
• Other data not specifically listed here, which we will use as described in this Privacy Policy or as otherwise disclosed at the time of collection.

How We Use Your Personal Information

We may use your personal information for the following purposes or as otherwise described at the time of collection:

Service delivery and operations. We may use your personal information to:
• Provide, operate, and improve the Service and our business.
• Personalize the Service, including remembering the devices from which you have previously logged in and remembering your selections and preferences as you navigate the Service.
• Communicate with you about the Service, including by sending Service-related announcements, updates, security alerts, and support and administrative messages.
• Communicate with you about events or contests in which you participate.
• Understand your needs and interests, and personalize your experience with the Service and our communications.
• Provide support for the Service and respond to your requests, questions, and feedback.
• Facilitate event creation, customization, and distribution through our AI-enhanced platform.

Research and development. We may use your personal information for research and development purposes, including to analyze and improve the Service and our business, develop new products and services, and train our artificial intelligence models.

Marketing. We, our service providers, and our third-party advertising partners may collect and use your personal information for marketing purposes, including direct marketing communications and service improvement analytics.

Compliance and protection. We may use your personal information to comply with applicable laws, protect rights and safety, audit internal processes, and prevent fraudulent or harmful activity.

How We Share Your Personal Information

We may share your personal information with service providers, payment processors, business partners, professional advisors, authorities when required by law, and other users of the Service when you choose to make information public.

3. App Tracking Transparency (ATT)

If your app collects data for tracking across other apps or websites (for example, with ad SDKs like Facebook, Google Ads, etc.), Apple requires an App Tracking Transparency prompt before tracking. We may use tracking technologies to personalize content or advertising across third-party platforms. In such cases, we request your consent as required by Apple's App Tracking Transparency framework. By using the Service, you agree to our use of such tracking technologies in accordance with your device settings and applicable privacy laws.

4. Disclosure of Apple-Specific Requirements

We do not use HealthKit, HomeKit, or other Apple-provided frameworks to collect personal information. If this changes in the future, we will update this policy and comply with all of Apple's requirements. Our data collection and usage practices are designed to respect your privacy while delivering core Service functionality.

5. User-Generated Content and Moderation

User-generated content you submit, including photos, videos, event materials, and other content, may be visible to other users or the public depending on your privacy settings and choices. We reserve the right to moderate or remove content that violates our community guidelines, infringes on intellectual property rights, or breaches legal obligations. You may request deletion of your user-generated content at any time by contacting us. Upon your request, we will make reasonable efforts to remove such content from the Service and our systems, though backup copies may be retained for legal compliance purposes.

Your Choices

• Opt-out of communications: You may opt-out of marketing-related emails by following the unsubscribe instructions.
• Cookies: For information about cookies, see our Cookie Notice.
• Declining to provide information: We need certain personal information to provide services.

Security

We employ technical, organizational, and physical safeguards to protect your personal information. However, no system is completely secure.

International Data Transfers

Your personal information may be transferred to locations where privacy laws may differ from your jurisdiction.

Children

The Service is not intended for use by anyone under 16 years of age.

Contact Us

Email: mirrosocial@gmail.com
Mail: Gravity, Inc., 4050 Rocky Cir, Tampa, FL 33613

For European users, additional rights and protections apply under GDPR, including rights to access, correct, delete, transfer, restrict, and object to processing of your personal information.`

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-cream-50 to-cream-100 rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-taupe-200/30">
          <h2 className="text-2xl font-extralight text-text-primary tracking-wide">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-taupe-100/50 rounded-full transition-all duration-200"
          >
            <svg className="w-5 h-5 text-text-muted" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {showDeleteConfirmation ? (
            <div className="space-y-6">
              {/* Back button */}
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="flex items-center space-x-2 text-text-muted hover:text-text-primary transition-colors duration-200 mb-2 font-light text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Back</span>
              </button>

              {/* Delete Confirmation */}
              <div className="p-6 glass-card rounded-xl border-2 border-red-200">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary">Delete Account</h3>
                  <p className="text-text-secondary">
                    Are you sure you want to delete your account? This action cannot be undone.
                  </p>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>This will permanently delete:</strong>
                    </p>
                    <ul className="text-sm text-red-700 mt-2 space-y-1">
                      <li>• Your profile and account information</li>
                      <li>• All events you've created</li>
                      <li>• Your event attendance records</li>
                      <li>• All associated data</li>
                    </ul>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setShowDeleteConfirmation(false)}
                      className="flex-1 px-4 py-2 glass-card rounded-xl text-text-secondary hover:bg-white/10 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      {isDeleting ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <span>Delete Account</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : !showPrivacyPolicy && !showContactSupport && !showEditProfile ? (
            <div className="space-y-3">
              {/* Edit Profile */}
              <button
                onClick={() => {
                  onClose()
                  if (onEditProfile) {
                    onEditProfile()
                  }
                }}
                className="w-full p-5 bg-white/40 backdrop-blur-sm rounded-2xl hover:bg-white/60 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-taupe-600 rounded-xl flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-text-primary font-light text-base">Edit Profile</p>
                      <p className="text-text-muted text-xs font-light">Update your profile information</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-text-muted" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>

              {/* Contact Support */}
              <button
                onClick={() => setShowContactSupport(true)}
                className="w-full p-5 bg-white/40 backdrop-blur-sm rounded-2xl hover:bg-white/60 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-taupe-700 rounded-xl flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-text-primary font-light text-base">Contact Support</p>
                      <p className="text-text-muted text-xs font-light">Get help with your account</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-text-muted" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>

              {/* Privacy Policy */}
              <button
                onClick={() => setShowPrivacyPolicy(true)}
                className="w-full p-5 bg-white/40 backdrop-blur-sm rounded-2xl hover:bg-white/60 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-taupe-600 rounded-xl flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-text-primary font-light text-base">Privacy Policy</p>
                      <p className="text-text-muted text-xs font-light">View our privacy policy</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-text-muted" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>

              {/* Danger Zone */}
              <div className="mt-10 pt-6 border-t border-taupe-200/30">
                <h3 className="text-xs font-light text-red-600 mb-3 tracking-wide uppercase">Danger Zone</h3>
                <button
                  onClick={() => setShowDeleteConfirmation(true)}
                  className="w-full flex items-center justify-between p-5 bg-red-50/50 backdrop-blur-sm rounded-2xl border border-red-200/50 hover:border-red-300 hover:bg-red-50 transition-all duration-300 shadow-sm"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012-2h4a1 1 0 110 2v6a1 1 0 11-2 0V9a1 1 0 00-1-1H9a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-red-700 font-light text-base">Delete Account</p>
                      <p className="text-red-600 text-xs font-light">Permanently delete your data</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ) : showContactSupport ? (
            <div className="space-y-6">
              {/* Back button */}
              <button
                onClick={() => setShowContactSupport(false)}
                className="flex items-center space-x-2 text-text-muted hover:text-text-primary transition-colors duration-200 mb-2 font-light text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Back</span>
              </button>

              {/* Contact Support Content */}
              <div className="space-y-4">
                {/* Email Support Card */}
                <div className="p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-taupe-700 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-light text-text-primary mb-1">Email Support</h3>
                      <a href="mailto:mirrosocial@gmail.com" className="text-taupe-700 text-sm font-light hover:underline">
                        mirrosocial@gmail.com
                      </a>
                      <p className="text-xs text-text-muted font-light mt-2">Response within 24 hours</p>
                    </div>
                  </div>
                </div>

                {/* Support Info */}
                <div className="p-6 bg-white/30 backdrop-blur-sm rounded-2xl">
                  <h3 className="text-sm font-light text-text-primary mb-3">How We Can Help</h3>
                  <ul className="space-y-2 text-xs text-text-muted font-light">
                    <li className="flex items-start space-x-2">
                      <span className="text-taupe-600 mt-0.5">•</span>
                      <span>Technical support & troubleshooting</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-taupe-600 mt-0.5">•</span>
                      <span>Account & profile assistance</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-taupe-600 mt-0.5">•</span>
                      <span>Event creation & management help</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-taupe-600 mt-0.5">•</span>
                      <span>Feature requests & feedback</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-taupe-600 mt-0.5">•</span>
                      <span>Bug reports & issues</span>
                    </li>
                  </ul>
                </div>

                {/* Quick Tip */}
                <div className="p-4 bg-amber-50/50 backdrop-blur-sm rounded-2xl border border-amber-200/30">
                  <p className="text-xs text-amber-900 font-light leading-relaxed">
                    <span className="font-normal">💡 Tip:</span> Include your username and a detailed description of your issue for faster assistance.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Back button */}
              <button
                onClick={() => setShowPrivacyPolicy(false)}
                className="flex items-center space-x-2 text-text-muted hover:text-text-primary transition-colors duration-200 mb-2 font-light text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Back</span>
              </button>

              {/* Privacy Policy Content */}
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-line text-text-secondary text-sm leading-relaxed">
                  {privacyPolicyContent}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}