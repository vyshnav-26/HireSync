// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'candidate' | 'recruiter';
  createdAt: string;
}

export interface Candidate extends User {
  userType: 'candidate';
  headline?: string;
  bio?: string;
  skills: string[];
  experience: string;
  location?: string;
  resume?: string;
  profilePicture?: string;
}

export interface Recruiter extends User {
  userType: 'recruiter';
  company: string;
  position?: string;
  profilePicture?: string;
}

// Auth Types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, userType: 'candidate' | 'recruiter', company?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Job Types
export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  location: string;
  workType: 'remote' | 'on-site' | 'hybrid';
  postedDate: string;
  createdBy: string; // recruiter ID
  status: 'open' | 'closed' | 'draft';
  applicantCount?: number;
  hiringPhases?: string[];
  questionnaire?: string[];
}

// Application Types
export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: 'applied' | 'under_review' | 'shortlisted' | 'rejected' | 'hired';
  appliedDate: string;
  coverLetter: string;
  rating?: number;
  feedback?: string;
  hiringPhases?: string[];
  currentPhaseIndex?: number;
  currentPhaseName?: string;
  phaseStatus?: string;
  emailLogs?: Array<{
    timestamp: string;
    type: string;
    subject: string;
    body: string;
  }>;
  job?: {
    id: string;
    title: string;
    company: string;
  };
  candidate?: {
    id: string;
    name: string;
    email: string;
    headline?: string;
    location?: string;
    experience?: string;
    bio?: string;
    skills?: string[];
  };
}

// Candidate List for Recruiter
export interface CandidateListItem extends Candidate {
  applicationId?: string;
  applicationStatus?: string;
  matchScore?: number;
  currentPhaseIndex?: number;
  phaseStatus?: string;
  jobId?: string;
  jobTitle?: string;
}

// Pagination
export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Filter Types
export interface JobFilters {
  searchTerm?: string;
  location?: string;
  workType?: string;
  minSalary?: number;
  maxSalary?: number;
  status?: string;
}

export interface CandidateFilters {
  searchTerm?: string;
  skills?: string[];
  experience?: string;
  location?: string;
}
