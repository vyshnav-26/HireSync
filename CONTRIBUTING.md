# Contributing to HireSync

Thank you for your interest in contributing to **HireSync**! This document provides guidelines, coding conventions, branching strategies, and pull request procedures to ensure high code quality and smooth collaboration across the project.

---

## 📑 Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started & Local Setup](#getting-started--local-setup)
   - [Prerequisites](#prerequisites)
   - [Initial Setup](#initial-setup)
3. [Branching Strategy](#branching-strategy)
   - [Branch Naming Rules](#branch-naming-rules)
   - [Branch Workflow](#branch-workflow)
4. [Commit Message Conventions](#commit-message-conventions)
   - [Format](#format)
   - [Commit Types](#commit-types)
   - [Commit Scopes](#commit-scopes)
   - [Examples](#examples)
5. [Code Style & Standards](#code-style--standards)
   - [Backend (Java / Spring Boot)](#backend-java--spring-boot)
   - [Frontend (React / TypeScript)](#frontend-react--typescript)
6. [Pull Request (PR) Workflow](#pull-request-pr-workflow)
   - [Pre-submission Checklist](#pre-submission-checklist)
   - [Submitting a Pull Request](#submitting-a-pull-request)
   - [Code Review & Merge Policy](#code-review--merge-policy)
7. [Reporting Bugs & Suggesting Features](#reporting-bugs--suggesting-features)

---

## Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for all contributors. Please be respectful, constructive, and collaborative in all communications, issue discussions, and pull requests.

[↑ Back to Top](#table-of-contents)

---

## Getting Started & Local Setup

### Prerequisites
Before contributing, ensure you have the following installed on your machine:
- **Git** 2.30+
- **JDK 21** (Eclipse Temurin recommended)
- **Node.js 20+** & **npm 10+**
- **Docker** & **Docker Compose** (v2+)

### Initial Setup
1. **Fork & Clone:**
   ```bash
   git clone https://github.com/<your-username>/HireSync.git
   cd HireSync
   ```
2. **Add Upstream Remote:**
   ```bash
   git remote add upstream https://github.com/vyshnav-26/HireSync.git
   ```
3. **Environment Configuration:**
   Copy the example environment template to create your local `.env`:
   ```bash
   cp .env.example .env
   ```
4. **Start Infrastructure Services:**
   Launch the backing services (PostgreSQL 16, Redis 7, MinIO S3) in the background:
   ```bash
   docker compose up -d postgres redis minio minio-init
   ```

[↑ Back to Top](#table-of-contents)

---

## Branching Strategy

We follow a structured branch naming convention. All development branches must branch off and target `main`.

### Branch Naming Rules

| Prefix | Usage | Example |
| :--- | :--- | :--- |
| `feature/` | New functionality or feature development | `feature/candidate-auth` or `feature/issue-6-contributing` |
| `bugfix/` | Non-urgent bug fixes on development code | `bugfix/jwt-expiration-check` |
| `hotfix/` | Urgent production fixes | `hotfix/null-pointer-login` |
| `chore/` | Maintenance, dependencies, or tooling | `chore/upgrade-tailwind` |
| `docs/` | Documentation additions or updates | `docs/api-documentation` |

### Branch Workflow
- **Never push directly to `main`.**
- Always sync with `upstream/main` before creating or pushing a branch:
  ```bash
  git checkout main
  git pull upstream main
  git checkout -b feature/<your-feature-name>
  ```
- Keep feature branches short-lived and focused on a single task or issue.

[↑ Back to Top](#table-of-contents)

---

## Commit Message Conventions

We adhere to the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. This maintains a clean, readable git history and powers automated changelog generation.

### Format
```text
<type>(<scope>): <short description>

[optional body explaining motivation and context]

[optional footer(s), e.g., Closes #6]
```

### Commit Types
- `feat`: A new feature for the user or API.
- `fix`: A bug fix.
- `docs`: Documentation updates only (`README`, `Task.md`, code documentation).
- `style`: Changes that do not affect the meaning of code (formatting, spacing, semi-colons).
- `refactor`: Code changes that neither fix a bug nor add a feature.
- `perf`: Code changes that improve performance.
- `test`: Adding missing unit/integration tests or fixing existing tests.
- `build`: Changes affecting build systems or external dependencies (`pom.xml`, `package.json`).
- `ci`: Changes to CI configuration files and pipelines (`.github/workflows`).
- `chore`: Routine maintenance, repo configuration, or auxiliary tools.

### Commit Scopes
Use scopes to specify the affected module when appropriate:
- `backend`, `frontend`, `auth`, `jobs`, `candidates`, `ai`, `docker`, `infra`, `ci`

### Examples
- `feat(auth): implement refresh token rotation with redis`
- `fix(backend): resolve cors issue on health endpoint`
- `docs: add CONTRIBUTING.md with PR workflow (#6)`
- `ci: configure github actions pipeline for frontend and backend (#5)`

[↑ Back to Top](#table-of-contents)

---

## Code Style & Standards

### Backend (Java / Spring Boot)
- **Style Guide:** Adhere to the [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html).
- **Architecture:** Maintain strict layered separation of concerns:
  - `com.hiresync.controller` — REST endpoints, request parameter validation, routing.
  - `com.hiresync.service` — Business logic and transaction management.
  - `com.hiresync.repository` — Spring Data JPA data access interfaces.
  - `com.hiresync.model` — JPA entities, domain models, and DTOs.
  - `com.hiresync.config` — Spring configuration classes and bean definitions.
  - `com.hiresync.security` — Spring Security filter chain, JWT validators, and auth handlers.
- **API Standards:**
  - Standardize all REST API responses using the `ApiResponse<T>` envelope.
  - Centralize exception handling using `@RestControllerAdvice`.
  - Use appropriate semantic HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`).
- **Verification:**
  ```bash
  cd backend
  mvn clean verify
  ```

### Frontend (React / TypeScript)
- **Style Guide:** Functional components with React hooks, strict TypeScript types, and explicit prop interfaces.
- **Directory Structure:**
  - `src/components` — Reusable atomic UI elements (Buttons, Inputs, Modals, Cards).
  - `src/pages` — Top-level route views (Home, Login, Dashboard, Jobs).
  - `src/services` — Axios API clients with JWT authentication interceptors.
  - `src/hooks` — Custom state and lifecycle hooks.
  - `src/types` — TypeScript interfaces, models, and API contract types.
  - `src/store` — Zustand global client state management.
- **Styling:** Use Tailwind CSS utility classes; avoid inline styles.
- **Icons:** Use `lucide-react` for consistent iconography.
- **Verification:**
  ```bash
  cd frontend
  npm run lint
  npm run build
  ```

[↑ Back to Top](#table-of-contents)

---

## Pull Request (PR) Workflow

### Pre-submission Checklist
Before submitting a pull request, verify:
- [ ] Code builds and passes all tests locally (`mvn clean verify` and `npm run build`).
- [ ] No lint errors or formatting warnings exist.
- [ ] Documentation is updated if changes alter configurations, APIs, or behaviors.
- [ ] Commits follow Conventional Commits formatting.
- [ ] No sensitive credentials, secrets, or temporary debug logs are committed.

### Submitting a Pull Request
1. Push your branch to your GitHub fork:
   ```bash
   git push origin <branch-name>
   ```
2. Navigate to [HireSync Pull Requests](https://github.com/vyshnav-26/HireSync/pulls) and click **New Pull Request**.
3. Select `base: main` and `compare: <your-branch>`.
4. Fill in the PR template:
   - Provide a clear, descriptive title using conventional format (e.g., `feat(jobs): add keyword search filtering`).
   - Describe the purpose and implementation details of the change.
   - Reference related issues (e.g., `Closes #6`, `Fixes #12`).

### Code Review & Merge Policy
- All PRs require automated CI checks (`Backend CI` & `Frontend CI`) to pass before merging.
- At least one code review approval is required from a project maintainer.
- PRs are merged using **Squash and Merge** to maintain a clean and linear git history on `main`.

[↑ Back to Top](#table-of-contents)

---

## Reporting Bugs & Suggesting Features

- **Bug Reports:** Open an issue on GitHub detailing the steps to reproduce, expected vs. actual behavior, and environment logs/screenshots.
- **Feature Requests:** Open a GitHub issue titled `[Feature Request]: <summary>` explaining the problem statement, proposed solution, and value to HireSync.

[↑ Back to Top](#table-of-contents)
