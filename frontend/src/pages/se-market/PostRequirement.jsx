import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as requirementAPI from '@/api/requirement.api';
import { useAuth } from '@/hooks/useAuth';
import { SKILLS, CATEGORIES } from '@/utils/constants';
import { Loader, X } from 'lucide-react';
import { useState } from 'react';

const postRequirementSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(2000, 'Description cannot exceed 2000 characters'),
  category: z.string().min(1, 'Please select a category'),
  skills: z.array(z.string()).min(1, 'Please select at least one skill').max(10, 'Maximum 10 skills allowed'),
  budget: z.object({
    min: z.number().min(1000, 'Min budget must be at least ₹10 (1000 paise)'),
    max: z.number().min(1000, 'Max budget must be at least ₹10 (1000 paise)'),
  }).refine((data) => data.max >= data.min, {
    message: 'Max budget must be greater than min budget',
    path: ['max'],
  }),
  deadline: z.string().min(1, 'Please select a deadline'),
  location: z.string().optional(),
});

export default function PostRequirement() {
  const navigate = useNavigate();
  const { user, isUser } = useAuth();
  const [selectedSkills, setSelectedSkills] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(postRequirementSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      skills: [],
      budget: { min: 10000, max: 50000 },
      deadline: '',
      location: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      const deadline = new Date(data.deadline);
      return requirementAPI.createRequirement({
        title: data.title,
        description: data.description,
        category: data.category,
        skills: selectedSkills,
        budgetMin: Math.round(data.budget.min * 100),
        budgetMax: Math.round(data.budget.max * 100),
        budgetType: 'fixed',
        deadline: deadline.toISOString(),
      });
    },
    onSuccess: (data) => {
      toast.success('Requirement posted successfully!');
      const createdId = data?.id || data?._id || data?.requirement?.id || data?.requirement?._id;
      if (createdId) {
        navigate(`/se-market/requirement/${createdId}`);
      } else {
        navigate('/se-market/my');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to post requirement');
    },
  });

  const onSubmit = handleSubmit((data) => {
    if (selectedSkills.length === 0) {
      toast.error('Please select at least one skill');
      return;
    }
    createMutation.mutate(data);
  });

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      const nextSkills = selectedSkills.filter((s) => s !== skill);
      setSelectedSkills(nextSkills);
      setValue('skills', nextSkills, { shouldValidate: true, shouldDirty: true });
      return;
    }

    if (selectedSkills.length < 10) {
      const nextSkills = [...selectedSkills, skill];
      setSelectedSkills(nextSkills);
      setValue('skills', nextSkills, { shouldValidate: true, shouldDirty: true });
      return;
    }

    toast.error('Maximum 10 skills allowed');
  };

  // Check user role
  if (!isUser) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-900/20">
            <h2 className="text-lg font-bold text-red-900 dark:text-red-200">Access Denied</h2>
            <p className="mt-2 text-red-800 dark:text-red-300">Only users can post requirements. Please switch to user mode to continue.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-cyan-50/50 py-12 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-indigo-200/70 bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-8 shadow-xl shadow-indigo-200/60 dark:border-transparent dark:bg-none dark:p-0 dark:shadow-none">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-100 dark:hidden">Service Exchange Market</p>
          <h1 className="text-3xl font-bold text-white dark:text-white">Post a Requirement</h1>
          <p className="mt-2 text-indigo-100 dark:text-gray-400">
            Tell developers what you need and get quality proposals
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-6 rounded-3xl border border-indigo-200/70 bg-white/95 p-8 shadow-2xl shadow-indigo-100/60 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-slate-900 dark:text-white">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              {...register('title')}
              maxLength={100}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 bg-white text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-accent dark:focus:ring-accent"
              placeholder="Build a React dashboard for my business"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>}
            <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">Maximum 100 characters</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-900 dark:text-white">
              Project Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={6}
              maxLength={2000}
              className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 bg-white text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-accent dark:focus:ring-accent"
              placeholder="Describe your project requirements, goals, scope, and any specific requirements..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>}
            <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">Minimum 50, maximum 2000 characters</p>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-slate-900 dark:text-white">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              {...register('category')}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 bg-white text-slate-900 shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-accent dark:focus:ring-accent"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category.message}</p>}
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
              Required Skills <span className="text-red-500">*</span>
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {SKILLS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                    selectedSkills.includes(skill)
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-200/70 dark:bg-accent'
                      : 'border border-slate-300 bg-white text-slate-700 hover:border-primary hover:bg-primary-50/70 dark:border-gray-600 dark:text-gray-300 dark:hover:border-accent'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
            {(errors.skills || selectedSkills.length === 0) && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.skills?.message || 'Please select at least one skill'}
              </p>
            )}
            <p className="mt-2 text-xs text-slate-500 dark:text-gray-400">
              Selected: {selectedSkills.length}/10 skills
            </p>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="budgetMin" className="block text-sm font-semibold text-slate-900 dark:text-white">
                Min Budget (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register('budget.min', { valueAsNumber: true })}
                min={100}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 bg-white text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-accent dark:focus:ring-accent"
                placeholder="10000"
              />
              {errors.budget?.min && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.budget.min.message}</p>}
            </div>
            <div>
              <label htmlFor="budgetMax" className="block text-sm font-semibold text-slate-900 dark:text-white">
                Max Budget (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register('budget.max', { valueAsNumber: true })}
                min={100}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 bg-white text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-accent dark:focus:ring-accent"
                placeholder="50000"
              />
              {errors.budget?.max && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.budget.max.message}</p>}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label htmlFor="deadline" className="block text-sm font-semibold text-slate-900 dark:text-white">
              Deadline <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="deadline"
              {...register('deadline')}
              min={minDate}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 bg-white text-slate-900 shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-accent dark:focus:ring-accent"
            />
            {errors.deadline && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.deadline.message}</p>}
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-semibold text-slate-900 dark:text-white">
              Location <span className="text-slate-500 text-sm font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              id="location"
              {...register('location')}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 bg-white text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-accent dark:focus:ring-accent"
              placeholder="e.g., Bangalore, India (Remote accepted)"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 py-3 font-bold text-white shadow-lg shadow-primary-300/50 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary-300/60 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-accent-600 dark:hover:bg-accent-700"
            >
              {isSubmitting || createMutation.isPending ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Publishing Requirement...
                </>
              ) : (
                'Publish Requirement'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
