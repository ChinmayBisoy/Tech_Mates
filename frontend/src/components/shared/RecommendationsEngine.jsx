import { useQuery } from '@tanstack/react-query'
import { Zap, Target, TrendingUp, Clock, Users } from 'lucide-react'
import axios from '@/api/axios'
import { CardSkeleton, GridCardsSkeleton } from '@/components/shared/Skeletons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { responsive, mobilePatterns } from '@/lib/mobileResponsive'

// AI Recommendation Engine API
const recommendationsAPI = {
  getRecommendedProjects: async (preferences) => {
    try {
      const response = await axios.get('/api/recommendations/projects', {
        params: preferences,
      })
      return response.data.data || []
    } catch (error) {
      // Fallback to mock recommendations while backend is being built
      return getMockRecommendations()
    }
  },
}

// Mock recommendations while backend is in development
function getMockRecommendations() {
  return [
    {
      _id: '1',
      title: 'React Dashboard Development',
      description: 'Build an analytics dashboard using React and TypeScript',
      budget: 5000,
      timeline: '30 days',
      matchScore: 98,
      reason: 'Matches your React expertise',
      skills: ['React', 'TypeScript', 'Data Visualization'],
      difficulty: 'intermediate',
    },
    {
      _id: '2',
      title: 'Node.js API Development',
      description: 'Create RESTful API for e-commerce platform',
      budget: 3500,
      timeline: '14 days',
      matchScore: 95,
      reason: 'Aligns with your backend skills',
      skills: ['Node.js', 'Express', 'MongoDB'],
      difficulty: 'intermediate',
    },
    {
      _id: '3',
      title: 'Mobile App UI Design',
      description: 'Design mobile app interface components',
      budget: 2000,
      timeline: '7 days',
      matchScore: 85,
      reason: 'Good for portfolio building',
      skills: ['UI Design', 'Figma', 'Responsive Design'],
      difficulty: 'easy',
    },
  ]
}

// Individual recommendation card
function RecommendationCard({ project, isLoading }) {
  const navigate = useNavigate()

  if (isLoading) return <CardSkeleton />

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      intermediate: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      hard: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    }
    return colors[difficulty] || colors.intermediate
  }

  return (
    <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-4 md:p-5 lg:p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start gap-3 md:gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base md:text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
            {project.title}
          </h3>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {project.description}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <div className="text-xl md:text-2xl font-bold text-accent-600 dark:text-accent-400">
              {project.matchScore}%
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Match</p>
          </div>
        </div>
      </div>

      {/* Match Reason */}
      <div className="mb-4 p-2 md:p-3 rounded-lg bg-accent-50 dark:bg-accent-900/20">
        <p className="text-xs md:text-xs text-accent-700 dark:text-accent-400 flex items-center gap-2">
          <Zap className="w-3 h-3 flex-shrink-0" />
          <span className="line-clamp-1">{project.reason}</span>
        </p>
      </div>

      {/* Skills */}
      <div className="mb-4 flex flex-wrap gap-2">
        {project.skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center px-2 py-1 md:px-2.5 md:py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 whitespace-nowrap"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Details */}
      <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Budget</p>
          <p className="font-bold text-sm md:text-base text-gray-900 dark:text-white">${project.budget}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Timeline</p>
          <p className="font-bold text-sm md:text-base text-gray-900 dark:text-white">{project.timeline}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Difficulty</p>
          <p className="font-bold text-sm md:text-base text-gray-900 dark:text-white capitalize">
            {project.difficulty}
          </p>
        </div>
      </div>

      {/* Button */}
      <button
        onClick={() => navigate(`/project/${project._id}`)}
        className="w-full py-2 md:py-2.5 px-4 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-semibold transition-colors text-sm md:text-base min-h-[40px] md:min-h-[36px]"
      >
        View Project
      </button>
    </div>
  )
}

// Recommendations Widget for Dashboard
export function RecommendationsWidget({ userSkills = [] }) {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['recommendations', userSkills],
    queryFn: () => recommendationsAPI.getRecommendedProjects({ skills: userSkills }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const visibleProjects = projects?.slice(0, 3) || []

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-6 h-6 text-accent-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Recommended For You
        </h2>
      </div>

      {isLoading ? (
        <GridCardsSkeleton columns={3} count={3} />
      ) : visibleProjects.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No matching projects yet. Complete your profile to get personalized recommendations!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
          {visibleProjects.map((project) => (
            <RecommendationCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}

// Full Recommendations Page
export function RecommendationsPage() {
  const { user } = useAuth()
  const { data: projects, isLoading } = useQuery({
    queryKey: ['recommendations-all', user?.skills],
    queryFn: () => recommendationsAPI.getRecommendedProjects({ skills: user?.skills }),
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-base dark:via-surface dark:to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-accent-500" />
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
              Recommended Projects
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Personalized project matches based on your skills and experience
          </p>
        </div>

        {/* Filters/Sort */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button className="px-4 py-2 rounded-lg bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium text-gray-900 dark:text-white transition-colors">
            All Projects
          </button>
          <button className="px-4 py-2 rounded-lg bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium text-gray-900 dark:text-white transition-colors">
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Highest Match
          </button>
          <button className="px-4 py-2 rounded-lg bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium text-gray-900 dark:text-white transition-colors">
            <Clock className="w-4 h-4 inline mr-2" />
            Urgent
          </button>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <GridCardsSkeleton columns={3} count={9} />
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
            {projects.map((project) => (
              <RecommendationCard key={project._id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Target className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Matching Projects
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Check back soon or update your skills to get recommendations!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default recommendationsAPI
