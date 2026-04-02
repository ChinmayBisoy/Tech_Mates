import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as contractAPI from '@/api/contract.api';
import { ContractCard } from '@/components/contracts/ContractCard';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { useAuth } from '@/hooks/useAuth';
import { Briefcase, Filter, ChevronDown, ChevronUp } from 'lucide-react';

export default function ContractList() {
  const { user, isUser } = useAuth();
  const [statusFilter, setStatusFilter] = useState(null);
  const [expandedStatus, setExpandedStatus] = useState(false);

  // Fetch contracts
  const contractsQuery = useQuery({
    queryKey: ['contracts', statusFilter],
    queryFn: () => contractAPI.fetchContracts(1, 50, statusFilter),
  });

  const rawContracts = Array.isArray(contractsQuery.data)
    ? contractsQuery.data
    : Array.isArray(contractsQuery.data?.contracts)
      ? contractsQuery.data.contracts
      : [];

  const contracts = rawContracts.map((contract) => {
    const client = contract?.client || contract?.clientId || {};
    const developer = contract?.developer || contract?.developerId || {};

    return {
      ...contract,
      id: contract?.id || contract?._id,
      client: {
        id: client?.id || client?._id || contract?.clientId,
        name: client?.name || 'Client',
        avatar: client?.avatar,
      },
      developer: {
        id: developer?.id || developer?._id || contract?.developerId,
        name: developer?.name || 'Developer',
        avatar: developer?.avatar,
      },
      isClientView: isUser && String(client?.id || client?._id || contract?.clientId) === String(user?.id || user?._id),
    };
  });
  const statusCounts = {
    active: contracts.filter((c) => c.status === 'active').length,
    completed: contracts.filter((c) => c.status === 'completed').length,
    disputed: contracts.filter((c) => c.status === 'disputed').length,
    cancelled: contracts.filter((c) => c.status === 'cancelled').length,
  };
  const statusOptions = [
    { label: 'All', value: null },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
    { label: 'Disputed', value: 'disputed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-50 via-indigo-50 to-slate-100 py-10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-500/10" />
      <div className="pointer-events-none absolute right-0 top-24 h-80 w-80 rounded-full bg-indigo-300/25 blur-3xl dark:bg-indigo-500/10" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.45)] backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-2.5 ring-1 ring-primary/20 dark:bg-accent/10 dark:ring-accent/20">
              <Briefcase className="h-8 w-8 text-black dark:text-accent stroke-[2.5]" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">My Contracts</h1>
          </div>
          <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300">
            Manage your active contracts and track milestones
          </p>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {[
            { label: 'Total', count: contracts.length, status: null },
            { label: 'Active', count: statusCounts.active, status: 'active' },
            { label: 'Completed', count: statusCounts.completed, status: 'completed' },
            { label: 'Disputed', count: statusCounts.disputed, status: 'disputed' },
            { label: 'Cancelled', count: statusCounts.cancelled, status: 'cancelled' },
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
        <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-900/70">
          <div className="flex flex-wrap items-center justify-between gap-3">
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
              className="rounded-md px-2 py-1 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 dark:text-accent dark:hover:bg-accent/10"
            >
              Clear filter
            </button>
          )}
          </div>

          {expandedStatus && (
            <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-200/80 pt-3 dark:border-gray-700">
              {statusOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => {
                    setStatusFilter(option.value);
                    setExpandedStatus(false);
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                    statusFilter === option.value
                      ? 'bg-primary text-white dark:bg-accent dark:text-gray-950'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Contracts List */}
        {contractsQuery.isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : contractsQuery.error ? (
          <ErrorState
            title="Failed to load contracts"
            description="An error occurred while loading your contracts."
            onRetry={() => contractsQuery.refetch()}
          />
        ) : contracts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-8 dark:border-gray-700 dark:bg-gray-900/70">
            <EmptyState
              icon={Briefcase}
              title="No contracts yet"
              description={
                statusFilter
                  ? 'You have no contracts with this status'
                  : 'Start by accepting proposals to create contracts!'
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {contracts.map((contract) => (
              <ContractCard key={contract.id} contract={contract} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
