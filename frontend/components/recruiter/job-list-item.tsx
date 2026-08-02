import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Job } from '@/lib/types';
import { MapPin, Users, Edit2, Trash2 } from 'lucide-react';

interface JobListItemProps {
  job: Job;
  onEdit?: (jobId: string) => void;
  onDelete?: (jobId: string) => void;
}

const statusColors = {
  open: 'success',
  closed: 'danger',
  draft: 'secondary',
} as const;

export function JobListItem({ job, onEdit, onDelete }: JobListItemProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Link href={`/recruiter/jobs/${job.id}`}>
                <h3 className="text-lg font-semibold text-foreground hover:text-[#4F46E5] cursor-pointer">
                  {job.title}
                </h3>
              </Link>
              <Badge variant={statusColors[job.status]}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{job.company}</p>
          </div>

          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(job.id)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                className="text-[#EF4444] hover:bg-[#FEE2E2]"
                onClick={() => onDelete(job.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {job.location}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {job.applicantCount || 0} applications
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {job.description}
        </p>

        <Link href={`/recruiter/jobs/${job.id}`}>
          <Button variant="outline" size="sm" className="w-full">
            View & Manage
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
