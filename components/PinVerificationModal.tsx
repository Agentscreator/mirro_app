'use client';

import { useState } from 'react';
import { X, Lock } from 'lucide-react';

interface PinVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

export default function PinVerificationModal({ isOpen, onClose, userId, onSuccess }: PinVerificationModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/parental-controls/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, pin }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.lockedUntil) {
          setLockedUntil(data.lockedUntil);
          setError(data.error);
        } else if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
          setError(`Incorrect PIN. ${data.attemptsRemaining} attempts remaining.`);
        } else {
          setError(data.error || 'Verification failed');
        }
        setPin('');
        return;
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Lock className="text-blue-500" size={24} />
            <h2 className="text-xl font-semibold">Enter PIN</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Enter your 4-digit PIN to access parental control settings.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
              placeholder="••••"
              required
              disabled={!!lockedUntil}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!lockedUntil && (
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify PIN'}
            </button>
          )}

          <button
            type="button"
            onClick={() => {/* TODO: Implement forgot PIN flow */}}
            className="w-full text-blue-500 text-sm hover:underline"
          >
            Forgot PIN?
          </button>
        </form>
      </div>
    </div>
  );
}
