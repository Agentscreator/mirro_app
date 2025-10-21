'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import Link from 'next/link';

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Support request sent successfully! We\'ll get back to you soon.');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          category: 'general'
        });
      } else {
        toast.error(result.message || 'Failed to send support request. Please try again.');
      }
    } catch (error) {
      console.error('Support form error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div 
      className="max-w-md mx-auto min-h-screen shadow-xl"
      style={{ background: "linear-gradient(135deg, #F5E8D5 0%, #F0DFC7 50%, #EBD6B9 100%)" }}
    >
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between">
        <Link 
          href="/" 
          className="p-2 glass-card rounded-xl hover:bg-white/10 transition-all duration-200"
        >
          <svg className="w-5 h-5 text-text-secondary" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </Link>
        <h1 className="text-xl font-normal text-text-primary">Support</h1>
        <div className="w-9"></div> {/* Spacer for centering */}
      </header>

      {/* Content */}
      <div className="px-6 pb-6 space-y-6">
        {/* Support Info */}
        <div className="glass-card rounded-2xl p-4 hover-lift">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-text-primary">Email Support</p>
              <p className="text-sm text-text-secondary">mirrosocial@gmail.com</p>
            </div>
          </div>
          <p className="text-xs text-text-muted">Response within 24 hours</p>
        </div>

        {/* Contact Form */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-medium text-text-primary mb-4">Send a Message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 glass-card rounded-xl border-0 text-text-primary placeholder-text-light focus:ring-2 focus:ring-taupe-400 transition-all duration-200"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 glass-card rounded-xl border-0 text-text-primary placeholder-text-light focus:ring-2 focus:ring-taupe-400 transition-all duration-200"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 glass-card rounded-xl border-0 text-text-primary focus:ring-2 focus:ring-taupe-400 transition-all duration-200"
              >
                <option value="general">General Support</option>
                <option value="technical">Technical Issue</option>
                <option value="account">Account Help</option>
                <option value="events">Event Creation</option>
                <option value="mobile">Mobile App</option>
                <option value="billing">Billing & Payments</option>
                <option value="feature">Feature Request</option>
                <option value="bug">Bug Report</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Subject *</label>
              <input
                type="text"
                name="subject"
                required
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-4 py-3 glass-card rounded-xl border-0 text-text-primary placeholder-text-light focus:ring-2 focus:ring-taupe-400 transition-all duration-200"
                placeholder="Brief description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Message *</label>
              <textarea
                name="message"
                required
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 glass-card rounded-xl border-0 text-text-primary placeholder-text-light focus:ring-2 focus:ring-taupe-400 transition-all duration-200 resize-none"
                placeholder="Describe your issue or question..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full gradient-primary text-white py-4 rounded-xl font-medium hover-lift disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* About */}
        <div className="glass-card rounded-2xl p-4 text-center">
          <h3 className="font-medium text-text-primary mb-2">About Mirro</h3>
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            Where beautiful events begin. We help you create meaningful moments with elegant, AI-enhanced tools.
          </p>
          <a 
            href="https://www.mirro2.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-taupe-600 hover:text-taupe-700 text-sm underline transition-colors"
          >
            www.mirro2.com
          </a>
        </div>
      </div>
      <Toaster />
    </div>
  );
}