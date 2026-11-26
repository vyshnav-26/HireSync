import type { FC } from 'react';
import { Briefcase, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const currentYear = new Date().getFullYear();

export const Footer: FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900">
                Hire<span className="text-primary-600">Sync</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-500 max-w-sm">
              Next-generation recruitment automation and Applicant Tracking System powered by AI screening, Kanban pipelines, and modern collaboration tools.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Navigation</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/jobs" className="hover:text-primary-600 transition-colors">Careers</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary-600 transition-colors">Recruiter Portal</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Architecture</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                React 18+ & Vite
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Spring Boot 3 (Java 21)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                PostgreSQL & Redis & MinIO
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {currentYear} HireSync Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for modern hiring teams
          </p>
        </div>
      </div>
    </footer>
  );
};
