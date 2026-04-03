import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import * as requirementAPI from '@/api/requirement.api';
import { RequirementCard } from '@/components/se-market/RequirementCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { useAuth } from '@/hooks/useAuth';
import { Briefcase, Plus, Filter, ChevronDown, ChevronUp } from 'lucide-react';

export default function MyRequirements() {
  const navigate = useNavigate();
  const { isUser } = useAuth();
  const [statusFilter, setStatusFilter] = useState(null);
  const [expandedStatus, setExpandedStatus] = useState(false);

  // Check user role
  if (!isUser) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-900/20">
            <h2 className="text-lg font-bold text-red-900 dark:text-red-200">Access Denied</h2>
            <p className="mt-2 text-red-800 dark:text-red-300">Only users can post and manage requirements.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fetch requirements
  const requirementsQuery = useQuery({
    queryKey: ['requirements', 'my-requirements', statusFilter],
    queryFn: () => requirementAPI.getMyRequirements(1, 50, statusFilter),
  });

  // Delete requirement mutation
  const deleteMutation = useMutation({
    mutationFn: requirementAPI.deleteRequirement,
    onSuccess: () => {
      toast.success('Requirement deleted successfully');
      requirementsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete requirement');
    },
  });

  // Close requirement mutation
  const closeMutation = useMutation({
    mutationFn: requirementAPI.closeRequirement,
    onSuccess: () => {
      toast.success('Requirement closed successfully');
      requirementsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to close requirement');
    },
  });

  const requirements = Array.isArray(requirementsQuery.data) ? requirementsQuery.data : [];
  const statusCounts = {
    open: requirements.filter((r) => r.status === 'open').length,
    closed: requirements.filter((r) => r.status === 'closed').length,
  };

  const getRequirementId = (requirement) => requirement?._id || requirement?.id;

  const handleAction = (action, requirementId) => {
    if (!requirementId) {
      toast.error('Invalid requirement ID');
      return;
    }

    if (action === 'close') {
      if (window.confirm('Are you sure you want to close this requirement? New proposals won\'t be accepted.')) {
        closeMutation.mutate(requirementId);
      }
    } else if (action === 'delete') {
      if (window.confirm('Are you sure you want to delete this requirement? This action cannot be undone.')) {
        deleteMutation.mutate(requirementId);
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-50 via-indigo-50 to-slate-100 py-10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-500/10" />
      <div className="pointer-events-none absolute right-0 top-24 h-80 w-80 rounded-full bg-indigo-300/25 blur-3xl dark:bg-indigo-500/10" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 rounded-2xl border border-indigo-200/70 bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-8 shadow-xl shadow-indigo-200/60 dark:border-transparent dark:bg-none dark:p-0 dark:shadow-none">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-2xl bg-white/15 p-2.5 ring-1 ring-white/35 backdrop-blur-sm">
                  <Briefcase className="h-8 w-8 text-white stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-100">Service Exchange Market</p>
                  <h1 className="text-3xl font-extrabold tracking-tight text-white">My Requirements</h1>
                </div>
              </div>
              <p className="text-base text-indigo-100">
                Manage projects and view proposals from developers
              </p>
            </div>
            <button
              onClick={() => navigate('/se-market/post-requirement')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/95 px-6 py-3 font-bold text-indigo-700 shadow-md shadow-indigo-900/20 transition-all hover:-translate-y-0.5 hover:bg-white"
            >
              <Plus className="h-5 w-5" />
              Post Requirement
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'Total', count: requirements.length, status: null },
            { label: 'Open', count: statusCounts.open, status: 'open' },
            { label: 'Closed', count: statusCounts.closed, status: 'closed' },
          ].map((stat) => (
            <button
              key={stat.label}
              onClick={() => setStatusFilter(stat.status)}
              className={`rounded-2xl px-5 py-6 text-left transition-all ${
                statusFilter === stat.status
                  ? 'border border-primary/30 bg-gradient-to-br from-primary/10 via-white to-primary/5 shadow-md shadow-primary/20 dark:border-accent/40 dark:from-accent/20 dark:via-gray-900 dark:to-accent/10'
                  : 'border border-slate-200/90 bg-white/85 shadow-sm hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-900/80'
              }`}
            >
              <p className="text-4xl font-black leading-none text-slate-900 dark:text-white">{stat.count}</p>
              <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{stat.label}</p>
            </button>
          ))}
        </div>

        {/* Filter Section */}
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-900/70">
          <button
            onClick={() => setExpandedStatus(!expandedStatus)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Filter className="h-4 w-4" />
            Status
            {expandedStatus ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {statusFilter && (
            <button
              onClick={() => setStatusFilter(null)}
              className="text-sm font-semibold text-primary hover:underline dark:text-accent"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Requirements List */}
        {requirementsQuery.isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl bg-white/70 dark:bg-gray-800" />
            ))}
          </div>
        ) : requirementsQuery.error ? (
          <ErrorState
            title="Failed to load requirements"
            description="An error occurred while loading your requirements."
            onRetry={() => requirementsQuery.refetch()}
          />
        ) : requirements.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-8 dark:border-gray-700 dark:bg-gray-900/70">
            <EmptyState
              icon={Briefcase}
              title="No requirements yet"
              description={
                statusFilter
                  ? 'You have no requirements with this status'
                  : 'Post a requirement to get started!'
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {requirements.map((requirement) => (
              <div key={getRequirementId(requirement)} className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.6)] backdrop-blur dark:border-gray-700 dark:bg-gray-900/75">
                <RequirementCard requirement={requirement} />

                {/* Actions Overlay */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate(`/se-market/requirement/${getRequirementId(requirement)}`)}
                    className="flex-1 rounded-xl bg-gradient-to-r from-blue-700 to-blue-800 px-4 py-2.5 text-sm font-bold text-white transition-all hover:from-blue-800 hover:to-blue-900 hover:shadow-md hover:shadow-blue-800/35 dark:from-accent dark:to-accent/90"
                  >
                    View Details
                  </button>
                  {requirement.status === 'open' && (
                    <button
                      onClick={() => handleAction('close', getRequirementId(requirement))}
                      disabled={closeMutation.isPending}
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Close
                    </button>
                  )}
                  <button
                    onClick={() => handleAction('delete', getRequirementId(requirement))}
                    disabled={deleteMutation.isPending}
                    className="rounded-xl border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
