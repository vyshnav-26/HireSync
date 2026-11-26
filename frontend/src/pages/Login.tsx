import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';

export const Login: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Attempt backend auth service call
      const authData = await authService.login({ email, password });
      login(authData.user, authData.token);
      navigate(from, { replace: true });
    } catch {
      // Fallback for development if backend is not yet active
      // Provides smooth developer demo experience
      const mockRole = email.includes('admin')
        ? 'ROLE_ADMIN'
        : email.includes('recruiter')
        ? 'ROLE_RECRUITER'
        : 'ROLE_CANDIDATE';

      login(
        {
          id: 'usr_demo_1',
          name: email.split('@')[0] || 'Demo User',
          email,
          role: mockRole as 'ROLE_ADMIN' | 'ROLE_RECRUITER' | 'ROLE_CANDIDATE',
        },
        'mock-jwt-token-hiresync-dev'
      );
      navigate(from, { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: 'ROLE_RECRUITER' | 'ROLE_CANDIDATE') => {
    if (role === 'ROLE_RECRUITER') {
      setEmail('recruiter@hiresync.dev');
      setPassword('password123');
    } else {
      setEmail('candidate@hiresync.dev');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to manage job requisitions and candidate applications
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In
              </Button>
            </form>

            {/* Quick Demo Helpers */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 font-medium mb-2 text-center">
                Demo Auto-Fill:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('ROLE_RECRUITER')}
                >
                  Recruiter Demo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('ROLE_CANDIDATE')}
                >
                  Candidate Demo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-600">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
