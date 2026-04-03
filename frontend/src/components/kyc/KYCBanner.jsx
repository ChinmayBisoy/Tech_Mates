import React from 'react';
import { AlertCircle, CheckCircle, Clock, XCircle, X } from 'lucide-react';

const KYCBanner = ({ kycStatus = 'pending', onStartKYC, onClose }) => {
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) return null;

  const statusConfig = {
    pending: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: AlertCircle,
      iconColor: 'text-amber-600',
      title: 'KYC Verification Pending',
      message: 'Complete your KYC verification to unlock transactions and withdrawals.',
      button: 'Start Verification',
      buttonClass: 'bg-amber-600 hover:bg-amber-700',
    },
    submitted: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: Clock,
      iconColor: 'text-blue-600',
      title: 'KYC Under Review',
      message: "Your KYC documents are under review. We'll notify you once verified.",
      button: null,
      buttonClass: '',
    },
    verified: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      title: 'KYC Verified',
      message: 'Your account is fully verified. You can now make transactions.',
      button: null,
      buttonClass: '',
    },
    rejected: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: XCircle,
      iconColor: 'text-red-600',
      title: 'KYC Rejected',
      message: 'Your KYC was rejected. Please resubmit with correct documents.',
      button: 'Resubmit KYC',
      buttonClass: 'bg-red-600 hover:bg-red-700',
    },
  };

  const config = statusConfig[kycStatus] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border ${config.border} ${config.bg} p-4 mb-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`${config.iconColor} mt-0.5 flex-shrink-0`} size={20} />

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{config.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{config.message}</p>

          {config.button && (
            <button
              onClick={onStartKYC}
              className={`mt-3 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${config.buttonClass}`}
            >
              {config.button}
            </button>
          )}
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default KYCBanner;
