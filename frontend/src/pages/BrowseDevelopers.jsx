import { useState, useEffect } from 'react';
import { Search, Star, MapPin, Briefcase, Users } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function BrowseDevelopers() {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDevelopers();
  }, [searchTerm, selectedTier, currentPage]);

  const fetchDevelopers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedTier && { tier: selectedTier }),
      });

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/search?${params}`
      );

      setDevelopers(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setError('');
    } catch (err) {
      setError('Failed to load developers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const getTierBadgeColor = (tier) => {
    switch (tier) {
      case 'elite':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'professional':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Browse Developers
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover and connect with talented developers
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, skills, or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={selectedTier}
                onChange={(e) => {
                  setSelectedTier(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Tiers</option>
                <option value="elite">Elite</option>
                <option value="professional">Professional</option>
                <option value="beginner">Beginner</option>
              </select>
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 transition"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse"
              >
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && developers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
              No developers found
            </p>
            <p className="text-gray-500 dark:text-gray-500">
              Try adjusting your search filters
            </p>
          </div>
        )}

        {/* Developers Grid */}
        {!loading && developers.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {developers.map((developer) => (
                <div
                  key={developer._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/profile/${developer._id}`)}
                >
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <img
                        src={
                          developer.profilePhoto ||
                          `https://ui-avatars.com/api/?name=${developer.name}`
                        }
                        alt={developer.name}
                        className="h-12 w-12 rounded-full"
                      />
                      {developer.tier && (
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${getTierBadgeColor(
                            developer.tier
                          )}`}
                        >
                          {developer.tier}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {developer.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {developer.email}
                    </p>
                    {developer.location && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-2">
                        <MapPin className="h-3 w-3" />
                        {developer.location}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.round(developer.avgRating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {developer.avgRating ? developer.avgRating.toFixed(1) : '0.0'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({Math.floor(Math.random() * 100)}+ projects)
                      </span>
                    </div>

                    {/* Bio */}
                    {developer.bio && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {developer.bio}
                      </p>
                    )}

                    {/* Skills */}
                    {developer.skills && developer.skills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {developer.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {developer.skills.length > 3 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                              +{developer.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Followers */}
                    {developer.followers && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                        <Users className="h-3 w-3" />
                        {developer.followers.length} followers
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                    <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 transition font-medium">
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-2 rounded-lg transition ${
                        currentPage === i + 1
                          ? 'bg-primary text-white dark:bg-accent'
                          : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
