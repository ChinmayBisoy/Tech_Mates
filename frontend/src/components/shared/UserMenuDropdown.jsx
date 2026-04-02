import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  User, Settings, HelpCircle, LogOut, MessageSquare, 
  ShoppingBag, LayoutDashboard, FileText, Contact2,
  ChevronDown, Mail
} from 'lucide-react'

export function UserMenuDropdown() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!isAuthenticated || !user) return null

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsOpen(false)
  }

  const menuItems = [
    { icon: User, label: 'Profile', path: '/profile/me' },
    { icon: ShoppingBag, label: 'My Listings', path: '/my-listings' },
    { icon: FileText, label: 'My Projects', path: '/my-projects' },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: MessageSquare, label: 'Inbox', path: '/messages', badge: 0 },
    { icon: Mail, label: 'Notifications', path: '/notifications', badge: 2 },
  ]

  const secondaryItems = [
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Help & Support', path: '/help' },
    { icon: Contact2, label: 'Contact Us', path: '/contact' },
  ]

  return (
    <div ref={dropdownRef} className="relative">
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-700/30 transition duration-200"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
          {user.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <span className="hidden sm:inline text-sm font-medium text-gray-200">
          {user.name?.split(' ')[0] || 'User'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-xl z-50 overflow-hidden">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/50">
            <p className="font-semibold text-white text-sm">{user.name || 'User'}</p>
            <p className="text-xs text-gray-400">{user.email || 'user@example.com'}</p>
            {user.role && (
              <p className="text-xs text-blue-400 capitalize mt-1">{user.role} Account</p>
            )}
          </div>

          {/* Main Menu Items */}
          <div className="py-2 border-b border-slate-700/50">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-200 hover:bg-slate-700/40 transition duration-150 group"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition" />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Secondary Menu Items */}
          <div className="py-2 border-b border-slate-700/50">
            {secondaryItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-slate-700/40 transition duration-150 group"
              >
                <item.icon className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Logout Button */}
          <div className="py-2 px-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-lg transition duration-150 group"
            >
              <LogOut className="w-4 h-4 group-hover:text-red-400 transition" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
