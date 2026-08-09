'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ErrorMessage } from '@/components/common/error-message';
import { X, Sparkles } from 'lucide-react';

interface ApplyDialogProps {
  jobTitle: string;
  questionnaire?: string[];
  onSubmit: (coverLetter: string) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

export function ApplyDialog({ jobTitle, questionnaire = [], onSubmit, onCancel, isOpen }: ApplyDialogProps) {
  const [coverLetter, setCoverLetter] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerateAiCoverLetter = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generated = `Dear Hiring Manager,\n\nI am writing to express my strong interest in the ${jobTitle} position. Based on my background and technical skills, I am confident in my ability to make an immediate, positive contribution to your team.\n\nKey Highlights:\n- Proven experience aligned directly with the requirements for ${jobTitle}.\n- Strong commitment to technical execution, high code quality, and teamwork.\n\nThank you for considering my application. I look forward to the opportunity to discuss my qualifications further.\n\nSincerely,\nCandidate`;
      setCoverLetter(generated);
      setIsGenerating(false);
    }, 400);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    let finalPayload = coverLetter;
    if (questionnaire.length > 0) {
      const answersText = questionnaire.map((q, idx) => `Q: ${q}\nA: ${answers[q] || 'N/A'}`).join('\n\n');
      if (coverLetter.trim()) {
        finalPayload = `${coverLetter}\n\n--- SCREENING QUESTIONNAIRE ---\n${answersText}`;
      } else {
        finalPayload = `--- SCREENING QUESTIONNAIRE ---\n${answersText}`;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit(finalPayload);
      setCoverLetter('');
      setAnswers({});
      onCancel();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to apply';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <Card className="w-full max-w-lg border border-border shadow-2xl rounded-sm max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Apply for Position</CardTitle>
            <CardDescription className="mt-1 font-medium text-indigo-500">{jobTitle}</CardDescription>
          </div>
          <button
            onClick={onCancel}
            className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

            {questionnaire.length > 0 && (
              <div className="space-y-3 p-3 rounded-sm bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800">
                <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                  Screening Questionnaire Required
                </p>
                {questionnaire.map((q, idx) => (
                  <div key={idx} className="space-y-1">
                    <label className="text-xs font-medium text-foreground block">
                      {idx + 1}. {q}
                    </label>
                    <input
                      type="text"
                      placeholder="Your answer..."
                      value={answers[q] || ''}
                      onChange={(e) => setAnswers({ ...answers, [q]: e.target.value })}
                      disabled={isSubmitting}
                      className="w-full h-8 px-2.5 text-xs rounded-sm border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="coverLetter" className="text-sm font-medium text-foreground">
                  Cover Letter
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateAiCoverLetter}
                  disabled={isSubmitting || isGenerating}
                  className="text-xs text-indigo-500 hover:text-indigo-600 gap-1.5 h-7 px-2"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {isGenerating ? 'Generating...' : 'AI Generate Cover Letter'}
                </Button>
              </div>
              <Textarea
                id="coverLetter"
                placeholder="Write your cover letter or click 'AI Generate Cover Letter' above to create one automatically..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                disabled={isSubmitting}
                className="min-h-40 rounded-sm text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {coverLetter.length} characters (Leave blank to let AI auto-generate upon submission)
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="rounded-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm font-medium"
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
