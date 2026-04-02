import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useThemeStore } from '@/store/themeStore'
import { useNotificationStore } from '@/store/notificationStore'
import { Footer } from '@/components/shared/Footer'
import {
  Moon, Sun, Bell, Search, Settings,
  HelpCircle, Shield, LayoutDashboard, User, LogIn, LogOut,
  Home, ShoppingBag, Code2, FileText, Menu, X, Zap,
  Gavel, DollarSign, Hammer, AlertCircle, BarChart3, Users, MessageSquare, Star, Store,
  Briefcase, TrendingUp, Wallet, Award, Clock, CheckCircle, ChevronDown, Lock, Crown
} from 'lucide-react'
import { cn } from '@/utils/cn'

export function CollapsibleNavbar() {
  const { isAuthenticated, user, isDeveloper, isUser, logout } = useAuth()
  const isDark = useThemeStore((state) => state.isDark)
  const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode)
  const unreadMessageNotificationCount = useNotificationStore((state) =>
    (state.notifications || []).filter((item) => !item.read && item.type === 'new_message').length
  )
  const unreadNonMessageNotificationCount = useNotificationStore((state) =>
    (state.notifications || []).filter((item) => !item.read && item.type !== 'new_message').length
  )
  const [isHovered, setIsHovered] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const navRef = useRef(null)
  const profileRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMobileOpen(false)
    setProfileOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setIsMobileOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const publicNavItems = [
    { icon: Home, label: 'Home', path: '/', public: true },
    { icon: ShoppingBag, label: 'Projects', path: '/projects', public: true },
    { icon: Code2, label: 'SE Market', path: '/se-market/browse', public: true },
    { icon: Users, label: 'Developers', path: '/browse/developers', public: true },
  ]

  const profilePath = '/profile/me'
  const isProMember = Boolean(
    user?.isPro ||
    user?.pro ||
    user?.proMember ||
    user?.subscriptionStatus === 'active' ||
    user?.plan === 'pro' ||
    user?.subscriptionTier === 'pro' ||
    user?.subscription?.plan === 'pro'
  )

  // Developer-specific grouped navigation
  const developerMainItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: User, label: 'My Profile', path: profilePath },
  ]

  const developerWorkItems = [
    { icon: TrendingUp, label: 'Opportunities', path: '/se-market/browse' },
    { icon: FileText, label: 'My Proposals', path: '/se-market/my-proposals' },
    { icon: Briefcase, label: 'My Contracts', path: '/contracts' },
  ]

  const developerMarketplaceItems = [
    { icon: Store, label: 'My Listings', path: '/projects/my' },
    {
      icon: isProMember ? ShoppingBag : Lock,
      label: 'Post a Listing',
      path: isProMember ? '/projects/post' : '/payments/subscription',
      badge: isProMember ? null : 'Pro',
    },
  ]

  const developerMoneyItems = [
    { icon: Wallet, label: 'Earnings', path: '/payments/earnings' },
    {
      icon: isProMember ? Award : Crown,
      label: isProMember ? 'My Subscription' : 'Go Pro',
      path: '/payments/subscription',
    },
  ]

  // Client-specific grouped navigation
  const clientMainItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: User, label: 'My Profile', path: profilePath },
  ]

  const clientHireItems = [
    { icon: FileText, label: 'Post a Requirement', path: '/se-market/post-requirement' },
    { icon: Clock, label: 'My Requirements', path: '/se-market/my-requirements' },
    { icon: MessageSquare, label: 'Proposals Received', path: '/se-market/proposals-received' },
    { icon: CheckCircle, label: 'My Contracts', path: '/contracts' },
  ]

  const clientMarketplaceItems = [
    { icon: ShoppingBag, label: 'Browse Projects', path: '/projects' },
    { icon: Star, label: 'Wishlist', path: '/dashboard/wishlist' },
    { icon: Store, label: 'My Purchases', path: '/dashboard/purchases' },
  ]

  const dashboardPath = '/dashboard'
  const isChatRoute = location.pathname.startsWith('/chat') || location.pathname.startsWith('/messages')
  const shouldShowChatDot = unreadMessageNotificationCount > 0 && !isChatRoute

  const isActive = (path) => location.pathname === path

  return (
    <div className="bg-white dark:bg-base min-h-screen">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-surface border-b border-gray-200 dark:border-gray-800">
        <div className="h-16 px-4 md:px-6 flex items-center justify-between">
          {/* Left: Logo & Menu Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Menu"
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="hidden sm:inline font-bold text-lg text-gray-900 dark:text-white">
                TechMates
              </span>
            </Link>
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Notifications */}
            {isAuthenticated && (
              <button
                onClick={() => navigate('/notifications')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {unreadNonMessageNotificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>
            )}

            {/* Messages */}
            {isAuthenticated && (
              <button
                onClick={() => navigate('/messages')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative"
                title="Messages"
              >
                <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {shouldShowChatDot && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Profile Dropdown - Right Corner */}
            {isAuthenticated && user ? (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                  title="Profile Menu"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white leading-none">
                      {user.name?.split(' ')[0] || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize leading-none">
                      {user.role === 'client' ? 'Client' : user.role}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-elevated rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 capitalize mt-1">
                        {user.role === 'client' ? 'Client Account' : `${user.role} Account`}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to={dashboardPath}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link
                        to="/profile/me"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        View Profile
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>

                      {user.role === 'admin' && (
                        <>
                          <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
                          <Link
                            to="/admin"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        </>
                      )}

                      <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
                      <Link
                        to="/help"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <HelpCircle className="w-4 h-4" />
                        Help & Support
                      </Link>

                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors hidden sm:block"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          ref={navRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            'fixed left-0 top-16 h-[calc(100vh-64px)] bg-white dark:bg-surface border-r border-gray-200 dark:border-gray-800',
            'transition-all duration-300 flex flex-col overflow-hidden',
            'z-30',
            isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-20',
            isHovered && 'md:w-64'
          )}
        >
          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-4 space-y-1.5">
            {/* Public Items (only for logged-out users) */}
            {!isAuthenticated && publicNavItems.map((item) => (
              <NavItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                path={item.path}
                isActive={isActive(item.path)}
                isHovered={isHovered}
                onClick={() => setIsMobileOpen(false)}
              />
            ))}

            {/* Authenticated Content */}
            {isAuthenticated && (
              <>
                {/* Developer Sidebar */}
                {isDeveloper && (
                  <>
                    <SectionLabel label="Main" icon="🏠" isHovered={isHovered} />
                    {developerMainItems.map((item) => (
                      <NavItem
                        key={item.path}
                        icon={item.icon}
                        label={item.label}
                        path={item.path}
                        isActive={isActive(item.path)}
                        isHovered={isHovered}
                        onClick={() => setIsMobileOpen(false)}
                      />
                    ))}

                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-3 mx-2" />
                    <SectionLabel label="Work" icon="💼" isHovered={isHovered} />
                    {developerWorkItems.map((item) => (
                      <NavItem
                        key={item.path}
                        icon={item.icon}
                        label={item.label}
                        path={item.path}
                        isActive={isActive(item.path)}
                        isHovered={isHovered}
                        onClick={() => setIsMobileOpen(false)}
                      />
                    ))}

                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-3 mx-2" />
                    <SectionLabel label="Marketplace" icon="🛒" isHovered={isHovered} />
                    {developerMarketplaceItems.map((item) => (
                      <NavItem
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        path={item.path}
                        badge={item.badge}
                        isActive={isActive(item.path)}
                        isHovered={isHovered}
                        onClick={() => setIsMobileOpen(false)}
                      />
                    ))}

                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-3 mx-2" />
                    <SectionLabel label="Money" icon="💰" isHovered={isHovered} />
                    {developerMoneyItems.map((item) => (
                      <NavItem
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        path={item.path}
                        isActive={isActive(item.path)}
                        isHovered={isHovered}
                        onClick={() => setIsMobileOpen(false)}
                      />
                    ))}
                  </>
                )}

                {/* Client Sidebar */}
                {isUser && (
                  <>
                    <SectionLabel label="Main" icon="🏠" isHovered={isHovered} />
                    {clientMainItems.map((item) => (
                      <NavItem
                        key={item.path}
                        icon={item.icon}
                        label={item.label}
                        path={item.path}
                        isActive={isActive(item.path)}
                        isHovered={isHovered}
                        onClick={() => setIsMobileOpen(false)}
                      />
                    ))}

                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-3 mx-2" />
                    <SectionLabel label="Hire" icon="📝" isHovered={isHovered} />
                    {clientHireItems.map((item) => (
                      <NavItem
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        path={item.path}
                        isActive={isActive(item.path)}
                        isHovered={isHovered}
                        onClick={() => setIsMobileOpen(false)}
                      />
                    ))}

                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-3 mx-2" />
                    <SectionLabel label="Marketplace" icon="🛍️" isHovered={isHovered} />
                    {clientMarketplaceItems.map((item) => (
                      <NavItem
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        path={item.path}
                        isActive={isActive(item.path)}
                        isHovered={isHovered}
                        onClick={() => setIsMobileOpen(false)}
                      />
                    ))}
                  </>
                )}

                {/* Admin Section */}
                {user?.role === 'admin' && (
                  <>
                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-3 mx-2" />
                    <NavItem
                      icon={Shield}
                      label="Admin Panel"
                      path="/admin"
                      isActive={isActive('/admin')}
                      isHovered={isHovered}
                      variant="danger"
                      onClick={() => setIsMobileOpen(false)}
                    />
                  </>
                )}
              </>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={cn(
          'flex-1 transition-all duration-300 flex flex-col min-h-[calc(100vh-64px)]',
          isMobileOpen ? 'ml-0' : isHovered ? 'md:ml-64' : 'md:ml-20'
        )}>
          <div className={cn('flex-1', isChatRoute ? 'overflow-hidden' : 'overflow-auto')}>
            <Outlet />
          </div>
          {!isChatRoute && <Footer />}
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden top-16"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  )
}

// Section Label Component
const SectionLabel = ({ label, icon, isHovered }) => (
  <div className="px-4 py-2">
    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
      {isHovered ? label : icon}
    </p>
  </div>
)

// NavItem Component
const NavItem = ({ 
  icon: Icon, 
  label, 
  path, 
  badge,
  isActive, 
  isHovered, 
  onClick, 
  variant = 'default' 
}) => (
  <Link
    to={path}
    onClick={onClick}
    className={cn(
      'flex items-center gap-4 px-4 py-3 mx-2 rounded-lg transition-all duration-300 group',
      isActive 
        ? 'bg-primary-600 dark:bg-primary-700 text-white'
        : variant === 'danger'
          ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
          : 'text-gray-600 dark:text-gray-400 hover:bg-primary-100 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400'
    )}
    title={label}
  >
    <Icon className="w-5 h-5 shrink-0" />
    
    {isHovered && (
      <div className="flex items-center justify-between w-full min-w-0 gap-2">
        <span className="text-sm font-medium whitespace-nowrap transition-opacity duration-300 truncate">
          {label}
        </span>
        {badge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-700 shrink-0">
            {badge}
          </span>
        )}
      </div>
    )}
  </Link>
)
