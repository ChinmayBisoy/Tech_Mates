import { Link } from 'react-router-dom';
import { formatINR } from '@/utils/formatCurrency';
import { SkillTags } from '@/components/profile/SkillTags';
import { Briefcase, Clock, MapPin } from 'lucide-react';

export function RequirementCard({ requirement }) {
  const requirementId = requirement.id || requirement._id;
  const client = requirement.client || requirement.postedBy || {};
  const clientName = client.name || 'Client';
  const clientAvatar = client.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(clientName)}`;
  const skills = requirement.skills || requirement.skillsRequired || [];
  const budget = requirement.budget || {
    min: Number(requirement.budgetMin || 0),
    max: Number(requirement.budgetMax || 0),
  };

  const skillsList = skills.slice(0, 3) || [];
  const skillsCount = skills.length || 0;
  const proposalCount = requirement.proposalCount || 0;
  const daysAgo = Math.floor(
    (Date.now() - new Date(requirement.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  const deadline = new Date(requirement.deadline);
  const daysLeft = Math.ceil((deadline - Date.now()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0;

  return (
    <Link
      to={`/se-market/requirement/${requirementId}`}
      className="group block rounded-xl border border-slate-200/90 bg-white/90 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_18px_35px_-25px_rgba(59,130,246,0.45)] dark:border-gray-700 dark:bg-gray-900/95"
    >
      {/* Header with client avatar and metadata */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={clientAvatar}
            alt={clientName}
            className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-sm"
          />
          <div className="flex-1">
            <p className="text-base font-bold text-slate-900 dark:text-white">
              {clientName}
            </p>
            <p className="text-sm text-slate-500 dark:text-gray-400">
              Posted {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 ring-1 ring-primary/20 dark:bg-accent/10 dark:ring-accent/30">
          <Briefcase className="h-4 w-4 text-black dark:text-accent stroke-[2]" />
          <span className="text-xs font-bold text-slate-800 dark:text-accent">
            {proposalCount} proposals
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="mb-2 line-clamp-2 text-xl font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-primary dark:text-white dark:group-hover:text-accent">
        {requirement.title}
      </h3>

      {/* Description snippet */}
      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-gray-300">
        {requirement.description}
      </p>

      {/* Skills */}
      {skillsList.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          <SkillTags skills={skillsList} />
          {skillsCount > 3 && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-gray-800 dark:text-gray-300">
              +{skillsCount - 3}
            </span>
          )}
        </div>
      )}

      {/* Budget and deadline */}
      <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-gray-700">
        {/* Budget */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600 dark:text-gray-400">Budget</span>
          <span className="text-lg font-black text-slate-900 dark:text-accent">
            {formatINR(budget.min)} - {formatINR(budget.max)}
          </span>
        </div>

        {/* Deadline */}
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm dark:bg-slate-800/70">
          <Clock className="h-4 w-4 text-slate-600 dark:text-gray-300" />
          <span className={isOverdue ? 'font-semibold text-red-600 dark:text-red-400' : 'font-medium text-slate-700 dark:text-gray-300'}>
            {isOverdue
              ? `Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''}`
              : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
          </span>
        </div>

        {/* Location if applicable */}
        {requirement.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4" />
            <span>{requirement.location}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
