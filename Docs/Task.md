# HireSync — Project Roadmap & Task Execution Matrix

> Centralized tracking document defining project architecture, delivery phases, checkbox-based milestone trackers, epic-level user stories, and execution backlog.

---

## 1. Project Overview & System Architecture

**HireSync** is an end-to-end Applicant Tracking System (ATS) and recruitment automation platform designed to streamline hiring workflows—from job requisition and candidate application to AI-driven resume screening, collaborative pipeline evaluations, and automated candidate communications.

### Tech Stack Overview

| Layer | Technologies | Key Responsibilities |
| :--- | :--- | :--- |
| **Frontend** | React 18+, TypeScript, Vite, Tailwind CSS, React Router DOM, Axios, Lucide React | Modern, responsive recruiter dashboard, public career portal, and candidate management interface |
| **Backend** | Java 21, Spring Boot 3.x (Maven), Spring Web, Spring Data JPA, Spring Security | Clean layered REST API (`controller`, `service`, `repository`, `model`, `config`, `security`), business logic, security |
| **Database** | PostgreSQL 16 | Relational persistence for users, jobs, candidates, applications, feedback, and audit events |
| **Cache & Session** | Redis 7 (Alpine) | Session storage, token invalidation/blocklist, high-frequency query caching, rate limiting |
| **Object Storage** | MinIO (S3-compatible) / AWS S3 | Secure storage for resumes, candidate portfolios, and application attachments |
| **AI / Intelligence** | **Phase 2:** Google Gemini API<br>**Phase 3:** Self-hosted / fine-tuned open-source LLM & embeddings | Resume parsing, candidate-job description semantic matching, fit scoring, screening summaries |
| **DevOps & CI/CD** | Docker Compose, GitHub Actions | Multi-container local development orchestration, automated test verification, and frontend build checks |

---

## 2. Phase Breakdown & Milestone Trackers

### Phase 1: Foundation & Local Infrastructure
> **Objective:** Establish core developer tooling, containerized infrastructure, backend architecture, frontend foundation, and automated CI workflows. Aligned with GitHub Issues #1 through #7.

#### Milestone 1.1: Project Setup & Repository Standards
- [x] **[Issue #1]** Initialize `Docs/Task.md` with complete roadmap, milestones, and user stories
- [x] **[Issue #6]** Create `CONTRIBUTING.md` outlining branching strategy (`feature/*`, `bugfix/*`, `hotfix/*`), Conventional Commits, code standards, and PR templates
- [x] **[Issue #7]** Create comprehensive `README.md` with architecture diagrams, prerequisites, quick-start guide, and build badges

#### Milestone 1.2: Containerized Local Environment & CI/CD
- [x] **[Issue #4]** Create root `docker-compose.yml` orchestrating:
  - [x] PostgreSQL 16 with persistent named volumes and health check
  - [x] Redis 7 (Alpine) with persistent storage and ping health check
  - [x] MinIO with default buckets (`resumes`, `attachments`) and access console
  - [x] Spring Boot backend service container definition
- [x] **[Issue #4]** Create `.env.example` with documented environment variable keys for all services
- [x] **[Issue #5]** Configure GitHub Actions CI (`.github/workflows/ci.yml`):
  - [x] Backend verification job (JDK 21, `mvn clean verify`)
  - [x] Frontend verification job (Node 20, `npm ci && npm run build`)
  - [x] Branch protection rules and status badge setup

#### Milestone 1.3: Backend Spring Boot Scaffold (`/backend`)
- [x] **[Issue #2]** Initialize Spring Boot project (Java 21, Maven) under `/backend`
- [x] **[Issue #2]** Implement clean layered package structure:
  - `com.hiresync.controller`
  - `com.hiresync.service`
  - `com.hiresync.repository`
  - `com.hiresync.model`
  - `com.hiresync.config`
  - `com.hiresync.security`
- [x] Configure `application.yml` and `application-dev.yml` targeting Docker Compose services
- [x] Configure Spring Data JPA / Hibernate connection pooling with PostgreSQL
- [x] Configure Spring Data Redis connection and cache manager
- [x] Configure MinIO / S3 SDK client bean with credentials from environment
- [x] Establish base Spring Security configuration (JWT token generation, validation, and filter chain)
- [x] Add global exception handling (`@ControllerAdvice`) and standardized API response envelope (`ApiResponse<T>`)

#### Milestone 1.4: Frontend React + Vite Scaffold (`/frontend`)
- [x] **[Issue #3]** Initialize React 18+ with TypeScript using Vite under `/frontend`
- [x] **[Issue #3]** Set up and configure Tailwind CSS and theme tokens
- [x] **[Issue #3]** Establish frontend directory architecture:
  - `src/components` (reusable UI atoms/molecules: buttons, inputs, modals, cards)
  - `src/pages` (route views: Home, Login, Register, Dashboard, Jobs)
  - `src/services` (Axios API client with interceptors for JWT injection)
  - `src/hooks` (custom business and state hooks)
  - `src/types` (TypeScript domain models and API contracts)
  - `src/store` (global client-side state management)
- [x] Set up React Router DOM with public vs. protected route guards
- [x] Integrate Lucide React icon library

---

### Phase 2: Core ATS Features & Gemini AI Integration
> **Objective:** Deliver functional recruitment workflows—job requisition, candidate applications, document ingestion, Gemini-powered resume screening, and recruiter Kanban pipeline management.

#### Milestone 2.1: Authentication & Role-Based Access Control (RBAC)
- [ ] Role hierarchy: `ROLE_ADMIN`, `ROLE_RECRUITER`, `ROLE_CANDIDATE`
- [ ] Candidate registration and login (email/password with BCrypt hashing)
- [ ] Recruiter / Admin invitation flow and authenticated management
- [ ] Refresh token rotation with Redis-backed revocation list
- [ ] Frontend login/registration views and authenticated session persistence

#### Milestone 2.2: Job Management & Public Career Portal
- [ ] Job requisition entity & schema (Title, Department, Location, Type, Description, Requirements, Salary Range, Status)
- [ ] Job lifecycle states: `DRAFT`, `PUBLISHED`, `CLOSED`, `ARCHIVED`
- [ ] Recruiter CRUD endpoints for managing job postings
- [ ] Public-facing career portal:
  - [ ] Search and filter jobs by keyword, department, and employment type
  - [ ] Responsive job detail view with application CTA

#### Milestone 2.3: Candidate Portal & Multi-Part Application Ingestion
- [ ] Candidate application entity (Candidate Profile, Job ID, Status, Cover Note, Resume S3 Reference)
- [ ] Secure multi-part resume upload endpoint with file type (PDF/DOCX) and size validation
- [ ] Asynchronous upload pipeline saving documents to MinIO/S3 bucket with pre-signed URLs
- [ ] Candidate dashboard allowing applicants to view submitted applications and current status

#### Milestone 2.4: Gemini API Integration (AI Resume Screening & Fit Scoring)
- [ ] Set up Google Gemini API integration service with secure API key configuration
- [ ] Text extraction from uploaded resumes (Apache Tika / PDFBox)
- [ ] **Structured Resume Parsing via Gemini:**
  - Extract candidate contact details, skills taxonomy, work history, and education into JSON
- [ ] **AI Fit Scoring & Gap Analysis:**
  - Semantic comparison between resume extraction and Job Description (JD)
  - Generation of a 0–100% Match Score
  - Bulleted summary of matched qualifications, missing requirements, and potential interview questions
- [ ] Store AI screening analysis and match score directly on the application entity

#### Milestone 2.5: Recruiter Pipeline & Kanban Board
- [ ] Application pipeline status states:
  - `APPLIED` → `SCREENING` → `INTERVIEW` → `OFFERED` → `HIRED` / `REJECTED`
- [ ] Interactive Kanban board view for recruiters organized by stage
- [ ] Drag-and-drop or single-click candidate status transitions with audit updates
- [ ] Recruiter evaluation notes and structured scorecard ratings (1–5 scale per criteria)

#### Milestone 2.6: Automated Communications & Email Notifications
- [ ] Asynchronous event-driven notification service (Spring Events / MailSender)
- [ ] Automated email triggers:
  - Application submission confirmation to candidate
  - New candidate alert to assigned recruiter
  - Status updates (e.g. interview invitation, rejection notice)

---

### Phase 3: Advanced Features, Custom Model & Enterprise Polish
> **Objective:** Transition to or evaluate custom self-hosted AI models, introduce collaborative interview scheduling, recruitment analytics, audit tracking, and enterprise security.

#### Milestone 3.1: Custom AI Model & Local Inference Evaluation
- [ ] Architecture design for self-hosted / fine-tuned model (e.g. Hugging Face open-source LLM / custom embedding model)
- [ ] Containerized inference runtime setup (vLLM / ONNX Runtime / Ollama)
- [ ] Benchmarking custom model performance vs. Google Gemini API:
  - Parsing precision and schema conformance
  - Latency per resume
  - Compute cost vs. external API token billing
- [ ] Hybrid AI routing strategy (e.g., local model for initial bulk filtering, Gemini API for complex analysis)

#### Milestone 3.2: Interview Scheduling & Calendar Integration
- [ ] Interview scheduling module (Date, Time, Duration, Interviewers, Meeting Link)
- [ ] External calendar integration (Google Calendar / Outlook / Cal.com webhook integration)
- [ ] Candidate self-service time slot selection
- [ ] Multi-interviewer feedback aggregation with unanimous voting/recommendation

#### Milestone 3.3: Analytics & Recruiter Metrics Dashboard
- [ ] Metrics calculation service:
  - Time-to-hire (days from application to offer)
  - Pipeline funnel conversion rates (stage drop-off analytics)
  - Sourcing channel effectiveness
  - Job requisition fulfillment status
- [ ] Interactive chart components on the recruiter dashboard (Chart.js / Recharts)
- [ ] Report export functionality (CSV / PDF summary downloads)

#### Milestone 3.4: Enterprise Hardening, Performance & Compliance
- [ ] End-to-end audit logging for candidate PII data access (GDPR / privacy compliance)
- [ ] Redis caching optimizations for high-throughput public job listings
- [ ] API rate limiting on public application and AI endpoints using Redis Token Bucket
- [ ] Comprehensive unit and integration test coverage (JUnit 5, Mockito, Testcontainers, Vitest, React Testing Library)
- [ ] Production-ready Docker build configurations (multi-stage Dockerfiles)

---

## 3. Epics & User Stories Matrix

### Epic 1: Authentication & User Management (AUTH)
* **US-1.1:** *As an applicant*, I want to create an account and log in with my email and password so that I can manage my applications.
* **US-1.2:** *As a recruiter or administrator*, I want secure role-based access so that only authorized personnel can view candidate private data.
* **US-1.3:** *As any authenticated user*, I want my session to remain secure through token refresh and logout capabilities so that unauthorized users cannot access my account.

### Epic 2: Job Requisitions & Listings (JOB)
* **US-2.1:** *As a recruiter*, I want to create, edit, and publish job postings with detailed criteria so that relevant candidates can discover opportunities.
* **US-2.2:** *As a job seeker*, I want to browse and search open job listings by keyword, department, and location so that I can find positions matching my skills.
* **US-2.3:** *As a recruiter*, I want to close or archive job requisitions when hiring is complete so that new applicants cannot apply to closed positions.

### Epic 3: Applicant Experience & Document Upload (APPL)
* **US-3.1:** *As a candidate*, I want to submit my resume (PDF/DOCX) and profile information for a specific job in a seamless workflow.
* **US-3.2:** *As a candidate*, I want to view the real-time status of all jobs I have applied to from a centralized dashboard.
* **US-3.3:** *As a system administrator*, I want uploaded files stored securely in object storage (MinIO/S3) with strict file integrity and virus/format validation.

### Epic 4: AI Screening & Candidate Matching (AI)
* **US-4.1 (Phase 2):** *As a recruiter*, I want the system to parse candidate resumes using the **Google Gemini API** so that skills, work history, and education are automatically extracted.
* **US-4.2 (Phase 2):** *As a recruiter*, I want an AI-generated match score (0–100%) and gap analysis comparing the candidate's resume to the job description so that I can prioritize top prospects.
* **US-4.3 (Phase 3):** *As an engineering team*, I want the flexibility to switch or fall back to a self-hosted/custom open-source model so that the platform can operate independently of third-party API rate limits and costs.

### Epic 5: Recruiter Workflow & Pipeline Management (PIPE)
* **US-5.1:** *As a recruiter*, I want a visual Kanban board to view all applicants grouped by their current hiring stage.
* **US-5.2:** *As a hiring team member*, I want to transition candidates between stages and leave timestamped feedback/ratings on candidate profiles.
* **US-5.3:** *As an interviewer*, I want to view candidate scorecards and submit structured assessment criteria after completing an interview.

### Epic 6: Scheduling, Communication & Analytics (OPS)
* **US-6.1:** *As a candidate and recruiter*, I want automated email notifications whenever an application status changes or an interview is scheduled.
* **US-6.2:** *As an interviewer*, I want calendar integration to easily book and coordinate interview times with candidates.
* **US-6.3:** *As a recruitment lead*, I want actionable analytics on hiring velocity, funnel drop-off, and sourcing channels to optimize the recruiting process.

---

## 4. Current Execution Status & Backlog

| Task ID | Item | Owner / Issue | Target Phase | Status |
| :--- | :--- | :--- | :--- | :--- |
| **DOC-01** | Roadmap & Task Tracking (`Docs/Task.md`) | Issue #1 | Phase 1 | `COMPLETED` |
| **DOC-02** | Contribution Guidelines (`CONTRIBUTING.md`) | Issue #6 | Phase 1 | `COMPLETED` |
| **DOC-03** | Comprehensive Documentation (`README.md`) | Issue #7 | Phase 1 | `COMPLETED` |
| **INF-01** | Docker Compose Setup (Postgres, Redis, MinIO) | Issue #4 | Phase 1 | `COMPLETED` |
| **INF-02** | GitHub Actions CI Workflows | Issue #5 | Phase 1 | `COMPLETED` |
| **BE-01** | Spring Boot Project Scaffold & Configs | Issue #2 | Phase 1 | `COMPLETED` |
| **FE-01** | React + Vite + Tailwind Scaffold | Issue #3 | Phase 1 | `COMPLETED` |
| **BE-02** | Auth & JWT Security (RBAC) | Milestone 2.1 | Phase 2 | `BACKLOG` |
| **BE-03** | Job Requisition CRUD APIs | Milestone 2.2 | Phase 2 | `BACKLOG` |
| **FE-02** | Public Job Portal & Detail Pages | Milestone 2.2 | Phase 2 | `BACKLOG` |
| **BE-04** | MinIO Document Storage Integration | Milestone 2.3 | Phase 2 | `BACKLOG` |
| **AI-01** | Gemini API Resume Parsing & Fit Scoring | Milestone 2.4 | Phase 2 | `BACKLOG` |
| **FE-03** | Recruiter Pipeline & Kanban Board UI | Milestone 2.5 | Phase 2 | `BACKLOG` |
| **AI-02** | Custom Model Benchmark & Transition | Milestone 3.1 | Phase 3 | `BACKLOG` |
| **OPS-01** | Calendar Integration & Scheduling | Milestone 3.2 | Phase 3 | `BACKLOG` |
| **OPS-02** | Hiring Metrics & Analytics Dashboard | Milestone 3.3 | Phase 3 | `BACKLOG` |
