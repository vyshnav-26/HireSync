'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ErrorMessage } from '@/components/common/error-message';
import { validateRegisterForm } from '@/lib/validation';
import { ROUTES } from '@/lib/constants';

export function RegisterForm() {
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'candidate' | 'recruiter'>('candidate');
  const [company, setCompany] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setErrors([]);

    const validation = validateRegisterForm(
      name,
      email,
      password,
      userType === 'recruiter' ? company : undefined,
    );
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await register(
        name,
        email,
        password,
        userType,
        userType === 'recruiter' ? company : undefined,
      );
      
      const redirectUrl = userType === 'candidate' 
        ? ROUTES.CANDIDATE_DASHBOARD 
        : ROUTES.RECRUITER_DASHBOARD;
      router.push(redirectUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((err, idx) => (
            <ErrorMessage key={idx} message={err} />
          ))}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-[#111827]">
          Full Name
        </label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-[#111827]">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-[#111827]">
          Password
        </label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="userType" className="text-sm font-medium text-[#111827]">
          I&apos;m a...
        </label>
        <Select
          id="userType"
          value={userType}
          onChange={(e) => setUserType(e.target.value as 'candidate' | 'recruiter')}
          options={[
            { value: 'candidate', label: 'Job Seeker (Candidate)' },
            { value: 'recruiter', label: 'Recruiter' },
          ]}
          disabled={isLoading}
        />
      </div>

      {userType === 'recruiter' && (
        <div className="space-y-2">
          <label htmlFor="company" className="text-sm font-medium text-[#111827]">
            Company Name
          </label>
          <Input
            id="company"
            type="text"
            placeholder="Your Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            disabled={isLoading}
          />
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Sign Up'}
      </Button>
    </form>
  );
}
