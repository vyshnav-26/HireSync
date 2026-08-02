import { Candidate, Recruiter, Job, Application } from '@/lib/types';

// Demo Candidates
export const demoCandidate: Candidate = {
  id: 'candidate-1',
  email: 'candidate@demo.com',
  name: 'Alice Johnson',
  userType: 'candidate',
  headline: 'Full Stack Developer',
  bio: 'Passionate about building scalable web applications with React and Node.js',
  skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
  experience: '3 years',
  location: 'San Francisco, CA',
  resume: 'https://example.com/resume.pdf',
  createdAt: new Date().toISOString(),
};

// Demo Recruiter
export const demoRecruiter: Recruiter = {
  id: 'recruiter-1',
  email: 'recruiter@demo.com',
  name: 'Bob Smith',
  userType: 'recruiter',
  company: 'TechCorp Inc.',
  position: 'Head of Recruitment',
  createdAt: new Date().toISOString(),
};

// Demo Jobs
export const demoJobs: Job[] = [
  {
    id: 'job-1',
    title: 'Senior React Developer',
    company: 'TechCorp Inc.',
    description: 'We are looking for an experienced React developer to join our growing team. You will work on building scalable web applications serving millions of users.',
    requirements: ['5+ years React experience', 'TypeScript proficiency', 'REST/GraphQL APIs', 'Testing expertise'],
    salary: {
      min: 120000,
      max: 160000,
      currency: 'USD',
    },
    location: 'San Francisco, CA',
    workType: 'hybrid',
    postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'recruiter-1',
    status: 'open',
    applicantCount: 12,
  },
  {
    id: 'job-2',
    title: 'Full Stack Engineer',
    company: 'TechCorp Inc.',
    description: 'Join our engineering team to build the next generation of our platform. You will work across the full stack with modern technologies.',
    requirements: ['Full stack experience', 'Node.js/Python backend', 'React/Vue frontend', 'Database design'],
    salary: {
      min: 100000,
      max: 140000,
      currency: 'USD',
    },
    location: 'Remote',
    workType: 'remote',
    postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'recruiter-1',
    status: 'open',
    applicantCount: 28,
  },
  {
    id: 'job-3',
    title: 'DevOps Engineer',
    company: 'TechCorp Inc.',
    description: 'We are seeking a DevOps engineer to manage our infrastructure and deployment pipelines. Experience with cloud platforms is essential.',
    requirements: ['AWS/GCP/Azure experience', 'Docker & Kubernetes', 'CI/CD pipelines', 'Infrastructure as Code'],
    salary: {
      min: 110000,
      max: 150000,
      currency: 'USD',
    },
    location: 'New York, NY',
    workType: 'on-site',
    postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'recruiter-1',
    status: 'open',
    applicantCount: 8,
  },
  {
    id: 'job-4',
    title: 'Product Manager',
    company: 'TechCorp Inc.',
    description: 'Lead the product strategy and development of our core platform. Work with cross-functional teams to deliver value to our customers.',
    requirements: ['5+ years PM experience', 'Data-driven mindset', 'Technical background', 'Startup experience'],
    salary: {
      min: 130000,
      max: 170000,
      currency: 'USD',
    },
    location: 'San Francisco, CA',
    workType: 'hybrid',
    postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'recruiter-1',
    status: 'open',
    applicantCount: 15,
  },
];

// Demo Applications
export const demoApplications: Application[] = [
  {
    id: 'app-1',
    jobId: 'job-1',
    candidateId: 'candidate-1',
    status: 'under_review',
    appliedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    coverLetter: 'I am very interested in this Senior React Developer position. With 3 years of hands-on experience building scalable React applications...',
  },
  {
    id: 'app-2',
    jobId: 'job-2',
    candidateId: 'candidate-1',
    status: 'applied',
    appliedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    coverLetter: 'I believe my full stack skills align perfectly with this role. I have experience with both frontend and backend technologies...',
  },
];

// Demo Candidates for Recruiter View
export const demoCandidatesList: Candidate[] = [
  {
    ...demoCandidate,
    id: 'candidate-2',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    headline: 'Data Scientist',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
    experience: '4 years',
  },
  {
    ...demoCandidate,
    id: 'candidate-3',
    name: 'Diana Prince',
    email: 'diana@example.com',
    headline: 'UI/UX Designer',
    skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
    experience: '2 years',
  },
  {
    ...demoCandidate,
    id: 'candidate-4',
    name: 'Eva Martinez',
    email: 'eva@example.com',
    headline: 'Backend Engineer',
    skills: ['Node.js', 'Python', 'Go', 'PostgreSQL', 'MongoDB'],
    experience: '5 years',
  },
];
