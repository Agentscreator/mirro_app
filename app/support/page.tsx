'use client';

import Link from 'next/link';

export default function SupportPage() {
  return (
    <div 
      className="max-w-md mx-auto min-h-screen shadow-xl"
      style={{ background: "linear-gradient(135deg, #F5E8D5 0%, #F0DFC7 50%, #EBD6B9 100%)" }}
    >
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between">
        <Link 
          href="/" 
          className="p-2 bg-white/40 backdrop-blur-sm rounded-xl hover:bg-white/60 transition-all duration-200"
        >
          <svg className="w-5 h-5 text-text-secondary" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </Link>
        <h1 className="text-xl font-light text-text-primary">Contact Support</h1>
        <div className="w-9"></div> {/* Spacer for centering */}
      </header>

      {/* Content */}
      <div className="px-6 pb-6 space-y-4">
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
  );
}