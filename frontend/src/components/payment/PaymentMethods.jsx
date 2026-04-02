import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, Check } from 'lucide-react';
import { usePaymentStore } from '@/store/paymentStore';

// Payment Methods Manager Component
export default function PaymentMethods() {
  const { paymentMethods, addPaymentMethod, removePaymentMethod, setDefaultPaymentMethod } = usePaymentStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'credit_card',
    brand: '',
    last4: '',
    expiryMonth: '',
    expiryYear: '',
    cardholderName: '',
  });

  const handleAddMethod = () => {
    if (formData.cardholderName && formData.last4) {
      addPaymentMethod(formData);
      setFormData({
        type: 'credit_card',
        brand: '',
        last4: '',
        expiryMonth: '',
        expiryYear: '',
        cardholderName: '',
      });
      setShowForm(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Payment Methods</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          <Plus className="w-4 h-4" />
          Add Method
        </button>
      </div>

      {/* Add Method Form */}
      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
          <input
            type="text"
            placeholder="Cardholder Name"
            value={formData.cardholderName}
            onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <select
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">Select Card Brand</option>
            <option value="Visa">Visa</option>
            <option value="Mastercard">Mastercard</option>
            <option value="Amex">American Express</option>
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Last 4 digits"
              value={formData.last4}
              onChange={(e) => setFormData({ ...formData, last4: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <input
              type="number"
              placeholder="Year"
              value={formData.expiryYear}
              onChange={(e) => setFormData({ ...formData, expiryYear: parseInt(e.target.value) })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddMethod}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Payment Methods List */}
      <div className="space-y-3">
        {paymentMethods.length === 0 ? (
          <p className="text-center py-6 text-gray-500 dark:text-gray-400">No payment methods added yet</p>
        ) : (
          paymentMethods.map(method => (
            <div
              key={method.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {method.brand} ••• {method.last4}
                    </p>
                    {method.isDefault && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {method.cardholderName} • Expires {method.expiryMonth}/{method.expiryYear}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!method.isDefault && (
                    <button
                      onClick={() => setDefaultPaymentMethod(method.id)}
                      className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                      title="Set as default"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => removePaymentMethod(method.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
