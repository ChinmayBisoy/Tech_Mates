import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as requirementAPI from '@/api/requirement.api';
import * as proposalAPI from '@/api/proposal.api';
import { chatAPI } from '@/api/chat.api';
import { ProposalCard } from '@/components/se-market/ProposalCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { useAuth } from '@/hooks/useAuth';
import { Inbox, MessageSquare } from 'lucide-react';

export default function ProposalsReceived() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isUser } = useAuth();

  if (!isUser) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-900/20">
            <h2 className="text-lg font-bold text-red-900 dark:text-red-200">Access Denied</h2>
            <p className="mt-2 text-red-800 dark:text-red-300">Only clients can view received proposals.</p>
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

  const requirementsQuery = useQuery({
    queryKey: ['requirements', 'my-requirements'],
    queryFn: () => requirementAPI.getMyRequirements(1, 100),
  });

  const proposalsQuery = useQuery({
    queryKey: ['proposals', 'received', requirementsQuery.data],
    enabled: requirementsQuery.isSuccess,
    queryFn: async () => {
      const requirements = Array.isArray(requirementsQuery.data) ? requirementsQuery.data : [];

      if (requirements.length === 0) {
        return [];
      }

      const grouped = await Promise.all(
        requirements.map(async (requirement) => {
          const requirementId = requirement?._id || requirement?.id;

          if (!requirementId) {
            return [];
          }

          const response = await proposalAPI.getRequirementProposals(requirementId, 1, 100);
          const proposals = Array.isArray(response)
            ? response
            : Array.isArray(response?.proposals)
              ? response.proposals
              : [];

          return proposals.map((proposal) => {
            const developer = proposal?.developer || proposal?.developerId || {};

            return {
              ...proposal,
              id: proposal?.id || proposal?._id,
              proposedPrice: proposal?.proposedPrice ?? proposal?.price ?? 0,
              developer: {
                id: developer?.id || developer?._id,
                name: developer?.name || 'Developer',
                avatar: developer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(developer?.name || 'Developer')}`,
              },
              requirement: {
                _id: requirementId,
                title: requirement?.title || 'Requirement',
                clientName: requirement?.client?.name,
                client: requirement?.client,
              },
            };
          });
        })
      );

      return grouped.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
  });

  const proposals = Array.isArray(proposalsQuery.data) ? proposalsQuery.data : [];

  const actionMutation = useMutation({
    mutationFn: async ({ action, proposalId }) => {
      if (action === 'accept') {
        return proposalAPI.acceptProposal(proposalId);
      }
      if (action === 'reject') {
        return proposalAPI.rejectProposal(proposalId);
      }
      if (action === 'shortlist') {
        return proposalAPI.shortlistProposal(proposalId);
      }
      return null;
    },
    onSuccess: (_, variables) => {
      if (variables.action === 'accept') {
        toast.success('Proposal accepted successfully');
      } else if (variables.action === 'reject') {
        toast.success('Proposal rejected');
      } else if (variables.action === 'shortlist') {
        toast.success('Proposal shortlisted');
      }
      proposalsQuery.refetch();
      requirementsQuery.refetch();
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update proposal status');
    },
  });

  if (requirementsQuery.isLoading || proposalsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-4 h-7 w-56 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="space-y-4">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="h-28 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (requirementsQuery.error || proposalsQuery.error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <ErrorState
            title="Unable to load proposals"
            message="There was a problem loading proposals received for your requirements."
            onRetry={() => {
              requirementsQuery.refetch();
              proposalsQuery.refetch();
            }}
          />
        </div>
      </div>
    );
  }

  if ((Array.isArray(requirementsQuery.data) ? requirementsQuery.data.length : 0) === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <EmptyState
            icon={Inbox}
            title="No requirements yet"
            description="Post your first requirement to start receiving developer proposals."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-50 via-indigo-50 to-slate-100 py-10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-500/10" />
      <div className="pointer-events-none absolute right-0 top-24 h-80 w-80 rounded-full bg-indigo-300/25 blur-3xl dark:bg-indigo-500/10" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-2xl border border-indigo-200/70 bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-8 shadow-xl shadow-indigo-200/60 dark:border-transparent dark:bg-none dark:p-0 dark:shadow-none">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-2xl bg-white/15 p-2.5 ring-1 ring-white/35 backdrop-blur-sm">
                  <MessageSquare className="h-8 w-8 text-white stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-100">Service Exchange Market</p>
                  <h1 className="text-3xl font-bold tracking-tight text-white">Proposals Received</h1>
                </div>
              </div>
              <p className="text-sm text-indigo-100">Review proposals submitted by developers for your requirements.</p>
            </div>
            <div className="inline-flex w-fit items-center rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm">
              {proposals.length} total
            </div>
          </div>
        </div>

        {proposals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-8 dark:border-gray-700 dark:bg-gray-900/70">
            <EmptyState
              icon={Inbox}
              title="No proposals received yet"
              description="Developers will appear here after they submit proposals to your requirements."
            />
          </div>
        ) : (
          <div className="space-y-5">
            {proposals.map((proposal) => (
              <div key={proposal.id} className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.6)] backdrop-blur dark:border-gray-700 dark:bg-gray-900/75">
                <ProposalCard
                  proposal={proposal}
                  isDeveloper={false}
                  onAction={async (action, proposalId) => {
                    if (action === 'message') {
                      const targetProposal = proposals.find(
                        (item) => item.id === proposalId || item._id === proposalId
                      );
                      const developerId =
                        targetProposal?.developer?.id ||
                        targetProposal?.developer?._id ||
                        targetProposal?.developerId;

                      if (!developerId) {
                        toast.error('Unable to open chat for this proposal');
                        return;
                      }

                      try {
                        const room = await chatAPI.createRoom({ userId: developerId });
                        const roomId = room?._id || room?.id;

                        if (!roomId) {
                          toast.error('Failed to open chat room');
                          return;
                        }

                        navigate(`/chat/${roomId}`);
                      } catch (error) {
                        toast.error(error?.response?.data?.message || 'Failed to open chat');
                      }
                      return;
                    }
                    actionMutation.mutate({ action, proposalId });
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
