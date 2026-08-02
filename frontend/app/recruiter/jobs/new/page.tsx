'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { JobForm } from '@/components/recruiter/job-form';
import { apiPost } from '@/lib/api-client';
import { Job } from '@/lib/types';
import { ROUTES } from '@/lib/constants';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateJobPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleCreateJob = async (jobData: Partial<Job>) => {
    try {
      const response = await apiPost<Job>('/api/recruiter/jobs', {
        ...jobData,
        createdBy: user?.id,
        company: (user as any)?.company || 'Company',
      });

      router.push(`${ROUTES.RECRUITER_JOBS}/${response.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create job';
      throw new Error(message);
    }
  };

  return (
    <ProtectedRoute allowedUserTypes={['recruiter']}>
      <div className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link href={ROUTES.RECRUITER_JOBS}>
            <Button variant="ghost" className="mb-6 gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Jobs
            </Button>
          </Link>

          {/* Create Form */}
          <JobForm onSubmit={handleCreateJob} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
