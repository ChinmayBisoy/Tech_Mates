import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function AdminPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary dark:text-accent hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-900/20">
          <p className="text-red-800 dark:text-red-400 font-semibold">
            Access Denied: Admin privileges required
          </p>
        </div>
      </div>
    );
  }

  const adminStats = [
    { label: 'Total Users', value: '1,234' },
    { label: 'Active Projects', value: '567' },
    { label: 'Total Revenue', value: '₹45,67,890' },
    { label: 'Platform Fee', value: '₹12,34,567' },
  ];

  const adminActions = [
    { label: 'Manage Users', href: '#' },
    { label: 'Manage Projects', href: '#' },
    { label: 'Review Disputes', href: '#' },
    { label: 'View Analytics', href: '#' },
    { label: 'Manage Reports', href: '#' },
    { label: 'System Settings', href: '#' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-primary dark:text-accent hover:underline mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {adminStats.map((stat, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Admin Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Admin Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {adminActions.map((action, idx) => (
            <a
              key={idx}
              href={action.href}
              className="rounded-lg border border-gray-300 p-4 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors"
            >
              <p className="font-semibold text-gray-900 dark:text-white">
                {action.label}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
