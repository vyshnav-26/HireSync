import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CandidateListItem } from '@/lib/types';
import { MapPin, Briefcase, Star } from 'lucide-react';

interface CandidateListItemProps {
  candidate: CandidateListItem;
  onViewProfile?: (candidateId: string) => void;
}

export function CandidateListItemComponent({ candidate, onViewProfile }: CandidateListItemProps) {
  const statusBadgeVariant = candidate.applicationStatus === 'hired' ? 'success' : 
                             candidate.applicationStatus === 'rejected' ? 'danger' :
                             candidate.applicationStatus === 'shortlisted' ? 'info' : 'secondary';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">
              {candidate.name}
            </h3>
            {candidate.headline && (
              <p className="text-sm text-[#4F46E5] font-medium mt-1">
                {candidate.headline}
              </p>
            )}
          </div>
          {candidate.matchScore && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[#FFFBEB] px-3 py-1 rounded-full">
                <Star className="h-4 w-4 text-[#F59E0B]" />
                <span className="text-sm font-medium text-[#F59E0B]">
                  {Math.round(candidate.matchScore)}%
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 mb-4">
          {candidate.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {candidate.location}
            </div>
          )}
          {candidate.experience && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              {candidate.experience}
            </div>
          )}
        </div>

        {candidate.skills && candidate.skills.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground uppercase font-medium mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
              {candidate.skills.length > 3 && (
                <Badge variant="secondary">
                  +{candidate.skills.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          {candidate.applicationStatus && (
            <Badge variant={statusBadgeVariant}>
              {candidate.applicationStatus.charAt(0).toUpperCase() + candidate.applicationStatus.slice(1).replace(/_/g, ' ')}
            </Badge>
          )}
          {onViewProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewProfile(candidate.id)}
            >
              View Profile
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
