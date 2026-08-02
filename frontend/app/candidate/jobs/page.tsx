'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { JobCard } from '@/components/candidate/job-card';
import { JobFiltersComponent } from '@/components/candidate/job-filters';
import { Pagination } from '@/components/common/pagination';
import { ApplyDialog } from '@/components/candidate/apply-dialog';
import { apiGet, apiPost } from '@/lib/api-client';
import { Job, JobFilters, PaginatedResponse, Application } from '@/lib/types';
import { useDebounce } from '@/hooks/use-debounce';

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<JobFilters>({});
  const [applications, setApplications] = useState<string[]>([]);
  
  // Apply dialog state
  const [applyDialog, setApplyDialog] = useState<{
    isOpen: boolean;
    jobId: string | null;
  }>({
    isOpen: false,
    jobId: null,
  });

  const debouncedFilters = useDebounce(filters, 300);

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

        const response = await apiGet<Job[]>(
          `/api/job-seeker/jobs?${params.toString()}`
        );
        const fetchedJobs = Array.isArray(response) ? response : (response as any).data || [];
        setJobs(fetchedJobs);
        setTotalPages(1);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [debouncedFilters, currentPage]);

  // Fetch user applications on mount
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await apiGet<Application[]>(
          '/api/job-seeker/applications'
        );
        const apps = Array.isArray(response) ? response : (response as any).data || [];
        const appliedJobIds = apps.map((app: Application) => app.jobPosting?.id || app.jobId);
        setApplications(appliedJobIds);
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      }
    };

    fetchApplications();
  }, []);

  const handleApply = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setApplyDialog({ isOpen: true, jobId });
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Browse Jobs</h1>
            <p className="mt-2 text-muted-foreground">
              Find your next opportunity
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-8">
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
            <Card>
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
      </div>
    </ProtectedRoute>
  );
}
