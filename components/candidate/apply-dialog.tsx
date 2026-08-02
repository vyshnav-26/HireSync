'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ErrorMessage } from '@/components/common/error-message';
import { X } from 'lucide-react';

interface ApplyDialogProps {
  jobTitle: string;
  onSubmit: (coverLetter: string) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

export function ApplyDialog({ jobTitle, onSubmit, onCancel, isOpen }: ApplyDialogProps) {
  const [coverLetter, setCoverLetter] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!coverLetter.trim()) {
      setError('Please write a cover letter');
      return;
    }

    if (coverLetter.length < 20) {
      setError('Cover letter must be at least 20 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(coverLetter);
      setCoverLetter('');
      onCancel();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to apply';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Apply for Position</CardTitle>
            <CardDescription className="mt-1">{jobTitle}</CardDescription>
          </div>
          <button
            onClick={onCancel}
            className="rounded p-1 hover:bg-[#F3F4F6]"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

            <div className="space-y-2">
              <label htmlFor="coverLetter" className="text-sm font-medium text-[#111827]">
                Cover Letter
              </label>
              <Textarea
                id="coverLetter"
                placeholder="Tell us why you're interested in this position..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                disabled={isSubmitting}
                className="min-h-32"
              />
              <p className="text-xs text-[#6B7280]">
                {coverLetter.length} / 2000 characters
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
