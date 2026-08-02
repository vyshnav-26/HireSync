'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { JobListItem } from '@/components/recruiter/job-list-item';
import { Select } from '@/components/ui/select';
import { apiGet, apiDelete } from '@/lib/api-client';
import { Job, PaginatedResponse } from '@/lib/types';
import { ROUTES } from '@/lib/constants';
import { Pagination } from '@/components/common/pagination';
import { Plus } from 'lucide-react';

type JobStatus = 'all' | 'open' | 'closed' | 'draft';

export default function JobsManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<JobStatus>('all');

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', currentPage.toString());
        params.set('limit', '10');

        if (statusFilter !== 'all') {
          params.set('status', statusFilter);
        }

        const response = await apiGet<PaginatedResponse<Job>>(
          `/api/recruiter/jobs?${params.toString()}`
        );
        setJobs(response.data);
        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [currentPage, statusFilter]);

  const handleDelete = async (jobId: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      try {
        await apiDelete(`/api/recruiter/jobs/${jobId}`);
        setJobs(jobs.filter(j => j.id !== jobId));
      } catch (error) {
        console.error('Failed to delete job:', error);
      }
    }
  };

  const handleEdit = (jobId: string) => {
    router.push(`${ROUTES.RECRUITER_JOBS}/${jobId}/edit`);
  };

  return (
    <ProtectedRoute allowedUserTypes={['recruiter']}>
      <div className="min-h-screen bg-[#F9FAFB] py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#111827]">Job Postings</h1>
              <p className="mt-2 text-[#6B7280]">Manage all your job listings</p>
            </div>
            <Link href={`${ROUTES.RECRUITER_JOBS}/new`}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Job
              </Button>
            </Link>
          </div>

          {/* Filter */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as JobStatus);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: 'all', label: 'All Jobs' },
                    { value: 'draft', label: 'Draft' },
                    { value: 'open', label: 'Open' },
                    { value: 'closed', label: 'Closed' },
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Jobs List */}
          {isLoading ? (
            <LoadingSpinner />
          ) : jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job) => (
                <JobListItem
                  key={job.id}
                  job={job}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
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
                  <p className="text-[#6B7280] mb-4">No jobs found</p>
                  <Link href={`${ROUTES.RECRUITER_JOBS}/new`}>
                    <Button>Create Your First Job</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
