import { User } from '../../shared/types/database';

export const getUserDashboardPath = (user: User | null): string => {
  if (!user) return '/auth';
  
  const userType = user.user_type || user.userType;
  switch (userType) {
    case 'admin':
      return '/admin-dashboard';
    case 'reviewer':
      return '/reviewer-dashboard';
    case 'donor':
      return '/donor-dashboard';
    case 'student':
    default:
      return '/student-dashboard';
  }
};

export const getUserDisplayName = (user: User | null): string => {
  if (!user) return '';
  
  const firstName = user.first_name || user.firstName || '';
  const lastName = user.last_name || user.lastName || '';
  
  return `${firstName} ${lastName}`.trim() || user.email || 'User';
};

export const getUserInitials = (user: User | null): string => {
  if (!user) return 'U';
  
  const firstName = user.first_name || user.firstName || '';
  const lastName = user.last_name || user.lastName || '';
  
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  
  if (firstName) {
    return firstName[0].toUpperCase();
  }
  
  if (user.email) {
    return user.email[0].toUpperCase();
  }
  
  return 'U';
};

export const isUserRole = (user: User | null, role: string): boolean => {
  if (!user) return false;
  const userType = user.user_type || user.userType;
  return userType === role;
};

export const hasPermission = (user: User | null, allowedRoles: string[]): boolean => {
  if (!user) return false;
  const userType = user.user_type || user.userType;
  return allowedRoles.includes(userType);
};

export const getWelcomeMessage = (user: User | null): string => {
  if (!user) return 'Welcome!';
  
  const firstName = user.first_name || user.firstName || '';
  const userType = user.user_type || user.userType;
  
  const timeOfDay = new Date().getHours();
  let greeting = 'Hello';
  
  if (timeOfDay < 12) {
    greeting = 'Good Morning';
  } else if (timeOfDay < 17) {
    greeting = 'Good Afternoon';
  } else {
    greeting = 'Good Evening';
  }
  
  const name = firstName || 'there';
  const roleTitle = userType === 'student' ? '' : `, ${userType.charAt(0).toUpperCase() + userType.slice(1)}`;
  
  return `${greeting}, ${name}${roleTitle}!`;
};

export const validateUserAccess = (
  user: User | null, 
  requiredRoles: string[], 
  currentPath: string
): { hasAccess: boolean; redirectPath?: string; message?: string } => {
  if (!user) {
    return {
      hasAccess: false,
      redirectPath: '/auth',
      message: 'Authentication required'
    };
  }

  const userType = user.user_type || user.userType;
  
  if (!requiredRoles.includes(userType)) {
    return {
      hasAccess: false,
      redirectPath: `/${userType}-dashboard`,
      message: `Access denied. This page is for ${requiredRoles.join(', ')} users only.`
    };
  }

  return { hasAccess: true };
};