'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { CandidateListItemComponent } from '@/components/recruiter/candidate-list-item';
import { Pagination } from '@/components/common/pagination';
import { apiGet, apiPost } from '@/lib/api-client';
import { CandidateListItem } from '@/lib/types';
import { useDebounce } from '@/hooks/use-debounce';
import { Search, Sparkles, Filter, CheckCircle2, Users, Settings, RotateCcw } from 'lucide-react';

export default function CandidatesDirectoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [topNSelection, setTopNSelection] = useState<number | null>(null);
  const [isScreening, setIsScreening] = useState(false);
  const [screenResult, setScreenResult] = useState<string | null>(null);

  // Manual Override State
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideAppId, setOverrideAppId] = useState<string | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<string>('shortlisted');
  const [overridePhaseIndex, setOverridePhaseIndex] = useState<number>(0);
  const [overridePhaseStatus, setOverridePhaseStatus] = useState<string>('IN_PROGRESS');
  const [isOverriding, setIsOverriding] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const query = debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : '';
      const response = await apiGet<CandidateListItem[]>(`/api/recruiter/candidates${query}`);
      const data = Array.isArray(response) ? response : (response as any).data || [];
      setCandidates(data);
      setTotalPages(Math.ceil(data.length / 10) || 1);
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [debouncedSearch, currentPage]);

  const DEFAULT_TOTAL_PHASES = 5;

  const handleAdvanceCandidate = async (cand: CandidateListItem) => {
    if (!cand.applicationId || cand.applicationStatus === 'rejected' || cand.applicationStatus === 'hired') return;
    
    const currentIdx = cand.currentPhaseIndex ?? 0;
    const nextIdx = currentIdx + 1;
    const isHired = nextIdx >= DEFAULT_TOTAL_PHASES;

    // Optimistic instantaneous state update with proper phase progression
    setCandidates(prev => prev.map(c => {
      if (c.id === cand.id) {
        return {
          ...c,
          currentPhaseIndex: isHired ? DEFAULT_TOTAL_PHASES - 1 : nextIdx,
          applicationStatus: isHired ? 'hired' : 'shortlisted',
          phaseStatus: isHired ? 'PASSED' : 'IN_PROGRESS',
        };
      }
      return c;
    }));

    try {
      await apiPost(`/api/recruiter/applications/${cand.applicationId}/advance-phase`);
      await fetchCandidates();
    } catch (error) {
      console.error('Failed to advance candidate:', error);
      await fetchCandidates();
    }
  };

  const handleApplyManualOverride = async () => {
    if (!overrideAppId) return;
    setIsOverriding(true);
    try {
      await apiPost(`/api/recruiter/applications/${overrideAppId}/override`, {
        status: overrideStatus,
        currentPhaseIndex: overridePhaseIndex,
        phaseStatus: overridePhaseStatus,
      });
      // Synchronize shared candidate state
      setCandidates(prev => prev.map(c => {
        if (c.applicationId === overrideAppId) {
          return {
            ...c,
            applicationStatus: overrideStatus,
          };
        }
        return c;
      }));
      setShowOverrideModal(false);
      await fetchCandidates();
    } catch (err) {
      console.error('Manual override failed:', err);
    } finally {
      setIsOverriding(false);
    }
  };

  const handleResetAllToApplied = async () => {
    setIsOverriding(true);
    try {
      for (const cand of candidates) {
        if (cand.applicationId) {
          await apiPost(`/api/recruiter/applications/${cand.applicationId}/override`, {
            status: 'applied',
            currentPhaseIndex: 0,
            phaseStatus: 'IN_PROGRESS',
          });
        }
      }
      setCandidates(prev => prev.map(c => ({
        ...c,
        applicationStatus: 'applied',
      })));
      setShowOverrideModal(false);
      await fetchCandidates();
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setIsOverriding(false);
    }
  };

  const handleQuickSelectTopN = (n: number) => {
    setTopNSelection(n);
  };

  return (
    <ProtectedRoute allowedUserTypes={['recruiter']}>
      <div className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header & Quick Action Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Candidate Directory & AI Screening</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Review AI-ranked candidate profiles and auto-select the top applicants for hiring rounds.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (candidates.length > 0) {
                    const firstWithApp = candidates.find(c => c.applicationId);
                    if (firstWithApp) {
                      setOverrideAppId(firstWithApp.applicationId);
                      setOverrideStatus(firstWithApp.applicationStatus || 'shortlisted');
                    }
                  }
                  setShowOverrideModal(true);
                }}
                className="gap-1.5 text-xs font-semibold rounded-sm h-8"
                title="Manual Pipeline & State Override Menu"
              >
                <Settings className="h-4 w-4 text-indigo-500" />
                <span>Override Pipeline</span>
              </Button>

              <Link href="/recruiter/jobs">
                <Button variant="outline" className="gap-1.5 text-xs font-semibold rounded-sm h-8">
                  <Users className="h-4 w-4" />
                  View Jobs
                </Button>
              </Link>
            </div>
          </div>

          {/* Search Bar (Compact & Properly Proportioned) & Top N Filter Bar */}
          <Card className="border border-border/80 shadow-2xs rounded-sm">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Compact Search Input with Icon Button */}
                <div className="flex items-center gap-2 max-w-md w-full">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search candidates by name, skills, title..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-9 pr-3 h-9 text-xs rounded-sm bg-background"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => fetchCandidates()}
                    className="h-9 px-3 text-xs font-semibold rounded-sm shrink-0 border border-border"
                  >
                    Search
                  </Button>
                </div>

                {/* Select Exact Number 'N' Candidates Toolbar */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                    Top N:
                  </span>

                  {/* Custom Exact Number Input */}
                  <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-sm border border-border">
                    <label htmlFor="custom-n-input" className="text-xs font-semibold text-muted-foreground pl-1.5">
                      N =
                    </label>
                    <input
                      id="custom-n-input"
                      type="number"
                      min="1"
                      max={candidates.length || 100}
                      placeholder="e.g. 4"
                      value={topNSelection ?? ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (isNaN(val) || val <= 0) {
                          setTopNSelection(null);
                        } else {
                          setTopNSelection(val);
                        }
                      }}
                      className="w-16 h-7 px-2 text-xs font-bold rounded-sm border border-border bg-background text-foreground text-center focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Quick Presets */}
                  <div className="flex items-center gap-1">
                    {[3, 5, 10].map((n) => (
                      <Button
                        key={n}
                        size="sm"
                        variant={topNSelection === n ? 'default' : 'outline'}
                        onClick={() => handleQuickSelectTopN(n)}
                        className={`h-7 px-2.5 text-xs font-bold rounded-sm ${
                          topNSelection === n ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'hover:border-indigo-400'
                        }`}
                      >
                        Top {n}
                      </Button>
                    ))}
                  </div>

                  {topNSelection && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setTopNSelection(null)}
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Visual Banner when Top N is active with One-Click Bulk Advance */}
              {topNSelection && (
                <div className="mt-3 p-3.5 rounded-sm bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>
                      Highlighting <strong>Top {topNSelection}</strong> ranked candidates by AI match score.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      disabled={isScreening}
                      onClick={async () => {
                        setIsScreening(true);
                        try {
                          const targetCandidates = candidates
                            .slice(0, topNSelection)
                            .filter(c => c.applicationId && c.applicationStatus !== 'rejected' && c.applicationStatus !== 'hired');
                          
                          const appIds = targetCandidates.map(c => c.applicationId!);

                          // Optimistic validated phase advancement: Advance selected candidates, auto-reject unselected
                          setCandidates(prev =>
                            prev.map((c, idx) => {
                              if (idx < topNSelection && c.applicationStatus !== 'rejected' && c.applicationStatus !== 'hired') {
                                const currentIdx = c.currentPhaseIndex ?? 0;
                                const nextIdx = currentIdx + 1;
                                const isHired = nextIdx >= DEFAULT_TOTAL_PHASES;
                                return {
                                  ...c,
                                  currentPhaseIndex: isHired ? DEFAULT_TOTAL_PHASES - 1 : nextIdx,
                                  applicationStatus: isHired ? 'hired' : 'shortlisted',
                                  phaseStatus: isHired ? 'PASSED' : 'IN_PROGRESS',
                                };
                              } else if (c.applicationStatus !== 'rejected' && c.applicationStatus !== 'hired') {
                                // Auto-reject unselected candidates in that round
                                return {
                                  ...c,
                                  applicationStatus: 'rejected',
                                  phaseStatus: 'REJECTED',
                                };
                              }
                              return c;
                            })
                          );

                          const res: any = await apiPost('/api/recruiter/applications/bulk-advance-phase', {
                            applicationIds: appIds,
                          });
                          setScreenResult(res.message || `Advanced top ${targetCandidates.length} candidate(s) to next round and auto-rejected remaining applicants.`);
                          await fetchCandidates();
                        } catch (error) {
                          console.error('Bulk advance error:', error);
                          await fetchCandidates();
                        } finally {
                          setIsScreening(false);
                        }
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8 px-3 rounded-sm gap-1.5 shadow-sm"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{isScreening ? 'Advancing...' : `Advance Top ${topNSelection}`}</span>
                    </Button>

                    <Badge variant="secondary" className="bg-indigo-600 text-white font-bold text-xs h-8 px-2.5 flex items-center">
                      {Math.min(topNSelection, candidates.length)} of {candidates.length} Selected
                    </Badge>
                  </div>
                </div>
              )}

              {screenResult && (
                <div className="mt-3 p-3 rounded-sm bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs font-medium text-emerald-900 dark:text-emerald-200">
                  {screenResult}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Candidates List */}
          {isLoading ? (
            <LoadingSpinner />
          ) : candidates.length > 0 ? (
            <div className="space-y-3">
              {candidates
                .slice((currentPage - 1) * 10, currentPage * 10)
                .map((candidate, idx) => {
                  const isTopSelected = topNSelection !== null && idx < topNSelection;
                  return (
                    <div
                      key={candidate.id}
                      className={`transition-all rounded-sm ${
                        isTopSelected
                          ? 'ring-2 ring-indigo-500/80 bg-indigo-50/20 dark:bg-indigo-950/10'
                          : ''
                      }`}
                    >
                      <CandidateListItemComponent
                        candidate={candidate}
                        onAdvancePhase={handleAdvanceCandidate}
                        onViewProfile={() => {
                          if (candidate.applicationId) {
                            window.location.href = `/recruiter/applications/${candidate.applicationId}`;
                          }
                        }}
                      />
                    </div>
                  );
                })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
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
                  <p className="text-muted-foreground text-sm">No candidates found matching your query.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Manual Pipeline & State Override Modal (Hidden Behind Gear Icon) */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-xl border border-border shadow-2xl rounded-sm">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <Settings className="h-5 w-5" />
                  <CardTitle className="text-lg font-bold">Candidate Pipeline & State Override</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOverrideModal(false)}
                  className="h-7 w-7 p-0 rounded-sm text-muted-foreground"
                >
                  ✕
                </Button>
              </div>
              <CardDescription className="mt-1">
                Recruiter control panel to force-override candidate phase, status, or reset progression across all pipelines.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Select Target Candidate */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Select Candidate:
                </label>
                <select
                  value={overrideAppId || ''}
                  onChange={(e) => {
                    const selected = candidates.find(c => c.applicationId === e.target.value);
                    if (selected) {
                      setOverrideAppId(selected.applicationId);
                      setOverrideStatus(selected.applicationStatus || 'shortlisted');
                    }
                  }}
                  className="w-full h-9 px-3 text-xs rounded-sm border border-border bg-background text-foreground"
                >
                  {candidates.map(cand => (
                    <option key={cand.id} value={cand.applicationId || cand.id}>
                      {cand.name} (Status: {(cand.applicationStatus || 'applied').toUpperCase()} | Match: {cand.matchScore}%)
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Override */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Force Status:
                  </label>
                  <select
                    value={overrideStatus}
                    onChange={(e) => setOverrideStatus(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-sm border border-border bg-background text-foreground"
                  >
                    <option value="applied">APPLIED</option>
                    <option value="shortlisted">SHORTLISTED</option>
                    <option value="hired">HIRED</option>
                    <option value="rejected">REJECTED</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Phase Status:
                  </label>
                  <select
                    value={overridePhaseStatus}
                    onChange={(e) => setOverridePhaseStatus(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-sm border border-border bg-background text-foreground"
                  >
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="PASSED">PASSED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              {/* Phase Index Override */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Force Phase Round:
                </label>
                <select
                  value={overridePhaseIndex}
                  onChange={(e) => setOverridePhaseIndex(parseInt(e.target.value))}
                  className="w-full h-9 px-3 text-xs rounded-sm border border-border bg-background text-foreground"
                >
                  {['Round 0: Screening', 'Round 1: Group Discussion', 'Round 2: Assessment', 'Round 3: Technical Interview', 'Round 4: HR Interview'].map((phase, idx) => (
                    <option key={idx} value={idx}>
                      {phase}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bulk Reset Shortcut */}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetAllToApplied}
                  disabled={isOverriding}
                  className="text-xs text-amber-600 hover:text-amber-700 border-amber-300 dark:border-amber-800 rounded-sm gap-1.5 h-8"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset All to Phase 0
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowOverrideModal(false)}
                    disabled={isOverriding}
                    className="rounded-sm text-xs h-8"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleApplyManualOverride}
                    disabled={isOverriding}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm font-bold text-xs h-8 px-4"
                  >
                    {isOverriding ? 'Saving...' : 'Apply Override'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </ProtectedRoute>
  );
}
