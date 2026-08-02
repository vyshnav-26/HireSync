'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { JobForm } from '@/components/recruiter/job-form';
import { apiGet, apiPatch } from '@/lib/api-client';
import { Job } from '@/lib/types';
import { ROUTES } from '@/lib/constants';
import { ChevronLeft } from 'lucide-react';

export default function EditJobPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await apiGet<Job>(`/api/recruiter/jobs/${jobId}`);
        setJob(response);
      } catch (error) {
        console.error('Failed to fetch job:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleUpdateJob = async (jobData: Partial<Job>) => {
    try {
      const response = await apiPatch<Job>(`/api/recruiter/jobs/${jobId}`, jobData);
      setJob(response);
      router.push(`${ROUTES.RECRUITER_JOBS}/${jobId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update job';
      throw new Error(message);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedUserTypes={['recruiter']}>
        <div className="min-h-screen bg-[#F9FAFB] py-8">
          <LoadingSpinner />
        </div>
      </ProtectedRoute>
    );
  }

  if (!job) {
    return (
      <ProtectedRoute allowedUserTypes={['recruiter']}>
        <div className="min-h-screen bg-[#F9FAFB] py-8">
          <div className="mx-auto max-w-3xl px-4">
            <p className="text-[#6B7280]">Job not found</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedUserTypes={['recruiter']}>
      <div className="min-h-screen bg-[#F9FAFB] py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link href={`${ROUTES.RECRUITER_JOBS}/${jobId}`}>
            <Button variant="ghost" className="mb-6 gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Job
            </Button>
          </Link>

          {/* Edit Form */}
          <JobForm job={job} onSubmit={handleUpdateJob} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
