import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Store, TrendingUp, Heart, Tag, BarChart3, Gift, Zap,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import useStorefrontStore from '@/store/storefront/storefrontStore'
import useWishlistStore from '@/store/storefront/wishlistStore'
import usePromotionStore from '@/store/storefront/promotionStore'
import useAnalyticsStore from '@/store/storefront/analyticsStore'
import useLoyaltyStore from '@/store/storefront/loyaltyStore'
import useBulkOperationsStore from '@/store/storefront/bulkOperationsStore'
import { StorefrontHeader, StorefrontAbout } from '@/components/storefront/StorefrontHeader'

export default function Phase10Page() {
  const { storefront: storefrontId } = useParams()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('storefront')
  
  const storefronts = useStorefrontStore((state) => state.storefronts)
  const wishlists = useWishlistStore((state) => state.wishlists)
  const promotions = usePromotionStore((state) => state.promotions)
  const analytics = useAnalyticsStore((state) => state.sellerAnalytics)
  const loyaltyMembers = useLoyaltyStore((state) => state.memberAccounts)
  const bulkTasks = useBulkOperationsStore((state) => state.bulkTasks)

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center py-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Restricted</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Premium Shopping Experience is only available for logged-in users. Please sign in to access this feature.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'storefront', label: 'Storefronts', icon: Store },
    { id: 'recommendations', label: 'Recommendations', icon: TrendingUp },
    { id: 'wishlist', label: 'Wishlists', icon: Heart },
    { id: 'promotions', label: 'Promotions', icon: Tag },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'loyalty', label: 'Loyalty', icon: Gift },
    { id: 'bulk', label: 'Bulk Ops', icon: Zap },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ✨ Premium Shopping Experience
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Discover curated seller storefronts, personalized recommendations, save wishlists, exclusive promotions, and more
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          
          {/* Phase 10.4: Seller Storefronts */}
          {activeTab === 'storefront' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Store className="w-5 h-5" /> Phase 10.4: Seller Storefronts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {storefronts.slice(0, 4).map((sf) => (
                    <div key={sf.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-lg transition">
                      <div className="flex items-start gap-3">
                        <img src={sf.logoUrl} alt={sf.storeName} className="w-12 h-12 rounded" />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white">{sf.storeName}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">{sf.description}</p>
                          <div className="flex gap-2 mt-2">
                            <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs px-2 py-1 rounded">
                              ⭐ {sf.totalRatings}
                            </span>
                            <span className="text-xs text-slate-500">{sf.productsCount} products</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {storefrontId && <StorefrontHeader storefrontId={parseInt(storefrontId)} />}
              {storefrontId && <StorefrontAbout storefrontId={parseInt(storefrontId)} />}
            </div>
          )}

          {/* Phase 10.5: Recommendations */}
          {activeTab === 'recommendations' && (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> Phase 10.5: AI-Powered Recommendations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Recommended For You</p>
                  <p className="text-2xl font-bold text-blue-600">Web Dev Service</p>
                  <p className="text-sm mt-2">Based on your browsing (95% match)</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Trending Now</p>
                  <p className="text-2xl font-bold text-blue-600">App Development</p>
                  <p className="text-sm mt-2">Popular in your category</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Related Services</p>
                  <p className="text-2xl font-bold text-blue-600">Consulting</p>
                  <p className="text-sm mt-2">People who bought also viewed</p>
                </div>
              </div>
            </div>
          )}

          {/* Phase 10.6: Wishlists */}
          {activeTab === 'wishlist' && (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5" /> Phase 10.6: Wishlist Pro
              </h2>
              <div className="space-y-4">
                {wishlists.slice(0, 2).map((wl) => (
                  <div key={wl.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold">{wl.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{wl.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        wl.isPublic ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-slate-100 dark:bg-slate-700'
                      }`}>
                        {wl.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{wl.items.length} items • Created {new Date(wl.createdDate).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phase 10.7: Promotions */}
          {activeTab === 'promotions' && (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5" /> Phase 10.7: Promotions & Discounts
              </h2>
              <div className="space-y-4">
                {promotions.slice(0, 3).map((promo) => (
                  <div key={promo.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-gradient-to-r from-red-50 dark:from-red-900/10 to-transparent">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{promo.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{promo.description}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 font-bold px-3 py-1 rounded">
                            {promo.discountValue}% OFF
                          </span>
                          <span className="font-mono bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded">
                            {promo.code}
                          </span>
                        </div>
                      </div>
                      <span className={promo.isActive ? 'text-green-600 font-bold' : 'text-slate-500'}>
                        {promo.isActive ? 'Active' : 'Expired'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phase 10.8: Analytics */}
          {activeTab === 'analytics' && (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" /> Phase 10.8: Advanced Analytics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {analytics.slice(0, 1).map((a) => (
                  <div key={a.id} className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Views</p>
                      <p className="text-2xl font-bold">{a.views.toLocaleString()}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Conversions</p>
                      <p className="text-2xl font-bold">{a.conversions}</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Revenue</p>
                      <p className="text-2xl font-bold">${a.revenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Conversion Rate</p>
                      <p className="text-2xl font-bold">{a.conversionRate?.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phase 10.9: Loyalty */}
          {activeTab === 'loyalty' && (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5" /> Phase 10.9: Loyalty Program
              </h2>
              <div className="space-y-4">
                {loyaltyMembers.slice(0, 3).map((member) => (
                  <div key={member.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold">User #{member.userId}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Member since {new Date(member.joinDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{member.currentPoints}</p>
                        <p className="text-xs text-slate-500">points</p>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          member.tier === 'platinum' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                          member.tier === 'gold' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' :
                          'bg-slate-100 dark:bg-slate-700'
                        }`}>
                          {member.tier}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phase 10.10: Bulk Operations */}
          {activeTab === 'bulk' && (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" /> Phase 10.10: Bulk Operations
              </h2>
              <div className="space-y-4">
                {bulkTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold capitalize">{task.taskType.replace('_', ' ')}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {task.itemsProcessed} of {task.totalItems} items processed
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        task.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                        task.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                        'bg-slate-100 dark:bg-slate-700'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(task.itemsProcessed / task.totalItems) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700 text-center text-slate-600 dark:text-slate-400 text-sm">
          <p>© 2026 Tech-Mates. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
