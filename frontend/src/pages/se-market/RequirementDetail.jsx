import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as requirementAPI from '@/api/requirement.api';
import * as proposalAPI from '@/api/proposal.api';
import { ProposalForm } from '@/components/se-market/ProposalForm';
import { ProposalCard } from '@/components/se-market/ProposalCard';
import { SkillTags } from '@/components/profile/SkillTags';
import { ErrorState } from '@/components/shared/ErrorState';
import { useAuth } from '@/hooks/useAuth';
import { formatINR } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { ArrowLeft, Calendar, DollarSign, MapPin, Users, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RequirementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isDeveloper, isUser } = useAuth();

  // Fetch requirement
  const requirementQuery = useQuery({
    queryKey: ['requirement', id],
    queryFn: () => requirementAPI.getRequirementDetail(id),
  });

  // Fetch proposals
  const proposalsQuery = useQuery({
    queryKey: ['requirement', id, 'proposals'],
    queryFn: () => requirementAPI.getRequirementProposals(id),
    enabled: requirementQuery.isSuccess,
  });

  // Check if developers has already proposed
  const hasProposed = proposalsQuery.data?.proposals?.some((p) => p.developer.id === user?.id);

  const requirement = requirementQuery.data;
  const proposals = proposalsQuery.data?.proposals || [];

  const client = requirement?.client || requirement?.postedBy || {};
  const clientId = client?.id || client?._id || (typeof requirement?.postedBy === 'string' ? requirement.postedBy : null);
  const clientName = client?.name || 'Client';
  const clientAvatar = client?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(clientName)}`;
  const skills = requirement?.skills || requirement?.skillsRequired || [];
  const budget = requirement?.budget || {
    min: Number(requirement?.budgetMin || 0),
    max: Number(requirement?.budgetMax || 0),
  };

  if (requirementQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-primary hover:underline dark:text-accent"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <div className="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-900">
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  if (requirementQuery.error || !requirement) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-primary hover:underline dark:text-accent"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <ErrorState
            title="Requirement not found"
            description="The requirement you're looking for doesn't exist or has been deleted."
            onRetry={() => navigate('/se-market/browse')}
          />
        </div>
      </div>
    );
  }

  const daysLeft = Math.ceil((new Date(requirement.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-primary transition-colors hover:text-primary/80 dark:text-accent dark:hover:text-accent/80"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 break-words [overflow-wrap:anywhere] dark:text-white">{requirement.title}</h1>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Posted {formatDate(new Date(requirement.createdAt))}</p>
                </div>
                <div className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold ${
                  requirement.status === 'open'
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {requirement.status === 'open' ? 'Open' : 'Closed'}
                </div>
              </div>

              {/* Client Info */}
              <div className="mt-6 flex items-center gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
                <img
                  src={clientAvatar}
                  alt={clientName}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{clientName}</p>
                  {client?.createdAt && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">Member since {formatDate(new Date(client.createdAt))}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">About this requirement</h2>
              <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-gray-700 dark:text-gray-300">{requirement.description}</p>

              {/* Skills */}
              <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Required Skills</h3>
                <SkillTags skills={skills} />
              </div>

              {/* Location if applicable */}
              {requirement.location && (
                <div className="mt-4 flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <MapPin className="h-5 w-5" />
                  <span className="break-words [overflow-wrap:anywhere]">{requirement.location}</span>
                </div>
              )}
            </div>

            {/* Proposals Section (for requirement owner) */}
            {isUser && clientId === user?.id && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                  <Users className="h-5 w-5" />
                  Proposals ({proposals.length})
                </h2>

                {proposalsQuery.isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                    ))}
                  </div>
                ) : proposals.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
                    <p className="text-gray-600 dark:text-gray-400">No proposals yet. Share this requirement to attract developers!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {proposals.map((proposal) => (
                      <ProposalCard
                        key={proposal.id}
                        proposal={proposal}
                        isDeveloper={false}
                        onAction={(action, proposalId) => {
                          if (action === 'accept') {
                            proposalAPI.acceptProposal(proposalId).then(() => {
                              toast.success('Proposal accepted!');
                              proposalsQuery.refetch();
                            });
                          } else if (action === 'reject') {
                            proposalAPI.rejectProposal(proposalId).then(() => {
                              toast.success('Proposal rejected');
                              proposalsQuery.refetch();
                            });
                          }
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Details Card */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <h3 className="mb-4 font-bold text-gray-900 dark:text-white">Project Details</h3>

              <div className="space-y-4">
                {/* Budget */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <DollarSign className="h-5 w-5" />
                    Budget
                  </div>
                  <p className="mt-1 text-lg font-bold text-primary dark:text-accent">
                    {formatINR(budget.min)} - {formatINR(budget.max)}
                  </p>
                </div>

                {/* Deadline */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-5 w-5" />
                    Deadline
                  </div>
                  <p className={`mt-1 font-bold ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                    {isOverdue
                      ? `Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''}`
                      : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                  </p>
                </div>

                {/* Proposals Count */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="h-5 w-5" />
                    Proposals Received
                  </div>
                  <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">{proposals.length}</p>
                </div>
              </div>
            </div>

            {/* Proposal Form (for developers) */}
            {isDeveloper && requirement.status === 'open' && !hasProposed && (
              <ProposalForm requirementId={id} requirement={requirement} onSuccess={() => {
                proposalsQuery.refetch();
                toast.success('Proposal submitted successfully!');
              }} />
            )}

            {/* Already Proposed */}
            {isDeveloper && hasProposed && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-200">You've already proposed</h4>
                    <p className="mt-1 text-sm text-blue-800 dark:text-blue-300">Your proposal is under review by the client.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Closed */}
            {requirement.status === 'closed' && (
              <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">This requirement is closed</h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">No new proposals can be submitted.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Not Logged In */}
            {!user && (
              <div className="rounded-lg border border-primary bg-primary/5 p-4 dark:border-accent dark:bg-accent/5">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <button onClick={() => navigate('/login')} className="font-semibold text-primary hover:underline dark:text-accent">
                    Sign in
                  </button>
                  {' '}to submit a proposal
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
