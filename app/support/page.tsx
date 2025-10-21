'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, MessageCircle, HelpCircle, ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-amber-700 hover:text-amber-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Mirro
          </Link>
          <h1 className="text-4xl font-light text-amber-900 mb-2">Support Center</h1>
          <p className="text-lg text-amber-700">We're here to help you create beautiful events</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Support Form */}
          <div className="md:col-span-2">
            <Card className="border-amber-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100">
                <CardTitle className="text-amber-900 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contact Support
                </CardTitle>
                <CardDescription className="text-amber-700">
                  Tell us how we can help you with Mirro
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-amber-900">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="border-amber-200 focus:border-amber-400"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-amber-900">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="border-amber-200 focus:border-amber-400"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-amber-900">Category</Label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full mt-1 px-3 py-2 border border-amber-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
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
                    <Label htmlFor="subject" className="text-amber-900">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="border-amber-200 focus:border-amber-400"
                      placeholder="Brief description of your issue"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-amber-900">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      className="border-amber-200 focus:border-amber-400 min-h-[120px]"
                      placeholder="Please describe your issue or question in detail..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Support Request'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Support Information */}
          <div className="space-y-6">
            <Card className="border-amber-200">
              <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100">
                <CardTitle className="text-amber-900 flex items-center text-lg">
                  <Mail className="w-5 h-5 mr-2" />
                  Contact Info
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-amber-900">Email Support</p>
                    <p className="text-amber-700">mirrosocial@gmail.com</p>
                  </div>
                  <div>
                    <p className="font-medium text-amber-900">Response Time</p>
                    <p className="text-amber-700">Within 24 hours</p>
                  </div>
                  <div>
                    <p className="font-medium text-amber-900">Website</p>
                    <a 
                      href="https://www.mirro2.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:text-amber-800 underline"
                    >
                      www.mirro2.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200">
              <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100">
                <CardTitle className="text-amber-900 flex items-center text-lg">
                  <HelpCircle className="w-5 h-5 mr-2" />
                  Quick Help
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-amber-900">Common Issues</p>
                    <ul className="text-amber-700 space-y-1 mt-1">
                      <li>• Account login problems</li>
                      <li>• Event creation help</li>
                      <li>• Mobile app issues</li>
                      <li>• Video upload troubles</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-amber-900">Before Contacting</p>
                    <ul className="text-amber-700 space-y-1 mt-1">
                      <li>• Try refreshing the page</li>
                      <li>• Check your internet connection</li>
                      <li>• Update your mobile app</li>
                      <li>• Clear browser cache</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <h3 className="font-medium text-amber-900 mb-2">About Mirro</h3>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    We're dedicated to helping you create beautiful, meaningful events. 
                    Our tools are designed to be simple, elegant, and powerful.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}