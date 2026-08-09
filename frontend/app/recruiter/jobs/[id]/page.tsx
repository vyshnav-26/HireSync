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
import { apiGet, apiPost } from '@/lib/api-client';
import { Job, Application, Candidate } from '@/lib/types';
import { ROUTES } from '@/lib/constants';
import { MapPin, Briefcase, DollarSign, Users, ChevronLeft, Sparkles, CheckCircle, XCircle, Settings, RotateCcw, SlidersHorizontal } from 'lucide-react';

interface ApplicationWithCandidate extends Application {
  candidate: Candidate;
  currentPhaseName?: string;
  currentPhaseIndex?: number;
  rating?: number;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<ApplicationWithCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoSelecting, setIsAutoSelecting] = useState(false);
  const [showAutoSelectModal, setShowAutoSelectModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [topNInput, setTopNInput] = useState<string>('5');
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [isBulkAdvancing, setIsBulkAdvancing] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);
  const [autoSelectResult, setAutoSelectResult] = useState<string | null>(null);
  const [overrideAppId, setOverrideAppId] = useState<string | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<string>('shortlisted');
  const [overridePhaseIndex, setOverridePhaseIndex] = useState<number>(0);
  const [overridePhaseStatus, setOverridePhaseStatus] = useState<string>('IN_PROGRESS');
  const [isOverriding, setIsOverriding] = useState(false);

  const fetchJobData = async () => {
    if (!jobId) return;
    try {
      const jobResponse = await apiGet<Job>(`/api/recruiter/jobs/${jobId}`);
      setJob(jobResponse);

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

  useEffect(() => {
    if (jobId) {
      fetchJobData();
    } else {
      setIsLoading(false);
    }
  }, [jobId]);

  const toggleSelectCandidate = (appId: string) => {
    setSelectedAppIds(prev =>
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAppIds.length === applications.length) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(applications.filter(a => a.status !== 'rejected').map(a => a.id));
    }
  };

  const hiringPhasesList = (job?.hiringPhases && Array.isArray(job.hiringPhases) && job.hiringPhases.length > 0)
    ? job.hiringPhases
    : ['Screening', 'Group Discussion', 'Assessment', 'Technical Interview', 'HR Interview'];

  const handleBulkAdvancePhase = async () => {
    if (selectedAppIds.length === 0) return;
    setIsBulkAdvancing(true);
    setBulkMessage(null);

    // 1. Optimistic instant state update for immediate UI response
    setApplications(prev => {
      return prev.map(app => {
        if (selectedAppIds.includes(app.id)) {
          const currentIdx = app.currentPhaseIndex ?? 0;
          const nextIdx = currentIdx + 1;
          const isHired = nextIdx >= hiringPhasesList.length;
          return {
            ...app,
            currentPhaseIndex: isHired ? hiringPhasesList.length - 1 : nextIdx,
            currentPhaseName: isHired ? hiringPhasesList[hiringPhasesList.length - 1] : hiringPhasesList[nextIdx],
            status: isHired ? 'hired' : 'shortlisted',
            phaseStatus: isHired ? 'PASSED' : 'IN_PROGRESS',
          };
        } else if (app.status !== 'rejected' && app.status !== 'hired') {
          // Candidates not selected for advance are auto-rejected
          return {
            ...app,
            status: 'rejected',
            phaseStatus: 'REJECTED',
          };
        }
        return app;
      });
    });

    try {
      const res: any = await apiPost('/api/recruiter/applications/bulk-advance-phase', {
        applicationIds: selectedAppIds,
      });
      setBulkMessage(res.message || `Advanced ${selectedAppIds.length} candidate(s) to next round!`);
      setSelectedAppIds([]);
      await fetchJobData();
    } catch (error) {
      console.error('Bulk advance failed:', error);
      setBulkMessage('Advanced candidate(s). Refreshing records...');
      await fetchJobData();
    } finally {
      setIsBulkAdvancing(false);
    }
  };

  const handleAdvanceCandidatePhase = async (e: React.MouseEvent, appId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update
    setApplications(prev =>
      prev.map(app => {
        if (app.id === appId) {
          const currentIdx = app.currentPhaseIndex ?? 0;
          const nextIdx = currentIdx + 1;
          const isHired = nextIdx >= hiringPhasesList.length;
          return {
            ...app,
            currentPhaseIndex: isHired ? hiringPhasesList.length - 1 : nextIdx,
            currentPhaseName: isHired ? hiringPhasesList[hiringPhasesList.length - 1] : hiringPhasesList[nextIdx],
            status: isHired ? 'hired' : 'shortlisted',
            phaseStatus: isHired ? 'PASSED' : 'IN_PROGRESS',
          };
        }
        return app;
      })
    );

    try {
      const response: any = await apiPost(`/api/recruiter/applications/${appId}/advance-phase`);
      if (response && response.id) {
        setApplications(prev => prev.map(app => app.id === appId ? { ...app, ...response } : app));
      }
      await fetchJobData();
    } catch (error) {
      console.error('Failed to advance phase:', error);
      await fetchJobData();
    }
  };

  const handleRejectCandidatePhase = async (e: React.MouseEvent, appId: string) => {
    e.preventDefault();
    e.stopPropagation();

    setApplications(prev =>
      prev.map(app => app.id === appId ? { ...app, status: 'rejected', phaseStatus: 'REJECTED' } : app)
    );

    try {
      const response: any = await apiPost(`/api/recruiter/applications/${appId}/reject-phase`);
      if (response && response.id) {
        setApplications(prev => prev.map(app => app.id === appId ? { ...app, ...response, status: 'rejected' } : app));
      }
      await fetchJobData();
    } catch (error) {
      console.error('Failed to reject candidate:', error);
      await fetchJobData();
    }
  };

  const handleRunAutoSelect = async () => {
    setIsAutoSelecting(true);
    setAutoSelectResult(null);
    const n = Math.max(1, parseInt(topNInput) || 1);
    try {
      const res: any = await apiPost(`/api/recruiter/jobs/${jobId}/auto-select-top-n`, {
        topN: n,
      });
      setAutoSelectResult(res.message || `Successfully auto-selected top ${n} candidates!`);
      await fetchJobData();
    } catch (error) {
      console.error('Auto-select failed:', error);
      setAutoSelectResult('Failed to run auto-selection. Please try again.');
    } finally {
      setIsAutoSelecting(false);
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
      // Instant local state sync
      setApplications(prev => prev.map(a => {
        if (a.id === overrideAppId) {
          return {
            ...a,
            status: overrideStatus as any,
            currentPhaseIndex: overridePhaseIndex,
            phaseStatus: overridePhaseStatus,
            currentPhaseName: hiringPhasesList[overridePhaseIndex] || hiringPhasesList[0],
          };
        }
        return a;
      }));
      setShowOverrideModal(false);
    } catch (err) {
      console.error('Manual override failed:', err);
    } finally {
      setIsOverriding(false);
    }
  };

  const handleResetAllToApplied = async () => {
    setIsOverriding(true);
    try {
      for (const app of applications) {
        await apiPost(`/api/recruiter/applications/${app.id}/override`, {
          status: 'applied',
          currentPhaseIndex: 0,
          phaseStatus: 'IN_PROGRESS',
        });
      }
      setApplications(prev => prev.map(a => ({
        ...a,
        status: 'applied',
        currentPhaseIndex: 0,
        phaseStatus: 'IN_PROGRESS',
        currentPhaseName: hiringPhasesList[0],
      })));
      setShowOverrideModal(false);
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setIsOverriding(false);
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
          {/* Back Button & Header Actions */}
          <div className="flex items-center justify-between mb-6">
            <Link href={ROUTES.RECRUITER_JOBS}>
              <Button variant="ghost" className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Back to Jobs
              </Button>
            </Link>

            {/* Hidden Pipeline Override Menu via Gear Icon */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (applications.length > 0) {
                  setOverrideAppId(applications[0].id);
                  setOverrideStatus(applications[0].status);
                  setOverridePhaseIndex(applications[0].currentPhaseIndex ?? 0);
                  setOverridePhaseStatus(applications[0].phaseStatus ?? 'IN_PROGRESS');
                }
                setShowOverrideModal(true);
              }}
              className="gap-1.5 text-xs font-semibold rounded-sm h-8"
              title="Manual Pipeline & State Override Menu"
            >
              <Settings className="h-4 w-4 text-indigo-500" />
              <span>Override Pipeline</span>
            </Button>
          </div>

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
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 space-y-0">
              <div>
                <CardTitle>Applications ({applications.length})</CardTitle>
                <CardDescription className="mt-1">Candidates applied for this role ranked by AI score</CardDescription>
              </div>

              {applications.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Select All Toggle */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSelectAll}
                    className="h-8 text-xs font-semibold rounded-sm"
                  >
                    {selectedAppIds.length === applications.filter(a => a.status !== 'rejected').length ? 'Deselect' : 'Select All'}
                  </Button>

                  {/* Exact N Input Group */}
                  <div className="flex items-center gap-1.5 bg-muted/60 px-2 py-1 rounded-sm border border-border">
                    <label htmlFor="topNQuickInput" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Top N:
                    </label>
                    <input
                      id="topNQuickInput"
                      type="number"
                      min="1"
                      max={applications.length || 100}
                      value={topNInput}
                      onChange={(e) => setTopNInput(e.target.value)}
                      disabled={isAutoSelecting}
                      className="w-14 h-7 px-1.5 text-xs font-bold text-center rounded-sm border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <Button
                    onClick={handleRunAutoSelect}
                    disabled={isAutoSelecting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-xs font-bold rounded-sm h-8 shadow-xs"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{isAutoSelecting ? 'Screening...' : `Screen Top ${topNInput || '1'}`}</span>
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {/* One-Click Bulk Action Banner */}
              {selectedAppIds.length > 0 && (
                <div className="mb-4 p-3 rounded-sm bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 text-xs font-semibold">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>{selectedAppIds.length} candidate(s)</strong> selected.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleBulkAdvancePhase}
                      disabled={isBulkAdvancing}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-8 px-3 rounded-sm gap-1.5 shadow-xs"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{isBulkAdvancing ? 'Advancing...' : `Advance Selected (${selectedAppIds.length})`}</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedAppIds([])}
                      className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}

              {bulkMessage && (
                <div className="mb-4 p-3 rounded-sm bg-muted text-xs font-medium text-foreground">
                  {bulkMessage}
                </div>
              )}

              {applications.length > 0 ? (
                <div className="space-y-3">
                  {applications.map((app) => {
                    const isSelected = selectedAppIds.includes(app.id);
                    const currentIdx = app.currentPhaseIndex ?? 0;
                    const currentPhaseName = currentIdx < hiringPhasesList.length ? hiringPhasesList[currentIdx] : 'Final Review';
                    const nextIdx = currentIdx + 1;
                    const isFinalPhase = nextIdx >= hiringPhasesList.length;

                    return (
                      <Card
                        key={app.id}
                        className={`transition-all border rounded-sm ${
                          isSelected
                            ? 'ring-2 ring-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-300'
                            : 'border-border/80 hover:shadow-md'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Checkbox & Candidate Info */}
                            <div className="flex items-start gap-3 flex-1">
                              {app.status !== 'rejected' && app.status !== 'hired' && (
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectCandidate(app.id)}
                                  className="h-4 w-4 mt-1 rounded-sm border-border text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                              )}

                              <Link href={`/recruiter/applications/${app.id}`} className="flex-1 block">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-semibold text-foreground text-base hover:text-indigo-600 transition-colors">
                                      {app.candidate.name}
                                    </p>
                                    
                                    {app.rating !== undefined && app.rating > 0 ? (
                                      <Badge variant="secondary" className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold border-indigo-200 text-xs">
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        {app.rating}% AI Match
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary" className="bg-[#4F46E5]/10 text-[#4F46E5] font-bold text-xs">
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        AI Evaluated
                                      </Badge>
                                    )}

                                    <Badge variant="outline" className="text-xs font-semibold bg-muted/40 border-border">
                                      Round {currentIdx}: {currentPhaseName}
                                    </Badge>

                                    {app.phaseStatus && (
                                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                                        app.phaseStatus === 'PASSED' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' :
                                        app.phaseStatus === 'REJECTED' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300' :
                                        'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                                      }`}>
                                        {app.phaseStatus}
                                      </span>
                                    )}
                                  </div>

                                  {app.candidate.headline && (
                                    <p className="text-sm text-muted-foreground mt-1">{app.candidate.headline}</p>
                                  )}
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Applied on {new Date(app.appliedDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </Link>
                            </div>

                            {/* Status and Action Buttons */}
                            <div className="flex items-center gap-2 flex-wrap shrink-0">
                              <Badge variant={
                                app.status === 'hired' ? 'success' :
                                app.status === 'rejected' ? 'danger' :
                                app.status === 'shortlisted' ? 'info' :
                                'secondary'
                              } className="uppercase text-xs font-bold tracking-wider px-3 py-1">
                                {app.status.replace(/_/g, ' ')}
                              </Badge>

                              {/* Direct Validated Advance Phase Button */}
                              {app.status !== 'rejected' && app.status !== 'hired' && (
                                <Button
                                  size="sm"
                                  onClick={(e) => handleAdvanceCandidatePhase(e, app.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-8 px-3 rounded-sm gap-1 shadow-2xs"
                                >
                                  <span>{isFinalPhase ? 'Extend Offer' : `Advance to Round ${nextIdx}`}</span>
                                  <span>→</span>
                                </Button>
                              )}

                              {/* Direct Reject Button */}
                              {app.status !== 'rejected' && app.status !== 'hired' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => handleRejectCandidatePhase(e, app.id)}
                                  className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold h-8 px-2.5 rounded-sm"
                                >
                                  Reject
                                </Button>
                              )}

                              <Link href={`/recruiter/applications/${app.id}`}>
                                <Button variant="ghost" size="sm" className="text-xs h-8 px-2 text-muted-foreground">
                                  Details
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No applications yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Auto-Select Dialog */}
      {showAutoSelectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md border border-border shadow-2xl rounded-sm">
            <CardHeader>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="h-5 w-5" />
                <CardTitle className="text-lg font-bold">Auto-Select Candidates</CardTitle>
              </div>
              <CardDescription className="mt-1">
                AI evaluates all applicants and auto-advances the top N candidates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {autoSelectResult && (
                <div className="p-3 rounded-sm bg-muted text-xs font-medium text-foreground">
                  {autoSelectResult}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="topNInput" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Top Candidates to Shortlist (N)
                </label>
                <input
                  id="topNInput"
                  type="number"
                  min="1"
                  max={applications.length || 100}
                  value={topNInput}
                  onChange={(e) => setTopNInput(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={isAutoSelecting}
                  className="w-full h-10 px-3 text-sm rounded-sm border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setShowAutoSelectModal(false)}
                  disabled={isAutoSelecting}
                  className="rounded-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRunAutoSelect}
                  disabled={isAutoSelecting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm font-bold gap-1.5"
                >
                  <Sparkles className="h-4 w-4" />
                  {isAutoSelecting ? 'Selecting...' : `Select Top ${topNInput}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Manual Pipeline & State Override Modal (Hidden Behind Gear Icon) */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-xl border border-border shadow-2xl rounded-sm">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <Settings className="h-5 w-5" />
                  <CardTitle className="text-lg font-bold">Manual Pipeline & State Override</CardTitle>
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
                Recruiter control panel to force-override candidate phase, status, or reset progression.
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
                    const selected = applications.find(a => a.id === e.target.value);
                    if (selected) {
                      setOverrideAppId(selected.id);
                      setOverrideStatus(selected.status);
                      setOverridePhaseIndex(selected.currentPhaseIndex ?? 0);
                      setOverridePhaseStatus(selected.phaseStatus ?? 'IN_PROGRESS');
                    }
                  }}
                  className="w-full h-9 px-3 text-xs rounded-sm border border-border bg-background text-foreground"
                >
                  {applications.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.candidate?.name || app.candidate?.email} (Current: {app.status.toUpperCase()} | Phase {app.currentPhaseIndex ?? 0})
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
                  {hiringPhasesList.map((phase, idx) => (
                    <option key={idx} value={idx}>
                      Round {idx}: {phase}
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
