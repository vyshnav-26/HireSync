'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ErrorMessage } from '@/components/common/error-message';
import { apiGet, apiPatch } from '@/lib/api-client';
import { Recruiter } from '@/lib/types';
import { Building2, Mail, User } from 'lucide-react';
import { FormEvent } from 'react';

export default function RecruiterProfilePage() {
  const { user } = useAuth();
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    position: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiGet<Recruiter>('/api/recruiter/profile');
        setRecruiter(response);
        setFormData({
          name: response.name,
          position: response.position || '',
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const response = await apiPatch<Recruiter>('/api/recruiter/profile', {
        name: formData.name,
        position: formData.position,
      });
      setRecruiter(response);
      setIsEditing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save profile';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedUserTypes={['recruiter']}>
        <div className="min-h-screen bg-[#F9FAFB] py-8">
          <LoadingSpinner />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedUserTypes={['recruiter']}>
      <div className="min-h-screen bg-[#F9FAFB] py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Profile Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <h2 className="text-3xl font-bold text-[#111827]">{recruiter?.name}</h2>
                  {recruiter?.position && (
                    <p className="text-lg text-[#4F46E5] mt-1">{recruiter.position}</p>
                  )}
                </div>

                {/* Company and Contact */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-[#4F46E5] mt-0.5" />
                    <div>
                      <p className="text-xs text-[#6B7280] uppercase">Company</p>
                      <p className="text-sm text-[#111827]">{recruiter?.company}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-[#4F46E5] mt-0.5" />
                    <div>
                      <p className="text-xs text-[#6B7280] uppercase">Email</p>
                      <p className="text-sm text-[#111827]">{recruiter?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Form */}
          {isEditing && recruiter && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-[#111827]">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        name: e.target.value,
                      }))}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="position" className="text-sm font-medium text-[#111827]">
                      Position
                    </label>
                    <Input
                      id="position"
                      placeholder="e.g., Recruitment Manager"
                      value={formData.position}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        position: e.target.value,
                      }))}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
