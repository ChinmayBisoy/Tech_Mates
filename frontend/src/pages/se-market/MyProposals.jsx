import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import * as proposalAPI from '@/api/proposal.api';
import { chatAPI } from '@/api/chat.api';
import { ProposalCard } from '@/components/se-market/ProposalCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { useAuth } from '@/hooks/useAuth';
import { Briefcase, Filter, ChevronDown, ChevronUp } from 'lucide-react';

export default function MyProposals() {
  const navigate = useNavigate();
  const { isDeveloper } = useAuth();
  const [statusFilter, setStatusFilter] = useState(null);
  const [expandedStatus, setExpandedStatus] = useState(false);

  // Check user role
  if (!isDeveloper) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-900/20">
            <h2 className="text-lg font-bold text-red-900 dark:text-red-200">Access Denied</h2>
            <p className="mt-2 text-red-800 dark:text-red-300">Only developers can view their proposals.</p>
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

  // Fetch proposals
  const proposalsQuery = useQuery({
    queryKey: ['proposals', 'my-proposals', statusFilter],
    queryFn: () => proposalAPI.getMyProposals(1, 50, statusFilter),
  });

  // Withdraw proposal mutation
  const withdrawMutation = useMutation({
    mutationFn: proposalAPI.withdrawProposal,
    onSuccess: () => {
      toast.success('Proposal withdrawn successfully');
      proposalsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to withdraw proposal');
    },
  });

  // Edit proposal mutation
  const editMutation = useMutation({
    mutationFn: ({ proposalId, data }) => proposalAPI.updateProposal(proposalId, data),
    onSuccess: () => {
      toast.success('Proposal updated successfully');
      proposalsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update proposal');
    },
  });

  const rawProposals = Array.isArray(proposalsQuery.data)
    ? proposalsQuery.data
    : Array.isArray(proposalsQuery.data?.proposals)
      ? proposalsQuery.data.proposals
      : [];

  const proposals = rawProposals.map((proposal) => {
    const requirementObj = proposal?.requirement || proposal?.requirementId || {};
    const requirementId = requirementObj?._id || requirementObj?.id || proposal?.requirementId;
    const requirementClientObj = requirementObj?.client || requirementObj?.clientId || {};
    const counterpartUserId =
      requirementClientObj?._id ||
      requirementClientObj?.id ||
      proposal?.client?._id ||
      proposal?.client?.id ||
      proposal?.clientId;

    return {
      ...proposal,
      id: proposal?.id || proposal?._id,
      price: proposal?.price ?? proposal?.proposedPrice ?? 0,
      requirementId,
      counterpartUserId,
      requirement: {
        ...(proposal?.requirement || {}),
        ...(typeof requirementObj === 'object' ? requirementObj : {}),
        title: requirementObj?.title || proposal?.requirement?.title || 'Requirement',
      },
    };
  });
  const statusCounts = {
    pending: proposals.filter((p) => p.status === 'pending').length,
    accepted: proposals.filter((p) => p.status === 'accepted').length,
    rejected: proposals.filter((p) => p.status === 'rejected').length,
    withdrawn: proposals.filter((p) => p.status === 'withdrawn').length,
    contract_created: proposals.filter((p) => p.status === 'contract_created').length,
  };
  const statusOptions = [
    { label: 'All', value: null },
    { label: 'Pending', value: 'pending' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Withdrawn', value: 'withdrawn' },
    { label: 'Contract', value: 'contract_created' },
  ];

  const handleProposalAction = (action, proposalId) => {
    if (action === 'withdraw') {
      if (window.confirm('Are you sure you want to withdraw this proposal?')) {
        withdrawMutation.mutate(proposalId);
      }
    } else if (action === 'edit') {
      const targetProposal = proposals.find((proposal) => proposal.id === proposalId || proposal._id === proposalId);
      if (!targetProposal) {
        toast.error('Proposal not found');
        return;
      }

      const currentPrice = Math.ceil((targetProposal.price || targetProposal.proposedPrice || 0) / 100);
      const updatedPrice = window.prompt('Enter updated price (INR):', String(currentPrice));
      if (updatedPrice === null) return;

      const parsedPrice = Number(updatedPrice);
      if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        toast.error('Please enter a valid price');
        return;
      }

      const currentDelivery = Number(targetProposal.deliveryDays || 7);
      const updatedDelivery = window.prompt('Enter updated delivery days:', String(currentDelivery));
      if (updatedDelivery === null) return;

      const parsedDelivery = Number(updatedDelivery);
      if (!Number.isInteger(parsedDelivery) || parsedDelivery < 1) {
        toast.error('Please enter valid delivery days');
        return;
      }

      const updatedCoverLetter = window.prompt(
        'Update your cover letter (minimum 50 characters):',
        targetProposal.coverLetter || ''
      );
      if (updatedCoverLetter === null) return;

      const trimmedCoverLetter = updatedCoverLetter.trim();
      if (trimmedCoverLetter.length < 50) {
        toast.error('Cover letter must be at least 50 characters');
        return;
      }

      const proposedPrice = Math.round(parsedPrice * 100);
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + parsedDelivery);

      editMutation.mutate({
        proposalId,
        data: {
          coverLetter: trimmedCoverLetter,
          proposedPrice,
          deliveryDays: parsedDelivery,
          milestones: [
            {
              title: 'Project Delivery',
              description: 'Updated project delivery timeline and scope.',
              amount: proposedPrice,
              dueDate: dueDate.toISOString(),
            },
          ],
        },
      });
    } else if (action === 'message') {
      const targetProposal = proposals.find((proposal) => proposal.id === proposalId || proposal._id === proposalId);
      const counterpartUserId = targetProposal?.counterpartUserId;

      if (!counterpartUserId) {
        toast.error('Unable to find recipient for this chat');
        return;
      }

      chatAPI
        .createRoom({ userId: counterpartUserId })
        .then((room) => {
          const resolvedRoomId = room?._id || room?.id;

          if (!resolvedRoomId) {
            toast.error('Failed to open chat room');
            return;
          }

          navigate(`/chat/${resolvedRoomId}`);
        })
        .catch((error) => {
          toast.error(error?.response?.data?.message || 'Failed to open chat');
        });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-50 via-indigo-50 to-slate-100 py-10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-500/10" />
      <div className="pointer-events-none absolute right-0 top-24 h-80 w-80 rounded-full bg-indigo-300/25 blur-3xl dark:bg-indigo-500/10" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 rounded-2xl border border-indigo-200/70 bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-8 shadow-xl shadow-indigo-200/60 dark:border-transparent dark:bg-none dark:p-0 dark:shadow-none">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-2xl bg-white/15 p-2.5 ring-1 ring-white/35 backdrop-blur-sm">
              <Briefcase className="h-8 w-8 text-white stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-100">Service Exchange Market</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">My Proposals</h1>
            </div>
          </div>
          <p className="text-base text-indigo-100">
            Track the status of all proposals you've submitted
          </p>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {[
            { label: 'Total', count: proposals.length, status: null },
            { label: 'Pending', count: statusCounts.pending, status: 'pending' },
            { label: 'Accepted', count: statusCounts.accepted, status: 'accepted' },
            { label: 'Rejected', count: statusCounts.rejected, status: 'rejected' },
            { label: 'Contract', count: statusCounts.contract_created, status: 'contract_created' },
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

        {/* Proposals List */}
        {proposalsQuery.isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl bg-white/70 dark:bg-gray-800" />
            ))}
          </div>
        ) : proposalsQuery.error ? (
          <ErrorState
            title="Failed to load proposals"
            description="An error occurred while loading your proposals."
            onRetry={() => proposalsQuery.refetch()}
          />
        ) : proposals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-8 dark:border-gray-700 dark:bg-gray-900/70">
            <EmptyState
              icon={Briefcase}
              title="No proposals yet"
              description={
                statusFilter
                  ? 'You have no proposals with this status'
                  : 'Start submitting proposals to get noticed by clients!'
              }
            />
          </div>
        ) : (
          <div className="space-y-5">
            {proposals.map((proposal) => (
              <div key={proposal.id} className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.6)] backdrop-blur dark:border-gray-700 dark:bg-gray-900/75">
                <ProposalCard
                  proposal={proposal}
                  isDeveloper={true}
                  onAction={handleProposalAction}
                />

                {/* Additional Actions */}
                <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-200 pt-3 dark:border-gray-700">
                  {['pending', 'shortlisted'].includes(proposal.status) && (
                    <button
                      onClick={() => handleProposalAction('edit', proposal.id)}
                      disabled={editMutation.isPending}
                      className="flex-1 rounded-xl border border-primary-300 bg-white px-4 py-2.5 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50 disabled:opacity-50 dark:border-accent dark:bg-gray-900 dark:text-accent dark:hover:bg-accent/10"
                    >
                      Edit Proposal
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/se-market/requirement/${proposal.requirementId}`)}
                    className="flex flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-blue-700 to-blue-800 px-4 py-2.5 text-sm font-bold text-white transition-all hover:from-blue-800 hover:to-blue-900 hover:shadow-md hover:shadow-blue-800/35 dark:from-accent dark:to-accent/90"
                  >
                    View Requirement
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
