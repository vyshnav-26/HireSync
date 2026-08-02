'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ProfileForm } from '@/components/candidate/profile-form';
import { apiGet, apiPatch } from '@/lib/api-client';
import { Candidate } from '@/lib/types';
import { Mail, MapPin, Briefcase, Sparkles, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user } = useAuth();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiGet<Candidate>('/api/job-seeker/profile');
        setCandidate(response);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // If profile doesn't exist yet, initialize with user auth info
        if (user) {
          setCandidate({
            id: user.id || '',
            email: user.email || '',
            name: user.name || '',
            userType: 'candidate',
            headline: '',
            bio: '',
            location: '',
            skills: [],
            experience: '',
            resume: ''
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleUpdateProfile = async (data: Partial<Candidate>) => {
    setIsSaving(true);
    try {
      const response = await apiPatch<Candidate>('/api/job-seeker/profile', data);
      setCandidate(response);
    } catch (error) {
       console.error("Error updating profile", error);
       throw error;
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedUserTypes={['candidate']}>
        <div className="min-h-screen bg-background py-8">
          <LoadingSpinner />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedUserTypes={['candidate']}>
      <div className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Profile Overview */}
          <Card className="mb-8 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Name and Headline */}
                <div>
                  <h2 className="text-3xl font-bold text-foreground">{candidate?.name || user?.name}</h2>
                  {candidate?.headline && (
                    <p className="text-lg text-primary mt-1">{candidate.headline}</p>
                  )}
                </div>

                {/* Contact Info */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Email</p>
                      <p className="text-sm text-foreground">{candidate?.email || user?.email}</p>
                    </div>
                  </div>

                  {candidate?.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Location</p>
                        <p className="text-sm text-foreground">{candidate.location}</p>
                      </div>
                    </div>
                  )}

                  {candidate?.experience && (
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Experience</p>
                        <p className="text-sm text-foreground">{candidate.experience}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {candidate?.bio && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium mb-2">About</p>
                    <p className="text-muted-foreground">{candidate.bio}</p>
                  </div>
                )}

                {/* Skills */}
                {candidate?.skills && candidate.skills.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium mb-3">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
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

          {/* AI Resume Insights */}
          {candidate?.resume && (
            <Card className="mb-8 border-primary/20 bg-primary/5 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  AI Resume Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Based on your resume, our AI has generated the following insights to help you stand out.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg bg-background p-4 border border-border shadow-sm">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Strengths
                      </h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li>Strong experience in your stated roles</li>
                        <li>Clear progression of responsibilities</li>
                        <li>Good balance of technical and soft skills</li>
                      </ul>
                    </div>
                    <div className="rounded-lg bg-background p-4 border border-border shadow-sm">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        Recommendations
                      </h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li>Quantify more of your achievements</li>
                        <li>Highlight recent projects prominently</li>
                        <li>Ensure keywords match your target roles</li>
                      </ul>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-between items-center">
                    <a 
                      href={candidate.resume} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      <FileText className="h-4 w-4" />
                      View uploaded resume
                    </a>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => alert("AI is analyzing your resume... (Mock)")}>
                      <Sparkles className="h-4 w-4" />
                      Refresh Insights
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
