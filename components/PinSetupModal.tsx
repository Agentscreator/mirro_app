'use client';

import { useState, useEffect } from 'react';
import { X, Mail, CheckCircle } from 'lucide-react';

interface PinSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  guardianEmail: string;
  onSuccess: () => void;
}

export default function PinSetupModal({ isOpen, onClose, userId, guardianEmail, onSuccess }: PinSetupModalProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setupPin();
    }
  }, [isOpen]);

  const setupPin = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/parental-controls/setup-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to setup PIN');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Parental Controls Setup</h2>
          {success && (
            <button onClick={handleContinue} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          )}
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Setting up parental controls...</p>
          </div>
        )}

        {error && (
          <div className="space-y-4">
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
            <button
              onClick={setupPin}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600"
            >
              Try Again
            </button>
            <button
              onClick={handleContinue}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300"
            >
              Skip for Now
            </button>
          </div>
        )}

        {success && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">PIN Sent to Guardian!</h3>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Mail className="text-blue-600 mt-0.5" size={20} />
                <div>
                  <p className="text-sm text-blue-900 font-medium mb-1">
                    Check your guardian's email
                  </p>
                  <p className="text-sm text-blue-700">
                    A 4-digit PIN has been sent to <strong>{guardianEmail}</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-3">
                <strong>What's next?</strong>
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">1.</span>
                  <span>Your guardian will receive the PIN via email</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">2.</span>
                  <span>They can use it to access Parental Controls in Settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">3.</span>
                  <span>They can adjust restrictions as needed</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleContinue}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600"
            >
              Continue to App
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
