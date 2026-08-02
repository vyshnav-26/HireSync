'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { apiGet } from '@/lib/api-client';
import { Job, Application, Candidate, PaginatedResponse } from '@/lib/types';
import { ROUTES } from '@/lib/constants';
import { MapPin, Briefcase, DollarSign, Users, ChevronLeft } from 'lucide-react';

interface ApplicationWithCandidate extends Application {
  candidate: Candidate;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<ApplicationWithCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        // Fetch job
        const jobResponse = await apiGet<Job>(`/api/recruiter/jobs/${jobId}`);
        setJob(jobResponse);

        // Fetch applications (backend uses /candidates for job applications)
        const appResponse = await apiGet<ApplicationWithCandidate[]>(
          `/api/recruiter/jobs/${jobId}/candidates`
        );
        const apps = Array.isArray(appResponse) ? appResponse : (appResponse as any).data || [];
        setApplications(apps);
      } catch (error) {
        console.error('Failed to fetch job data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobData();
  }, [jobId]);

  if (isLoading) {
    return (
      <ProtectedRoute allowedUserTypes={['recruiter']}>
        <div className="min-h-screen bg-background py-8">
          <LoadingSpinner />
        </div>
      </ProtectedRoute>
    );
  }

  if (!job) {
    return (
      <ProtectedRoute allowedUserTypes={['recruiter']}>
        <div className="min-h-screen bg-background py-8">
          <div className="mx-auto max-w-3xl px-4">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Job not found</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const statusColorMap = {
    open: 'success',
    closed: 'danger',
    draft: 'secondary',
  } as const;

  return (
    <ProtectedRoute allowedUserTypes={['recruiter']}>
      <div className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link href={ROUTES.RECRUITER_JOBS}>
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
                  <h1 className="text-3xl font-bold text-foreground">{job.title}</h1>
                  <p className="text-lg text-muted-foreground mt-1">{job.company}</p>
                </div>
                <Badge variant={statusColorMap[job.status]}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2 mt-6">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-[#4F46E5]" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">{job.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-[#4F46E5]" />
                  <div>
                    <p className="text-xs text-muted-foreground">Work Type</p>
                    <p className="font-medium text-foreground capitalize">{job.workType}</p>
                  </div>
                </div>

                {job.salary && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-[#4F46E5]" />
                    <div>
                      <p className="text-xs text-muted-foreground">Salary Range</p>
                      <p className="font-medium text-foreground">
                        ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-[#4F46E5]" />
                  <div>
                    <p className="text-xs text-muted-foreground">Applications</p>
                    <p className="font-medium text-foreground">{applications.length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
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
                    <span className="text-muted-foreground">{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Applications ({applications.length})</CardTitle>
              <CardDescription>Recent applications for this role</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <Link key={app.id} href={`/recruiter/applications/${app.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-medium text-foreground">{app.candidate.name}</p>
                              {app.candidate.headline && (
                                <p className="text-sm text-muted-foreground">{app.candidate.headline}</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                Applied on {new Date(app.appliedDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={
                              app.status === 'hired' ? 'success' :
                              app.status === 'rejected' ? 'danger' :
                              app.status === 'shortlisted' ? 'info' :
                              'secondary'
                            }>
                              {app.status.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No applications yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
