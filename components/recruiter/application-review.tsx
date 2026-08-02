'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Application } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/common/star-rating';

interface ApplicationReviewProps {
  application: Application;
  onStatusChange: (status: Application['status']) => Promise<void>;
  onFeedbackSubmit: (feedback: string, rating: number) => Promise<void>;
  isLoading?: boolean;
}

export function ApplicationReview({
  application,
  onStatusChange,
  onFeedbackSubmit,
  isLoading = false,
}: ApplicationReviewProps) {
  const [feedback, setFeedback] = useState(application.feedback || '');
  const [rating, setRating] = useState(application.rating || 0);
  const [isSaving, setIsSaving] = useState(false);

  const handleStatusChange = async (newStatus: Application['status']) => {
    setIsSaving(true);
    try {
      await onStatusChange(newStatus);
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
      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Application Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-[#111827]">Current Status</span>
              <Badge variant={
                application.status === 'hired' ? 'success' :
                application.status === 'rejected' ? 'danger' :
                application.status === 'shortlisted' ? 'info' :
                'secondary'
              }>
                {application.status.charAt(0).toUpperCase() + application.status.slice(1).replace(/_/g, ' ')}
              </Badge>
            </div>

            <div className="grid gap-2 md:grid-cols-3">
              <Button
                variant={application.status === 'under_review' ? 'default' : 'outline'}
                onClick={() => handleStatusChange('under_review')}
                disabled={isLoading || isSaving}
              >
                Under Review
              </Button>
              <Button
                variant={application.status === 'shortlisted' ? 'default' : 'outline'}
                onClick={() => handleStatusChange('shortlisted')}
                disabled={isLoading || isSaving}
              >
                Shortlist
              </Button>
              <Button
                variant={application.status === 'hired' ? 'default' : 'outline'}
                className={application.status === 'hired' ? '' : ''}
                onClick={() => handleStatusChange('hired')}
                disabled={isLoading || isSaving}
              >
                Hire
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full text-[#EF4444] hover:bg-[#FEE2E2]"
              onClick={() => handleStatusChange('rejected')}
              disabled={isLoading || isSaving}
            >
              Reject
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Interview Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveFeedback} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111827]">
                Rating
              </label>
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                disabled={isLoading || isSaving}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="feedback" className="text-sm font-medium text-[#111827]">
                Feedback
              </label>
              <Textarea
                id="feedback"
                placeholder="Add your notes about this candidate..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={isLoading || isSaving}
                className="min-h-24"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Feedback'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
