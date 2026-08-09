import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RegisterForm } from '@/components/auth/register-form';
import { ROUTES } from '@/lib/constants';
import { Logo } from '@/components/common/logo';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex justify-center">
        <Logo size="lg" />
      </div>

      <div className="w-full max-w-md">
        <Card className="shadow-lg border border-border/80">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>Join the HireSync AI Hiring Platform</CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <Link href={ROUTES.LOGIN} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
