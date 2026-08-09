import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';
import { ROUTES } from '@/lib/constants';
import { Logo } from '@/components/common/logo';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex justify-center">
        <Logo size="lg" />
      </div>

      <div className="w-full max-w-md">
        <Card className="shadow-lg border border-border/80">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Sign in to your HireSync AI account</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href={ROUTES.REGISTER} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                  Sign up here
                </Link>
              </p>
            </div>

            {/* Demo Credentials Hint */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Demo Accounts:</p>
              <div className="space-y-1 text-xs font-mono bg-muted/60 p-2.5 rounded-sm border border-border/60">
                <p><span className="text-muted-foreground">Recruiter:</span> recruiter@demo.com / password</p>
                <p><span className="text-muted-foreground">Candidate:</span> candidate@demo.com / password</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
