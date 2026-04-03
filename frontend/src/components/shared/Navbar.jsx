import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useNotificationStore } from '@/store/notificationStore'
import { useThemeStore } from '@/store/themeStore'
import { 
  Menu, X, Moon, Sun, LogOut, Bell, Search, Settings, 
  HelpCircle, Shield, LayoutDashboard, User, LogIn, Zap
} from 'lucide-react'
import { cn } from '@/utils/cn'

export function Navbar() {
  const { isAuthenticated, user, clearAuth } = useAuth()
  const { unreadCount } = useNotificationStore()
  const isDark = useThemeStore((state) => state.isDark)
  const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode)
  const [isOpen, setIsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const profileRef = useRef(null)
  const searchRef = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    clearAuth()
    setProfileOpen(false)
    setIsOpen(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setSearchOpen(false)
    }
  }

  const navLinks = isAuthenticated
    ? [
        { label: 'Projects', href: '/projects' },
        user?.role === 'developer' && { label: 'Opportunities', href: '/se-market' },
        user?.role === 'developer' && {
          label: 'Earnings',
          href: '/payments/earnings',
        },
        user?.role === 'developer' && { label: 'Recommended', href: '/recommendations' },
        user?.role === 'user' && {
          label: 'My Requirements',
          href: '/se-market/my',
        },
        { label: 'Contracts', href: '/dashboard/contracts' },
        { label: 'Chat', href: '/chat' },
      ].filter(Boolean)
    : [
        { label: 'Projects', href: '/projects' },
        { label: 'Developers', href: '/developers' },
      ]

  const isActive = (href) => location.pathname === href

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-surface border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:inline">
              TechMates
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'text-primary-600 dark:text-accent'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Dashboard Link - Feature 3 */}
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={cn(
                  'text-sm font-medium transition-colors flex items-center gap-2',
                  isActive('/dashboard')
                    ? 'text-primary-600 dark:text-accent'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Search Bar - Feature 4 */}
            {isAuthenticated && (
              <div ref={searchRef} className="relative">
                {searchOpen ? (
                  <form onSubmit={handleSearch} className="absolute right-0 top-1/2 -translate-y-1/2">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search projects, developers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-48 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    />
                  </form>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-elevated rounded-lg transition-colors"
                    aria-label="Search"
                  >
                    <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                )}
              </div>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-gray-100 dark:hover:bg-elevated rounded-lg transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notification Bell - Feature 2 */}
                <button
                  onClick={() => navigate('/notifications')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-elevated rounded-lg transition-colors relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-danger rounded-full text-white text-xs flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* User Profile Dropdown - Feature 1 */}
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-3 p-1 hover:bg-gray-100 dark:hover:bg-elevated rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="hidden sm:block text-sm">
                      <p className="text-gray-900 dark:text-white font-medium truncate max-w-xs">
                        {user?.name}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs capitalize">
                        {user?.role}
                      </p>
                    </div>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-elevated rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {user?.role} Account
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {/* View Profile */}
                        <Link
                          to="/profile/me"
                          onClick={() => setProfileOpen(false)}
                          className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          View Profile
                        </Link>

                        {/* Settings - Feature 5 */}
                        <Link
                          to="/settings"
                          onClick={() => setProfileOpen(false)}
                          className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>

                        {/* Admin Panel - Feature 7 */}
                        {user?.role === 'admin' && (
                          <>
                            <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                            <Link
                              to="/admin"
                              onClick={() => setProfileOpen(false)}
                              className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                            >
                              <Shield className="w-4 h-4" />
                              Admin Panel
                            </Link>
                          </>
                        )}

                        {/* Help & Support - Feature 6 */}
                        <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                        <Link
                          to="/help"
                          onClick={() => setProfileOpen(false)}
                          className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors"
                        >
                          <HelpCircle className="w-4 h-4" />
                          Help & Support
                        </Link>

                        {/* Logout */}
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-sm text-danger hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Auth Buttons */
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-elevated rounded-lg transition-colors flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-elevated rounded-lg transition-colors"
            >
              {isOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Feature 5 (Organized Sections) */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="flex flex-col gap-1">
              {/* Navigation Section */}
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Navigation
                </p>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-lg transition-colors block',
                      isActive(link.href)
                        ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-accent'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-elevated'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {isAuthenticated && (
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-elevated"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
              </div>

              {/* Account Section */}
              {isAuthenticated && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                  <div className="px-4 py-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Account
                    </p>
                    <Link
                      to="/profile/me"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-elevated rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-elevated rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </div>

                  {/* Admin Section */}
                  {user?.role === 'admin' && (
                    <>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                      <div className="px-4 py-2">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                          Administration
                        </p>
                        <Link
                          to="/admin"
                          onClick={() => setIsOpen(false)}
                          className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      </div>
                    </>
                  )}

                  {/* Support Section */}
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                  <div className="px-4 py-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Support
                    </p>
                    <Link
                      to="/help"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-elevated rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Help & Support
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsOpen(false)
                    }}
                    className="mx-4 w-auto px-4 py-2 text-sm font-medium text-danger hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              )}

              {/* Auth Links */}
              {!isAuthenticated && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-elevated rounded-lg transition-colors flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="mx-4 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
