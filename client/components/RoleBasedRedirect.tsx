import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Shield, 
  Users, 
  Heart, 
  ArrowRight,
  CheckCircle 
} from 'lucide-react';

const RoleBasedRedirect = () => {
  const { user, redirectToDashboard } = useAuth();

  useEffect(() => {
    if (user) {
      // Redirect after showing role confirmation
      const timer = setTimeout(() => {
        redirectToDashboard(user.user_type);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, redirectToDashboard]);

  if (!user) return null;

  const getRoleInfo = (userType: string) => {
    switch (userType) {
      case 'student':
        return {
          icon: GraduationCap,
          title: 'Student Dashboard',
          description: 'Access scholarships, track applications, and manage your profile',
          color: 'bg-blue-600',
          path: '/student-dashboard'
        };
      case 'admin':
        return {
          icon: Shield,
          title: 'Admin Dashboard', 
          description: 'Manage programs, users, and system settings',
          color: 'bg-red-600',
          path: '/admin-dashboard'
        };
      case 'reviewer':
        return {
          icon: Users,
          title: 'Reviewer Dashboard',
          description: 'Review applications and evaluate candidates',
          color: 'bg-purple-600', 
          path: '/reviewer-dashboard'
        };
      case 'donor':
        return {
          icon: Heart,
          title: 'Donor Dashboard',
          description: 'Fund scholarships and track your impact',
          color: 'bg-green-600',
          path: '/donor-dashboard'
        };
      default:
        return {
          icon: GraduationCap,
          title: 'Dashboard',
          description: 'Welcome to your dashboard',
          color: 'bg-gray-600',
          path: '/student-dashboard'
        };
    }
  };

  const roleInfo = getRoleInfo(user.user_type);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`w-20 h-20 ${roleInfo.color} rounded-full flex items-center justify-center mx-auto mb-6`}
        >
          <roleInfo.icon className="h-10 w-10 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <h2 className="text-2xl font-bold text-gray-900">Welcome!</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            Hello, {user.first_name} {user.last_name}
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {roleInfo.title}
            </h3>
            <p className="text-sm text-gray-600">
              {roleInfo.description}
            </p>
          </div>

          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <span className="text-sm font-medium">Redirecting to your dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </div>

          <div className="flex justify-center mt-4">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-blue-600 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RoleBasedRedirect;