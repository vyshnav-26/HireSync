'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ApplicationReview } from '@/components/recruiter/application-review';
import { apiGet, apiPatch } from '@/lib/api-client';
import { Application, Job, Candidate } from '@/lib/types';
import { ROUTES } from '@/lib/constants';
import { MapPin, Briefcase, Mail, ChevronLeft } from 'lucide-react';

interface ApplicationDetail extends Application {
  job: Job;
  candidate: Candidate;
}

export default function ApplicationReviewPage() {
  const params = useParams();
  const applicationId = params.id as string;

  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await apiGet<ApplicationDetail>(
          `/api/recruiter/applications/${applicationId}`
        );
        setApplication(response);
      } catch (error) {
        console.error('Failed to fetch application:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId]);

  const handleStatusChange = async (status: Application['status']) => {
    if (!application) return;

    setIsUpdating(true);
    try {
      const response = await apiPatch<Application>(
        `/api/recruiter/applications/${applicationId}`,
        { status }
      );
      setApplication({ ...application, ...response });
    } catch (error) {
      console.error('Failed to update application:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFeedbackSubmit = async (feedback: string, rating: number) => {
    if (!application) return;

    setIsUpdating(true);
    try {
      const response = await apiPatch<Application>(
        `/api/recruiter/applications/${applicationId}`,
        { feedback, rating }
      );
      setApplication({ ...application, ...response });
    } catch (error) {
      console.error('Failed to save feedback:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedUserTypes={['recruiter']}>
        <div className="min-h-screen bg-background py-8">
          <LoadingSpinner />
        </div>
      </ProtectedRoute>
    );
  }

  if (!application) {
    return (
      <ProtectedRoute allowedUserTypes={['recruiter']}>
        <div className="min-h-screen bg-background py-8">
          <div className="mx-auto max-w-3xl px-4">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Application not found</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedUserTypes={['recruiter']}>
      <div className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link href={`${ROUTES.RECRUITER_JOBS}/${application.job.id}`}>
            <Button variant="ghost" className="mb-6 gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Job
            </Button>
          </Link>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Candidate Info */}
            <div className="md:col-span-2 space-y-6">
              {/* Job Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Job Applied For</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={`${ROUTES.RECRUITER_JOBS}/${application.job.id}`}>
                    <p className="text-lg font-semibold text-[#4F46E5] hover:text-[#4338CA] cursor-pointer">
                      {application.job.title}
                    </p>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">{application.job.company}</p>
                  <p className="text-xs text-muted-foreground mt-3">
                    Applied on {new Date(application.appliedDate).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>

              {/* Candidate Profile */}
              <Card>
                <CardHeader>
                  <CardTitle>Candidate Profile</CardTitle>
                  <CardDescription>Background and qualifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {application.candidate.name}
                    </h3>
                    {application.candidate.headline && (
                      <p className="text-[#4F46E5] font-medium mt-1">
                        {application.candidate.headline}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${application.candidate.email}`} className="text-[#4F46E5] hover:underline">
                        {application.candidate.email}
                      </a>
                    </div>

                    {application.candidate.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{application.candidate.location}</span>
                      </div>
                    )}

                    {application.candidate.experience && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{application.candidate.experience}</span>
                      </div>
                    )}
                  </div>

                  {application.candidate.bio && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground uppercase font-medium mb-2">About</p>
                      <p className="text-muted-foreground">{application.candidate.bio}</p>
                    </div>
                  )}

                  {application.candidate.skills?.length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground uppercase font-medium mb-3">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {application.candidate.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cover Letter */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Cover Letter</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {application.coverLetter}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Review Panel */}
            <div>
              <ApplicationReview
                application={application}
                onStatusChange={handleStatusChange}
                onFeedbackSubmit={handleFeedbackSubmit}
                isLoading={isUpdating}
              />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
