import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Kanban, ShieldCheck, ArrowRight, CheckCircle2, Search } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card, CardContent } from '../components/common/Card';

export const Home: FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/50 via-white to-slate-50 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 text-primary-800 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <span>Phase 1 Frontend & Backend Architecture Active</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Streamline Hiring with Intelligent <span className="text-primary-600">Applicant Tracking</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            HireSync automates candidate sourcing, AI-driven resume screening, collaborative pipeline management, and candidate engagement—all in one high-performance platform.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/jobs">
              <Button size="lg" leftIcon={<Search className="w-5 h-5" />}>
                Explore Open Positions
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Recruiter Portal
              </Button>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-8 border-t border-slate-200">
            <div>
              <p className="text-3xl font-extrabold text-primary-600">95%</p>
              <p className="text-xs text-slate-500 mt-1">Screening Precision</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900">4x</p>
              <p className="text-xs text-slate-500 mt-1">Faster Time-to-Hire</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-primary-600">&lt; 100ms</p>
              <p className="text-xs text-slate-500 mt-1">API Query Latency</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900">100%</p>
              <p className="text-xs text-slate-500 mt-1">Role-Based Security</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Engineered for Modern Talent Teams
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Built on a layered Spring Boot 3 & React 18 architecture for enterprise scalability and reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-md transition-shadow border-slate-200">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 mb-5">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Gemini AI Resume Screening</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Automated parsing extracts skills, work history, and education. Generates a 0–100% match score against your Job Description instantly.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow border-slate-200">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-5">
                  <Kanban className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Visual Kanban Pipeline</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Drag and drop candidates across stages: Applied, Screening, Interview, Offered, and Hired with real-time audit updates.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow border-slate-200">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-5">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Secure RBAC & Storage</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Strict JWT role-based access control with Redis-backed revocation and encrypted MinIO S3 object storage for candidate resumes.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Value Props Row */}
          <div className="mt-16 bg-slate-50 rounded-2xl p-8 border border-slate-200/80">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Automated Notifications</h4>
                  <p className="text-xs text-slate-500 mt-1">Keep applicants informed at every stage of the evaluation funnel.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Scorecards & Notes</h4>
                  <p className="text-xs text-slate-500 mt-1">Structured 1–5 ratings and interviewer consensus voting.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Analytics & Metrics</h4>
                  <p className="text-xs text-slate-500 mt-1">Live metrics on time-to-hire, funnel conversion, and drop-off rates.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
