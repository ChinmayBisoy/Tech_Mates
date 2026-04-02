import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { listingAPI } from '@/api/listing.api';
import { ListingCard } from '@/components/projects/ListingCard';
import { ListingFilters } from '@/components/projects/ListingFilters';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Search, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';

const RESULTS_PER_PAGE = 12;

export default function BrowseListings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  // Parse filters from URL
  const [filters, setFilters] = useState({
    types: searchParams.get('types')?.split(',').filter(Boolean) || [],
    techStack: searchParams.get('techStack')?.split(',').filter(Boolean) || [],
    priceRange: searchParams.get('priceRange') || null,
    minRating: searchParams.get('minRating') ? parseInt(searchParams.get('minRating')) : null,
    search: localSearch,
  });

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (localSearch) params.set('search', localSearch);
    if (filters.types.length) params.set('types', filters.types.join(','));
    if (filters.techStack.length) params.set('techStack', filters.techStack.join(','));
    if (filters.priceRange) params.set('priceRange', filters.priceRange);
    if (filters.minRating) params.set('minRating', filters.minRating);
    if (page > 1) params.set('page', page);

    setSearchParams(params, { replace: true });
  }, [filters, localSearch, page, setSearchParams]);

  // Build filter params for API
  const buildFilterParams = () => {
    const params = {
      page,
      limit: RESULTS_PER_PAGE,
      search: filters.search,
    };

    if (filters.types.length > 0) params.type = filters.types;
    if (filters.techStack.length > 0) params.techStack = filters.techStack;
    if (filters.minRating) params.minRating = filters.minRating;
    
    // Map price range to API format
    if (filters.priceRange) {
      const priceRanges = {
        'under-5k': { min: 0, max: 500000 },
        '5k-25k': { min: 500000, max: 2500000 },
        '25k-100k': { min: 2500000, max: 10000000 },
        'above-100k': { min: 10000000, max: 999999999 },
      };
      const range = priceRanges[filters.priceRange];
      if (range) {
        params.priceMin = range.min;
        params.priceMax = range.max;
      }
    }

    return params;
  };

  // Fetch listings
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'listings',
      'browse',
      {
        search: filters.search,
        types: filters.types,
        techStack: filters.techStack,
        priceRange: filters.priceRange,
        minRating: filters.minRating,
        page,
      },
    ],
    queryFn: () => listingAPI.fetchListings(buildFilterParams(), page, RESULTS_PER_PAGE),
    keepPreviousData: true,
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1); // Reset to first page
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      search: localSearch,
    }));
    setPage(1);
  };

  const listings = data?.listings || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag className="h-8 w-8 text-primary dark:text-accent" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Project Marketplace</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Discover quality projects and tools built by developers
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search by project name, tech stack, or description..."
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-accent dark:focus:ring-accent"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90"
            >
              Search
            </button>
          </div>
        </form>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ListingFilters filters={filters} onFilterChange={handleFilterChange} />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {isLoading ? (
              // Skeleton Loading
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : error ? (
              <ErrorState
                title="Failed to load listings"
                description="An error occurred while loading the project marketplace. Please try again."
                onRetry={() => refetch()}
              />
            ) : listings.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="No listings found"
                description={
                  filters.search || filters.types.length || filters.techStack.length
                    ? 'Try adjusting your filters to find more projects'
                    : 'No listings available at the moment. Check back later!'
                }
              />
            ) : (
              <>
                {/* Results Grid */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(Math.max(1, page - 1))}
                      className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                        const pageNum = Math.max(1, page - 2) + i;
                        if (pageNum > totalPages) return null;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`h-10 w-10 rounded-lg font-semibold transition-colors ${
                              pageNum === page
                                ? 'bg-primary text-white dark:bg-accent'
                                : 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
