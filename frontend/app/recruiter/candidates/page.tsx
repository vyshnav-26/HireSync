'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { CandidateListItemComponent } from '@/components/recruiter/candidate-list-item';
import { Pagination } from '@/components/common/pagination';
import { apiGet } from '@/lib/api-client';
import { CandidateListItem, PaginatedResponse } from '@/lib/types';
import { useDebounce } from '@/hooks/use-debounce';

export default function CandidatesPage() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchCandidates = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', currentPage.toString());
        params.set('limit', '10');

        if (debouncedSearch) {
          params.set('search', debouncedSearch);
        }

        const response = await apiGet<CandidateListItem[]>(
          `/api/recruiter/candidates?${params.toString()}`
        );
        const fetchedCandidates = Array.isArray(response) ? response : (response as any).data || [];
        setCandidates(fetchedCandidates);
        setTotalPages(1);
      } catch (error) {
        console.error('Failed to fetch candidates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidates();
  }, [debouncedSearch, currentPage]);

  return (
    <ProtectedRoute allowedUserTypes={['recruiter']}>
      <div className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Browse Candidates</h1>
            <p className="mt-2 text-muted-foreground">
              Find and review talented candidates
            </p>
          </div>

          {/* Search */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <Input
                placeholder="Search by name or skills..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </CardContent>
          </Card>

          {/* Candidates List */}
          {isLoading ? (
            <LoadingSpinner />
          ) : candidates.length > 0 ? (
            <div className="space-y-4">
              {candidates.map((candidate) => (
                <CandidateListItemComponent
                  key={candidate.id}
                  candidate={candidate}
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
                  <p className="text-muted-foreground">No candidates found</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
