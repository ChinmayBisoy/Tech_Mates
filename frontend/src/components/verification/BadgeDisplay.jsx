import React from 'react';

const BadgeDisplay = ({ badges, size = 'md', showLabel = true }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
    xl: 'w-12 h-12 text-lg',
  };

  const badgeColorMap = {
    green: 'bg-green-100 text-green-700 border-green-300',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    gold: 'bg-amber-100 text-amber-700 border-amber-300',
    blue: 'bg-blue-100 text-blue-700 border-blue-300',
    purple: 'bg-purple-100 text-purple-700 border-purple-300',
    cyan: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  };

  if (!badges || badges.length === 0) {
    return (
      <div className={`flex items-center gap-2 ${showLabel ? 'mb-3' : ''}`}>
        <span className="text-xs text-gray-500 dark:text-gray-400">No badges yet</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="group relative"
            title={badge.description}
          >
            <div
              className={`
                rounded-full border-2 flex items-center justify-center font-bold
                hover:scale-110 transition-transform cursor-help
                ${sizeClasses[size]}
                ${badgeColorMap[badge.color] || badgeColorMap.blue}
              `}
            >
              {badge.icon}
            </div>

            {/* Tooltip */}
            <div
              className={`
                absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                bg-gray-900 dark:bg-gray-950 text-white px-3 py-2 rounded
                text-xs whitespace-nowrap pointer-events-none
                opacity-0 group-hover:opacity-100 transition-opacity
                z-10
              `}
            >
              {badge.name}
              <div className="text-gray-300 text-xs mt-1">{badge.description}</div>
            </div>
          </div>
        ))}
      </div>

      {showLabel && (
        <div className="space-y-1">
          {badges.map((badge) => (
            <div key={badge.id} className="text-xs text-gray-600 dark:text-gray-300">
              <span className="font-medium">{badge.name}</span>
              <span className="text-gray-400"> • Earned {badge.earned}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BadgeDisplay;
