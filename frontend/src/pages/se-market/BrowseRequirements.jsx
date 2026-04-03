import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as requirementAPI from '@/api/requirement.api';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { formatINR } from '@/utils/formatCurrency';
import { formatDeadline } from '@/utils/formatDate';
import { Briefcase, Clock3 } from 'lucide-react';

const truncateText = (value, maxLength = 140) => {
  if (typeof value !== 'string') return '';
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}...`;
};

export default function BrowseRequirements() {
  const [hiddenRequirementIds, setHiddenRequirementIds] = useState([]);

  const { data: openRequirementsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['requirements', 'open', 'opportunities-page'],
    queryFn: () => requirementAPI.fetchOpenRequirements(50),
  });

  const allRequirements = Array.isArray(openRequirementsResponse?.data)
    ? openRequirementsResponse.data
    : Array.isArray(openRequirementsResponse)
      ? openRequirementsResponse
      : [];

  const requirements = allRequirements.filter((requirement) => {
    const requirementId = String(requirement?._id || requirement?.id || '');
    return requirementId && !hiddenRequirementIds.includes(requirementId);
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-50 via-indigo-50 to-slate-100 py-10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-500/10" />
      <div className="pointer-events-none absolute right-0 top-24 h-80 w-80 rounded-full bg-indigo-300/25 blur-3xl dark:bg-indigo-500/10" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-2xl border border-indigo-200/70 bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-8 shadow-xl shadow-indigo-200/60 dark:border-transparent dark:bg-none dark:p-0 dark:shadow-none">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-2xl bg-white/15 p-2.5 ring-1 ring-white/35 backdrop-blur-sm">
              <Clock3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-100">Live Opportunities</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Open Opportunities</h1>
            </div>
          </div>
          <p className="mt-2 text-base text-indigo-100">Fresh requirements from teams looking for developers right now.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200/90 bg-white/85 p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900/80">
                <div className="mb-4 h-6 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mb-4 h-14 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load requirements"
            description="An error occurred while loading requirements. Please try again."
            onRetry={() => refetch()}
          />
        ) : requirements.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-8 dark:border-gray-700 dark:bg-gray-900/70">
            <EmptyState
              icon={Briefcase}
              title="No open requirements at the moment"
              description="Check back soon for new opportunities."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {requirements.map((requirement) => {
              const requirementId = requirement?._id || requirement?.id;
              const minBudget = requirement?.budget?.min ?? requirement?.budgetMin ?? 0;
              const maxBudget = requirement?.budget?.max ?? requirement?.budgetMax ?? 0;
              const skills = requirement?.skills || requirement?.skillsRequired || [];

              return (
                <div key={requirementId} className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.6)] backdrop-blur dark:border-gray-700 dark:bg-gray-900/75">
                  <div className="group rounded-xl border border-slate-200/90 bg-white/90 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_18px_35px_-25px_rgba(59,130,246,0.45)] dark:border-gray-700 dark:bg-gray-900/95">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-xl font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-primary dark:text-white dark:group-hover:text-accent">
                          {requirement.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-gray-300">
                          {truncateText(requirement.description, 130)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-primary/10 p-2.5 ring-1 ring-primary/20 dark:bg-accent/10 dark:ring-accent/20">
                        <Briefcase className="h-4 w-4 text-black dark:text-accent stroke-[2]" />
                      </div>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      {skills.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-gray-700">
                      <p className="text-xl font-extrabold text-slate-900 dark:text-accent">
                        {formatINR(minBudget)} - {formatINR(maxBudget)}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-slate-600 dark:text-gray-400">{formatDeadline(requirement.deadline)}</p>
                        <Link
                          to={`/se-market/requirement/${requirementId}`}
                          className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-700"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => setHiddenRequirementIds((prev) => [...prev, String(requirementId)])}
                          className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                        >
                          Leave
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
