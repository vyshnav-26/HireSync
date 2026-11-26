import { useState } from 'react';
import type { FC } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Briefcase, Users, CheckCircle, Sparkles, Plus, Clock, ExternalLink } from 'lucide-react';
import type { Application } from '../types';

const SAMPLE_APPLICATIONS: Application[] = [
  {
    id: 'app-001',
    jobId: 'job-101',
    candidateId: 'cand-01',
    candidateName: 'Sarah Jenkins',
    candidateEmail: 'sarah.j@example.com',
    jobTitle: 'Senior Full Stack Engineer',
    stage: 'INTERVIEW',
    matchScore: 94,
    appliedDate: '2026-11-25',
  },
  {
    id: 'app-002',
    jobId: 'job-102',
    candidateId: 'cand-02',
    candidateName: 'David Chen',
    candidateEmail: 'david.c@example.com',
    jobTitle: 'AI / LLM Systems Engineer',
    stage: 'SCREENING',
    matchScore: 88,
    appliedDate: '2026-11-26',
  },
  {
    id: 'app-003',
    jobId: 'job-103',
    candidateId: 'cand-03',
    candidateName: 'Elena Rostova',
    candidateEmail: 'elena.r@example.com',
    jobTitle: 'Lead Product Designer',
    stage: 'OFFERED',
    matchScore: 91,
    appliedDate: '2026-11-21',
  },
  {
    id: 'app-004',
    jobId: 'job-101',
    candidateId: 'cand-04',
    candidateName: 'Marcus Vance',
    candidateEmail: 'marcus.v@example.com',
    jobTitle: 'Senior Full Stack Engineer',
    stage: 'APPLIED',
    matchScore: 78,
    appliedDate: '2026-11-26',
  },
];

export const Dashboard: FC = () => {
  const { user, isRecruiter } = useAuth();
  const [filterStage, setFilterStage] = useState<string>('ALL');

  const filteredApps = SAMPLE_APPLICATIONS.filter((app) =>
    filterStage === 'ALL' ? true : app.stage === filterStage
  );

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'APPLIED':
        return 'bg-blue-100 text-blue-800';
      case 'SCREENING':
        return 'bg-purple-100 text-purple-800';
      case 'INTERVIEW':
        return 'bg-amber-100 text-amber-800';
      case 'OFFERED':
        return 'bg-emerald-100 text-emerald-800';
      case 'HIRED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Recruiter Dashboard</h1>
          <p className="mt-1 text-slate-500">
            Welcome back, <strong className="text-slate-800">{user?.name || user?.email}</strong> (
            {user?.role?.replace('ROLE_', '')})
          </p>
        </div>

        {isRecruiter && (
          <Button leftIcon={<Plus className="w-4 h-4" />}>Create Job Requisition</Button>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Active Requisitions
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">4</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Applicants
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">38</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                In Interviews
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">8</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Offers Extended
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">3</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Pipeline Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Recent Candidate Pipeline</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Parsed resumes and semantic fit scores generated by Google Gemini AI
            </p>
          </div>

          <div className="flex gap-2">
            {['ALL', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFERED'].map((stage) => (
              <button
                key={stage}
                onClick={() => setFilterStage(stage)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  filterStage === stage
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Candidate</th>
                <th className="px-6 py-3.5 font-semibold">Job Title</th>
                <th className="px-6 py-3.5 font-semibold">Stage</th>
                <th className="px-6 py-3.5 font-semibold">AI Fit Score</th>
                <th className="px-6 py-3.5 font-semibold">Applied</th>
                <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{app.candidateName}</p>
                    <p className="text-xs text-slate-400">{app.candidateEmail}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{app.jobTitle}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStageColor(
                        app.stage
                      )}`}
                    >
                      {app.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {app.matchScore ? (
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-primary-500" />
                        <span className="font-bold text-slate-800">{app.matchScore}%</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">Processing...</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">{app.appliedDate}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
