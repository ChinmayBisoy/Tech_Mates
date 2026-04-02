import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [searchType, setSearchType] = useState('all');

  // Placeholder results (in real app, fetch from API)
  const mockResults = {
    projects: [
      { id: 1, title: 'Build E-commerce Platform', category: 'Web Development', price: '₹50,000' },
      { id: 2, title: 'Mobile App Development', category: 'Mobile App', price: '₹1,00,000' },
    ],
    developers: [
      { id: 1, name: 'John Developer', skills: 'React, Node.js', rating: 4.8 },
      { id: 2, name: 'Jane Designer', skills: 'UI/UX, Figma', rating: 4.9 },
    ],
    requirements: [
      { id: 1, title: 'Need a Data Analytics Expert', budget: '₹30,000' },
      { id: 2, title: 'AWS Cloud Migration Project', budget: '₹75,000' },
    ],
  };

  const getResults = () => {
    if (searchType === 'all') {
      return {
        projects: mockResults.projects,
        developers: mockResults.developers,
        requirements: mockResults.requirements,
      };
    }
    return { [searchType + 's']: mockResults[searchType + 's'] };
  };

  const results = getResults();
  const totalResults = Object.values(results).flat().length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-primary dark:text-accent hover:underline mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Search Results
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Found {totalResults} results for "{query}"
        </p>
      </div>

      {/* Search Type Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'project', 'developer', 'requirement'].map((type) => (
          <button
            key={type}
            onClick={() => setSearchType(type)}
            className={`whitespace-nowrap rounded-full px-4 py-2 font-medium capitalize transition ${
              searchType === type
                ? 'bg-primary text-white dark:bg-accent'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            {type === 'requirement' ? 'Requirements' : type + 's'}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {results.projects && results.projects.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Projects
            </h2>
            <div className="space-y-2 mb-6">
              {results.projects.map((project) => (
                <a
                  key={project.id}
                  href="#"
                  className="block rounded-lg border border-gray-200 p-4 hover:border-primary dark:border-gray-700 dark:hover:border-accent transition-colors"
                >
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {project.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {project.category} • {project.price}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}

        {results.developers && results.developers.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Developers
            </h2>
            <div className="space-y-2 mb-6">
              {results.developers.map((dev) => (
                <a
                  key={dev.id}
                  href="#"
                  className="block rounded-lg border border-gray-200 p-4 hover:border-primary dark:border-gray-700 dark:hover:border-accent transition-colors"
                >
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {dev.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {dev.skills} • ⭐ {dev.rating}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}

        {results.requirements && results.requirements.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Requirements
            </h2>
            <div className="space-y-2">
              {results.requirements.map((req) => (
                <a
                  key={req.id}
                  href="#"
                  className="block rounded-lg border border-gray-200 p-4 hover:border-primary dark:border-gray-700 dark:hover:border-accent transition-colors"
                >
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {req.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Budget: {req.budget}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}

        {totalResults === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-600 dark:text-gray-400">
              No results found for "{query}". Try a different search term.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
