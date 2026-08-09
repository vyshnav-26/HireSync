import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CandidateListItem } from '@/lib/types';
import { MapPin, Briefcase, Sparkles } from 'lucide-react';

interface CandidateListItemProps {
  candidate: CandidateListItem;
  onViewProfile?: (candidateId: string) => void;
  onAdvancePhase?: (candidate: CandidateListItem) => void;
}

const DEFAULT_PHASES = ['Screening', 'Group Discussion', 'Assessment', 'Technical Interview', 'HR Interview'];

export function CandidateListItemComponent({ candidate, onViewProfile, onAdvancePhase }: CandidateListItemProps) {
  const score = Math.round(candidate.matchScore || 70);
  const scoreColor = score >= 80 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200' :
                     score >= 65 ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200' :
                                   'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200';

  const currentIdx = candidate.currentPhaseIndex ?? 0;
  const currentPhaseName = currentIdx < DEFAULT_PHASES.length ? DEFAULT_PHASES[currentIdx] : 'Final Review';
  const nextPhaseName = currentIdx + 1 < DEFAULT_PHASES.length ? DEFAULT_PHASES[currentIdx + 1] : 'Offer Extension';
  const isFinalPhase = currentIdx + 1 >= DEFAULT_PHASES.length;

  const statusBadgeVariant = candidate.applicationStatus === 'hired' ? 'success' : 
                             candidate.applicationStatus === 'rejected' ? 'danger' :
                             candidate.applicationStatus === 'shortlisted' ? 'info' : 'secondary';

  return (
    <Card className="rounded-sm border border-border/80 hover:border-indigo-500/50 hover:shadow-md transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-foreground tracking-tight capitalize">
                {candidate.name}
              </h3>
              {score >= 80 && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-none bg-indigo-600 text-white flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Top AI Candidate
                </span>
              )}
              {candidate.jobTitle && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">
                  Applied for: <strong>{candidate.jobTitle}</strong>
                </span>
              )}
            </div>
            {candidate.headline && (
              <p className="text-sm text-indigo-600 font-medium mt-0.5 capitalize">
                {candidate.headline}
              </p>
            )}
          </div>

          {candidate.matchScore !== undefined && candidate.matchScore !== null && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border font-semibold text-sm ${scoreColor}`}>
              <Sparkles className="h-4 w-4" />
              <span>{score}% AI Match</span>
            </div>
          )}
        </div>

        {/* Phase & Pipeline Status Pill */}
        <div className="mb-4 flex items-center gap-2 flex-wrap text-xs">
          <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
            Pipeline Stage:
          </span>
          <Badge variant="outline" className="font-semibold text-xs rounded-sm bg-muted/40 border-border">
            Round {currentIdx}: {currentPhaseName}
          </Badge>
          {candidate.phaseStatus && (
            <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
              candidate.phaseStatus === 'PASSED' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' :
              candidate.phaseStatus === 'REJECTED' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300' :
              'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
            }`}>
              {candidate.phaseStatus}
            </span>
          )}
        </div>

        <div className="space-y-1.5 mb-4">
          {candidate.location && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {candidate.location}
            </div>
          )}
          {candidate.experience && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5 shrink-0" />
              {candidate.experience}
            </div>
          )}
        </div>

        {candidate.skills && candidate.skills.length > 0 && (
          <div className="mb-5">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Verified Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.slice(0, 5).map((skill) => (
                <Badge key={skill} variant="secondary" className="rounded-none font-normal text-xs px-2 py-0.5">
                  {skill}
                </Badge>
              ))}
              {candidate.skills.length > 5 && (
                <Badge variant="outline" className="rounded-none font-normal text-xs px-2 py-0.5">
                  +{candidate.skills.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-border/40">
          {candidate.applicationStatus ? (
            <Badge variant={statusBadgeVariant} className="rounded-none uppercase tracking-wider text-[10px]">
              {candidate.applicationStatus.charAt(0).toUpperCase() + candidate.applicationStatus.slice(1).replace(/_/g, ' ')}
            </Badge>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {onAdvancePhase && candidate.applicationId && candidate.applicationStatus !== 'rejected' && candidate.applicationStatus !== 'hired' && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm text-xs font-bold h-8 px-3 gap-1 shadow-2xs"
                onClick={() => onAdvancePhase(candidate)}
              >
                <span>{isFinalPhase ? 'Extend Offer' : `Advance to Round ${currentIdx + 1}`}</span>
                <span>→</span>
              </Button>
            )}

            {onViewProfile && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-sm text-xs font-medium border-border/80 hover:bg-muted h-8"
                onClick={() => onViewProfile(candidate.id)}
              >
                Review Application
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
