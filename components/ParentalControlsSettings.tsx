'use client';

import { useState, useEffect } from 'react';
import { Shield, MessageSquare, Calendar, Filter, Bell } from 'lucide-react';

interface ParentalControlsSettingsProps {
  userId: string;
  pin: string;
  onClose: () => void;
}

export default function ParentalControlsSettings({ userId, pin, onClose }: ParentalControlsSettingsProps) {
  const [settings, setSettings] = useState({
    messagingRestricted: true,
    eventCreationRestricted: true,
    contentFilteringEnabled: true,
    notificationsEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [disabling, setDisabling] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch(`/api/parental-controls/settings?userId=${userId}&pin=${pin}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load settings');
      }

      setSettings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof typeof settings, value: boolean) => {
    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/parental-controls/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          pin,
          settings: { [key]: value },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      setSettings(data.settings);
    } catch (err: any) {
      setError(err.message);
      // Revert the change
      setSettings((prev) => ({ ...prev, [key]: !value }));
    } finally {
      setSaving(false);
    }
  };

  const handleDisableParentalControls = async () => {
    setDisabling(true);
    setError('');

    try {
      const response = await fetch('/api/parental-controls/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, pin }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to disable parental controls');
      }

      // Update user in localStorage to remove minor status
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        user.ageCategory = 'adult';
        localStorage.setItem('user', JSON.stringify(user));
      }

      // Show success message and close
      alert('Parental controls have been disabled successfully. The page will refresh.');
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
      setShowDisableConfirm(false);
    } finally {
      setDisabling(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="text-blue-500" size={24} />
        <h2 className="text-xl font-semibold">Parental Control Settings</h2>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Calendar className="text-gray-600" size={20} />
            <div>
              <h3 className="font-medium">Event Creation Restrictions</h3>
              <p className="text-sm text-gray-600">Prevent creating public events</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.eventCreationRestricted}
              onChange={(e) => updateSetting('eventCreationRestricted', e.target.checked)}
              disabled={saving}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Filter className="text-gray-600" size={20} />
            <div>
              <h3 className="font-medium">Content Filtering</h3>
              <p className="text-sm text-gray-600">Hide mature or inappropriate content</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.contentFilteringEnabled}
              onChange={(e) => updateSetting('contentFilteringEnabled', e.target.checked)}
              disabled={saving}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Bell className="text-gray-600" size={20} />
            <div>
              <h3 className="font-medium">Guardian Notifications</h3>
              <p className="text-sm text-gray-600">Receive activity alerts via email</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={(e) => updateSetting('notificationsEnabled', e.target.checked)}
              disabled={saving}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-red-600 mb-3">Danger Zone</h3>
        <button
          onClick={() => setShowDisableConfirm(true)}
          className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 hover:bg-red-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-medium">Disable All Parental Controls</span>
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">
          This will remove all restrictions and cannot be undone
        </p>
      </div>

      <button
        onClick={onClose}
        className="w-full mt-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300"
      >
        Close
      </button>

      {/* Disable Confirmation Modal */}
      {showDisableConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Disable Parental Controls?</h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to completely disable parental controls? This will:
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>Remove all event creation restrictions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>Disable content filtering</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>Stop guardian notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>Delete the PIN and all parental control data</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> This action cannot be undone. You will need to set up parental controls again from scratch if you change your mind.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDisableConfirm(false)}
                disabled={disabling}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDisableParentalControls}
                disabled={disabling}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {disabling ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Disabling...</span>
                  </>
                ) : (
                  'Yes, Disable Controls'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
