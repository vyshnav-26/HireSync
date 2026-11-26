import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, token, isAuthenticated, isLoading, login, logout, updateUser } = useAuthStore();

  const isRecruiter = user?.role === 'ROLE_RECRUITER' || user?.role === 'ROLE_ADMIN';
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isCandidate = user?.role === 'ROLE_CANDIDATE';

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    isRecruiter,
    isAdmin,
    isCandidate,
    login,
    logout,
    updateUser,
  };
};
