import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as proposalAPI from '@/api/proposal.api';
import { Loader } from 'lucide-react';
import { useEffect } from 'react';

const proposalSchema = z.object({
  price: z.number().min(1, 'Price must be at least ₹1').max(10000000, 'Price is too high'),
  deliveryDays: z.number().min(1, 'Delivery must be at least 1 day').max(365, 'Delivery cannot exceed 1 year'),
  coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters').max(2000, 'Cover letter cannot exceed 2000 characters'),
});

export function ProposalForm({ requirementId, onSuccess, requirement }) {
  const queryClient = useQueryClient();

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
        <label htmlFor="coverLetter" className="block text-sm font-semibold text-gray-900 dark:text-white">
          Cover Letter <span className="text-red-500">*</span>
        </label>
        <textarea
          id="coverLetter"
          {...register('coverLetter')}
          rows={5}
          maxLength={2000}
          className="mt-1 w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-accent dark:focus:ring-accent"
          placeholder="Tell the client why you're the perfect fit for this project..."
        />
        {errors.coverLetter && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.coverLetter.message}</p>}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Minimum 50 characters, maximum 2000</p>
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
