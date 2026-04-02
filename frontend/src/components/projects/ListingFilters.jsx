import { SKILLS, LISTING_TYPES } from '@/utils/constants';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export function ListingFilters({ filters, onFilterChange }) {
  const [expandedSections, setExpandedSections] = useState({
    type: true,
    price: true,
    rating: true,
    techStack: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleTypeChange = (type) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    onFilterChange('types', newTypes);
  };

  const handleTechStackChange = (tech) => {
    const newTechs = filters.techStack.includes(tech)
      ? filters.techStack.filter((t) => t !== tech)
      : [...filters.techStack, tech];
    onFilterChange('techStack', newTechs);
  };

  const handlePriceRangeChange = (range) => {
    onFilterChange('priceRange', range === filters.priceRange ? null : range);
  };

  const handleRatingChange = (rating) => {
    onFilterChange('minRating', rating === filters.minRating ? null : rating);
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <h3 className="font-bold text-gray-900 dark:text-white">Filters</h3>

      {/* Listing Type */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <button
          onClick={() => toggleSection('type')}
          className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 dark:text-white"
        >
          Type
          {expandedSections.type ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedSections.type && (
          <div className="mt-3 space-y-2">
            {LISTING_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.types.includes(type)}
                  onChange={() => handleTypeChange(type)}
                  className="h-4 w-4 rounded border-gray-300 bg-white accent-primary [color-scheme:light] focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:accent-accent dark:[color-scheme:dark]"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">{type}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <button
          onClick={() => toggleSection('price')}
          className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 dark:text-white"
        >
          Price
          {expandedSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedSections.price && (
          <div className="mt-3 space-y-2">
            {[
              { label: 'Under ₹5K', id: 'under-5k' },
              { label: '₹5K - ₹25K', id: '5k-25k' },
              { label: '₹25K - ₹1,00,000', id: '25k-100k' },
              { label: 'Above ₹1,00,000', id: 'above-100k' },
            ].map(({ label, id }) => (
              <label key={id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="price"
                  checked={filters.priceRange === id}
                  onChange={() => handlePriceRangeChange(id)}
                  className="h-4 w-4 border-gray-300 bg-white accent-primary [color-scheme:light] focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:accent-accent dark:[color-scheme:dark]"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <button
          onClick={() => toggleSection('rating')}
          className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 dark:text-white"
        >
          Rating
          {expandedSections.rating ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedSections.rating && (
          <div className="mt-3 space-y-2">
            {[5, 4, 3].map((rating) => (
              <label key={rating} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.minRating === rating}
                  onChange={() => handleRatingChange(rating)}
                  className="h-4 w-4 border-gray-300 bg-white accent-primary [color-scheme:light] focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:accent-accent dark:[color-scheme:dark]"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {rating}⭐ & up
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Tech Stack */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <button
          onClick={() => toggleSection('techStack')}
          className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 dark:text-white"
        >
          Tech Stack
          {expandedSections.techStack ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedSections.techStack && (
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
            {SKILLS.map((skill) => (
              <label key={skill} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.techStack.includes(skill)}
                  onChange={() => handleTechStackChange(skill)}
                  className="h-4 w-4 rounded border-gray-300 bg-white accent-primary [color-scheme:light] focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:accent-accent dark:[color-scheme:dark]"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">{skill}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => {
          onFilterChange('types', []);
          onFilterChange('techStack', []);
          onFilterChange('priceRange', null);
          onFilterChange('minRating', null);
          onFilterChange('search', '');
        }}
        className="w-full rounded-lg border border-gray-300 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        Clear All Filters
      </button>
    </div>
  );
}
