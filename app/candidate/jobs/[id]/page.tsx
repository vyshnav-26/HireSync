'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ApplyDialog } from '@/components/candidate/apply-dialog';
import { apiGet, apiPost } from '@/lib/api-client';
import { Job, Application } from '@/lib/types';
import { ROUTES } from '@/lib/constants';
import { MapPin, Briefcase, DollarSign, Calendar, ChevronLeft } from 'lucide-react';

export default function JobDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplied, setIsApplied] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await apiGet<Job>(`/api/jobs/${jobId}`);
        setJob(response);

        // Check if user already applied
        const applicationsResponse = await apiGet<Application[]>(
          '/api/candidate/applications?limit=100'
        );
        const alreadyApplied = applicationsResponse.some(app => app.jobId === jobId);
        setIsApplied(alreadyApplied);
      } catch (error) {
        console.error('Failed to fetch job:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleSubmitApplication = async (coverLetter: string) => {
    try {
      await apiPost('/api/candidate/applications', {
        jobId,
        coverLetter,
      });
      setIsApplied(true);
      setApplyDialogOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to apply';
      throw new Error(message);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedUserTypes={['candidate']}>
        <div className="min-h-screen bg-[#F9FAFB] py-8">
          <LoadingSpinner />
        </div>
      </ProtectedRoute>
    );
  }

  if (!job) {
    return (
      <ProtectedRoute allowedUserTypes={['candidate']}>
        <div className="min-h-screen bg-[#F9FAFB] py-8">
          <div className="mx-auto max-w-3xl px-4">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-[#6B7280]">Job not found</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedUserTypes={['candidate']}>
      <div className="min-h-screen bg-[#F9FAFB] py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link href={ROUTES.CANDIDATE_JOBS}>
            <Button variant="ghost" className="mb-6 gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Jobs
            </Button>
          </Link>

          {/* Job Header */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-[#111827]">{job.title}</h1>
                  <p className="text-lg text-[#6B7280] mt-1">{job.company}</p>
                </div>
                {isApplied && (
                  <Badge variant="success">Applied</Badge>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2 mt-6">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-[#4F46E5]" />
                  <div>
                    <p className="text-xs text-[#6B7280]">Location</p>
                    <p className="font-medium text-[#111827]">{job.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-[#4F46E5]" />
                  <div>
                    <p className="text-xs text-[#6B7280]">Work Type</p>
                    <p className="font-medium text-[#111827] capitalize">{job.workType}</p>
                  </div>
                </div>

                {job.salary && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-[#4F46E5]" />
                    <div>
                      <p className="text-xs text-[#6B7280]">Salary Range</p>
                      <p className="font-medium text-[#111827]">
                        ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-[#4F46E5]" />
                  <div>
                    <p className="text-xs text-[#6B7280]">Posted</p>
                    <p className="font-medium text-[#111827]">
                      {new Date(job.postedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>About This Role</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#6B7280] whitespace-pre-wrap">{job.description}</p>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#4F46E5] text-xs text-white flex-shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span className="text-[#6B7280]">{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Apply Button */}
          <div className="flex gap-4">
            {!isApplied ? (
              <Button
                size="lg"
                onClick={() => setApplyDialogOpen(true)}
              >
                Apply Now
              </Button>
            ) : (
              <Button disabled size="lg">
                Already Applied
              </Button>
            )}
            <Link href={ROUTES.CANDIDATE_JOBS}>
              <Button variant="outline" size="lg">
                Back to Jobs
              </Button>
            </Link>
          </div>
        </div>

        {/* Apply Dialog */}
        <ApplyDialog
          jobTitle={job.title}
          isOpen={applyDialogOpen}
          onCancel={() => setApplyDialogOpen(false)}
          onSubmit={handleSubmitApplication}
        />
      </div>
    </ProtectedRoute>
  );
}
