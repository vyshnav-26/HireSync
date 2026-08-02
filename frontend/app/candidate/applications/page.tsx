'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { Pagination } from '@/components/common/pagination';
import { ApplicationCard } from '@/components/candidate/application-card';
import { Badge } from '@/components/ui/badge';
import { apiGet } from '@/lib/api-client';
import { Application, Job, PaginatedResponse } from '@/lib/types';
import { Briefcase, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ApplicationStatus = 'applied' | 'under_review' | 'shortlisted' | 'rejected' | 'hired' | 'all';

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Array<Application & { job: Job }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus>('all');

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', currentPage.toString());
        params.set('limit', '10');

        if (statusFilter !== 'all') {
          params.set('status', statusFilter);
        }

        const response = await apiGet<Application[]>(
          `/api/job-seeker/applications?${params.toString()}`
        );
        const apps = Array.isArray(response) ? response : (response as any).data || [];
        setApplications(apps);
        setTotalPages(1);
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [currentPage, statusFilter]);

  const statusOptions: { value: ApplicationStatus; label: string }[] = [
    { value: 'all', label: 'All Applications' },
    { value: 'applied', label: 'Applied' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'hired', label: 'Hired' },
  ];

  return (
    <ProtectedRoute allowedUserTypes={['candidate']}>
      <div className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Applications</h1>
            <p className="mt-2 text-muted-foreground">
              Track all your job applications in one place
            </p>
          </div>

          {/* Filter */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-foreground">Filter by Status</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={statusFilter === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setStatusFilter(option.value);
                      setCurrentPage(1);
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Applications List */}
          {isLoading ? (
            <LoadingSpinner />
          ) : applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((app) => (
                <ApplicationCard key={app.id} application={app} job={app.job} />
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
                  <Briefcase className="mx-auto h-12 w-12 text-[#E5E7EB] mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No applications found
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Start applying to jobs to see them here
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
