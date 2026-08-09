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
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from '@/components/ui/select';
import { apiGet, apiDelete } from '@/lib/api-client';
import { Job } from '@/lib/types';
import { ROUTES } from '@/lib/constants';
import { Pagination } from '@/components/common/pagination';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';

type JobStatus = 'all' | 'open' | 'closed' | 'draft';

export default function JobsManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<JobStatus>('all');
  
  // Custom Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    jobId: string | null;
    jobTitle: string | null;
  }>({
    isOpen: false,
    jobId: null,
    jobTitle: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const response = await apiGet<Job[]>(`/api/recruiter/jobs`);
        let fetchedJobs = Array.isArray(response) ? response : (response as any).data || [];
        
        if (statusFilter !== 'all') {
          fetchedJobs = fetchedJobs.filter((j: Job) => j.status === statusFilter);
        }
        
        setJobs(fetchedJobs);
        setTotalPages(Math.ceil(fetchedJobs.length / 10));
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [currentPage, statusFilter]);

  const openDeleteModal = (jobId: string) => {
    const target = jobs.find(j => j.id === jobId);
    setDeleteModal({
      isOpen: true,
      jobId,
      jobTitle: target?.title || 'this job posting',
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.jobId) return;
    setIsDeleting(true);
    try {
      await apiDelete(`/api/recruiter/jobs/${deleteModal.jobId}`);
      setJobs(prev => prev.filter(j => j.id !== deleteModal.jobId));
      setDeleteModal({ isOpen: false, jobId: null, jobTitle: null });
    } catch (error) {
      console.error('Failed to delete job:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (jobId: string) => {
    router.push(`${ROUTES.RECRUITER_JOBS}/${jobId}/edit`);
  };

  return (
    <ProtectedRoute allowedUserTypes={['recruiter']}>
      <div className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Job Postings</h1>
              <p className="mt-1 text-muted-foreground">Manage and track all your active listings</p>
            </div>
            <Link href={`${ROUTES.RECRUITER_JOBS}/new`}>
              <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm font-medium">
                <Plus className="h-4 w-4" />
                Create Job
              </Button>
            </Link>
          </div>

          {/* Filter */}
          <Card className="mb-8 border border-border/80 rounded-sm">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Select
                  value={statusFilter}
                  onValueChange={(val) => {
                    setStatusFilter(val as JobStatus);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full rounded-sm">
                    <SelectValue placeholder="All Jobs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jobs</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Jobs List */}
          {isLoading ? (
            <LoadingSpinner />
          ) : jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.slice((currentPage - 1) * 10, currentPage * 10).map((job) => (
                <JobListItem
                  key={job.id}
                  job={job}
                  onEdit={handleEdit}
                  onDelete={openDeleteModal}
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
                  <p className="text-muted-foreground mb-4">No jobs found</p>
                  <Link href={`${ROUTES.RECRUITER_JOBS}/new`}>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm">
                      Create Your First Job
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Custom Delete Confirmation Modal */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-background border border-border rounded-sm max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 text-red-500">
                <div className="p-2 rounded-sm bg-red-50 dark:bg-red-950/40">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Delete Job Posting?</h3>
                  <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-foreground">{deleteModal.jobTitle}</strong>? All associated candidate applications will also be removed.
              </p>

              <div className="pt-3 flex justify-end gap-3 border-t border-border/60">
                <Button 
                  variant="outline" 
                  className="rounded-sm" 
                  onClick={() => setDeleteModal({ isOpen: false, jobId: null, jobTitle: null })}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white rounded-sm flex items-center gap-2"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? 'Deleting...' : 'Permanently Delete'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
