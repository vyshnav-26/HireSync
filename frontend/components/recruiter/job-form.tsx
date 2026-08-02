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
    description: job?.description || '',
    location: job?.location || '',
    workType: (job?.workType || 'hybrid') as 'remote' | 'on-site' | 'hybrid',
    requirements: job?.requirements || [],
    salary: {
      min: job?.salary?.min || 0,
      max: job?.salary?.max || 0,
    },
    status: (job?.status || 'draft') as 'open' | 'closed' | 'draft',
  });

  const [newRequirement, setNewRequirement] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

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

          {/* Title */}
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
                placeholder="100000"
                value={formData.salary.min}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    salary: { ...prev.salary, min: parseInt(e.target.value) || 0 },
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
                placeholder="150000"
                value={formData.salary.max}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    salary: { ...prev.salary, max: parseInt(e.target.value) || 0 },
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
