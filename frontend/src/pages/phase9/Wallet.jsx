import React from 'react';
import { Wallet } from 'lucide-react';
import WalletCard from '@/components/payment/WalletCard';
import PaymentMethods from '@/components/payment/PaymentMethods';
import TransactionHistory from '@/components/payment/TransactionHistory';

export const Wallet_Phase9 = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Wallet</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Manage your balance and payment methods</p>
        </div>

        {/* Wallet Card */}
        <div className="mb-8">
          <WalletCard />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-1">
            <PaymentMethods />
          </div>

          {/* Transaction History */}
          <div className="lg:col-span-2">
            <TransactionHistory />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet_Phase9;
