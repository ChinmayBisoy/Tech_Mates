import React from 'react';
import { History, ArrowUpRight, ArrowDownLeft, DollarSign } from 'lucide-react';
import { usePaymentStore } from '@/store/paymentStore';

// Transaction History - Shows all wallet transactions
export default function TransactionHistory() {
  const { transactions } = usePaymentStore();

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
      case 'refund':
        return <ArrowDownLeft className="w-4 h-4" />;
      case 'withdrawal':
      case 'payment':
      case 'fee':
        return <ArrowUpRight className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit':
      case 'refund':
        return 'text-green-600 dark:text-green-400';
      case 'withdrawal':
      case 'payment':
      case 'fee':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTypeLabel = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Transaction History</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left py-3 font-semibold text-gray-700 dark:text-gray-300">Description</th>
              <th className="text-left py-3 font-semibold text-gray-700 dark:text-gray-300">Type</th>
              <th className="text-right py-3 font-semibold text-gray-700 dark:text-gray-300">Amount</th>
              <th className="text-center py-3 font-semibold text-gray-700 dark:text-gray-300">Status</th>
              <th className="text-right py-3 font-semibold text-gray-700 dark:text-gray-300">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="py-3">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{tx.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{tx.reference}</p>
                  </div>
                </td>
                <td className="py-3">
                  <div className={`flex items-center gap-1 ${getTransactionColor(tx.type)}`}>
                    {getTransactionIcon(tx.type)}
                    {getTypeLabel(tx.type)}
                  </div>
                </td>
                <td className="py-3 text-right font-semibold text-gray-900 dark:text-white">
                  {tx.type === 'deposit' || tx.type === 'refund' ? '+' : '-'}${tx.amount.toFixed(2)}
                </td>
                <td className="py-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-medium
                    ${tx.status === 'completed' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                      : tx.status === 'pending'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}
                  >
                    {getTypeLabel(tx.status)}
                  </span>
                </td>
                <td className="py-3 text-right text-gray-500 dark:text-gray-400">
                  {new Date(tx.date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
