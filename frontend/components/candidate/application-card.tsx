'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Briefcase, X } from 'lucide-react';
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
  const [showModal, setShowModal] = useState(false);

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

        <Button variant="outline" size="sm" onClick={() => setShowModal(true)}>
          View Application
        </Button>
      </CardContent>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Application Details</h2>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-muted rounded">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge className="mt-1" variant={application.status === 'hired' ? 'success' : application.status === 'rejected' ? 'danger' : 'info'}>
                    {statusConfig?.label}
                  </Badge>
                </div>
                {application.coverLetter && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Cover Letter</h3>
                    <div className="p-3 bg-muted rounded-md text-sm text-foreground max-h-40 overflow-y-auto whitespace-pre-wrap">
                      {(() => {
                        try {
                          const parsed = JSON.parse(application.coverLetter);
                          if (parsed && typeof parsed === 'object') {
                            if (parsed.text) return parsed.text;
                            return Object.entries(parsed)
                              .map(([key, value]) => `${key}:\n${value}`)
                              .join('\n\n');
                          }
                          return application.coverLetter;
                        } catch (e) {
                          return application.coverLetter;
                        }
                      })()}
                    </div>
                  </div>
                )}
                {application.feedback && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">AI Feedback</h3>
                    <div className="p-3 bg-[#DBEAFE] rounded-md text-sm text-[#1E40AF] whitespace-pre-wrap">
                      {application.feedback}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
}
