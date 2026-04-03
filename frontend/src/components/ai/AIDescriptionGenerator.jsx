import { useState } from 'react';
import { Sparkles, Loader, X, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AIDescriptionGenerator({ projectTitle, onDescriptionGenerated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateDescription = async () => {
    if (!projectTitle || projectTitle.trim().length < 5) {
      toast.error('Project title must be at least 5 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: projectTitle.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.data) {
        throw new Error('No data returned from server');
      }

      setResult(data.data);
      toast.success('Description generated successfully!');
    } catch (err) {
      const errorMsg = err.message || 'Failed to generate description';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const useDescription = () => {
    if (result) {
      onDescriptionGenerated(result);
      setResult(null);
      setError(null);
      toast.success('All fields auto-filled!');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard!');
  };

  if (!result) {
    return (
      <div className="rounded-lg border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 dark:border-blue-900/30 dark:from-blue-950/20 dark:to-cyan-950/20">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-1 h-5 w-5 text-blue-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              ✨ AI Description Generator
            </p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Generate a complete project description based on your project title
            </p>
            {error && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                ❌ {error}. Try again or refine manually.
              </p>
            )}
            <button
              onClick={generateDescription}
              disabled={loading || !projectTitle || projectTitle.trim().length < 5}
              className="mt-3 flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-xs font-semibold text-white transition-all hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate from Title
                </>
              )}
            </button>
            {!projectTitle || projectTitle.trim().length < 5 ? (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                💡 Add a project title (min 5 characters) to generate description
              </p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:border-green-900/30 dark:from-green-950/20 dark:to-emerald-950/20">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <Check className="mt-1 h-5 w-5 text-green-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white">Generated Description</p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Here's an AI-generated description for your project:
            </p>
          </div>
        </div>
        <button
          onClick={() => setResult(null)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Generated Description */}
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Description:</p>
          <div className="relative rounded-lg bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {result.description || 'No description generated'}
            </p>
            <button
              onClick={() => copyToClipboard(result.description)}
              className="absolute top-2 right-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-400" />}
            </button>
          </div>
        </div>

        {/* Skills */}
        {result.skills && result.skills.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Required Skills:</p>
            <div className="flex flex-wrap gap-2">
              {result.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {result.difficulty && (
            <div className="rounded-lg bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">Difficulty</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{result.difficulty}</p>
            </div>
          )}
          {result.estimatedDays && (
            <div className="rounded-lg bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">Timeline</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{result.estimatedDays} days</p>
            </div>
          )}
          {result.estimatedBudget && (
            <div className="rounded-lg bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">Budget</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{result.estimatedBudget}</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={useDescription}
          className="flex-1 rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-green-600"
        >
          ✓ Use This Description
        </button>
        <button
          onClick={() => setResult(null)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Generate Again
        </button>
      </div>
    </div>
  );
}
