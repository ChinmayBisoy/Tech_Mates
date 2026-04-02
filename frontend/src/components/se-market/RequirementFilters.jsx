import { SKILLS, CATEGORIES } from '@/utils/constants';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';

export function RequirementFilters({ filters, onFilterChange }) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    skills: true,
    budget: true,
    deadline: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryChange = (category) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFilterChange('categories', newCategories);
  };

  const handleSkillChange = (skill) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter((s) => s !== skill)
      : [...filters.skills, skill];
    onFilterChange('skills', newSkills);
  };

  const handleBudgetRangeChange = (range) => {
    onFilterChange('budgetRange', range === filters.budgetRange ? null : range);
  };

  const handleDeadlineChange = (days) => {
    onFilterChange('deadlineInDays', days === filters.deadlineInDays ? null : days);
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <h3 className="font-bold text-gray-900 dark:text-white">Filters</h3>

      {/* Categories */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <button
          onClick={() => toggleSection('category')}
          className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 dark:text-white"
        >
          Category
          {expandedSections.category ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedSections.category && (
          <div className="mt-3 space-y-2">
            {CATEGORIES.map((category) => (
              <label key={category} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                  className="h-4 w-4 rounded border-gray-300 bg-white accent-primary [color-scheme:light] focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:accent-accent dark:[color-scheme:dark]"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">{category}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <button
          onClick={() => toggleSection('skills')}
          className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 dark:text-white"
        >
          Skills
          {expandedSections.skills ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedSections.skills && (
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
            {SKILLS.map((skill) => (
              <label key={skill} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.skills.includes(skill)}
                  onChange={() => handleSkillChange(skill)}
                  className="h-4 w-4 rounded border-gray-300 bg-white accent-primary [color-scheme:light] focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:accent-accent dark:[color-scheme:dark]"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">{skill}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Budget Range */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <button
          onClick={() => toggleSection('budget')}
          className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 dark:text-white"
        >
          Budget
          {expandedSections.budget ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedSections.budget && (
          <div className="mt-3 space-y-2">
            {[
              { label: 'Under ₹10K', id: 'under-10k' },
              { label: '₹10K - ₹50K', id: '10k-50k' },
              { label: '₹50K - ₹1,00,000', id: '50k-100k' },
              { label: 'Above ₹1,00,000', id: 'above-100k' },
            ].map(({ label, id }) => (
              <label key={id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="budget"
                  checked={filters.budgetRange === id}
                  onChange={() => handleBudgetRangeChange(id)}
                  className="h-4 w-4 border-gray-300 bg-white accent-primary [color-scheme:light] focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:accent-accent dark:[color-scheme:dark]"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Deadline */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <button
          onClick={() => toggleSection('deadline')}
          className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 dark:text-white"
        >
          Deadline
          {expandedSections.deadline ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedSections.deadline && (
          <div className="mt-3 space-y-2">
            {[
              { label: 'This week', days: 7 },
              { label: 'This month', days: 30 },
              { label: 'This quarter', days: 90 },
              { label: 'Anytime', days: 365 },
            ].map(({ label, days }) => (
              <label key={days} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="deadline"
                  checked={filters.deadlineInDays === days}
                  onChange={() => handleDeadlineChange(days)}
                  className="h-4 w-4 border-gray-300 bg-white accent-primary [color-scheme:light] focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:accent-accent dark:[color-scheme:dark]"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => {
          onFilterChange('categories', []);
          onFilterChange('skills', []);
          onFilterChange('budgetRange', null);
          onFilterChange('deadlineInDays', null);
          onFilterChange('search', '');
        }}
        className="w-full rounded-lg border border-gray-300 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        Clear All Filters
      </button>
    </div>
  );
}
