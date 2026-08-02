'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ProfileForm } from '@/components/candidate/profile-form';
import { apiGet, apiPatch } from '@/lib/api-client';
import { Candidate } from '@/lib/types';
import { Mail, MapPin, Briefcase } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiGet<Candidate>('/api/candidate/profile');
        setCandidate(response);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (data: Partial<Candidate>) => {
    setIsSaving(true);
    try {
      const response = await apiPatch<Candidate>('/api/candidate/profile', data);
      setCandidate(response);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedUserTypes={['candidate']}>
        <div className="min-h-screen bg-[#F9FAFB] py-8">
          <LoadingSpinner />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedUserTypes={['candidate']}>
      <div className="min-h-screen bg-[#F9FAFB] py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Profile Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Name and Headline */}
                <div>
                  <h2 className="text-3xl font-bold text-[#111827]">{candidate?.name}</h2>
                  {candidate?.headline && (
                    <p className="text-lg text-[#4F46E5] mt-1">{candidate.headline}</p>
                  )}
                </div>

                {/* Contact Info */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-[#4F46E5] mt-0.5" />
                    <div>
                      <p className="text-xs text-[#6B7280] uppercase">Email</p>
                      <p className="text-sm text-[#111827]">{candidate?.email}</p>
                    </div>
                  </div>

                  {candidate?.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-[#4F46E5] mt-0.5" />
                      <div>
                        <p className="text-xs text-[#6B7280] uppercase">Location</p>
                        <p className="text-sm text-[#111827]">{candidate.location}</p>
                      </div>
                    </div>
                  )}

                  {candidate?.experience && (
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-[#4F46E5] mt-0.5" />
                      <div>
                        <p className="text-xs text-[#6B7280] uppercase">Experience</p>
                        <p className="text-sm text-[#111827]">{candidate.experience}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {candidate?.bio && (
                  <div>
                    <p className="text-xs text-[#6B7280] uppercase font-medium mb-2">About</p>
                    <p className="text-[#6B7280]">{candidate.bio}</p>
                  </div>
                )}

                {/* Skills */}
                {candidate?.skills && candidate.skills.length > 0 && (
                  <div>
                    <p className="text-xs text-[#6B7280] uppercase font-medium mb-3">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-block rounded-full bg-[#DBEAFE] px-3 py-1 text-sm text-[#3B82F6]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Edit Form */}
          {candidate && (
            <ProfileForm
              candidate={candidate}
              onSubmit={handleUpdateProfile}
              isLoading={isSaving}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
