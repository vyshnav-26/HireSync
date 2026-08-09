'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Application } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/common/star-rating';
import { Clock, Star, CheckCircle2, XCircle, Check, ArrowRight, Mail, ChevronRight, AlertCircle } from 'lucide-react';

interface ApplicationReviewProps {
  application: Application;
  onStatusChange: (status: Application['status']) => Promise<void>;
  onFeedbackSubmit: (feedback: string, rating: number) => Promise<void>;
  onAdvancePhase?: () => Promise<void>;
  onRejectPhase?: () => Promise<void>;
  isLoading?: boolean;
}

export function ApplicationReview({
  application,
  onStatusChange,
  onFeedbackSubmit,
  onAdvancePhase,
  onRejectPhase,
  isLoading = false,
}: ApplicationReviewProps) {
  const [feedback, setFeedback] = useState(application.feedback || '');
  const [rating, setRating] = useState(application.rating || 0);
  const [isSaving, setIsSaving] = useState(false);
  const [showEmailLogs, setShowEmailLogs] = useState(false);

  const defaultPhases = ['Screening', 'Group Discussion', 'Assessment', 'Technical Interview', 'HR Interview'];
  const phases = application.hiringPhases && application.hiringPhases.length > 0 ? application.hiringPhases : defaultPhases;
  const currentIdx = application.currentPhaseIndex ?? 0;
  const currentPhaseName = phases[currentIdx] || phases[0];
  const isRejected = application.status === 'rejected' || application.phaseStatus === 'REJECTED';
  const isHired = application.status === 'hired';
  const isFinalPhase = currentIdx >= phases.length - 1;

  const handleStatusChange = async (newStatus: Application['status']) => {
    setIsSaving(true);
    try {
      await onStatusChange(newStatus);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdvance = async () => {
    if (!onAdvancePhase) return;
    setIsSaving(true);
    try {
      await onAdvancePhase();
    } finally {
      setIsSaving(false);
    }
  };

  const handleReject = async () => {
    if (!onRejectPhase) return;
    setIsSaving(true);
    try {
      await onRejectPhase();
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFeedback = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onFeedbackSubmit(feedback, rating);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Linear Hiring Pipeline Stepper & Controls */}
      <Card className="border border-border/80 rounded-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold text-foreground">Hiring Pipeline</CardTitle>
          <Badge 
            variant={isHired ? 'success' : isRejected ? 'danger' : 'info'}
            className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider"
          >
            {isHired ? 'Hired' : isRejected ? 'Rejected' : `Phase ${currentIdx + 1}: ${currentPhaseName}`}
          </Badge>
        </CardHeader>

        <CardContent className="pt-4 space-y-5">
          {/* Stepper Visualization */}
          <div className="space-y-3 p-3.5 rounded-sm bg-muted/30 border border-border/60">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Linear Hiring Flow
            </span>
            
            <div className="space-y-2">
              {phases.map((phase, idx) => {
                const isCompleted = !isRejected && idx < currentIdx;
                const isCurrent = !isRejected && idx === currentIdx;
                const isPhaseRejected = isRejected && idx === currentIdx;

                return (
                  <div 
                    key={phase}
                    className={`flex items-center justify-between p-2.5 rounded-sm border text-xs font-semibold transition-all ${
                      isPhaseRejected
                        ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 text-rose-700 dark:text-rose-400'
                        : isCurrent
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                        : isCompleted
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 text-emerald-700 dark:text-emerald-400'
                        : 'bg-background border-border text-muted-foreground opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isPhaseRejected
                          ? 'bg-rose-600 text-white'
                          : isCurrent
                          ? 'bg-indigo-600 text-white'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {isCompleted ? '✓' : idx + 1}
                      </span>
                      <span className="truncate">{phase}</span>
                    </div>

                    <span className="text-[10px] uppercase font-bold shrink-0">
                      {isPhaseRejected ? 'Failed' : isCurrent ? 'In Progress' : isCompleted ? 'Passed' : 'Upcoming'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phase Action Controls */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Phase Decision Actions
            </span>

            {isRejected ? (
              <div className="p-3 rounded-sm bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Candidate has been rejected in this round. No further emails or linear phase changes allowed.</span>
              </div>
            ) : isHired ? (
              <div className="p-3 rounded-sm bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Candidate cleared all rounds and has been Hired! Job offer email delivered.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleAdvance}
                  disabled={isLoading || isSaving}
                  className="w-full flex items-center justify-center gap-2 h-10 px-3.5 rounded-sm text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{isFinalPhase ? 'Pass Final Round & Hire Candidate' : `Advance to Phase ${currentIdx + 2}: ${phases[currentIdx + 1]}`}</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={handleReject}
                  disabled={isLoading || isSaving}
                  className="w-full flex items-center justify-center gap-2 h-9 px-3.5 rounded-sm text-xs font-semibold bg-background hover:bg-rose-50 text-rose-600 border border-rose-200 dark:border-rose-900 dark:hover:bg-rose-950/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>Fail Candidate in {currentPhaseName}</span>
                </button>
              </div>
            )}
          </div>

          {/* Email Log Notification Trigger */}
          {application.emailLogs && application.emailLogs.length > 0 && (
            <div className="pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => setShowEmailLogs(!showEmailLogs)}
                className="w-full flex items-center justify-between text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 py-1"
              >
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  <span>Automated Email History ({application.emailLogs.length})</span>
                </div>
                <ChevronRight className={`h-3.5 w-3.5 transition-transform ${showEmailLogs ? 'rotate-90' : ''}`} />
              </button>

              {showEmailLogs && (
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
                  {application.emailLogs.map((log: any, i: number) => (
                    <div key={i} className="p-2.5 rounded-sm bg-muted/40 border border-border/60 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-foreground">
                        <span className="truncate">{log.subject || 'Automated Email'}</span>
                        <Badge variant="secondary" className="text-[9px] uppercase px-1.5">
                          {log.type || 'Email'}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground whitespace-pre-wrap line-clamp-3">
                        {log.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Status Override Panel */}
      <Card className="border border-border/80 rounded-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-base font-bold text-foreground">Manual Status Override</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-2">
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleStatusChange('under_review')}
              disabled={isLoading || isSaving}
              className={`w-full flex items-center justify-between h-9 px-3.5 rounded-sm text-xs font-semibold transition-all duration-150 border cursor-pointer ${
                application.status === 'under_review'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-background hover:bg-indigo-50/70 border-border text-foreground dark:hover:bg-indigo-950/30'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Clock className="h-4 w-4 shrink-0 text-current" />
                <span className="truncate">Under Review</span>
              </div>
              {application.status === 'under_review' && <Check className="h-4 w-4 shrink-0" />}
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange('shortlisted')}
              disabled={isLoading || isSaving}
              className={`w-full flex items-center justify-between h-9 px-3.5 rounded-sm text-xs font-semibold transition-all duration-150 border cursor-pointer ${
                application.status === 'shortlisted'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                  : 'bg-background hover:bg-amber-50/70 border-border text-foreground dark:hover:bg-amber-950/30'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Star className="h-4 w-4 shrink-0 text-current" />
                <span className="truncate">Shortlist</span>
              </div>
              {application.status === 'shortlisted' && <Check className="h-4 w-4 shrink-0" />}
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange('hired')}
              disabled={isLoading || isSaving}
              className={`w-full flex items-center justify-between h-9 px-3.5 rounded-sm text-xs font-semibold transition-all duration-150 border cursor-pointer ${
                application.status === 'hired'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-background hover:bg-emerald-50/70 border-border text-foreground dark:hover:bg-emerald-950/30'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-current" />
                <span className="truncate">Hire</span>
              </div>
              {application.status === 'hired' && <Check className="h-4 w-4 shrink-0" />}
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange('rejected')}
              disabled={isLoading || isSaving}
              className={`w-full flex items-center justify-between h-9 px-3.5 rounded-sm text-xs font-semibold transition-all duration-150 border cursor-pointer ${
                application.status === 'rejected'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-background hover:bg-rose-50/70 border-border text-rose-600 dark:hover:bg-rose-950/30'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <XCircle className="h-4 w-4 shrink-0 text-current" />
                <span className="truncate">Reject</span>
              </div>
              {application.status === 'rejected' && <Check className="h-4 w-4 shrink-0" />}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Interview Feedback Card */}
      <Card className="border border-border/80 rounded-sm">
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-base font-bold text-foreground">Interview Feedback</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSaveFeedback} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Candidate Rating
              </label>
              <div className="pt-1">
                <StarRating
                  rating={rating}
                  onRatingChange={setRating}
                  disabled={isLoading || isSaving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="feedback" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Notes & Evaluation
              </label>
              <Textarea
                id="feedback"
                placeholder="Add notes about candidate performance, strengths, or next steps..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={isLoading || isSaving}
                className="min-h-28 text-sm rounded-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || isSaving}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm font-medium h-9"
            >
              {isSaving ? 'Saving Notes...' : 'Save Feedback'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
