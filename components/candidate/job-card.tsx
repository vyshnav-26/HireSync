import Link from 'next/link';
import { MapPin, Briefcase, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Job } from '@/lib/types';

interface JobCardProps {
  job: Job;
  onApply?: (jobId: string) => void;
  applied?: boolean;
}

export function JobCard({ job, onApply, applied }: JobCardProps) {
  const isRecent = new Date().getTime() - new Date(job.postedDate).getTime() < 7 * 24 * 60 * 60 * 1000;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#111827] mb-1">
              {job.title}
            </h3>
            <p className="text-sm text-[#6B7280]">{job.company}</p>
          </div>
          {isRecent && <Badge variant="success">New</Badge>}
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <MapPin className="h-4 w-4" />
            {job.location}
          </div>
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Briefcase className="h-4 w-4" />
            <span className="capitalize">{job.workType}</span>
          </div>
          {job.salary && (
            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <DollarSign className="h-4 w-4" />
              ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
            </div>
          )}
        </div>

        <p className="text-sm text-[#6B7280] mb-4 line-clamp-2">
          {job.description}
        </p>

        <div className="flex items-center justify-between">
          <Link href={`/candidate/jobs/${job.id}`}>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => onApply?.(job.id)}
            disabled={applied}
          >
            {applied ? 'Applied' : 'Apply'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
