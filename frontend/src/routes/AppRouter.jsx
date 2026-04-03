import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'
import OwnerRoute from '@/components/admin/OwnerRoute'
import App from '@/App'
import { PageLoader } from '@/components/shared/PageLoader'

// Lazy imports for SE Market pages
const PostRequirementPage = lazy(() => import('@/pages/se-market/PostRequirement'))
const MyRequirementsPage = lazy(() => import('@/pages/se-market/MyRequirements'))
const MyProposalsPage = lazy(() => import('@/pages/se-market/MyProposals'))
const ProposalsReceivedPage = lazy(() => import('@/pages/se-market/ProposalsReceived'))

// Lazy imports for Projects/Marketplace pages
const BrowseListings = lazy(() => import('@/pages/projects/BrowseListings'))
const ListingDetail = lazy(() => import('@/pages/projects/ListingDetail'))
const PostListing = lazy(() => import('@/pages/projects/PostListing'))
const PurchaseSuccess = lazy(() => import('@/pages/purchase/PurchaseSuccess'))

// Lazy imports for Phase 7 Dashboard pages
const ClientDashboard = lazy(() => import('@/pages/dashboard/ClientDashboard'))
const DeveloperDashboard = lazy(() => import('@/pages/dashboard/DeveloperDashboard'))
const MyPurchases = lazy(() => import('@/pages/dashboard/MyPurchases'))
const MyListings = lazy(() => import('@/pages/dashboard/MyListings'))
const WishlistPage = lazy(() => import('@/pages/dashboard/Wishlist'))
const AnalyticsDashboard = lazy(() => import('@/pages/dashboard/AnalyticsDashboard'))
const EditListing = lazy(() => import('@/pages/dashboard/EditListing'))
const ListingStats = lazy(() => import('@/pages/dashboard/ListingStats'))
const SupportTickets = lazy(() => import('@/pages/dashboard/SupportTickets'))

// Lazy imports for Navbar Feature Pages
const NotificationsPage = lazy(() => import('@/pages/Notifications'))
const SettingsPage = lazy(() => import('@/pages/Settings'))
const HelpPage = lazy(() => import('@/pages/Help'))
const AdminPage = lazy(() => import('@/pages/Admin'))
const UserProfilePage = lazy(() => import('@/pages/profile/PublicProfile'))
const ProfileSetupPage = lazy(() => import('@/pages/profile/ProfileSetup'))
const SearchPage = lazy(() => import('@/pages/Search'))
const BrowseDevelopersPage = lazy(() => import('@/pages/BrowseDevelopers'))

// Lazy import for Activity Feed
const ActivityFeed = lazy(() => import('@/pages/ActivityFeed'))

// Lazy imports for Phase 8 - Advanced Marketplace (Auctions, Escrow, Disputes)
const ActiveAuctions = lazy(() => import('@/pages/marketplace/ActiveAuctions'))
const MyAuctions = lazy(() => import('@/pages/marketplace/MyAuctions'))
const Escrow = lazy(() => import('@/pages/marketplace/Escrow'))
const Disputes = lazy(() => import('@/pages/marketplace/Disputes'))

// Lazy imports for Phase 9 - Real-time, Payments, Social, Analytics, Search, Notifications
const Wallet_Phase9 = lazy(() => import('@/pages/phase9/Wallet'))
const SellerDashboard_Phase9 = lazy(() => import('@/pages/phase9/SellerDashboard'))
const UserProfiles_Phase9 = lazy(() => import('@/pages/phase9/UserProfiles'))
const Messages_Phase9 = lazy(() => import('@/pages/phase9/Messages'))
const AdvancedSearchPage_Phase9 = lazy(() => import('@/pages/phase9/AdvancedSearch'))
const NotificationCenter_Phase9 = lazy(() => import('@/pages/phase9/NotificationCenter'))

// Lazy imports for Phase 10.1 - Owner Admin Dashboard
const OwnerLogin = lazy(() => import('@/pages/OwnerLogin'))
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'))

// Lazy imports for Phase 10.2 - Advanced Ratings & Reviews
const ReviewsPage_Phase10 = lazy(() => import('@/pages/ReviewsPage'))

// Lazy imports for Phase 10.3 - Seller Verification & Badges
const SellerVerificationPage_Phase10 = lazy(() => import('@/pages/SellerVerificationPage'))

// Lazy imports for Phase 10.4-10.10 - Enhanced Shopping Experience
const Phase10Page = lazy(() => import('@/pages/Phase10Page'))

// Lazy imports for Subscription
const SubscriptionPage = lazy(() => import('@/pages/Subscription'))
const SubscriptionCheckoutPage = lazy(() => import('@/pages/SubscriptionCheckout'))
const SubscriptionSuccessPage = lazy(() => import('@/pages/SubscriptionSuccess'))

// Stub page component for routes being built in other phases
const StubPage = ({ title }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mt-2">
        Coming in next phase
      </p>
    </div>
  </div>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { Home } = await import('@/pages/Home')
          return { Component: Home }
        },
      },
      {
        path: 'login',
        lazy: async () => {
          const { Login } = await import('@/pages/auth/Login')
          return { Component: Login }
        },
      },
      {
        path: 'register',
        lazy: async () => {
          const { Register } = await import('@/pages/auth/Register')
          return { Component: Register }
        },
      },
      {
        path: 'forgot-password',
        lazy: async () => {
          const { ForgotPassword } = await import('@/pages/auth/ForgotPassword')
          return { Component: ForgotPassword }
        },
      },
      {
        path: 'reset-password/:token',
        lazy: async () => {
          const { ResetPassword } = await import('@/pages/auth/ResetPassword')
          return { Component: ResetPassword }
        },
      },
      {
        path: 'dashboard',
        lazy: async () => {
          const { Dashboard } = await import('@/pages/Dashboard')
          return { Component: Dashboard }
        },
      },
      {
        path: 'user/dashboard',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <ClientDashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'developer/dashboard',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <DeveloperDashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <RoleRoute allowedRoles={['admin']}>
            <StubPage title="Admin Dashboard" />
          </RoleRoute>
        ),
      },
      {
        path: 'se-market/browse',
        lazy: async () => {
          const BrowseRequirements = await import('@/pages/se-market/BrowseRequirements')
          return { Component: BrowseRequirements.default }
        },
      },
      {
        path: 'se-market/post-requirement',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <PostRequirementPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'se-market/requirement/:id',
        lazy: async () => {
          const RequirementDetail = await import('@/pages/se-market/RequirementDetail')
          return { Component: RequirementDetail.default }
        },
      },
      {
        path: 'se-market/my-requirements',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <MyRequirementsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'se-market/my-proposals',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <MyProposalsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'se-market/proposals-received',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <ProposalsReceivedPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'projects',
        element: <Suspense fallback={<PageLoader />}><BrowseListings /></Suspense>,
      },
      {
        path: 'projects/:slug',
        element: <Suspense fallback={<PageLoader />}><ListingDetail /></Suspense>,
      },
      {
        path: 'projects/post',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <PostListing />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'projects/my',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <MyListings />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'purchase/success',
        element: <Suspense fallback={<PageLoader />}><PurchaseSuccess /></Suspense>,
      },
      {
        path: 'dashboard/purchases',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <MyPurchases />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/wishlist',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <WishlistPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'seller/analytics',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <AnalyticsDashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'projects/:id/edit',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <EditListing />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'projects/:id/stats',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <ListingStats />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'support/tickets',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <SupportTickets />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'notifications',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <NotificationsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <SettingsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'help',
        element: (
          <Suspense fallback={<PageLoader />}>
            <HelpPage />
          </Suspense>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <AdminPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile/:userId',
        element: (
          <Suspense fallback={<PageLoader />}>
            <UserProfilePage />
          </Suspense>
        ),
      },
      {
        path: 'profile/setup',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <ProfileSetupPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'search',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SearchPage />
          </Suspense>
        ),
      },
      {
        path: 'browse/developers',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BrowseDevelopersPage />
          </Suspense>
        ),
      },
      {
        path: 'activity',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ActivityFeed />
          </Suspense>
        ),
      },
      {
        path: 'contracts',
        lazy: async () => {
          const ContractList = await import('@/pages/contracts/ContractList')
          return { Component: ContractList.default }
        },
      },
      {
        path: 'contracts/:id',
        lazy: async () => {
          const ContractDetail = await import('@/pages/contracts/ContractDetail')
          return { Component: ContractDetail.default }
        },
      },
      {
        path: 'profile/edit',
        lazy: async () => {
          const { EditProfile } = await import('@/pages/profile/EditProfile')
          return { Component: EditProfile }
        },
      },
      {
        path: 'chat',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <Messages_Phase9 />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'chat/:roomId',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <Messages_Phase9 />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'payments/earnings',
        element: <StubPage title="Earnings" />,
      },
      {
        path: 'payments/subscription',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <SubscriptionPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'subscription/checkout/:planId',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <SubscriptionCheckoutPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'subscription/success',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <SubscriptionSuccessPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'payments/withdraw',
        element: <StubPage title="Withdraw" />,
      },
      {
        path: 'purchase/success',
        element: <StubPage title="Purchase Success" />,
      },
      {
        path: 'purchase/cancel',
        element: <StubPage title="Purchase Cancelled" />,
      },
      {
        path: 'admin/users',
        element: <StubPage title="Admin Users" />,
      },
      {
        path: 'admin/listings',
        element: <StubPage title="Admin Listings" />,
      },
      {
        path: 'admin/disputes',
        element: <StubPage title="Admin Disputes" />,
      },
      {
        path: 'admin/analytics',
        element: <StubPage title="Admin Analytics" />,
      },
      // Phase 8 - Advanced Marketplace Routes
      {
        path: 'marketplace/auctions',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ActiveAuctions />
          </Suspense>
        ),
      },
      {
        path: 'marketplace/my-auctions',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <MyAuctions />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'marketplace/escrow',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <Escrow />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'marketplace/disputes',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <Disputes />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      // Phase 9 Routes
      {
        path: 'wallet',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <Wallet_Phase9 />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'seller-dashboard',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <SellerDashboard_Phase9 />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'community',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <UserProfiles_Phase9 />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'messages',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <Messages_Phase9 />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'advanced-search',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdvancedSearchPage_Phase9 />
          </Suspense>
        ),
      },
      {
        path: 'notifications-center',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <NotificationCenter_Phase9 />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      // Phase 10.1 - Owner Admin Dashboard Routes
      {
        path: 'owner-login',
        element: (
          <Suspense fallback={<PageLoader />}>
            <OwnerLogin />
          </Suspense>
        ),
      },
      {
        path: 'admin-dashboard',
        element: (
          <OwnerRoute>
            <Suspense fallback={<PageLoader />}>
              <AdminDashboard />
            </Suspense>
          </OwnerRoute>
        ),
      },
      // Phase 10.2 - Advanced Ratings & Reviews Routes
      {
        path: 'reviews/:productId',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ReviewsPage_Phase10 />
          </Suspense>
        ),
      },
      // Phase 10.3 - Seller Verification & Badges Routes
      {
        path: 'seller-verification',
        element: (
          <RoleRoute allowedRoles={['developer']}>
            <Suspense fallback={<PageLoader />}>
              <SellerVerificationPage_Phase10 />
            </Suspense>
          </RoleRoute>
        ),
      },
      // Phase 10.4-10.10 - Enhanced Shopping Experience (Storefronts, Recommendations, Wishlist, Promotions, Analytics, Loyalty, Bulk Ops)
      {
        path: 'phase-10',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Phase10Page />
          </Suspense>
        ),
      },
      {
        path: 'phase-10/:storefront',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Phase10Page />
          </Suspense>
        ),
      },
      {
        path: '*',
        lazy: async () => {
          const { NotFound } = await import('@/pages/NotFound')
          return { Component: NotFound }
        },
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
