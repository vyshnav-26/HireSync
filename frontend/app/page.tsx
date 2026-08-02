import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/lib/constants';
import { Briefcase, Users, Zap, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            AI-Powered Recruitment
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect talented professionals with opportunities. Our AI recruitment platform makes hiring faster, smarter, and more effective.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href={ROUTES.REGISTER}>
              <Button size="lg" className="px-8">
                Get Started
              </Button>
            </Link>
            <Link href={ROUTES.LOGIN}>
              <Button size="lg" variant="outline" className="px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Credentials */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-card border-y border-border">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Demo Credentials</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-muted-foreground">Candidate Account</p>
                  <p className="font-mono bg-muted p-2 rounded text-sm">candidate@demo.com</p>
                  <p className="font-mono bg-muted p-2 rounded text-sm">password</p>
                </div>
                <Link href={ROUTES.LOGIN}>
                  <Button variant="outline" className="w-full">Try as Candidate</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-muted-foreground">Recruiter Account</p>
                  <p className="font-mono bg-muted p-2 rounded text-sm">recruiter@demo.com</p>
                  <p className="font-mono bg-muted p-2 rounded text-sm">password</p>
                </div>
                <Link href={ROUTES.LOGIN}>
                  <Button variant="outline" className="w-full">Try as Recruiter</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Why AI Recruiter?</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="h-12 w-12 bg-[#DBEAFE] rounded-lg flex items-center justify-center">
                    <Zap className="h-6 w-6 text-[#3B82F6]" />
                  </div>
                  <h3 className="font-semibold text-foreground">Lightning Fast</h3>
                  <p className="text-sm text-muted-foreground">Quick job matching powered by AI</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="h-12 w-12 bg-[#FEE2E2] rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-[#EF4444]" />
                  </div>
                  <h3 className="font-semibold text-foreground">Better Talent</h3>
                  <p className="text-sm text-muted-foreground">Connect with qualified candidates</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="h-12 w-12 bg-[#ECFDF5] rounded-lg flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-[#10B981]" />
                  </div>
                  <h3 className="font-semibold text-foreground">Easy to Use</h3>
                  <p className="text-sm text-muted-foreground">Simple and intuitive interface</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="h-12 w-12 bg-[#FEF3C7] rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-[#F59E0B]" />
                  </div>
                  <h3 className="font-semibold text-foreground">Data Driven</h3>
                  <p className="text-sm text-muted-foreground">Insights to improve hiring</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#4F46E5] text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your hiring?</h2>
          <p className="text-lg opacity-90 mb-8">
            Join hundreds of companies and candidates using AI Recruiter
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href={ROUTES.REGISTER}>
              <Button size="lg" variant="outline" className="text-[#4F46E5] border-white hover:bg-card">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border text-center text-muted-foreground">
        <p>&copy; 2024 AI Recruiter. All rights reserved.</p>
      </footer>
    </div>
  );
}
