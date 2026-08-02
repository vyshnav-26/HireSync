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
    name: candidate.name || '',
    headline: candidate.headline || '',
    bio: candidate.bio || '',
    location: candidate.location || '',
    skills: candidate.skills || [],
    experience: candidate.experience || '',
    email: candidate.email || '',
    resume: candidate.resume || '',
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

          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Full Name
            </label>
            <Input
              id="name"
              placeholder="e.g., Jane Doe"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <label htmlFor="headline" className="text-sm font-medium text-foreground">
              Headline
            </label>
            <Input
              id="headline"
              placeholder="e.g., Full Stack Developer"
              value={formData.headline}
              onChange={(e) => handleInputChange('headline', e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">A brief summary of your current role</p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium text-foreground">
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
            <label className="text-sm font-medium text-foreground">Skills</label>
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
                      className="ml-1 rounded p-0.5 hover:bg-card"
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

          {/* Experience */}
          <div className="space-y-2">
            <label htmlFor="experience" className="text-sm font-medium text-foreground">
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

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="e.g., jane@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Resume */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-foreground">
              Resume
            </label>
            
            <div className="space-y-2">
              <label htmlFor="resume-file" className="text-xs text-muted-foreground">Upload Document (PDF, DOCX)</label>
              <Input
                id="resume-file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  const formData = new FormData();
                  formData.append('file', file);
                  
                  try {
                    const res = await fetch('/api/job-seeker/resume', {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                      },
                      body: formData
                    });
                    
                    if (res.ok) {
                      const uri = await res.text();
                      handleInputChange('resume', uri);
                    } else {
                      setError('Failed to upload resume');
                    }
                  } catch (err) {
                    setError('Error uploading resume');
                  }
                }}
                disabled={isLoading}
              />
            </div>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-muted"></div>
              <span className="mx-4 text-xs text-muted-foreground">OR Provide URL</span>
              <div className="flex-grow border-t border-muted"></div>
            </div>

            <div className="space-y-2">
              <Input
                id="resume-url"
                type="url"
                placeholder="e.g., https://drive.google.com/..."
                value={formData.resume}
                onChange={(e) => handleInputChange('resume', e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">Link to your resume document (auto-filled if uploaded above)</p>
            </div>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
