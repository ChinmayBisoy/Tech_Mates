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
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50/50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 md:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700/50 transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back</span>
        </button>

        {/* Premium Header Card */}
        <div className="mb-8 rounded-2xl border border-blue-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)] p-8">
          <div className="flex items-start justify-between gap-6 mb-8 pb-8 border-b border-blue-100/50 dark:border-slate-700/50">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30">
                  <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white">{contract.title}</h1>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  Contract ID: <span className="font-mono text-blue-600 dark:text-blue-400">{contract.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-blue-300 dark:bg-blue-600"></div>
                <div className="text-slate-500 dark:text-slate-400 text-sm">
                  Created {formatDate(new Date(contract.createdAt))}
                </div>
              </div>
            </div>
            <div className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap ${
              contract.status === 'active'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700/50'
                : contract.status === 'completed'
                ? 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-700/50'
                : 'bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-700/50'
            }`}>
              <div className={`h-2 w-2 rounded-full ${
                contract.status === 'active' ? 'bg-blue-500' : contract.status === 'completed' ? 'bg-sky-500' : 'bg-slate-500'
              }`}></div>
              {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
            </div>
          </div>

          {/* Participants Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Client Card */}
            <div className="group rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 border border-blue-200/50 dark:border-blue-700/30 p-6 hover:shadow-md hover:border-blue-300/50 dark:hover:border-blue-600/50 transition-all duration-300">
              <div className="flex items-center gap-1 mb-4">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Client</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={contract.client.avatar || `https://ui-avatars.com/api/?name=${contract.client.name}&background=3b82f6&color=fff`}
                    alt={contract.client.name}
                    className="h-14 w-14 rounded-xl object-cover ring-2 ring-blue-200 dark:ring-blue-700"
                  />
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white dark:border-slate-800"></div>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 dark:text-white text-lg">{contract.client.name}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Member since {new Date(contract.client.createdAt).getFullYear()}</p>
                </div>
              </div>
            </div>

            {/* Developer Card */}
            <div className="group rounded-xl bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-900/20 dark:to-sky-800/30 border border-sky-200/50 dark:border-sky-700/30 p-6 hover:shadow-md hover:border-sky-300/50 dark:hover:border-sky-600/50 transition-all duration-300">
              <div className="flex items-center gap-1 mb-4">
                <User className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Developer</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={contract.developer.avatar || `https://ui-avatars.com/api/?name=${contract.developer.name}&background=0ea5e9&color=fff`}
                    alt={contract.developer.name}
                    className="h-14 w-14 rounded-xl object-cover ring-2 ring-sky-200 dark:ring-sky-700"
                  />
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white dark:border-slate-800"></div>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 dark:text-white text-lg">{contract.developer.name}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Member since {new Date(contract.developer.createdAt).getFullYear()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary - Blue Cards */}
        <div className="mb-8 grid md:grid-cols-3 gap-6">
          {/* Total Value */}
          <div className="group rounded-2xl border border-blue-200/80 dark:border-blue-700/80 bg-gradient-to-br from-blue-50/80 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/30 backdrop-blur-xl shadow-[0_10px_30px_-15px_rgba(59,130,246,0.2)] dark:shadow-[0_10px_30px_-15px_rgba(59,130,246,0.1)] p-6 hover:shadow-xl hover:border-blue-300/80 dark:hover:border-blue-600/80 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Total Contract Value</p>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatINR(totalValue)}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Across {contract.milestones?.length || 0} milestones</p>
          </div>

          {/* Completed Value */}
          <div className="group rounded-2xl border border-sky-200/80 dark:border-sky-700/80 bg-gradient-to-br from-sky-50/80 to-sky-100/50 dark:from-sky-900/20 dark:to-sky-800/30 backdrop-blur-xl shadow-[0_10px_30px_-15px_rgba(14,165,233,0.2)] dark:shadow-[0_10px_30px_-15px_rgba(14,165,233,0.1)] p-6 hover:shadow-xl hover:border-sky-300/80 dark:hover:border-sky-600/80 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-sky-700 dark:text-sky-400 uppercase tracking-wider">Completed & Released</p>
              <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/40">
                <CheckCircle2 className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatINR(completedValue)}</p>
            <p className="text-xs text-sky-600 dark:text-sky-400 mt-2">{totalValue > 0 ? Math.round((completedValue / totalValue) * 100) : 0}% of total</p>
          </div>

          {/* Pending Value */}
          <div className="group rounded-2xl border border-cyan-200/80 dark:border-cyan-700/80 bg-gradient-to-br from-cyan-50/80 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-800/30 backdrop-blur-xl shadow-[0_10px_30px_-15px_rgba(6,182,212,0.2)] dark:shadow-[0_10px_30px_-15px_rgba(6,182,212,0.1)] p-6 hover:shadow-xl hover:border-cyan-300/80 dark:hover:border-cyan-600/80 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">Pending Payment</p>
              <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/40">
                <AlertCircle className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatINR(pendingValue)}</p>
            <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-2">{totalValue > 0 ? Math.round((pendingValue / totalValue) * 100) : 0}% remaining</p>
          </div>
        </div>

        {/* Tab Navigation - Enhanced with Blue */}
        <div className="mb-8">
          <div className="rounded-2xl border border-blue-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="flex gap-1 p-1 bg-blue-50/50 dark:bg-slate-700/30 border-b border-blue-100/50 dark:border-slate-700/50">
              {[
                { id: 'overview', label: 'Overview', icon: Briefcase },
                { id: 'milestones', label: 'Milestones', icon: Calendar },
                { id: 'chat', label: 'Chat & Communication', icon: MessageCircle },
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-bold transition-all duration-300 rounded-xl whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-lg shadow-blue-600/30 dark:from-blue-500 dark:to-sky-500 dark:shadow-blue-500/20'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content Container */}
            <div className="p-8">
            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Description */}
                <div className="rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-700/40 dark:to-slate-700/30 border border-blue-200/50 dark:border-slate-600/50 p-6 backdrop-blur-sm hover:border-blue-300/50 dark:hover:border-slate-600 transition-all duration-300">
                  <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                      <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    Project Overview
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">{contract.description}</p>
                </div>

                {/* Key Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 dark:from-slate-700/40 dark:to-slate-700/30 border border-sky-200/50 dark:border-slate-600/50 p-6 hover:shadow-md hover:border-sky-300/50 dark:hover:border-slate-600 transition-all duration-300 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/40">
                        <Calendar className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                      </div>
                      <p className="text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">Start Date</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatDate(new Date(contract.createdAt))}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-slate-700/40 dark:to-slate-700/30 border border-cyan-200/50 dark:border-slate-600/50 p-6 hover:shadow-md hover:border-cyan-300/50 dark:hover:border-slate-600 transition-all duration-300 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/40">
                        <Calendar className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <p className="text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">Expected End</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatDate(expectedEndDate || new Date(contract.createdAt))}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'milestones' && (
              <div>
                <MilestoneTimeline
                  milestones={contract.milestones}
                  onAction={handleMilestoneAction}
                  userRole={userRole}
                  status={contract.status}
                />
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-500 mb-6 shadow-lg shadow-blue-500/40">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-lg">Contract Communication</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">
                  Use our secure chat feature to discuss project details, ask questions, and share updates in real-time
                </p>
                <button
                  onClick={handleOpenChat}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-600/40 transition-all hover:shadow-xl hover:shadow-blue-600/50 hover:-translate-y-0.5 active:scale-95"
                >
                  <MessageCircle className="h-5 w-5" />
                  Open Chat
                </button>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Work Submission Form */}
        {showWorkForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-blue-300/50 bg-white dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl shadow-blue-500/20 p-8 relative overflow-hidden">
              {/* Gradient Overlay */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl -z-10"></div>
              
              <div className="mb-6 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-sky-500">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Submit Work</h3>
                  <p className="text-blue-600 dark:text-blue-400 text-sm mt-0.5">Share your completed work for this milestone</p>
                </div>
              </div>

              <div className="space-y-5 mb-8">
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                    Work Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={workDetails.details}
                    onChange={(e) => setWorkDetails({ ...workDetails, details: e.target.value })}
                    maxLength={1000}
                    rows={4}
                    className="w-full rounded-xl border border-blue-300 dark:border-blue-700/50 bg-sky-50 dark:bg-slate-700/50 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    placeholder="Describe what you've delivered and any relevant details..."
                  />
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{workDetails.details.length}/1000 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                    Deliverables
                  </label>
                  <input
                    type="text"
                    value={workDetails.deliverables}
                    onChange={(e) => setWorkDetails({ ...workDetails, deliverables: e.target.value })}
                    className="w-full rounded-xl border border-blue-300 dark:border-blue-700/50 bg-sky-50 dark:bg-slate-700/50 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    placeholder="e.g., Design repo link, Code repository link (comma-separated)"
                  />
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Separate multiple items with commas</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowWorkForm(false);
                    setWorkDetails({ details: '', deliverables: '' });
                  }}
                  className="flex-1 rounded-xl border-2 border-slate-300 dark:border-slate-600/50 hover:border-slate-400 dark:hover:border-slate-500 px-4 py-3 font-bold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-100 dark:hover:bg-slate-700/30 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={() => submitWorkMutation.mutate(contract.milestones[0]?.id)}
                  disabled={submitWorkMutation.isPending || !workDetails.details}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 px-4 py-3 font-bold text-white shadow-lg shadow-blue-600/40 transition-all hover:shadow-xl hover:shadow-blue-600/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
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
