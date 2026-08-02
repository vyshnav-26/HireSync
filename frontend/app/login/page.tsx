import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';
import { ROUTES } from '@/lib/constants';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to your AI Recruiter account</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href={ROUTES.REGISTER} className="font-medium text-[#4F46E5] hover:text-[#4338CA]">
                  Sign up here
                </Link>
              </p>
            </div>

            {/* Demo Credentials Hint */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs font-mono bg-muted p-2 rounded">
                <p>candidate@demo.com / password</p>
                <p>recruiter@demo.com / password</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
