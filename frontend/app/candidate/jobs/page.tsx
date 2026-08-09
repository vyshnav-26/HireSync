'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { JobCard } from '@/components/candidate/job-card';
import { JobFiltersComponent } from '@/components/candidate/job-filters';
import { Pagination } from '@/components/common/pagination';
import { ApplyDialog } from '@/components/candidate/apply-dialog';
import { apiGet, apiPost } from '@/lib/api-client';
import { Job, JobFilters, Application, CandidateProfile } from '@/lib/types';
import { useDebounce } from '@/hooks/use-debounce';
import { Sparkles, AlertCircle, CheckCircle2, UserCheck } from 'lucide-react';

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<JobFilters>({});
  const [applications, setApplications] = useState<string[]>([]);
  const [isAutoApplying, setIsAutoApplying] = useState(false);
  
  // Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [autoApplyResults, setAutoApplyResults] = useState<{ count: number; appliedJobs: string[] } | null>(null);

  // Apply dialog state
  const [applyDialog, setApplyDialog] = useState<{
    isOpen: boolean;
    jobId: string | null;
  }>({
    isOpen: false,
    jobId: null,
  });

  const debouncedFilters = useDebounce(filters, 300);

  // Fetch profile and user applications on mount
  useEffect(() => {
    const fetchProfileAndApps = async () => {
      try {
        const profRes = await apiGet<CandidateProfile>('/api/job-seeker/profile');
        setProfile(profRes);

        const response = await apiGet<Application[]>('/api/job-seeker/applications');
        const apps = Array.isArray(response) ? response : (response as any).data || [];
        const appliedJobIds = apps.map((app: Application) => app.jobPosting?.id || app.jobId);
        setApplications(appliedJobIds);
      } catch (error) {
        console.error('Failed to load candidate profile/applications:', error);
      }
    };

    fetchProfileAndApps();
  }, []);

  // Fetch jobs on filter/page change
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', currentPage.toString());
        params.set('limit', '10');

        if (debouncedFilters.searchTerm) {
          params.set('search', debouncedFilters.searchTerm);
        }
        if (debouncedFilters.location) {
          params.set('location', debouncedFilters.location);
        }
        if (debouncedFilters.workType) {
          params.set('workType', debouncedFilters.workType);
        }

        const response = await apiGet<any>(
          `/api/job-seeker/jobs?${params.toString()}`
        );
        
        if (response && response.content) {
          setJobs(response.content);
          setTotalPages(response.totalPages);
        } else if (Array.isArray(response)) {
          setJobs(response);
          setTotalPages(Math.ceil(response.length / 10));
        } else if (response && response.data) {
          setJobs(response.data);
          setTotalPages(Math.ceil(response.total / 10));
        } else {
          setJobs([]);
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [debouncedFilters, currentPage]);

  const isProfileComplete = () => {
    if (!profile) return false;
    const hasResume = !!profile.resume && profile.resume.trim().length > 0;
    const hasSkills = !!profile.skills && (Array.isArray(profile.skills) ? profile.skills.length > 0 : profile.skills.trim().length > 0);
    return hasResume && hasSkills;
  };

  const handleApply = async (jobId: string) => {
    if (!isProfileComplete()) {
      setShowProfileModal(true);
      return;
    }
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setApplyDialog({ isOpen: true, jobId });
    }
  };

  const handleAutoApply = async () => {
    if (!isProfileComplete()) {
      setShowProfileModal(true);
      return;
    }
    setIsAutoApplying(true);
    try {
      const res = await apiPost<{ count: number; appliedJobs: string[] }>('/api/job-seeker/jobs/auto-apply', {});
      setAutoApplyResults(res);
      // Refresh applications list
      const response = await apiGet<Application[]>('/api/job-seeker/applications');
      const apps = Array.isArray(response) ? response : (response as any).data || [];
      setApplications(apps.map((app: Application) => app.jobPosting?.id || app.jobId));
    } catch (error) {
      console.error('Auto apply failed:', error);
    } finally {
      setIsAutoApplying(false);
    }
  };

  const handleSubmitApplication = async (coverLetter: string) => {
    if (!applyDialog.jobId) return;

    try {
      await fetch(`/api/job-seeker/jobs/${applyDialog.jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: coverLetter || 'No cover letter provided.'
      });

      setApplications([...applications, applyDialog.jobId]);
      setApplyDialog({ isOpen: false, jobId: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to apply';
      throw new Error(message);
    }
  };

  const currentJob = applyDialog.jobId ? jobs.find(j => j.id === applyDialog.jobId) : null;

  return (
    <ProtectedRoute allowedUserTypes={['candidate']}>
      <div className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Browse Jobs</h1>
              <p className="mt-1 text-muted-foreground">
                Find your next opportunity or let AI match & apply for you automatically
              </p>
            </div>

            <Button
              onClick={handleAutoApply}
              disabled={isAutoApplying}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-all rounded-sm flex items-center gap-2 px-5 py-2.5"
            >
              <Sparkles className="h-4 w-4 animate-pulse text-amber-300" />
              {isAutoApplying ? 'AI Scanning & Auto-Applying...' : 'AI Auto-Apply All Matching Jobs'}
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-8 border border-border/80 rounded-sm shadow-none">
            <CardContent className="pt-6">
              <JobFiltersComponent filters={filters} onFiltersChange={setFilters} />
            </CardContent>
          </Card>

          {/* Jobs List */}
          {isLoading ? (
            <LoadingSpinner />
          ) : jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={handleApply}
                  applied={applications.includes(job.id)}
                />
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          ) : (
            <Card className="border border-border/80 rounded-sm">
              <CardContent className="py-12">
                <div className="text-center">
                  <p className="text-muted-foreground">No jobs found matching your filters</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Apply Dialog */}
        <ApplyDialog
          jobTitle={currentJob?.title || 'Job'}
          isOpen={applyDialog.isOpen}
          onCancel={() => setApplyDialog({ isOpen: false, jobId: null })}
          onSubmit={handleSubmitApplication}
        />

        {/* Incomplete Profile Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-background border border-border rounded-sm max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3 text-amber-500">
                <AlertCircle className="h-6 w-6 shrink-0" />
                <h3 className="text-lg font-semibold text-foreground">Profile Action Required</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You must complete your candidate profile (upload a resume & list your skills) before applying to jobs or using AI Auto-Apply.
              </p>
              <div className="pt-2 flex justify-end gap-3">
                <Button variant="outline" className="rounded-sm" onClick={() => setShowProfileModal(false)}>
                  Cancel
                </Button>
                <Link href="/candidate/profile">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Complete Profile Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* AI Auto Apply Results Modal */}
        {autoApplyResults && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-background border border-border rounded-sm max-w-lg w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3 text-emerald-500">
                <CheckCircle2 className="h-6 w-6 shrink-0" />
                <h3 className="text-lg font-semibold text-foreground">AI Auto-Apply Complete</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {autoApplyResults.count > 0 
                  ? `AI successfully evaluated your resume and automatically applied to ${autoApplyResults.count} matching job(s):`
                  : 'AI evaluated available jobs against your resume, but no new jobs met the match threshold (80%+).'
                }
              </p>
              {autoApplyResults.appliedJobs.length > 0 && (
                <ul className="max-h-48 overflow-y-auto space-y-2 bg-muted/40 p-3 rounded-sm text-sm border border-border/60">
                  {autoApplyResults.appliedJobs.map((title, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-foreground font-medium">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      {title}
                    </li>
                  ))}
                </ul>
              )}
              <div className="pt-2 flex justify-end">
                <Button className="rounded-sm" onClick={() => setAutoApplyResults(null)}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
