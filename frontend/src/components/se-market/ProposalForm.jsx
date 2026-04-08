import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as proposalAPI from '@/api/proposal.api';
import { Loader, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

const proposalSchema = z.object({
  price: z.number().min(1, 'Price must be at least ₹1').max(10000000, 'Price is too high'),
  deliveryDays: z.number().min(1, 'Delivery must be at least 1 day').max(365, 'Delivery cannot exceed 1 year'),
  coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters').max(2000, 'Cover letter cannot exceed 2000 characters'),
});

export function ProposalForm({ requirementId, onSuccess, requirement }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const minBudgetPaise = Number(requirement?.budget?.min ?? requirement?.budgetMin ?? 0);
  const maxBudgetPaise = Number(requirement?.budget?.max ?? requirement?.budgetMax ?? 0);
  const hasBudgetRange = minBudgetPaise > 0 || maxBudgetPaise > 0;
  const fallbackPrice = hasBudgetRange
    ? Math.ceil(((minBudgetPaise + maxBudgetPaise) / 2) / 100)
    : 1000;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      price: fallbackPrice,
      deliveryDays: 7,
      coverLetter: '',
    },
  });

  const coverLetterValue = watch('coverLetter');

  const generateAIMutation = useMutation({
    mutationFn: async () => {
      const result = await proposalAPI.generateCoverLetter(
        requirement?.title || 'Professional Project',
        requirement?.description || '',
        user?.skills || [],
        hasBudgetRange ? { min: minBudgetPaise / 100, max: maxBudgetPaise / 100 } : {}
      );
      // axios already unwraps the response, so result is already the coverLetter object
      return result;
    },
    onSuccess: (data) => {
      if (data?.coverLetter) {
        setValue('coverLetter', data.coverLetter, { shouldDirty: true, shouldValidate: true });
        toast.success('Cover letter generated! Feel free to customize it.');
      } else {
        toast.error('No cover letter in response');
      }
    },
    onError: (error) => {
      console.error('AI Generation Error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to generate cover letter');
    },
  });

  useEffect(() => {
    setValue('price', fallbackPrice, { shouldDirty: false, shouldValidate: false });
  }, [fallbackPrice, setValue]);

  const createMutation = useMutation({
    mutationFn: (data) => proposalAPI.createProposal(requirementId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals', 'my-proposals'] });
      queryClient.invalidateQueries({ queryKey: ['requirement', requirementId, 'proposals'] });
      toast.success('Proposal submitted successfully!');
      reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit proposal');
    },
  });

  const onSubmit = handleSubmit((data) => {
    const proposedPrice = Math.round(data.price * 100);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + data.deliveryDays);

    createMutation.mutate({
      coverLetter: data.coverLetter,
      deliveryDays: data.deliveryDays,
      proposedPrice,
      milestones: [
        {
          title: 'Project Delivery',
          description: 'Full project delivery as per requirement scope.',
          amount: proposedPrice,
          dueDate: dueDate.toISOString(),
        },
      ],
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Submit Your Proposal</h3>

      {/* Budget */}
      <div>
        <label htmlFor="price" className="block text-sm font-semibold text-gray-900 dark:text-white">
          Your Price <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 flex w-full items-center gap-2">
          <span className="text-xl font-bold text-slate-900 dark:text-gray-200">₹</span>
          <input
            type="number"
            id="price"
            {...register('price', { valueAsNumber: true })}
            className="min-w-0 w-full flex-1 rounded-lg border border-slate-400 px-4 py-2.5 bg-slate-50 text-lg font-bold text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-accent dark:focus:ring-accent"
            placeholder="50000"
          />
        </div>
        {errors.price && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.price.message}</p>}
        {requirement && hasBudgetRange && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Budget range: ₹{Math.ceil(minBudgetPaise / 100).toLocaleString('en-IN')} - ₹{Math.ceil(maxBudgetPaise / 100).toLocaleString('en-IN')}
          </p>
        )}
      </div>

      {/* Delivery Days */}
      <div>
        <label htmlFor="deliveryDays" className="block text-sm font-semibold text-gray-900 dark:text-white">
          Delivery in (days) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="deliveryDays"
          {...register('deliveryDays', { valueAsNumber: true })}
          min="1"
          max="365"
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-accent dark:focus:ring-accent"
          placeholder="7"
        />
        {errors.deliveryDays && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.deliveryDays.message}</p>}
      </div>

      {/* Cover Letter */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <label htmlFor="coverLetter" className="block text-sm font-semibold text-gray-900 dark:text-white">
            Cover Letter <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => generateAIMutation.mutate()}
            disabled={generateAIMutation.isPending || isSubmitting}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-300/40"
          >
            {generateAIMutation.isPending ? (
              <>
                <Loader className="w-3.5 h-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Generate with AI
              </>
            )}
          </button>
        </div>
        <textarea
          id="coverLetter"
          {...register('coverLetter')}
          rows={5}
          maxLength={2000}
          className="mt-1 w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-accent dark:focus:ring-accent"
          placeholder="Tell the client why you're the perfect fit for this project..."
        />
        {errors.coverLetter && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.coverLetter.message}</p>}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {coverLetterValue?.length || 0}/2000 characters
        </p>
      </div>

      {/* Submit Button */}
      <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
        <button
          type="submit"
          disabled={isSubmitting || createMutation.isPending}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary-600 py-3 font-bold text-white transition-colors hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-accent dark:hover:bg-accent/90"
        >
          {isSubmitting || createMutation.isPending ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              Sending Proposal...
            </>
          ) : (
            'Send Your Proposal'
          )}
        </button>
      </div>
    </form>
  );
}
