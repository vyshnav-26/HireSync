// Design System Colors
export const COLORS = {
  primary: '#4F46E5', // indigo-600
  primaryDark: '#4338CA', // indigo-700
  
  // Neutrals
  background: '#F9FAFB', // gray-50
  border: '#E5E7EB', // gray-200
  textSecondary: '#6B7280', // gray-500
  textPrimary: '#111827', // gray-900
  
  // Status Colors
  success: '#10B981', // emerald-500
  warning: '#F59E0B', // amber-500
  danger: '#EF4444', // red-500
  info: '#3B82F6', // blue-500
};

// Application Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CANDIDATE: '/candidate',
  CANDIDATE_DASHBOARD: '/candidate/dashboard',
  CANDIDATE_JOBS: '/candidate/jobs',
  CANDIDATE_APPLICATIONS: '/candidate/applications',
  CANDIDATE_PROFILE: '/candidate/profile',
  RECRUITER: '/recruiter',
  RECRUITER_DASHBOARD: '/recruiter/dashboard',
  RECRUITER_JOBS: '/recruiter/jobs',
  RECRUITER_JOB_DETAIL: '/recruiter/jobs/[id]',
  RECRUITER_CANDIDATES: '/recruiter/candidates',
  RECRUITER_PROFILE: '/recruiter/profile',
};

// Pagination
export const PAGINATION = {
  PAGE_SIZE: 10,
  DEFAULT_PAGE: 1,
};

// Job Status Options
export const JOB_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  DRAFT: 'draft',
} as const;

// Application Status Options
export const APPLICATION_STATUS = {
  APPLIED: 'applied',
  UNDER_REVIEW: 'under_review',
  SHORTLISTED: 'shortlisted',
  REJECTED: 'rejected',
  HIRED: 'hired',
} as const;

// Candidate Status Display
export const STATUS_CONFIG = {
  [APPLICATION_STATUS.APPLIED]: {
    label: 'Applied',
    color: COLORS.info,
    bgColor: '#DBEAFE',
  },
  [APPLICATION_STATUS.UNDER_REVIEW]: {
    label: 'Under Review',
    color: COLORS.info,
    bgColor: '#DBEAFE',
  },
  [APPLICATION_STATUS.SHORTLISTED]: {
    label: 'Shortlisted',
    color: COLORS.info,
    bgColor: '#DBEAFE',
  },
  [APPLICATION_STATUS.REJECTED]: {
    label: 'Rejected',
    color: COLORS.danger,
    bgColor: '#FEE2E2',
  },
  [APPLICATION_STATUS.HIRED]: {
    label: 'Hired',
    color: COLORS.success,
    bgColor: '#ECFDF5',
  },
};

// Mock delay for API calls (ms)
export const API_MOCK_DELAY = 300;
