import React from 'react';
import { Wallet, DollarSign, TrendingUp } from 'lucide-react';
import { usePaymentStore } from '@/store/paymentStore';

// Wallet Card - Displays balance and quick stats
export default function WalletCard() {
  const { wallet, getTotalSpent, getTotalEarned } = usePaymentStore();
  const totalSpent = getTotalSpent()();
  const totalEarned = getTotalEarned()();

  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-blue-100 mb-1 text-sm font-medium">Total Balance</p>
          <p className="text-4xl font-bold">${wallet.balance.toFixed(2)}</p>
        </div>
        <Wallet className="w-12 h-12 opacity-30" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/20 rounded-lg p-3">
          <p className="text-blue-100 text-xs font-medium mb-1">Total Earned</p>
          <p className="text-xl font-semibold flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            ${totalEarned.toFixed(2)}
          </p>
        </div>
        <div className="bg-white/20 rounded-lg p-3">
          <p className="text-blue-100 text-xs font-medium mb-1">Total Spent</p>
          <p className="text-xl font-semibold">${totalSpent.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/20">
        <p className="text-blue-100 text-sm">Status: {wallet.status}</p>
        <p className="text-blue-100 text-sm">Last updated: {new Date(wallet.lastUpdated).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
