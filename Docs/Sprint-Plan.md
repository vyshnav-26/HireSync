# HireSync — Full Project Sprint Plan

> **Start:** Nov 27, 2026 → **End:** Mar 4, 2027  
> **Exam Break:** Dec 1 – Dec 10 (no work)  
> **Active Development:** 4 pre-exam days + 12 full weeks  
> **Scope:** Phase 2 (Core ATS) + Phase 3 (Advanced Features & Enterprise)

---

## Timeline Overview

| When | Module | Milestone | Deliverable |
|------|--------|-----------|-------------|
| **Nov 27–30** (4 days) | 🔑 Auth & RBAC (Head Start) | 2.1 | Backend auth APIs ready before exams |
| **Dec 1–10** | 📚 **EXAM BREAK** | — | — |
| **Week 1** · Dec 11–17 | 🔑 Auth & RBAC (Complete) | 2.1 | Login, registration, JWT, roles — end-to-end |
| **Week 2** · Dec 18–24 | 📋 Job Management & Career Portal | 2.2 | Career portal + recruiter job dashboard |
| **Week 3** · Dec 25–31 | 📄 Candidate Applications & Resume Upload | 2.3 | Resume upload to MinIO + candidate dashboard |
| **Week 4** · Jan 1–7 | 🤖 Gemini AI Resume Screening | 2.4 | Auto resume parsing + fit scoring pipeline |
| **Week 5** · Jan 8–14 | 🗂️ Recruiter Pipeline & Kanban Board | 2.5 | Drag-and-drop hiring pipeline board |
| **Week 6** · Jan 15–21 | 📧 Automated Email Notifications | 2.6 | Event-driven email triggers |
| **Week 7** · Jan 22–28 | 🛡️ Phase 2 Stabilization | — | Integration testing, bug fixes, API docs |
| **Week 8** · Jan 29–Feb 4 | 🧠 Custom AI Model | 3.1 | Self-hosted LLM + benchmarking vs Gemini |
| **Week 9** · Feb 5–11 | 📅 Interview Scheduling & Calendar | 3.2 | Calendar integration + candidate self-booking |
| **Week 10** · Feb 12–18 | 📊 Analytics & Metrics Dashboard | 3.3 | Hiring metrics, charts, report exports |
| **Week 11** · Feb 19–25 | 🔒 Enterprise Hardening & Compliance | 3.4 | Security, test coverage, production builds |
| **Week 12** · Feb 26–Mar 4 | 🚀 Final QA & Release | — | End-to-end QA, deployment |

---

## Detailed Module Breakdown

### Pre-Exam Sprint · Nov 27 – Nov 30 (4 days)
**Module:** 🔑 Auth & RBAC — Head Start (Milestone 2.1)

- User entity with role enum (`ADMIN`, `RECRUITER`, `CANDIDATE`)
- `UserRepository` with Spring Data JPA
- Registration endpoint (`POST /api/auth/register`) with BCrypt hashing
- Login endpoint (`POST /api/auth/login`) returning JWT access + refresh tokens
- `JwtService` for token generation and validation
- Redis-backed token blocklist for logout/revocation

**Goal:** All backend auth code merged before exams start.

---

### Week 1 · Dec 11 – Dec 17
**Module:** 🔑 Auth & RBAC — Complete (Milestone 2.1)

- Spring Security `JwtAuthenticationFilter` and filter chain configuration
- RBAC endpoint restrictions with `@PreAuthorize`
- Refresh token rotation endpoint (`POST /api/auth/refresh`)
- Logout endpoint (`POST /api/auth/logout`)
- Frontend Login & Register pages with form validation
- `authStore` (Zustand) session management — token storage, user state, role
- `ProtectedRoute` and `PublicOnlyRoute` guards wired to real auth
- Navbar updates — user info display, logout button

**Deliverable:** Users can register, log in, and access role-restricted pages.

---

### Week 2 · Dec 18 – Dec 24
**Module:** 📋 Job Management & Career Portal (Milestone 2.2)

- Job entity with lifecycle states (`DRAFT`, `PUBLISHED`, `CLOSED`, `ARCHIVED`)
- Fields: title, department, location, employment type, description, requirements, salary range, status, createdBy
- `JobRepository` with custom query methods
- Job CRUD endpoints — create, read, update, delete (recruiter/admin only)
- Status transition endpoint (`PATCH /api/jobs/{id}/status`)
- Public job listing API (`GET /api/public/jobs`) — paginated, filterable by keyword, department, type
- Public Career Portal page — search bar, filters, responsive job cards grid, pagination
- Job Detail view (`/jobs/:id`) — full description, requirements, salary, "Apply Now" CTA
- Recruiter Job Management dashboard — job table, status badges, create/edit form, publish/close/archive actions

**Deliverable:** Recruiters manage jobs, candidates browse and search the career portal.

---

### Week 3 · Dec 25 – Dec 31
**Module:** 📄 Candidate Applications & Resume Upload (Milestone 2.3)

- Application entity with status enum (`APPLIED`, `SCREENING`, `INTERVIEW`, `OFFERED`, `HIRED`, `REJECTED`)
- Fields: candidateId, jobId, status, coverNote, resumeKey (S3 reference), matchScore, aiAnalysis
- `ApplicationRepository`
- Multipart resume upload endpoint (`POST /api/applications/{jobId}/apply`)
  - File type validation (PDF/DOCX only)
  - File size validation (max 5MB)
  - Upload to MinIO `resumes` bucket
- Pre-signed resume download URL endpoint (`GET /api/applications/{id}/resume`)
- Candidate application form UI — drag-and-drop file upload, cover note, progress indicator
- Candidate Dashboard — list of applied jobs, status badges, submission dates

**Deliverable:** Candidates apply to jobs with resume upload and track their application status.

---

### Week 4 · Jan 1 – Jan 7
**Module:** 🤖 Gemini AI Resume Screening (Milestone 2.4)

- Apache Tika / PDFBox dependency for text extraction
- `ResumeTextExtractor` service — extracts plain text from PDF/DOCX files in MinIO
- `GeminiAiService` — Gemini API integration with secure API key configuration
- Structured resume parsing prompt → JSON output:
  - Contact details, skills taxonomy, work history, education
- AI fit scoring & gap analysis prompt:
  - Semantic comparison: parsed resume vs job description
  - 0–100% match score
  - Matched qualifications, missing requirements, suggested interview questions
- Store AI analysis and match score on Application entity
- Async screening pipeline (Spring Events / `@Async`):
  - On application submission → extract text → parse resume → score → update Application
  - Application status transitions to `SCREENING` during processing

**Deliverable:** Every submitted resume is automatically parsed and scored against the job description.

---

### Week 5 · Jan 8 – Jan 14
**Module:** 🗂️ Recruiter Pipeline & Kanban Board (Milestone 2.5)

- Application listing API (`GET /api/jobs/{jobId}/applications`) — paginated, filterable by status
- Status transition endpoint (`PATCH /api/applications/{id}/status`) with stage validation
- Recruiter notes endpoint (`POST /api/applications/{id}/notes`)
- Structured scorecard ratings (1–5 scale per criteria)
- Recruiter Application Review view:
  - Applicant list with match score, status, resume download link
  - Expandable detail: AI analysis summary, gap analysis, recruiter notes form
  - Status transition dropdown
- Interactive Kanban Board:
  - Columns: `APPLIED` → `SCREENING` → `INTERVIEW` → `OFFERED` → `HIRED` / `REJECTED`
  - Candidate cards with name, match score, applied date
  - Drag-and-drop status transitions with audit updates

**Deliverable:** Recruiters manage candidates through the full hiring pipeline visually.

---

### Week 6 · Jan 15 – Jan 21
**Module:** 📧 Automated Email Notifications (Milestone 2.6)

- Asynchronous event-driven notification service (Spring Events + JavaMailSender)
- HTML email templates (Thymeleaf)
- Automated email triggers:
  - Application submission confirmation → candidate
  - New candidate alert → assigned recruiter
  - Status change notification → candidate (e.g., moved to interview, rejected)
  - Interview invitation → candidate
- SMTP configuration (env-based, supports Gmail / SendGrid / Mailgun)

**Deliverable:** Candidates and recruiters receive timely, well-formatted email notifications.

---

### Week 7 · Jan 22 – Jan 28
**🛡️ Phase 2 Stabilization**

- Integration testing across all 6 modules
- Edge case handling and error scenarios
- API documentation (Swagger / SpringDoc OpenAPI)
- Code review, refactoring, and cleanup
- UI/UX polish and responsive design fixes
- Performance baseline measurements

**Deliverable:** Phase 2 is solid, tested, documented, and demo-ready.

---

### Week 8 · Jan 29 – Feb 4
**Module:** 🧠 Custom AI Model (Milestone 3.1)

- Architecture design for self-hosted model
- Containerized inference runtime setup (Ollama / vLLM / ONNX Runtime)
- Select and configure open-source LLM for resume parsing
- Build AI provider abstraction layer (interface to swap Gemini ↔ local model)
- Hybrid routing strategy (local model for bulk filtering, Gemini for complex analysis)
- Benchmark: parsing accuracy, latency per resume, compute cost vs API billing
- Production toggle configuration (env-based provider selection)

**Deliverable:** System can run with either Gemini API or self-hosted model, with benchmarked performance data.

---

### Week 9 · Feb 5 – Feb 11
**Module:** 📅 Interview Scheduling & Calendar Integration (Milestone 3.2)

- Interview entity (date, time, duration, interviewers, meeting link, status)
- Interview scheduling module — recruiter creates interview slots
- Candidate self-service time slot selection
- Google Calendar / Outlook API webhook integration
- Multi-interviewer feedback aggregation
- Unanimous voting / recommendation engine
- Frontend scheduling UI for recruiters and slot picker for candidates

**Deliverable:** Interviews can be scheduled with calendar sync and candidate self-booking.

---

### Week 10 · Feb 12 – Feb 18
**Module:** 📊 Analytics & Recruiter Metrics Dashboard (Milestone 3.3)

- Metrics calculation service:
  - Time-to-hire (days from application to offer)
  - Pipeline funnel conversion rates (stage drop-off analytics)
  - Sourcing channel effectiveness
  - Job requisition fulfillment status
- Interactive chart components (Recharts)
- Recruiter metrics dashboard page
- Report export functionality (CSV / PDF summary downloads)

**Deliverable:** Recruitment leads have actionable analytics on hiring velocity and pipeline health.

---

### Week 11 · Feb 19 – Feb 25
**Module:** 🔒 Enterprise Hardening, Performance & Compliance (Milestone 3.4)

- End-to-end audit logging for candidate PII data access (GDPR compliance)
- Redis caching optimizations for high-throughput public job listings
- API rate limiting on public application and AI endpoints (Redis Token Bucket)
- Comprehensive test coverage:
  - Backend: JUnit 5, Mockito, Testcontainers
  - Frontend: Vitest, React Testing Library
- Production-ready Docker builds (multi-stage Dockerfiles)

**Deliverable:** Production-grade security, performance, test coverage, and deployment pipeline.

---

### Week 12 · Feb 26 – Mar 4
**🚀 Final QA & Release**

- End-to-end testing across all features
- Security audit
- Load testing
- Final documentation updates
- Deployment guide
- Demo and release preparation

**Deliverable:** HireSync is fully complete and production-ready.

---

## Summary

| Phase | Modules | Weeks | Dates |
|-------|---------|-------|-------|
| 🏗️ Pre-exam head start | Auth backend | 4 days | Nov 27 – Nov 30 |
| 📚 Exam break | — | — | Dec 1 – Dec 10 |
| 🚀 **Phase 2** (Core ATS) | 6 milestones | Weeks 1–6 | Dec 11 – Jan 21 |
| 🛡️ Phase 2 buffer | Stabilization | Week 7 | Jan 22 – Jan 28 |
| ⚡ **Phase 3** (Advanced) | 4 milestones | Weeks 8–11 | Jan 29 – Feb 25 |
| 🎯 Final QA & Release | — | Week 12 | Feb 26 – Mar 4 |

**10 modules · 10 dev weeks · 2 buffer weeks · Done by Mar 4, 2027**

---

> **Note:** This plan is flexible. Modules can be reordered or adjusted as we go based on progress and priorities.
