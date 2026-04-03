import { useState } from 'react'
import { Wand2, Loader, Copy, CheckCircle, AlertCircle } from 'lucide-react'
import axios from '@/api/axios'

export default function AIProjectRefiner({ onDescriptionChange, initialDescription = '' }) {
  const [roughDescription, setRoughDescription] = useState(initialDescription)
  const [refined, setRefined] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [expandedSection, setExpandedSection] = useState(null)

  const handleRefine = async () => {
    if (!roughDescription.trim() || roughDescription.trim().length < 10) {
      setError('Description must be at least 10 characters')
      return
    }

    setError('')
    setLoading(true)
    try {
      const response = await axios.post('/api/ai/refine-description', {
        description: roughDescription,
      })

      setRefined(response.data.data)
    } catch (err) {
      console.error('Failed to refine:', err)
      setError(err.response?.data?.message || 'Failed to refine description. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUseRefined = () => {
    if (refined?.refinedDescription) {
      setRoughDescription(refined.refinedDescription)
      onDescriptionChange(refined.refinedDescription)
      setRefined(null)
    }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-slate-800/50 rounded-2xl border border-blue-200/70 dark:border-slate-700 p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/20 ring-1 ring-blue-200/70 dark:ring-blue-700/50">
          <Wand2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Project Refiner</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">Improve your project description with AI</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Your Project Idea (rough description)
        </label>
        <textarea
          value={roughDescription}
          onChange={(e) => setRoughDescription(e.target.value)}
          placeholder="Describe your project idea in any format... AI will help you structure it."
          className="w-full p-4 border border-gray-300 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition resize-none"
          rows={4}
        />
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          {roughDescription.length} characters • Minimum 10 required
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Refine Button */}
      <button
        onClick={handleRefine}
        disabled={loading || !roughDescription.trim() || roughDescription.trim().length < 10}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader className="animate-spin w-5 h-5" />
            Refining with AI...
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5" />
            Refine Description
          </>
        )}
      </button>

      {/* Results Section */}
      {refined && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
            <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              AI Refined Description
            </h4>
            <p className="text-gray-800 dark:text-gray-200 mb-3 leading-relaxed">{refined.refinedDescription}</p>
            <button
              onClick={() => handleCopy(refined.refinedDescription)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Key Information Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Difficulty */}
            <div className="p-3 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Difficulty Level</p>
              <p className="text-lg font-black text-gray-900 dark:text-white">{refined.difficulty}</p>
            </div>

            {/* Estimated Days */}
            <div className="p-3 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Timeline</p>
              <p className="text-lg font-black text-gray-900 dark:text-white">{refined.estimatedDays} days</p>
            </div>

            {/* Budget */}
            <div className="p-3 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Est. Budget</p>
              <p className="text-lg font-black text-green-600 dark:text-green-400">{refined.estimatedBudget}</p>
            </div>

            {/* Skills Count */}
            <div className="p-3 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Skills Needed</p>
              <p className="text-lg font-black text-purple-600 dark:text-purple-400">{refined.skills?.length} skills</p>
            </div>
          </div>

          {/* Skills Section */}
          {refined.skills && refined.skills.length > 0 && (
            <div className="p-4 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
              <button
                onClick={() => setExpandedSection(expandedSection === 'skills' ? null : 'skills')}
                className="w-full flex items-center justify-between"
              >
                <p className="text-sm font-bold text-gray-900 dark:text-white">Required Skills</p>
                <Wand2 className={`w-4 h-4 transition-transform ${expandedSection === 'skills' ? 'rotate-45' : ''}`} />
              </button>
              {expandedSection === 'skills' && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {refined.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-semibold rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Key Points Section */}
          {refined.keyPoints && refined.keyPoints.length > 0 && (
            <div className="p-4 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
              <button
                onClick={() => setExpandedSection(expandedSection === 'points' ? null : 'points')}
                className="w-full flex items-center justify-between"
              >
                <p className="text-sm font-bold text-gray-900 dark:text-white">Key Points</p>
                <Wand2 className={`w-4 h-4 transition-transform ${expandedSection === 'points' ? 'rotate-45' : ''}`} />
              </button>
              {expandedSection === 'points' && (
                <ul className="mt-3 space-y-2">
                  {refined.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3 border-t border-gray-200 dark:border-slate-600">
            <button
              onClick={handleUseRefined}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all duration-300"
            >
              Use This Description
            </button>
            <button
              onClick={() => setRefined(null)}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-900 dark:text-white rounded-lg font-semibold transition-all duration-300"
            >
              Refine Again
            </button>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-5 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          💡 <strong>Tip:</strong> AI will analyze your description and help you create a professional project brief with estimated budget, timeline, and required skills.
        </p>
      </div>
    </div>
  )
}
