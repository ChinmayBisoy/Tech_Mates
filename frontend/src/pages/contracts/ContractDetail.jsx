import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import * as contractAPI from '@/api/contract.api';
import { chatAPI } from '@/api/chat.api';
import { MilestoneTimeline } from '@/components/contracts/MilestoneTimeline';
import { ErrorState } from '@/components/shared/ErrorState';
import { useAuth } from '@/hooks/useAuth';
import { formatINR } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { 
  ArrowLeft, 
  User, 
  Briefcase, 
  DollarSign, 
  Calendar,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  Loader
} from 'lucide-react';

export default function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isDeveloper, isUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showWorkForm, setShowWorkForm] = useState(false);
  const [workDetails, setWorkDetails] = useState({ details: '', deliverables: '' });

  // Fetch contract
  const contractQuery = useQuery({
    queryKey: ['contract', id],
    queryFn: () => contractAPI.getContractDetail(id),
  });

  // Mutations
  const fundMutation = useMutation({
    mutationFn: (milestoneId) => contractAPI.fundMilestone(id, milestoneId),
    onSuccess: () => {
      toast.success('Milestone funded successfully!');
      contractQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to fund milestone');
    },
  });

  const approveMutation = useMutation({
    mutationFn: (milestoneId) => contractAPI.approveMilestone(id, milestoneId),
    onSuccess: () => {
      toast.success('Milestone approved!');
      contractQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to approve milestone');
    },
  });

  const submitWorkMutation = useMutation({
    mutationFn: (milestoneId) => contractAPI.submitWork(id, milestoneId, {
      details: workDetails.details,
      deliverables: workDetails.deliverables.split(',').map((d) => d.trim()),
    }),
    onSuccess: () => {
      toast.success('Work submitted successfully!');
      setWorkDetails({ details: '', deliverables: '' });
      setShowWorkForm(false);
      contractQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit work');
    },
  });

  const releaseMutation = useMutation({
    mutationFn: (milestoneId) => contractAPI.releaseMilestonePayment(id, milestoneId),
    onSuccess: () => {
      toast.success('Payment released!');
      contractQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to release payment');
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => contractAPI.completeContract(id),
    onSuccess: () => {
      toast.success('Contract completed!');
      navigate('/dashboard/contracts');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to complete contract');
    },
  });

  const rawContract = contractQuery.data;
  const contract = rawContract
    ? {
        ...rawContract,
        id: rawContract?.id || rawContract?._id,
        client: {
          ...(rawContract?.client || rawContract?.clientId || {}),
          id: rawContract?.client?.id || rawContract?.client?._id || rawContract?.clientId?._id || rawContract?.clientId,
          name: rawContract?.client?.name || rawContract?.clientId?.name || 'Client',
          avatar: rawContract?.client?.avatar || rawContract?.clientId?.avatar,
          createdAt: rawContract?.client?.createdAt || rawContract?.clientId?.createdAt,
        },
        developer: {
          ...(rawContract?.developer || rawContract?.developerId || {}),
          id: rawContract?.developer?.id || rawContract?.developer?._id || rawContract?.developerId?._id || rawContract?.developerId,
          name: rawContract?.developer?.name || rawContract?.developerId?.name || 'Developer',
          avatar: rawContract?.developer?.avatar || rawContract?.developerId?.avatar,
          createdAt: rawContract?.developer?.createdAt || rawContract?.developerId?.createdAt,
        },
      }
    : null;

  if (contractQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-primary hover:underline dark:text-accent">
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (contractQuery.error || !contract) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-primary hover:underline dark:text-accent">
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <ErrorState title="Contract not found" description="The contract you're looking for doesn't exist." onRetry={() => navigate('/dashboard/contracts')} />
        </div>
      </div>
    );
  }

  const currentUserId = user?.id || user?._id;
  const userRole =
    isUser && String(contract.client.id) === String(currentUserId)
      ? 'client'
      : isDeveloper && String(contract.developer.id) === String(currentUserId)
        ? 'developer'
        : 'viewer';
  const totalValue = contract.milestones?.reduce((sum, m) => sum + m.amount, 0) || 0;
  const completedValue = contract.milestones
    ?.filter((m) => ['approved', 'released'].includes(m.status))
    .reduce((sum, m) => sum + m.amount, 0) || 0;
  const pendingValue = totalValue - completedValue;
  const expectedEndDate = contract.milestones?.reduce((latestDate, milestone) => {
    if (!milestone?.dueDate) {
      return latestDate;
    }

    const milestoneDate = new Date(milestone.dueDate);
    if (Number.isNaN(milestoneDate.getTime())) {
      return latestDate;
    }

    if (!latestDate) {
      return milestoneDate;
    }

    return milestoneDate > latestDate ? milestoneDate : latestDate;
  }, null);

  const handleMilestoneAction = (action, milestoneId) => {
    switch (action) {
      case 'fund':
        fundMutation.mutate(milestoneId);
        break;
      case 'approve':
        approveMutation.mutate(milestoneId);
        break;
      case 'submitWork':
        setShowWorkForm(true);
        break;
      case 'release':
        releaseMutation.mutate(milestoneId);
        break;
      default:
        break;
    }
  };

  const handleOpenChat = async () => {
    const counterpartUserId = userRole === 'client' ? contract?.developer?.id : contract?.client?.id;

    if (!counterpartUserId) {
      toast.error('Unable to find chat recipient for this contract');
      return;
    }

    try {
      const room = await chatAPI.createRoom({
        userId: counterpartUserId,
        contractId: id,
      });

      const roomId = room?._id || room?.id;
      if (!roomId) {
        toast.error('Failed to open contract chat');
        return;
      }

      navigate(`/chat/${roomId}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to open chat');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-primary transition-colors hover:text-primary/80 dark:text-accent dark:hover:text-accent/80"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>

        {/* Header */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{contract.title}</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Contract #{contract.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <div className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              contract.status === 'active'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : contract.status === 'completed'
                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
            </div>
          </div>

          {/* Participants */}
          <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Client</p>
              <div className="mt-2 flex items-center gap-3">
                <img
                  src={contract.client.avatar || `https://ui-avatars.com/api/?name=${contract.client.name}`}
                  alt={contract.client.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{contract.client.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Member since {formatDate(new Date(contract.client.createdAt))}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Developer</p>
              <div className="mt-2 flex items-center gap-3">
                <img
                  src={contract.developer.avatar || `https://ui-avatars.com/api/?name=${contract.developer.name}`}
                  alt={contract.developer.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{contract.developer.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Member since {formatDate(new Date(contract.developer.createdAt))}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Value</p>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {formatINR(totalValue)}
            </p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
            <p className="text-xs text-green-700 dark:text-green-400">Completed Value</p>
            <p className="mt-2 text-2xl font-bold text-green-900 dark:text-green-300">
              {formatINR(completedValue)}
            </p>
          </div>
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-900/20">
            <p className="text-xs text-orange-700 dark:text-orange-400">Pending Value</p>
            <p className="mt-2 text-2xl font-bold text-orange-900 dark:text-orange-300">
              {formatINR(pendingValue)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'milestones', label: 'Milestones' },
            { id: 'chat', label: 'Chat & Communication' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-t-lg px-4 py-3 text-sm font-bold tracking-tight transition-all ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary-600 bg-primary-600 text-white shadow-sm dark:border-primary-500 dark:bg-primary-500 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Description */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">About this contract</h3>
              <p className="text-gray-700 dark:text-gray-300">{contract.description}</p>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </p>
                <p className="mt-2 font-bold text-gray-900 dark:text-white">
                  {formatDate(new Date(contract.createdAt))}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Expected End
                </p>
                <p className="mt-2 font-bold text-gray-900 dark:text-white">
                  {formatDate(expectedEndDate || new Date(contract.createdAt))}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'milestones' && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <MilestoneTimeline
              milestones={contract.milestones}
              onAction={handleMilestoneAction}
              userRole={userRole}
              status={contract.status}
            />
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <div className="text-center py-12">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Contract Communication</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Use our chat feature to discuss project details and updates
              </p>
              <button
                onClick={handleOpenChat}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-600/30 transition-all hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/40 dark:bg-primary-500 dark:text-white dark:shadow-primary-500/20 dark:hover:bg-primary-400 dark:hover:shadow-primary-500/30"
              >
                <MessageCircle className="h-5 w-5" />
                Open Chat
              </button>
            </div>
          </div>
        )}

        {/* Work Submission Form */}
        {showWorkForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-900">
              <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Submit Work</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Work Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={workDetails.details}
                    onChange={(e) => setWorkDetails({ ...workDetails, details: e.target.value })}
                    maxLength={1000}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-accent dark:focus:ring-accent"
                    placeholder="Describe what you've delivered..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Deliverables
                  </label>
                  <input
                    type="text"
                    value={workDetails.deliverables}
                    onChange={(e) => setWorkDetails({ ...workDetails, deliverables: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-accent dark:focus:ring-accent"
                    placeholder="e.g., Design mockups, Code repository link (comma-separated)"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowWorkForm(false);
                    setWorkDetails({ details: '', deliverables: '' });
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => submitWorkMutation.mutate(contract.milestones[0]?.id)}
                  disabled={submitWorkMutation.isPending || !workDetails.details}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50 dark:bg-accent dark:hover:bg-accent/90"
                >
                  {submitWorkMutation.isPending ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Work'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
