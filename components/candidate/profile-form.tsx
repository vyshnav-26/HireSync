'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ErrorMessage } from '@/components/common/error-message';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Candidate } from '@/lib/types';

interface ProfileFormProps {
  candidate: Candidate;
  onSubmit: (data: Partial<Candidate>) => Promise<void>;
  isLoading?: boolean;
}

export function ProfileForm({ candidate, onSubmit, isLoading = false }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    headline: candidate.headline || '',
    bio: candidate.bio || '',
    location: candidate.location || '',
    skills: candidate.skills || [],
    experience: candidate.experience || '',
  });

  const [newSkill, setNewSkill] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.headline.trim()) {
      setError('Please enter a headline');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your profile information to improve your chances</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

          {/* Headline */}
          <div className="space-y-2">
            <label htmlFor="headline" className="text-sm font-medium text-[#111827]">
              Headline
            </label>
            <Input
              id="headline"
              placeholder="e.g., Full Stack Developer"
              value={formData.headline}
              onChange={(e) => handleInputChange('headline', e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-[#6B7280]">A brief summary of your current role</p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium text-[#111827]">
              About You
            </label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself, your experience, and interests"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              disabled={isLoading}
              className="min-h-32"
            />
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#111827]">Skills</label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill (e.g., React)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                disabled={isLoading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSkill}
                disabled={isLoading || !newSkill.trim()}
              >
                Add
              </Button>
            </div>

            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="pr-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1 rounded p-0.5 hover:bg-white"
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium text-[#111827]">
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

          {/* Experience */}
          <div className="space-y-2">
            <label htmlFor="experience" className="text-sm font-medium text-[#111827]">
              Years of Experience
            </label>
            <Input
              id="experience"
              placeholder="e.g., 3 years"
              value={formData.experience}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
