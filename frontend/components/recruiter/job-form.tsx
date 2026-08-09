'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ErrorMessage } from '@/components/common/error-message';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Job } from '@/lib/types';
import { validateJobForm } from '@/lib/validation';

interface JobFormProps {
  job?: Partial<Job>;
  onSubmit: (data: Partial<Job>) => Promise<void>;
  isLoading?: boolean;
}

export function JobForm({ job, onSubmit, isLoading = false }: JobFormProps) {
  const isEdit = !!job?.id;

  const [formData, setFormData] = useState({
    title: job?.title || '',
    company: job?.company || '',
    description: job?.description || '',
    location: job?.location || '',
    workType: (job?.workType || 'hybrid') as 'remote' | 'on-site' | 'hybrid',
    requirements: job?.requirements || [],
    salary: {
      min: job?.salary?.min || 0,
      max: job?.salary?.max || 0,
    },
    status: (job?.status || 'draft') as 'open' | 'closed' | 'draft',
    hiringPhases: job?.hiringPhases || ['Screening', 'Group Discussion', 'Assessment', 'Technical Interview', 'HR Interview'],
    questionnaire: job?.questionnaire || [],
  });

  const [newRequirement, setNewRequirement] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newCustomPhase, setNewCustomPhase] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  // Comprehensive Standard Industry Hiring Rounds Library
  const STANDARD_ROUNDS_LIBRARY = [
    'Resume Screening',
    'Online Coding / Aptitude Test',
    'Group Discussion',
    'Technical Interview 1 (Fundamentals)',
    'Technical Interview 2 (Live Coding & Architecture)',
    'System Design Round',
    'Managerial / Behavioral Round',
    'Culture Fit Round',
    'Executive / Founder Round',
    'HR & Offer Negotiation',
    'Background & Reference Check',
  ];

  const handleAddRoundToPipeline = (round: string) => {
    if (!formData.hiringPhases.includes(round)) {
      setFormData(prev => ({
        ...prev,
        hiringPhases: [...prev.hiringPhases, round],
      }));
    }
  };

  const handleRemoveRound = (roundToRemove: string) => {
    if (formData.hiringPhases.length <= 1) return; // Keep at least 1 phase
    setFormData(prev => ({
      ...prev,
      hiringPhases: prev.hiringPhases.filter(r => r !== roundToRemove),
    }));
  };

  const handleMoveRoundUp = (index: number) => {
    if (index <= 0) return;
    setFormData(prev => {
      const updated = [...prev.hiringPhases];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
      return { ...prev, hiringPhases: updated };
    });
  };

  const handleMoveRoundDown = (index: number) => {
    if (index >= formData.hiringPhases.length - 1) return;
    setFormData(prev => {
      const updated = [...prev.hiringPhases];
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
      return { ...prev, hiringPhases: updated };
    });
  };

  const handleAddCustomRound = () => {
    if (newCustomPhase.trim() && !formData.hiringPhases.includes(newCustomPhase.trim())) {
      setFormData(prev => ({
        ...prev,
        hiringPhases: [...prev.hiringPhases, newCustomPhase.trim()],
      }));
      setNewCustomPhase('');
    }
  };

  const handleAddQuestion = () => {
    if (newQuestion.trim() && !formData.questionnaire.includes(newQuestion.trim())) {
      setFormData(prev => ({
        ...prev,
        questionnaire: [...prev.questionnaire, newQuestion.trim()],
      }));
      setNewQuestion('');
    }
  };

  const handleRemoveQuestion = (qToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      questionnaire: prev.questionnaire.filter(q => q !== qToRemove),
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()],
      }));
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (reqToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(r => r !== reqToRemove),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const validation = validateJobForm(
      formData.title,
      formData.description,
      formData.location,
      formData.requirements,
      formData.salary.min,
      formData.salary.max
    );

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save job';
      setErrors([message]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Job' : 'Create New Job'}</CardTitle>
        <CardDescription>
          {isEdit ? 'Update job posting details' : 'Create a new job posting for your candidates'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.length > 0 && (
            <div className="space-y-2">
              {errors.map((err, idx) => (
                <ErrorMessage key={idx} message={err} />
              ))}
            </div>
          )}

          {/* Title & Company */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-foreground">
                Job Title
              </label>
              <Input
                id="title"
                placeholder="e.g., Senior React Developer"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="company" className="text-sm font-medium text-foreground">
                Company Name
              </label>
              <Input
                id="company"
                placeholder="e.g., Acme Inc. (Leave blank to use profile company)"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-foreground">
              Job Description
            </label>
            <Textarea
              id="description"
              placeholder="Describe the role, responsibilities, and team..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={isLoading}
              className="min-h-32"
            />
          </div>

          {/* Location and Work Type */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium text-foreground">
                Location
              </label>
              <Input
                id="location"
                placeholder="e.g., San Francisco, CA"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="workType" className="text-sm font-medium text-foreground">
                Work Type
              </label>
              <Select
                value={formData.workType}
                onValueChange={(val) => handleInputChange('workType', val)}
                disabled={isLoading}
              >
                <SelectTrigger id="workType" className="w-full">
                  <SelectValue placeholder="Select work type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="on-site">On-site</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Salary */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="salaryMin" className="text-sm font-medium text-foreground">
                Minimum Salary ($)
              </label>
              <Input
                id="salaryMin"
                type="number"
                min="0"
                placeholder="100000"
                value={formData.salary.min === 0 ? '' : formData.salary.min}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    salary: { ...prev.salary, min: e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0) },
                  }))
                }
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="salaryMax" className="text-sm font-medium text-foreground">
                Maximum Salary ($)
              </label>
              <Input
                id="salaryMax"
                type="number"
                min="0"
                placeholder="150000"
                value={formData.salary.max === 0 ? '' : formData.salary.max}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    salary: { ...prev.salary, max: e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0) },
                  }))
                }
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Requirements
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a requirement (e.g., 5+ years React)"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                disabled={isLoading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRequirement();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddRequirement}
                disabled={isLoading || !newRequirement.trim()}
              >
                Add
              </Button>
            </div>

            {formData.requirements.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.requirements.map((req) => (
                  <Badge key={req} variant="secondary" className="pr-1">
                    {req}
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(req)}
                      className="ml-1 rounded p-0.5 hover:bg-background"
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Custom Linear Hiring Pipeline Customizer with Reordering */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-bold text-foreground block">
                  Custom Linear Hiring Pipeline & Order of Rounds
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Reorder rounds using ↑ / ↓ buttons to set the exact sequence candidates will flow through linearly.
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-semibold">
                {formData.hiringPhases.length} Rounds Configured
              </Badge>
            </div>

            {/* Active Pipeline Flow with Reordering Controls */}
            <div className="space-y-2 p-3.5 rounded-sm bg-muted/40 border border-border/80">
              <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                Active Hiring Sequence (Execution Order):
              </p>
              
              <div className="space-y-2">
                {formData.hiringPhases.map((phase, idx) => (
                  <div
                    key={`${phase}-${idx}`}
                    className="flex items-center justify-between p-2.5 rounded-sm bg-background border border-border text-xs font-semibold shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span className="truncate font-medium text-foreground text-sm">{phase}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Move Up */}
                      <button
                        type="button"
                        onClick={() => handleMoveRoundUp(idx)}
                        disabled={idx === 0 || isLoading}
                        title="Move round earlier"
                        className="px-2 py-1 rounded-sm border border-border bg-muted/50 hover:bg-muted text-foreground disabled:opacity-30 cursor-pointer text-xs font-bold"
                      >
                        ↑
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        onClick={() => handleMoveRoundDown(idx)}
                        disabled={idx === formData.hiringPhases.length - 1 || isLoading}
                        title="Move round later"
                        className="px-2 py-1 rounded-sm border border-border bg-muted/50 hover:bg-muted text-foreground disabled:opacity-30 cursor-pointer text-xs font-bold"
                      >
                        ↓
                      </button>

                      {/* Remove Round */}
                      <button
                        type="button"
                        onClick={() => handleRemoveRound(phase)}
                        disabled={formData.hiringPhases.length <= 1 || isLoading}
                        title="Remove round from pipeline"
                        className="px-2 py-1 rounded-sm border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-30 cursor-pointer text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Add from Standard Rounds Library */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Add Standard Rounds from Library:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {STANDARD_ROUNDS_LIBRARY.map((round) => {
                  const isAdded = formData.hiringPhases.includes(round);
                  return (
                    <button
                      key={round}
                      type="button"
                      onClick={() => handleAddRoundToPipeline(round)}
                      disabled={isAdded || isLoading}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                        isAdded
                          ? 'bg-indigo-50/80 text-indigo-700 border-indigo-200 opacity-60 dark:bg-indigo-950/40 dark:text-indigo-400 cursor-default'
                          : 'bg-background hover:bg-muted border-border text-foreground cursor-pointer shadow-2xs hover:border-indigo-400'
                      }`}
                    >
                      <span>{isAdded ? '✓ Added' : '+ Add'}</span>
                      <span>{round}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Round Input */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Add Custom Proprietary Round:
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Take-home Assignment Review or Founder 1-on-1"
                  value={newCustomPhase}
                  onChange={(e) => setNewCustomPhase(e.target.value)}
                  disabled={isLoading}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomRound();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCustomRound}
                  disabled={isLoading || !newCustomPhase.trim()}
                  className="rounded-sm font-semibold whitespace-nowrap"
                >
                  + Add Custom Round
                </Button>
              </div>
            </div>
          </div>

          {/* Optional Questionnaire Builder */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div>
              <label className="text-sm font-semibold text-foreground block">
                Job Screening Questionnaire (Optional)
              </label>
              <p className="text-xs text-muted-foreground">
                Add custom questions candidates must answer when applying. AI factors answers into candidate scores.
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., How many years of experience do you have with PostgreSQL?"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                disabled={isLoading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddQuestion();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddQuestion}
                disabled={isLoading || !newQuestion.trim()}
              >
                Add Question
              </Button>
            </div>

            {formData.questionnaire.length > 0 && (
              <div className="space-y-2 mt-2">
                {formData.questionnaire.map((q, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-sm bg-background border border-border text-xs text-foreground">
                    <span><strong>Q{idx + 1}:</strong> {q}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(q)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      disabled={isLoading}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium text-foreground">
              Status
            </label>
            <Select
              value={formData.status}
              onValueChange={(val) => handleInputChange('status', val)}
              disabled={isLoading}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (isEdit ? 'Updating...' : 'Creating...') : isEdit ? 'Update Job' : 'Create Job'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
