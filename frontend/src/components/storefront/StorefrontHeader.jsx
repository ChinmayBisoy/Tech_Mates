import { useState } from 'react'
import { Store, Share2, Heart, MapPin, Clock, Star, MessageSquare, ShoppingBag } from 'lucide-react'
import useStorefrontStore from '@/store/storefront/storefrontStore'

export function StorefrontHeader({ storefrontId }) {
  const storefront = useStorefrontStore((state) => state.getStorefront(storefrontId))
  const [isFollowing, setIsFollowing] = useState(false)

  if (!storefront) return null

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden mb-6">
      {/* Cover Image */}
      <div
        className="h-48 bg-cover bg-center"
        style={{ backgroundImage: `url(${storefront.coverImageUrl})` }}
      />

      {/* Store Info */}
      <div className="px-6 py-6 relative">
        <div className="flex items-start gap-6">
          {/* Logo */}
          <div className="relative -mt-16">
            <img
              src={storefront.logoUrl}
              alt={storefront.storeName}
              className="w-24 h-24 rounded-lg border-4 border-white dark:border-slate-800 shadow-lg"
            />
            {storefront.isVerified && (
              <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2">
                ✓
              </div>
            )}
          </div>

          {/* Store Details */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {storefront.storeName}
              </h1>
              {storefront.isPremium && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                  Premium
                </span>
              )}
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-3">{storefront.tagline}</p>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold">{storefront.totalRatings}/5</span>
                <span className="text-slate-500">({storefront.totalReviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <ShoppingBag className="w-4 h-4" />
                <span>{storefront.productsCount} products</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isFollowing
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Store Stats and Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Response Time</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {storefront.responseTime}h
            </p>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Success Rate</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {storefront.successRate}%
            </p>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Followers</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {storefront.followers?.length || 0}
            </p>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Views This Month</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {storefront.viewsThisMonth?.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function StorefrontAbout({ storefrontId }) {
  const storefront = useStorefrontStore((state) => state.getStorefront(storefrontId))

  if (!storefront) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">About This Store</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">{storefront.aboutUs}</p>

        <h4 className="font-semibold mb-3">Categories</h4>
        <div className="flex flex-wrap gap-2 mb-6">
          {storefront.categories?.map((cat) => (
            <span key={cat} className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
              {cat}
            </span>
          ))}
        </div>

        <h4 className="font-semibold mb-3">Business Hours</h4>
        <div className="space-y-2 text-sm">
          {storefront.businessHours && Object.entries(storefront.businessHours).map(([day, hours]) => (
            <div key={day} className="flex justify-between">
              <span className="capitalize text-slate-600 dark:text-slate-400">{day}</span>
              <span className="font-medium">
                {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6">
          <h4 className="font-semibold mb-4">Contact & Info</h4>
          <div className="space-y-3">
            {storefront.website && (
              <a href={storefront.website} className="text-blue-600 hover:underline flex items-center gap-2">
                🌐 Visit Website
              </a>
            )}
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <p>Since {new Date(storefront.establishedDate).getFullYear()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-6">
          <h4 className="font-semibold mb-4">Shipping & Returns</h4>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Domestic:</span> {storefront.shippingInfo.domesticShippingDays} days
            </p>
            <p>
              <span className="font-medium">International:</span> {storefront.shippingInfo.internationalShippingDays} days
            </p>
            <p>
              <span className="font-medium">Free Shipping:</span> Over ${storefront.shippingInfo.freeShippingThreshold}
            </p>
            <p>
              <span className="font-medium">Returns:</span> {storefront.shippingInfo.returnPolicyDays} days
            </p>
          </div>
        </div>

        {storefront.socialLinks && Object.keys(storefront.socialLinks).length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6">
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-3">
              {storefront.socialLinks.twitter && (
                <a href={storefront.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition">
                  𝕏
                </a>
              )}
              {storefront.socialLinks.linkedin && (
                <a href={storefront.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition">
                  in
                </a>
              )}
              {storefront.socialLinks.instagram && (
                <a href={storefront.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-400 transition">
                  📷
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// © 2026 Tech-Mates. All rights reserved.
