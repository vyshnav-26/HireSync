import { http, HttpResponse } from 'msw';
import {
  demoCandidate,
  demoRecruiter,
  demoJobs,
  demoApplications,
  demoCandidatesList,
} from './demo-data';
import { Job, Application, Candidate, Recruiter, User } from '@/lib/types';

// In-memory storage
let jobs: Job[] = [...demoJobs];
let applications: Application[] = [...demoApplications];
let candidates: Candidate[] = [demoCandidate, ...demoCandidatesList];
let recruiterData: Recruiter = { ...demoRecruiter };

export const handlers = [
  // ========== AUTH ==========
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as any;

    if (body.email === 'candidate@demo.com' && body.password === 'password') {
      return HttpResponse.json({
        token: 'demo-candidate-token',
        user: demoCandidate,
      });
    }

    if (body.email === 'recruiter@demo.com' && body.password === 'password') {
      return HttpResponse.json({
        token: 'demo-recruiter-token',
        user: demoRecruiter,
      });
    }

    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const body = (await request.json()) as any;

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: body.email,
      name: body.name,
      userType: body.userType,
      createdAt: new Date().toISOString(),
    };

    return HttpResponse.json({
      token: `token-${Date.now()}`,
      user: newUser,
    });
  }),

  // ========== JOBS ==========
  http.get('/api/jobs', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search');
    const location = url.searchParams.get('location');
    const workType = url.searchParams.get('workType');

    let filtered = jobs.filter(j => j.status === 'open');

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        j => j.title.toLowerCase().includes(searchLower) ||
             j.description.toLowerCase().includes(searchLower)
      );
    }

    if (location) {
      filtered = filtered.filter(j => j.location === location);
    }

    if (workType) {
      filtered = filtered.filter(j => j.workType === workType);
    }

    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    const paginatedJobs = filtered.slice(startIdx, endIdx);

    return HttpResponse.json({
      data: paginatedJobs,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    });
  }),

  http.get('/api/jobs/:jobId', ({ params }) => {
    const job = jobs.find(j => j.id === params.jobId);
    if (!job) {
      return HttpResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    return HttpResponse.json(job);
  }),

  // ========== RECRUITER JOBS ==========
  http.get('/api/recruiter/jobs', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');

    let filtered = jobs;

    if (status && status !== 'all') {
      filtered = filtered.filter(j => j.status === status);
    }

    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    const paginatedJobs = filtered.slice(startIdx, endIdx);

    return HttpResponse.json({
      data: paginatedJobs,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    });
  }),

  http.post('/api/recruiter/jobs', async ({ request }) => {
    const body = (await request.json()) as any;

    const newJob: Job = {
      id: `job-${Date.now()}`,
      title: body.title,
      company: body.company,
      description: body.description,
      requirements: body.requirements,
      salary: body.salary,
      location: body.location,
      workType: body.workType,
      status: body.status || 'draft',
      postedDate: new Date().toISOString(),
      createdBy: body.createdBy,
      applicantCount: 0,
    };

    jobs.push(newJob);
    return HttpResponse.json(newJob);
  }),

  http.get('/api/recruiter/jobs/:jobId', ({ params }) => {
    const job = jobs.find(j => j.id === params.jobId);
    if (!job) {
      return HttpResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    return HttpResponse.json(job);
  }),

  http.patch('/api/recruiter/jobs/:jobId', async ({ params, request }) => {
    const body = (await request.json()) as any;
    const jobIdx = jobs.findIndex(j => j.id === params.jobId);

    if (jobIdx === -1) {
      return HttpResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    jobs[jobIdx] = { ...jobs[jobIdx], ...body };
    return HttpResponse.json(jobs[jobIdx]);
  }),

  http.delete('/api/recruiter/jobs/:jobId', ({ params }) => {
    jobs = jobs.filter(j => j.id !== params.jobId);
    return HttpResponse.json({ success: true });
  }),

  // ========== CANDIDATE APPLICATIONS ==========
  http.get('/api/candidate/applications', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');

    let filtered = applications;

    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }

    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    const paginatedApps = filtered.slice(startIdx, endIdx).map(app => ({
      ...app,
      job: jobs.find(j => j.id === app.jobId)!,
    }));

    return HttpResponse.json({
      data: paginatedApps,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    });
  }),

  http.post('/api/candidate/applications', async ({ request }) => {
    const body = (await request.json()) as any;

    const newApp: Application = {
      id: `app-${Date.now()}`,
      jobId: body.jobId,
      candidateId: 'candidate-1',
      status: 'applied',
      appliedDate: new Date().toISOString(),
      coverLetter: body.coverLetter,
    };

    applications.push(newApp);
    return HttpResponse.json(newApp);
  }),

  // ========== RECRUITER APPLICATIONS ==========
  http.get('/api/recruiter/applications', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '100');

    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    const paginatedApps = applications.slice(startIdx, endIdx);

    return HttpResponse.json({
      data: paginatedApps,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: applications.length,
        totalPages: Math.ceil(applications.length / limit),
      },
    });
  }),

  http.get('/api/recruiter/jobs/:jobId/applications', ({ params, request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');

    const jobApps = applications
      .filter(a => a.jobId === params.jobId)
      .slice(0, limit)
      .map(app => ({
        ...app,
        candidate: candidates.find(c => c.id === app.candidateId) || demoCandidate,
      }));

    return HttpResponse.json({
      data: jobApps,
      pagination: {
        currentPage: 1,
        pageSize: limit,
        totalItems: jobApps.length,
        totalPages: 1,
      },
    });
  }),

  http.get('/api/recruiter/applications/:appId', ({ params }) => {
    const app = applications.find(a => a.id === params.appId);
    if (!app) {
      return HttpResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return HttpResponse.json({
      ...app,
      job: jobs.find(j => j.id === app.jobId)!,
      candidate: candidates.find(c => c.id === app.candidateId) || demoCandidate,
    });
  }),

  http.patch('/api/recruiter/applications/:appId', async ({ params, request }) => {
    const body = (await request.json()) as any;
    const appIdx = applications.findIndex(a => a.id === params.appId);

    if (appIdx === -1) {
      return HttpResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    applications[appIdx] = { ...applications[appIdx], ...body };
    return HttpResponse.json(applications[appIdx]);
  }),

  // ========== CANDIDATE PROFILE ==========
  http.get('/api/candidate/profile', () => {
    return HttpResponse.json(demoCandidate);
  }),

  http.patch('/api/candidate/profile', async ({ request }) => {
    const body = (await request.json()) as any;
    const updated = { ...demoCandidate, ...body };
    return HttpResponse.json(updated);
  }),

  // ========== RECRUITER PROFILE ==========
  http.get('/api/recruiter/profile', () => {
    return HttpResponse.json(recruiterData);
  }),

  http.patch('/api/recruiter/profile', async ({ request }) => {
    const body = (await request.json()) as any;
    recruiterData = { ...recruiterData, ...body };
    return HttpResponse.json(recruiterData);
  }),

  // ========== RECRUITER CANDIDATES ==========
  http.get('/api/recruiter/candidates', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search');

    let filtered = candidates;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        c => c.name.toLowerCase().includes(searchLower) ||
             c.skills?.some(s => s.toLowerCase().includes(searchLower))
      );
    }

    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    const paginatedCandidates = filtered.slice(startIdx, endIdx);

    return HttpResponse.json({
      data: paginatedCandidates,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    });
  }),
];
