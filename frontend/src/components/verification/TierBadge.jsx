import React from 'react';
import { Crown, Award, Zap, Sparkles } from 'lucide-react';

const TierBadge = ({ tier, size = 'md' }) => {
  const tierConfig = {
    bronze: {
      name: 'Bronze',
      icon: Award,
      color: 'from-amber-600 to-amber-700',
      bg: 'bg-amber-100 dark:bg-amber-900/20',
      border: 'border-amber-400 dark:border-amber-600',
      text: 'text-amber-700 dark:text-amber-300',
    },
    silver: {
      name: 'Silver',
      icon: Zap,
      color: 'from-slate-400 to-slate-500',
      bg: 'bg-slate-100 dark:bg-slate-900/20',
      border: 'border-slate-400 dark:border-slate-600',
      text: 'text-slate-700 dark:text-slate-300',
    },
    gold: {
      name: 'Gold',
      icon: Crown,
      color: 'from-yellow-400 to-yellow-500',
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
      border: 'border-yellow-400 dark:border-yellow-600',
      text: 'text-yellow-700 dark:text-yellow-300',
    },
    platinum: {
      name: 'Platinum',
      icon: Sparkles,
      color: 'from-purple-400 to-pink-500',
      bg: 'bg-purple-100 dark:bg-purple-900/20',
      border: 'border-purple-400 dark:border-purple-600',
      text: 'text-purple-700 dark:text-purple-300',
    },
  };

  const config = tierConfig[tier] || tierConfig.bronze;
  const Icon = config.icon;

  const sizeClasses = {
    sm: { container: 'px-2 py-1', icon: 'w-3 h-3', text: 'text-xs' },
    md: { container: 'px-3 py-2', icon: 'w-5 h-5', text: 'text-sm' },
    lg: { container: 'px-4 py-3', icon: 'w-6 h-6', text: 'text-base' },
  };

  const sizes = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-full border-2
        ${sizes.container} ${config.bg} ${config.border}
      `}
    >
      <div className={`bg-gradient-to-r ${config.color} p-1 rounded-full`}>
        <Icon className={`${sizes.icon} text-white`} />
      </div>
      <span className={`font-bold ${sizes.text} ${config.text}`}>
        {config.name}
      </span>
    </div>
  );
};

export default TierBadge;
