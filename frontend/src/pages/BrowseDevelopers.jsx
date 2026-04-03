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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-cyan-50/60 dark:from-base dark:via-surface dark:to-gray-900">
      <div className="bg-gradient-to-r from-indigo-700 via-primary-600 to-cyan-500 dark:from-primary-700 dark:via-primary-600 dark:to-accent-600 px-6 pt-8 pb-12 relative overflow-hidden border-b border-indigo-400/20 dark:border-white/5">
        <div className="pointer-events-none absolute top-0 right-0 w-96 h-96 rounded-full bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="pointer-events-none absolute -bottom-16 left-1/4 w-72 h-72 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="max-w-6xl mx-auto relative z-10">
          <p className="text-indigo-100 text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] mb-3">
            Talent Discovery
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 drop-shadow-sm">
            Search Developers
          </h1>
          <p className="text-indigo-100/95 text-base sm:text-lg max-w-2xl">
            Find the right specialists for your requirements with fast filters, skill-focused search, and profile quality signals.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 -mt-8 relative z-20">
        <div className="mb-8 rounded-2xl border border-indigo-200/80 dark:border-gray-700 bg-gradient-to-r from-white via-indigo-50/75 to-cyan-50/70 dark:bg-surface p-5 sm:p-6 shadow-xl shadow-indigo-200/40">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, skills, or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-indigo-200 dark:border-gray-600 bg-white/95 dark:bg-gray-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedTier}
                onChange={(e) => {
                  setSelectedTier(e.target.value);
                  setCurrentPage(1);
                }}
                className="sm:max-w-[210px] px-4 py-3 rounded-xl border border-indigo-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
              >
                <option value="">All Tiers</option>
                <option value="elite">Elite</option>
                <option value="professional">Professional</option>
                <option value="beginner">Beginner</option>
              </select>
              <button
                type="submit"
                className="sm:w-auto px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 shadow-md shadow-primary-500/20 transition-all duration-200 hover:-translate-y-0.5 dark:bg-accent dark:hover:bg-accent-600"
              >
                Search
              </button>
              <div className="sm:ml-auto flex items-center rounded-xl border border-indigo-200/80 dark:border-gray-700 px-4 py-3 bg-white/70 dark:bg-base text-sm text-slate-600 dark:text-gray-300">
                {loading ? 'Searching developers...' : `${developers.length} developers on this page`}
              </div>
            </div>
          </form>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/90 dark:bg-red-900/20 dark:border-red-800/60 text-red-700 dark:text-red-300 px-5 py-4 shadow-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-indigo-100 dark:border-gray-700 bg-gradient-to-b from-white to-indigo-50/40 dark:bg-surface p-6 animate-pulse"
              >
                <div className="h-12 w-12 bg-indigo-100 dark:bg-gray-700 rounded-full mb-4" />
                <div className="h-4 bg-indigo-100 dark:bg-gray-700 rounded mb-2 w-3/4" />
                <div className="h-4 bg-indigo-100 dark:bg-gray-700 rounded mb-4 w-1/2" />
                <div className="h-3 bg-indigo-100 dark:bg-gray-700 rounded mb-2" />
                <div className="h-3 bg-indigo-100 dark:bg-gray-700 rounded w-4/5" />
              </div>
            ))}
          </div>
        )}

        {!loading && developers.length === 0 && (
          <div className="rounded-3xl border border-dashed border-indigo-300/80 dark:border-gray-700 bg-white/80 dark:bg-surface/70 text-center py-14 px-6 shadow-sm">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-primary-900/30">
              <Users className="h-7 w-7 text-primary-600 dark:text-primary-300" />
            </div>
            <p className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No developers found</p>
            <p className="text-slate-600 dark:text-gray-400">Try changing the search keyword or selecting a different tier.</p>
          </div>
        )}

        {!loading && developers.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-8">
              {developers.map((developer) => (
                <div
                  key={developer._id}
                  className="rounded-2xl border border-indigo-200/80 dark:border-gray-700 bg-gradient-to-b from-white to-indigo-50/45 dark:bg-surface shadow-md hover:shadow-xl hover:shadow-indigo-200/45 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  onClick={() => navigate(`/profile/${developer._id}`)}
                >
                  <div className="p-6 border-b border-indigo-100 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <img
                        src={
                          developer.profilePhoto ||
                          `https://ui-avatars.com/api/?name=${developer.name}`
                        }
                        alt={developer.name}
                        className="h-12 w-12 rounded-full ring-2 ring-indigo-200/80 dark:ring-gray-600 object-cover"
                      />
                      {developer.tier && (
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${getTierBadgeColor(
                            developer.tier
                          )}`}
                        >
                          {developer.tier}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{developer.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-gray-400 mb-2 truncate">{developer.email}</p>
                    {developer.location && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-gray-400">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{developer.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
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
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {developer.avgRating ? developer.avgRating.toFixed(1) : '0.0'}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-gray-400">
                        <Briefcase className="h-3.5 w-3.5" />
                        {Math.floor(Math.random() * 100)}+ projects
                      </div>
                    </div>

                    {developer.bio && (
                      <p className="text-sm text-slate-600 dark:text-gray-400 mb-4 leading-relaxed line-clamp-2">
                        {developer.bio}
                      </p>
                    )}

                    {developer.skills && developer.skills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {developer.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-gray-700 dark:text-indigo-200"
                            >
                              {skill}
                            </span>
                          ))}
                          {developer.skills.length > 3 && (
                            <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-gray-700 dark:text-indigo-200">
                              +{developer.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {developer.followers && (
                      <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-gray-400">
                        <Users className="h-3.5 w-3.5" />
                        {developer.followers.length} followers
                      </div>
                    )}
                  </div>

                  <div className="p-6 pt-0">
                    <button className="w-full px-4 py-2.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 shadow-md shadow-primary-500/20 transition-all duration-200 hover:-translate-y-0.5 dark:bg-accent dark:hover:bg-accent-600">
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-3 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-gray-700 bg-white dark:bg-surface text-slate-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50 dark:hover:bg-gray-800 transition"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`min-w-10 px-3 py-2 rounded-xl transition ${
                        currentPage === i + 1
                          ? 'bg-primary-600 text-white dark:bg-accent'
                          : 'border border-indigo-200 dark:border-gray-700 bg-white dark:bg-surface text-slate-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-gray-700 bg-white dark:bg-surface text-slate-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50 dark:hover:bg-gray-800 transition"
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
