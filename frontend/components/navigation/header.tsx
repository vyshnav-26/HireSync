'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push(ROUTES.HOME);
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href={ROUTES.HOME} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F46E5]">
            <span className="text-sm font-bold text-white">AI</span>
          </div>
          <span className="hidden font-semibold text-foreground sm:inline">
            AI Recruiter
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {user?.userType === 'candidate' && (
                <>
                  <Link
                    href={ROUTES.CANDIDATE_DASHBOARD}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={ROUTES.CANDIDATE_JOBS}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Jobs
                  </Link>
                  <Link
                    href={ROUTES.CANDIDATE_APPLICATIONS}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Applications
                  </Link>
                </>
              )}

              {user?.userType === 'recruiter' && (
                <>
                  <Link
                    href={ROUTES.RECRUITER_DASHBOARD}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={ROUTES.RECRUITER_JOBS}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Jobs
                  </Link>
                  <Link
                    href={ROUTES.RECRUITER_CANDIDATES}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Candidates
                  </Link>
                </>
              )}

              <div className="flex items-center gap-2 border-l border-border pl-4">
                <ThemeToggle />
                <span className="text-sm text-muted-foreground">{user?.name}</span>
                <Button onClick={handleLogout} variant="ghost" size="sm">
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link href={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href={ROUTES.REGISTER}>
                <Button size="sm">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
