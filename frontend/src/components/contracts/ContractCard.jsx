import { useNavigate } from 'react-router-dom';
import { formatINR } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { 
  Briefcase, 
  User, 
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { chatAPI } from '@/api/chat.api';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';

const contractStatusConfig = {
  active: {
    label: 'Active',
    badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900',
    icon: Clock,
  },
  completed: {
    label: 'Completed',
    badge: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900',
    icon: CheckCircle2,
  },
  disputed: {
    label: 'Disputed',
    badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900',
    icon: AlertCircle,
  },
  cancelled: {
    label: 'Cancelled',
    badge: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-900',
    icon: AlertCircle,
  },
};

export function ContractCard({ contract }) {
  const navigate = useNavigate();
  const { isDeveloper, isUser } = useAuth();
  const config = contractStatusConfig[contract.status] || contractStatusConfig.active;

  // Calculate progress
  const completedMilestones = contract.milestones?.filter(
    (m) => ['approved', 'released'].includes(m.status)
  ).length || 0;
  const totalMilestones = contract.milestones?.length || 0;
  const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  // Calculate total value
  const totalValue = contract.milestones?.reduce((sum, m) => sum + m.amount, 0) || contract.totalAmount || 0;
  const completedValue = contract.milestones
    ?.filter((m) => ['approved', 'released'].includes(m.status))
    .reduce((sum, m) => sum + m.amount, 0) || 0;

  const getChatRecipientId = () => {
    if (isDeveloper) {
      return contract.client?.id || contract.client?._id;
    }

    if (isUser || contract.isClientView) {
      return contract.developer?.id || contract.developer?._id;
    }

    return contract.isClientView
      ? contract.developer?.id || contract.developer?._id
      : contract.client?.id || contract.client?._id;
  };

  const handleOpenChat = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const counterpartUserId = getChatRecipientId();

    if (!counterpartUserId) {
      toast.error('Unable to find chat recipient for this contract');
      return;
    }

    try {
      const room = await chatAPI.createRoom({
        userId: counterpartUserId,
        contractId: contract.id,
      });

      const roomId = room?._id || room?.id;
      if (!roomId) {
        toast.error('Failed to open chat');
        return;
      }

      navigate(`/chat/${roomId}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to open chat');
    }
  };

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/contracts/${contract.id}`)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          navigate(`/contracts/${contract.id}`);
        }
      }}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600 dark:hover:shadow-lg"
    >
      {/* Top Section: Title & Status */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white">
            {contract.title}
          </h3>
        </div>
        <span className={cn('shrink-0 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold', config.badge)}>
          {config.label}
        </span>
      </div>

      {/* Participant and Contract ID */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          <span className="truncate font-medium text-gray-700 dark:text-gray-300">
            {contract.isClientView ? contract.developer.name : contract.client.name}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Contract #{contract.id.slice(0, 8).toUpperCase()}
        </p>
      </div>

      {/* Progress Section */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Progress</span>
          <span className="text-xs font-semibold text-gray-900 dark:text-white">
            {completedMilestones}/{totalMilestones}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full bg-blue-500 transition-all duration-500 dark:bg-blue-400"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Financial Info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
          <p className="mb-1 text-xs text-gray-600 dark:text-gray-400">Total</p>
          <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
            {formatINR(totalValue)}
          </p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
          <p className="mb-1 text-xs text-emerald-700 dark:text-emerald-400">Funded</p>
          <p className="truncate text-sm font-bold text-emerald-600 dark:text-emerald-300">
            {formatINR(completedValue)}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-3 dark:border-gray-800">
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(new Date(contract.createdAt))}</span>
        </div>
        <button
          type="button"
          onClick={handleOpenChat}
          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-900/60 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Chat
        </button>
      </div>
    </div>
  );
}
