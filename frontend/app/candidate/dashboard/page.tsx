'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { apiGet } from '@/lib/api-client';
import { Application, Job, PaginatedResponse } from '@/lib/types';
import { ApplicationCard } from '@/components/candidate/application-card';
import { ROUTES } from '@/lib/constants';
import { ArrowRight, Briefcase } from 'lucide-react';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Array<Application & { job: Job }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplications: 0,
    under_review: 0,
    shortlisted: 0,
    hired: 0,
  });

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await apiGet<Array<Application & { job: Job }>>(
          '/api/job-seeker/applications'
        );
        const apps = Array.isArray(response) ? response : (response as any).data || [];
        setApplications(apps);

        // Calculate stats
        const stats = {
          totalApplications: apps.length,
          under_review: apps.filter(a => a.status === 'under_review').length,
          shortlisted: apps.filter(a => a.status === 'shortlisted').length,
          hired: apps.filter(a => a.status === 'hired').length,
        };
        setStats(stats);
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  return (
    <ProtectedRoute allowedUserTypes={['candidate']}>
      <div className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.name}!
            </h1>
            <p className="mt-2 text-muted-foreground">
              Track your applications and discover new opportunities
            </p>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#4F46E5]">
                    {stats.totalApplications}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Total Applications</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#3B82F6]">
                    {stats.under_review}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Under Review</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#F59E0B]">
                    {stats.shortlisted}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Shortlisted</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#10B981]">
                    {stats.hired}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Hired</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <Link href={ROUTES.CANDIDATE_JOBS}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="font-medium text-foreground">Browse Jobs</p>
                    <p className="text-sm text-muted-foreground">Find new opportunities</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[#4F46E5]" />
                </CardContent>
              </Card>
            </Link>

            <Link href={ROUTES.CANDIDATE_PROFILE}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="font-medium text-foreground">Update Profile</p>
                    <p className="text-sm text-muted-foreground">Improve your profile</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[#4F46E5]" />
                </CardContent>
              </Card>
            </Link>

            <Link href={ROUTES.CANDIDATE_APPLICATIONS}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="font-medium text-foreground">My Applications</p>
                    <p className="text-sm text-muted-foreground">View all {stats.totalApplications}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[#4F46E5]" />
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Your latest job applications</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LoadingSpinner />
              ) : applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <ApplicationCard key={app.id} application={app} job={app.job} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="mx-auto h-12 w-12 text-[#E5E7EB] mb-2" />
                  <p className="text-muted-foreground">No applications yet</p>
                  <Link href={ROUTES.CANDIDATE_JOBS}>
                    <Button className="mt-4">Browse Jobs</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
