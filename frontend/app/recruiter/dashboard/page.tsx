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
import { Job, Application, PaginatedResponse } from '@/lib/types';
import { ROUTES } from '@/lib/constants';
import { JobListItem } from '@/components/recruiter/job-list-item';
import { ArrowRight, Briefcase, Users } from 'lucide-react';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalApplications, setTotalApplications] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    openJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    hired: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch jobs (backend returns array directly)
        const jobsResponse = await apiGet<Job[]>('/api/recruiter/jobs');
        const fetchedJobs = Array.isArray(jobsResponse) ? jobsResponse : (jobsResponse as any).data || [];
        setJobs(fetchedJobs);

        // Fetch applications (backend returns array directly)
        const appsResponse = await apiGet<Application[]>('/api/recruiter/applications');
        const applications = Array.isArray(appsResponse) ? appsResponse : (appsResponse as any).data || [];
        setTotalApplications(applications.length);

        // Calculate stats
        const calculatedStats = {
          openJobs: fetchedJobs.filter((j: Job) => j.status === 'open').length,
          totalApplications: applications.length,
          shortlisted: applications.filter((a: Application) => a.status === 'shortlisted').length,
          hired: applications.filter((a: Application) => a.status === 'hired').length,
        };
        setStats(calculatedStats);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <ProtectedRoute allowedUserTypes={['recruiter']}>
      <div className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome, {user?.name}!
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your job postings and review applications
            </p>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#4F46E5]">
                    {stats.openJobs}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Open Jobs</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#3B82F6]">
                    {stats.totalApplications}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Applications</p>
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
            <Link href={`${ROUTES.RECRUITER_JOBS}/new`}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="font-medium text-foreground">Create Job</p>
                    <p className="text-sm text-muted-foreground">Post new job</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[#4F46E5]" />
                </CardContent>
              </Card>
            </Link>

            <Link href={ROUTES.RECRUITER_JOBS}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="font-medium text-foreground">My Jobs</p>
                    <p className="text-sm text-muted-foreground">Manage postings</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[#4F46E5]" />
                </CardContent>
              </Card>
            </Link>

            <Link href={ROUTES.RECRUITER_CANDIDATES}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="font-medium text-foreground">Browse Candidates</p>
                    <p className="text-sm text-muted-foreground">Find talent</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[#4F46E5]" />
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Recent Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Job Postings</CardTitle>
              <CardDescription>Your latest job listings</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LoadingSpinner />
              ) : jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <JobListItem key={job.id} job={job} />
                  ))}
                  <Link href={ROUTES.RECRUITER_JOBS}>
                    <Button variant="outline" className="w-full">
                      View All Jobs
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="mx-auto h-12 w-12 text-[#E5E7EB] mb-2" />
                  <p className="text-muted-foreground">No jobs posted yet</p>
                  <Link href={`${ROUTES.RECRUITER_JOBS}/new`}>
                    <Button className="mt-4">Create First Job</Button>
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
