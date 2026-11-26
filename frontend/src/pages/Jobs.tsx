import { useState, useMemo } from 'react';
import type { FC, FormEvent } from 'react';
import { Search, MapPin, Briefcase, DollarSign, Building, CheckCircle2, UploadCloud } from 'lucide-react';
import type { Job, JobType } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card, CardContent } from '../components/common/Card';
import { Modal } from '../components/common/Modal';

const INITIAL_JOBS: Job[] = [
  {
    id: 'job-101',
    title: 'Senior Full Stack Engineer (Java + React)',
    department: 'Engineering',
    location: 'San Francisco, CA (Hybrid)',
    type: 'FULL_TIME',
    description: 'Lead architecture for modern recruitment workflows, integrating Spring Boot 3 microservices with responsive React 18 interfaces and Redis caching.',
    requirements: ['5+ years Java / Spring Boot', 'React 18 & TypeScript', 'PostgreSQL schema design', 'Docker & CI/CD'],
    salaryRange: '$140k - $185k',
    status: 'PUBLISHED',
    createdAt: '2026-11-20',
  },
  {
    id: 'job-102',
    title: 'AI / LLM Systems Engineer',
    department: 'Artificial Intelligence',
    location: 'Remote',
    type: 'REMOTE',
    description: 'Design and deploy automated resume parsing pipelines using Google Gemini API and self-hosted open-source models with semantic embeddings.',
    requirements: ['Python & PyTorch', 'Gemini / OpenAI API integration', 'Vector databases', 'RESTful API integration'],
    salaryRange: '$150k - $200k',
    status: 'PUBLISHED',
    createdAt: '2026-11-22',
  },
  {
    id: 'job-103',
    title: 'Lead Product Designer (UI/UX)',
    department: 'Design',
    location: 'New York, NY',
    type: 'FULL_TIME',
    description: 'Craft intuitive, accessible ATS interfaces including Kanban candidate pipelines, scorecard reviews, and career portals.',
    requirements: ['Figma design systems', 'Enterprise SaaS design', 'User research & prototyping'],
    salaryRange: '$125k - $160k',
    status: 'PUBLISHED',
    createdAt: '2026-11-24',
  },
  {
    id: 'job-104',
    title: 'DevOps & Cloud Infrastructure Specialist',
    department: 'Infrastructure',
    location: 'Remote',
    type: 'CONTRACT',
    description: 'Orchestrate multi-container environments, Kubernetes clusters, MinIO/S3 object storage, and automated GitHub Actions CI/CD.',
    requirements: ['Docker Compose & K8s', 'GitHub Actions', 'MinIO/S3 & Redis', 'Linux & Bash'],
    salaryRange: '$80 - $110 / hr',
    status: 'PUBLISHED',
    createdAt: '2026-11-25',
  },
];

export const Jobs: FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const departments = ['ALL', 'Engineering', 'Artificial Intelligence', 'Design', 'Infrastructure'];
  const jobTypes: { label: string; value: string }[] = [
    { label: 'All Types', value: 'ALL' },
    { label: 'Full Time', value: 'FULL_TIME' },
    { label: 'Remote', value: 'REMOTE' },
    { label: 'Contract', value: 'CONTRACT' },
  ];

  const filteredJobs = useMemo(() => {
    return INITIAL_JOBS.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = selectedDept === 'ALL' || job.department === selectedDept;
      const matchesType = selectedType === 'ALL' || job.type === selectedType;
      return matchesSearch && matchesDept && matchesType;
    });
  }, [searchTerm, selectedDept, selectedType]);

  const handleApplyClick = (job: Job) => {
    setActiveJob(job);
    setAppliedSuccess(false);
    setIsApplyModalOpen(true);
  };

  const handleApplicationSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAppliedSuccess(true);
    setTimeout(() => {
      setIsApplyModalOpen(false);
      setAppliedSuccess(false);
    }, 1800);
  };

  const formatJobType = (type: JobType) => {
    return type.replace('_', ' ');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Open Opportunities</h1>
        <p className="mt-2 text-slate-600">
          Discover high-impact roles and join leading engineering and product teams.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full md:flex-1">
            <Input
              placeholder="Search by job title, skill, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {jobTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedType === type.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Department Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium py-1">Department:</span>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedDept === dept
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Listing */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">No positions found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your keyword or filter criteria.</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="hover:border-primary-300 transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-800 uppercase">
                        {formatJobType(job.type)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-slate-400" />
                        <span>{job.department}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>{job.location}</span>
                      </div>
                      {job.salaryRange && (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                          <DollarSign className="w-4 h-4" />
                          <span>{job.salaryRange}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 line-clamp-2 max-w-3xl pt-1">
                      {job.description}
                    </p>

                    {job.requirements && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {job.requirements.map((req, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 font-medium"
                          >
                            {req}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center md:flex-col justify-end gap-2">
                    <Button onClick={() => handleApplyClick(job)}>Apply Now</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Application Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title={activeJob ? `Apply for ${activeJob.title}` : 'Job Application'}
        description={activeJob ? `${activeJob.department} · ${activeJob.location}` : undefined}
      >
        {appliedSuccess ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-slate-900">Application Submitted!</h4>
            <p className="text-sm text-slate-500 mt-1">
              Your resume has been received and queued for Gemini AI screening.
            </p>
          </div>
        ) : (
          <form onSubmit={handleApplicationSubmit} className="space-y-4">
            <Input label="Full Name" placeholder="Alex Morgan" required />
            <Input label="Email Address" type="email" placeholder="alex@example.com" required />
            <Input label="Phone Number" type="tel" placeholder="+1 (555) 000-0000" />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Resume / CV (PDF or DOCX)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer bg-slate-50/50">
                <UploadCloud className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">Click to upload or drag & drop</p>
                <p className="text-xs text-slate-400 mt-1">PDF, DOCX up to 10MB (stored in MinIO)</p>
                <input type="file" accept=".pdf,.docx" className="hidden" id="resume-upload" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Cover Note / Key Qualifications
              </label>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Briefly highlight relevant project experience..."
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsApplyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Application</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
