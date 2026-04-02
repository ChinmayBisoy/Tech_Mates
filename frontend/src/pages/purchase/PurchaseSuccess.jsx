import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { verifyPurchaseSession } from '@/api/purchase.api';
import { CheckCircle, Download, Mail, Home } from 'lucide-react';

export default function PurchaseSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [purchaseData, setPurchaseData] = useState(null);
  const sessionId = searchParams.get('sessionId');

  const verifyPurchaseMutation = useMutation({
    mutationFn: () => verifyPurchaseSession(sessionId),
    onSuccess: (data) => {
      setPurchaseData(data);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to verify purchase');
    },
  });

  useEffect(() => {
    if (sessionId) {
      verifyPurchaseMutation.mutate();
    }
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950">
            <p className="text-red-800 dark:text-red-200">Invalid session. No purchase found.</p>
            <Link
              to="/projects"
              className="mt-4 inline-block rounded-lg bg-primary px-6 py-2 font-bold text-white transition-colors hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90"
            >
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (verifyPurchaseMutation.isPending) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-accent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying your purchase...</p>
        </div>
      </div>
    );
  }

  if (verifyPurchaseMutation.error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950">
            <p className="text-red-800 dark:text-red-200">
              {verifyPurchaseMutation.error.response?.data?.message || 'Failed to verify purchase'}
            </p>
            <Link
              to="/projects"
              className="mt-4 inline-block rounded-lg bg-primary px-6 py-2 font-bold text-white transition-colors hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90"
            >
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        {/* Success Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-900">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Purchase Successful!
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Thank you for your purchase. Check your email for order details and access links.
          </p>

          {/* Purchase Details */}
          {purchaseData && (
            <div className="mb-8 space-y-4 rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Product</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{purchaseData.listing?.title}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Amount Paid</p>
                  <p className="text-lg font-bold text-primary dark:text-accent">
                    ₹{(purchaseData.amount / 100).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {purchaseData.transactionId && (
                <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</p>
                    <p className="font-mono text-sm text-gray-900 dark:text-white">
                      {purchaseData.transactionId}
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(purchaseData.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">What happens next?</h2>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-bold dark:bg-accent">
                  1
                </span>
                <span className="text-gray-700 dark:text-gray-300">
                  Check your email for order confirmation and download links
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-bold dark:bg-accent">
                  2
                </span>
                <span className="text-gray-700 dark:text-gray-300">
                  Access your purchased product from your dashboard
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-bold dark:bg-accent">
                  3
                </span>
                <span className="text-gray-700 dark:text-gray-300">
                  Leave a review to help other developers
                </span>
              </li>
            </ol>
          </div>

          {/* Support Info */}
          <div className="mb-8 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 dark:bg-blue-900/20">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>Need help?</strong> Contact our support team if you have any issues accessing your purchase.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/dashboard/purchases"
              className="flex items-center justify-center gap-2 rounded-lg bg-primary py-3 font-bold text-white transition-colors hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90"
            >
              <Download className="h-5 w-5" />
              My Purchases
            </Link>
            <Link
              to="/projects"
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 font-bold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Home className="h-5 w-5" />
              Back to Projects
            </Link>
          </div>

          {/* Email Contact */}
          <div className="mt-8 border-t border-gray-200 pt-6 text-center dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We've sent a confirmation email to your inbox
            </p>
            <a
              href="mailto:support@tech-mates.com"
              className="mt-2 flex items-center justify-center gap-2 text-primary hover:underline dark:text-accent"
            >
              <Mail className="h-4 w-4" />
              support@tech-mates.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
