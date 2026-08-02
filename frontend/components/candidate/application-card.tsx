import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Briefcase } from 'lucide-react';
import { Application, Job, STATUS_CONFIG } from '@/lib/types';
import { STATUS_CONFIG as STATUS_COLORS } from '@/lib/constants';

interface ApplicationCardProps {
  application: Application;
  job: Job;
}

export function ApplicationCard({ application, job }: ApplicationCardProps) {
  const statusConfig = STATUS_COLORS[application.status];
  const appliedDate = new Date(application.appliedDate);
  const daysAgo = Math.floor((Date.now() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">
              {job.title}
            </h3>
            <p className="text-sm text-muted-foreground">{job.company}</p>
          </div>
          <Badge 
            variant={application.status === 'hired' ? 'success' : application.status === 'rejected' ? 'danger' : 'info'}
          >
            {statusConfig?.label}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Applied {daysAgo === 0 ? 'today' : `${daysAgo} days ago`}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Briefcase className="h-4 w-4" />
            <span className="capitalize">{job.workType}</span>
          </div>
        </div>

        {application.feedback && (
          <div className="mb-4 rounded-lg bg-muted p-3">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Feedback</p>
            <p className="text-sm text-foreground">{application.feedback}</p>
          </div>
        )}

        <Button variant="outline" size="sm" className="w-full">
          View Application
        </Button>
      </CardContent>
    </Card>
  );
}
