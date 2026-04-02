import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    sms: false,
    marketingEmails: false,
    profileVisibility: 'public',
  });

  const handleSave = () => {
    // TODO: Save settings to backend
    alert('Settings saved! (This is a placeholder)');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-primary dark:text-accent hover:underline mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

      {/* Notification Preferences */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Notification Preferences
        </h2>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">Email notifications</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.sms}
              onChange={(e) => setSettings({ ...settings, sms: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">SMS notifications</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.marketingEmails}
              onChange={(e) => setSettings({ ...settings, marketingEmails: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">Marketing emails</span>
          </label>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Privacy Settings
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Profile Visibility
            </label>
            <select
              value={settings.profileVisibility}
              onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="public">Public (Everyone can see)</option>
              <option value="private">Private (Logged-in users only)</option>
              <option value="hidden">Hidden (Nobody)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-white hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90"
      >
        <Save className="w-5 h-5" />
        Save Settings
      </button>
    </div>
  );
}
