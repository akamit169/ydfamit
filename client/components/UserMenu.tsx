import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Bell, 
  HelpCircle,
  CreditCard,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserDisplayName, getUserInitials, getUserDashboardPath } from '../utils/authHelpers';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  if (!user) return null;

  const userType = user.user_type || user.userType;
  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);

  const menuItems = [
    {
      icon: User,
      label: 'Profile',
      href: '/profile',
      description: 'Manage your account'
    },
    {
      icon: Bell,
      label: 'Notifications',
      href: '/notifications',
      description: 'View your alerts'
    },
    {
      icon: HelpCircle,
      label: 'Support',
      href: '/support',
      description: 'Get help and support'
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/settings',
      description: 'Account preferences'
    }
  ];

  // Add role-specific menu items
  if (userType === 'donor') {
    menuItems.splice(2, 0, {
      icon: CreditCard,
      label: 'Contributions',
      href: '/contributions',
      description: 'View your donations'
    });
  }

  if (userType === 'admin') {
    menuItems.splice(2, 0, {
      icon: Shield,
      label: 'Admin Panel',
      href: '/admin-dashboard',
      description: 'System administration'
    });
  }

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">{initials}</span>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">{displayName}</p>
          <p className="text-xs text-gray-500 capitalize">{userType}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
            >
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">{initials}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{displayName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {userType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <item.icon className="h-4 w-4 mr-3 text-gray-400" />
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Logout */}
              <div className="border-t border-gray-100 pt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;