import { formatINR } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { CheckCircle2, MessageSquare, TrendingUp } from 'lucide-react';
import { cn } from '@/utils/cn';

const proposalStatusColor = {
  pending: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900',
  accepted: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900',
  rejected: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-900',
  withdrawn: 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-900',
  shortlisted: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-900',
  contract_created: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-900',
};

const proposalStatusLabel = {
  pending: 'Pending Review',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  shortlisted: 'Shortlisted',
  contract_created: 'Contract Created',
};

export function ProposalCard({ proposal, isDeveloper = false, onAction = null }) {
  const isBoosted = proposal.boosted;
  const proposalId = proposal?.id || proposal?._id;
  const requirementObj = proposal?.requirement || proposal?.requirementId || {};
  const requirementTitle = requirementObj?.title || proposal?.requirementTitle || 'Requirement';
  const clientName = requirementObj?.client?.name || requirementObj?.clientName || 'Client';
  const clientAvatar = requirementObj?.client?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(clientName)}`;
  const priceInMinorUnit = proposal?.price ?? proposal?.proposedPrice ?? 0;

  return (
    <div className={cn(
      'group rounded-xl border bg-white/90 p-5 transition-all dark:bg-gray-900/95',
      isBoosted
        ? 'border-accent/40 shadow-[0_18px_35px_-25px_rgba(168,85,247,0.45)]'
        : 'border-slate-200/90 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_18px_35px_-25px_rgba(59,130,246,0.35)] dark:border-gray-700'
    )}>
      {/* Header with status and boost badge */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <img
              src={isDeveloper ? clientAvatar : proposal?.developer?.avatar}
              alt={isDeveloper ? clientName : proposal?.developer?.name}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
            <div className="flex-1">
              <p className="text-xl font-bold leading-tight text-slate-900 dark:text-white sm:text-2xl">
                {isDeveloper ? clientName : proposal?.developer?.name}
              </p>
              <p className="text-sm text-slate-500 dark:text-gray-400">
                {formatDate(new Date(proposal.createdAt))}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isBoosted && (
            <div className="flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1.5 ring-1 ring-accent/20">
              <TrendingUp className="h-3 w-3 text-accent" />
              <span className="text-xs font-semibold text-accent">Boosted</span>
            </div>
          )}
          <div className={cn('rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm', proposalStatusColor[proposal.status])}>
            {proposalStatusLabel[proposal.status]}
          </div>
        </div>
      </div>

      {/* Proposal details for requirement owner */}
      {!isDeveloper && (
        <div className="mb-4">
          <p className="line-clamp-2 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            {requirementTitle}
          </p>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-gray-300">
            {proposal.coverLetter}
          </p>
        </div>
      )}

      {/* Proposal details for developer */}
      {isDeveloper && (
        <div className="mb-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {requirementTitle}
          </p>
        </div>
      )}

      {/* Stats row */}
      <div className="mb-4 grid grid-cols-3 gap-3 border-t border-slate-200 pt-4 dark:border-gray-700">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-gray-400">Price</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-primary-300">{formatINR(priceInMinorUnit)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-gray-400">Delivery</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{proposal.deliveryDays}d</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-gray-400">Milestones</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{proposal.milestones?.length || 0}</p>
        </div>
      </div>

      {/* Actions row */}
      {onAction && (
        <div className="flex flex-wrap gap-2">
          {proposal.status === 'pending' && !isDeveloper && (
            <>
              <button
                onClick={() => onAction('accept', proposalId)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-md hover:shadow-green-700/35 dark:from-green-700 dark:to-green-600"
              >
                <CheckCircle2 className="h-4 w-4" />
                Accept
              </button>
              <button
                onClick={() => onAction('reject', proposalId)}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Reject
              </button>
            </>
          )}
          {isDeveloper && proposal.status === 'pending' && (
            <>
              <button
                onClick={() => onAction('withdraw', proposalId)}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Withdraw
              </button>
            </>
          )}
          {!isDeveloper && proposal.status === 'pending' && (
            <>
              <button
                onClick={() => onAction('shortlist', proposalId)}
                className="flex-1 rounded-xl border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 dark:border-accent dark:text-accent dark:hover:bg-accent/10"
              >
                Shortlist
              </button>
            </>
          )}
          <button
            onClick={() => onAction('message', proposalId)}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <MessageSquare className="h-4 w-4 text-black dark:text-accent stroke-[2]" />
          </button>
        </div>
      )}
    </div>
  );
}
