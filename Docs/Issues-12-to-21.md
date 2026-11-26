# HireSync — Detailed Issue Plans (Milestones 2.1 & 2.2)

> Covers Milestone 2.1 (Auth & RBAC) and Milestone 2.2 (Job Management & Career Portal)  
> Corresponding GitHub Issues: **#14 through #27**

| Module Plan Ref | GitHub Issue | Title | Type | Milestone |
|-----------------|--------------|-------|------|-----------|
| Issue #8 | **[Issue #14](https://github.com/vyshnav-26/HireSync/issues/14)** | backend: define User entity and Role enum | Backend | 2.1 |
| Issue #9 | **[Issue #15](https://github.com/vyshnav-26/HireSync/issues/15)** | backend: implement candidate registration endpoint | Backend | 2.1 |
| Issue #10 | **[Issue #16](https://github.com/vyshnav-26/HireSync/issues/16)** | backend: implement login endpoint and JWT token service | Backend | 2.1 |
| Issue #11 | **[Issue #17](https://github.com/vyshnav-26/HireSync/issues/17)** | backend: implement refresh token rotation and token revocation blocklist | Backend | 2.1 |
| Issue #12 | **[Issue #18](https://github.com/vyshnav-26/HireSync/issues/18)** | security: configure Spring Security filter chain with JWT and RBAC | Backend | 2.1 |
| Issue #13 | **[Issue #19](https://github.com/vyshnav-26/HireSync/issues/19)** | frontend: implement user login view and authentication handling | Frontend | 2.1 |
| Issue #14 | **[Issue #20](https://github.com/vyshnav-26/HireSync/issues/20)** | frontend: implement candidate registration view with validation | Frontend | 2.1 |
| Issue #15 | **[Issue #21](https://github.com/vyshnav-26/HireSync/issues/21)** | frontend: integrate auth store, session management, and route guards | Frontend | 2.1 |
| Issue #16 | **[Issue #22](https://github.com/vyshnav-26/HireSync/issues/22)** | backend: define Job entity, enums, and lifecycle states | Backend | 2.2 |
| Issue #17 | **[Issue #23](https://github.com/vyshnav-26/HireSync/issues/23)** | backend: implement recruiter Job CRUD REST endpoints | Backend | 2.2 |
| Issue #18 | **[Issue #24](https://github.com/vyshnav-26/HireSync/issues/24)** | backend: implement public published job listing and search API | Backend | 2.2 |
| Issue #19 | **[Issue #25](https://github.com/vyshnav-26/HireSync/issues/25)** | frontend: build public Career Portal page with search and filters | Frontend | 2.2 |
| Issue #20 | **[Issue #26](https://github.com/vyshnav-26/HireSync/issues/26)** | frontend: build Job Detail view with application CTA | Frontend | 2.2 |
| Issue #21 | **[Issue #27](https://github.com/vyshnav-26/HireSync/issues/27)** | frontend: build recruiter Job Management dashboard | Frontend | 2.2 |

---

## Issue #12 · Wire Spring Security filter chain with RBAC

| Field | Value |
|-------|-------|
| **Type** | Backend |
| **Labels** | `backend`, `security`, `auth`, `priority: critical` |
| **Milestone** | 2.1 — Auth & RBAC |
| **Schedule** | Dec 11–12 |
| **Estimate** | 4h |
| **Depends on** | #10 (JWT service), #11 (token blocklist) |
| **Branch** | `feature/12-security-filter-chain` |

### Description
Configure the full Spring Security pipeline so that every incoming request is authenticated via JWT and authorized based on user roles. The existing [`SecurityConfig.java`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/backend/src/main/java/com/hiresync/security/SecurityConfig.java) already has a basic stateless setup with `BCryptPasswordEncoder` and permits `/api/v1/auth/**`. This issue upgrades it with a JWT filter and role-based rules.

### Files to Create

**1. `backend/src/main/java/com/hiresync/security/JwtAuthenticationFilter.java`**
```
Extends OncePerRequestFilter
```
- Extract `Authorization: Bearer <token>` header
- Call `JwtService.validateToken(token)` (from issue #10)
- Call `TokenBlocklistService.isBlocked(token)` (from issue #11)
- If valid: extract userId and role from token claims, build `UsernamePasswordAuthenticationToken` with granted authorities, set on `SecurityContextHolder`
- If invalid/missing: continue filter chain (let Spring Security deny if endpoint requires auth)
- Skip filter for paths: `/api/v1/auth/**`, `/api/v1/public/**`, `/api/v1/health`

**2. `backend/src/main/java/com/hiresync/security/CustomUserDetailsService.java`**
```
Implements UserDetailsService
```
- Inject `UserRepository`
- `loadUserByUsername(String email)`:
  - `userRepository.findByEmail(email)` → map to Spring's `UserDetails`
  - Granted authority: `"ROLE_" + user.getRole().name()` (e.g., `ROLE_ADMIN`)
  - Throw `UsernameNotFoundException` if not found

**3. `backend/src/main/java/com/hiresync/config/CorsConfig.java`**
- `@Bean WebMvcConfigurer` with CORS mappings:
  - Allowed origins: `http://localhost:5173` (Vite dev server), configurable via `${CORS_ALLOWED_ORIGINS}`
  - Allowed methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
  - Allowed headers: `Authorization, Content-Type`
  - `allowCredentials: true`

### Files to Modify

**4. [`SecurityConfig.java`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/backend/src/main/java/com/hiresync/security/SecurityConfig.java)**

Update the filter chain:
```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf(AbstractHttpConfigurer::disable)
        .cors(cors -> {})
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            // Public — no auth
            .requestMatchers("/api/v1/health", "/api/v1/auth/**", "/api/v1/public/**", "/error").permitAll()
            // Admin only
            .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
            // Recruiter + Admin
            .requestMatchers(HttpMethod.POST, "/api/v1/jobs/**").hasAnyRole("RECRUITER", "ADMIN")
            .requestMatchers(HttpMethod.PUT, "/api/v1/jobs/**").hasAnyRole("RECRUITER", "ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/api/v1/jobs/**").hasAnyRole("RECRUITER", "ADMIN")
            .requestMatchers(HttpMethod.PATCH, "/api/v1/jobs/**").hasAnyRole("RECRUITER", "ADMIN")
            // Everything else — authenticated
            .anyRequest().authenticated()
        )
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
}
```
- Add `@EnableMethodSecurity` on the class for `@PreAuthorize` support
- Inject `JwtAuthenticationFilter` via constructor

### API Access Matrix

| Endpoint Pattern | ADMIN | RECRUITER | CANDIDATE | Public |
|-----------------|-------|-----------|-----------|--------|
| `POST /api/v1/auth/**` | — | — | — | ✅ |
| `GET /api/v1/public/**` | — | — | — | ✅ |
| `GET /api/v1/health` | — | — | — | ✅ |
| `POST/PUT/PATCH/DELETE /api/v1/jobs/**` | ✅ | ✅ | ❌ | ❌ |
| `GET /api/v1/jobs/**` | ✅ | ✅ | ✅ | ❌ |
| `/api/v1/admin/**` | ✅ | ❌ | ❌ | ❌ |
| Any other authenticated | ✅ | ✅ | ✅ | ❌ |

### Acceptance Criteria
- [ ] `JwtAuthenticationFilter` intercepts requests and sets security context from valid JWT
- [ ] Blocklisted tokens (from logout/rotation) are rejected with `401`
- [ ] Unauthenticated requests to protected endpoints return `401`
- [ ] Candidates get `403` on recruiter-only endpoints (POST/PUT/DELETE jobs)
- [ ] `@PreAuthorize` annotations work on controller methods
- [ ] CORS allows frontend at `localhost:5173` to call the API
- [ ] Public endpoints (`/api/v1/auth/*`, `/api/v1/public/*`, `/api/v1/health`) work without tokens

---

## Issue #13 · Build Login page

| Field | Value |
|-------|-------|
| **Type** | Frontend |
| **Labels** | `frontend`, `auth`, `ui`, `priority: critical` |
| **Milestone** | 2.1 — Auth & RBAC |
| **Schedule** | Dec 13 |
| **Estimate** | 3h |
| **Depends on** | #10 (backend login API ready) |
| **Branch** | `feature/13-login-page` |

### Description
The [`Login.tsx`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/frontend/src/pages/Login.tsx) page already exists with a form, demo auto-fill buttons, and a mock fallback (lines 36–51). This issue upgrades it to work with the real backend auth API and handle errors properly.

### Files to Modify

**1. [`frontend/src/pages/Login.tsx`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/frontend/src/pages/Login.tsx)**

Changes needed:
- **Remove the mock fallback** in the `catch` block (lines 36–51). Replace with real error handling:
  ```tsx
  catch (err: any) {
    if (err.response?.status === 401) {
      setError('Invalid email or password.');
    } else if (err.response?.data?.message) {
      setError(err.response.data.message);
    } else {
      setError('Unable to connect. Please try again later.');
    }
  }
  ```
- **Store both tokens**: The current `login()` call on line 31 only stores `authData.token`. Update to also store `refreshToken`:
  ```tsx
  const authData = await authService.login({ email, password });
  login(authData.user, authData.token, authData.refreshToken);
  ```
- **Add email format validation** before submission (basic regex or rely on `type="email"`)
- **Keep the demo auto-fill buttons** but add a small note that they require the backend to be running
- **Add "Forgot password?" link** (placeholder, links to `#` for now)

**2. [`frontend/src/services/authService.ts`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/frontend/src/services/authService.ts)**

The `login()` method (line 5) already calls `POST /auth/login` and returns `AuthResponse`. Verify it properly passes through backend error responses (it currently throws on missing `data` — good).

**No new files needed** — the page, service, and store already exist as scaffolds.

### Acceptance Criteria
- [ ] User can log in with valid credentials and is redirected to `/dashboard` (or the page they came from)
- [ ] Invalid credentials display: "Invalid email or password."
- [ ] Network/server errors display: "Unable to connect. Please try again later."
- [ ] Mock fallback code is removed — login only works with real backend
- [ ] Submit button shows loading spinner during API call (already implemented via `isLoading`)
- [ ] Demo auto-fill buttons still work for quick testing
- [ ] "Create an account" link navigates to `/register`

---

## Issue #14 · Build Registration page

| Field | Value |
|-------|-------|
| **Type** | Frontend |
| **Labels** | `frontend`, `auth`, `ui`, `priority: critical` |
| **Milestone** | 2.1 — Auth & RBAC |
| **Schedule** | Dec 13–14 |
| **Estimate** | 3h |
| **Depends on** | #9 (backend register API ready) |
| **Branch** | `feature/14-registration-page` |

### Description
The [`Register.tsx`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/frontend/src/pages/Register.tsx) page already exists with a name/email/password form and a role selector (Candidate/Recruiter). It currently has a mock fallback (lines 33–43). This issue upgrades it to use the real backend and adds proper validation.

### Files to Modify

**1. [`frontend/src/pages/Register.tsx`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/frontend/src/pages/Register.tsx)**

Changes needed:
- **Split `name` into `firstName` and `lastName`** fields to match the backend `RegisterRequest` DTO (issue #9). Update the form to have two inputs:
  ```tsx
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  ```
- **Add `confirmPassword` field** with match validation:
  ```tsx
  const [confirmPassword, setConfirmPassword] = useState('');
  // Before submit:
  if (password !== confirmPassword) {
    setError('Passwords do not match.');
    return;
  }
  ```
- **Add password strength validation**: minimum 8 characters, show inline hint
- **Remove the mock fallback** in the `catch` block (lines 33–43). Replace with real error handling:
  ```tsx
  catch (err: any) {
    if (err.response?.status === 409) {
      setError('An account with this email already exists.');
    } else if (err.response?.data?.data) {
      // Validation errors map from GlobalExceptionHandler
      const fieldErrors = err.response.data.data;
      setError(Object.values(fieldErrors).join(', '));
    } else {
      setError('Registration failed. Please try again.');
    }
  }
  ```
- **On success**: redirect to `/login` with a success message (not auto-login), since the backend register endpoint doesn't return tokens:
  ```tsx
  navigate('/login', { state: { registered: true } });
  ```
- **Update the `Login.tsx`** to show a success toast when arriving from registration (check `location.state?.registered`)

**2. [`frontend/src/types/index.ts`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/frontend/src/types/index.ts)**

Update `RegisterRequest` (line 23) to match backend DTO:
```typescript
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
```
Remove `role` from the request — candidates self-register (role is set server-side). The recruiter role selector should be removed or gated behind admin invitation flow (future issue).

**3. [`frontend/src/services/authService.ts`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/frontend/src/services/authService.ts)**

Update `register()` (line 13) return type — the backend returns a success message, not `AuthResponse`:
```typescript
async register(payload: RegisterRequest): Promise<{ message: string }> {
  const response = await apiClient.post<ApiResponse<null>>('/auth/register', payload);
  return { message: response.data.message || 'Registration successful' };
}
```

### Acceptance Criteria
- [ ] Registration form has: firstName, lastName, email, password, confirmPassword
- [ ] Password mismatch is caught client-side before API call
- [ ] Password under 8 chars shows inline validation error
- [ ] Duplicate email shows "An account with this email already exists."
- [ ] On successful registration, user is redirected to `/login` with a success message
- [ ] Mock fallback code is removed
- [ ] Role selector is removed (candidates only — recruiters are invited by admin later)

---

## Issue #15 · Implement auth store, session management & route guards

| Field | Value |
|-------|-------|
| **Type** | Frontend |
| **Labels** | `frontend`, `auth`, `state-management`, `priority: critical` |
| **Milestone** | 2.1 — Auth & RBAC |
| **Schedule** | Dec 15–16 |
| **Estimate** | 4h |
| **Depends on** | #13, #14 |
| **Branch** | `feature/15-auth-session-guards` |

### Description
The [`authStore.ts`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/frontend/src/store/authStore.ts) currently stores a single `token` and `user` in Zustand + localStorage. The [`api.ts`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/frontend/src/services/api.ts) interceptor attaches the token but only does a hard `logout()` on 401. This issue adds refresh token support, silent token renewal, and proper route guard behavior.

### Files to Modify

**1. [`frontend/src/store/authStore.ts`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/frontend/src/store/authStore.ts)**

Upgrade the state and actions:
```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  loadSession: () => void;
}
```
- `login()` — store `accessToken`, `refreshToken`, and `user` in localStorage and state
- `logout()` — clear all from localStorage and state, call `authService.logout()` (fire-and-forget to hit backend `POST /api/v1/auth/logout`)
- `setTokens()` — update tokens after silent refresh (without reloading user)
- `loadSession()` — called on app init, restore from localStorage, validate token isn't expired client-side (decode JWT, check `exp` claim)
- Rename `token` → `accessToken` throughout

**2. [`frontend/src/services/api.ts`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/frontend/src/services/api.ts)**

Upgrade the interceptors for silent refresh:
```typescript
// Request interceptor — use accessToken
config.headers.Authorization = `Bearer ${useAuthStore.getState().accessToken}`;

// Response interceptor — handle 401 with refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        try {
          // Call refresh endpoint directly (not through apiClient to avoid loop)
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          useAuthStore.getState().setTokens(accessToken, newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest); // Retry original request
        } catch {
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
      } else {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

**3. [`frontend/src/components/guards/ProtectedRoute.tsx`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/frontend/src/components/guards/ProtectedRoute.tsx)**

Already functional (checks `isAuthenticated` and `allowedRoles`). Minor update:
- Add a loading spinner while `isLoading` is true (session being restored):
  ```tsx
  if (isLoading) return <LoadingSpinner />;
  ```

**4. [`frontend/src/components/layout/Navbar.tsx`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/frontend/src/components/layout/Navbar.tsx)**

Already functional (shows user info, role badge, logout button). Update:
- `handleLogout()` (line 14) should call `authService.logout()` before store logout:
  ```tsx
  const handleLogout = async () => {
    await authService.logout(); // Hit backend to blocklist tokens
    logout();
    navigate('/login');
  };
  ```

**5. [`frontend/src/App.tsx`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/frontend/src/App.tsx)**

Add session restoration on app mount:
```tsx
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';

const App: FC = () => {
  const loadSession = useAuthStore((s) => s.loadSession);
  useEffect(() => { loadSession(); }, [loadSession]);
  // ... rest of component
};
```

Add new protected routes for future pages:
```tsx
<Route path="dashboard/jobs" element={
  <ProtectedRoute allowedRoles={['ROLE_RECRUITER', 'ROLE_ADMIN']}>
    <RecruiterJobDashboard />
  </ProtectedRoute>
} />
<Route path="jobs/:id" element={<JobDetail />} />
<Route path="careers" element={<Careers />} />
```

### Files to Create

**6. `frontend/src/components/common/LoadingSpinner.tsx`**
- Simple centered spinner component used in route guards and data loading states
- Tailwind-based CSS spinner animation

### Acceptance Criteria
- [ ] Session persists across page refreshes (tokens restored from localStorage)
- [ ] Expired access token triggers silent refresh — user is not interrupted
- [ ] Failed refresh (expired/invalid refresh token) logs out and redirects to `/login`
- [ ] `ProtectedRoute` shows loading spinner while session is being restored
- [ ] `ProtectedRoute` with `allowedRoles` redirects wrong-role users to home
- [ ] Navbar logout calls backend `POST /auth/logout` and clears local state
- [ ] Navbar shows user name + role badge when authenticated
- [ ] Navbar shows Sign In / Get Started when not authenticated
- [ ] New routes are registered in App.tsx: `/dashboard/jobs`, `/jobs/:id`, `/careers`

---

## Issue #16 · Define Job entity & lifecycle states

| Field | Value |
|-------|-------|
| **Type** | Backend |
| **Labels** | `backend`, `jobs`, `database`, `priority: critical` |
| **Milestone** | 2.2 — Job Management |
| **Schedule** | Dec 18 |
| **Estimate** | 2h |
| **Depends on** | #8 (User entity — for `createdBy` FK) |
| **Branch** | `feature/16-job-entity` |

### Description
Create the Job JPA entity and supporting enums for the job requisition lifecycle. This is the data foundation for all job management features.

### Files to Create

**1. `backend/src/main/java/com/hiresync/model/enums/JobStatus.java`**
```java
public enum JobStatus {
    DRAFT,
    PUBLISHED,
    CLOSED,
    ARCHIVED
}
```

**2. `backend/src/main/java/com/hiresync/model/enums/EmploymentType.java`**
```java
public enum EmploymentType {
    FULL_TIME,
    PART_TIME,
    CONTRACT,
    REMOTE,
    INTERNSHIP
}
```

**3. `backend/src/main/java/com/hiresync/model/entity/Job.java`**
```java
@Entity
@Table(name = "jobs", indexes = {
    @Index(name = "idx_job_status", columnList = "status"),
    @Index(name = "idx_job_department", columnList = "department"),
    @Index(name = "idx_job_created_by", columnList = "created_by")
})
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    private String department;

    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmploymentType employmentType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    private BigDecimal salaryMin;
    private BigDecimal salaryMax;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobStatus status = JobStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    // Getters, setters, builder pattern
}
```

**4. `backend/src/main/java/com/hiresync/repository/JobRepository.java`**
```java
public interface JobRepository extends JpaRepository<Job, UUID> {

    Page<Job> findByStatus(JobStatus status, Pageable pageable);

    Page<Job> findByCreatedById(UUID userId, Pageable pageable);

    @Query("SELECT j FROM Job j WHERE j.status = 'PUBLISHED' AND " +
           "(LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Job> searchPublishedJobs(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT j FROM Job j WHERE j.status = 'PUBLISHED' " +
           "AND (:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "    OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:department IS NULL OR j.department = :department) " +
           "AND (:employmentType IS NULL OR j.employmentType = :employmentType)")
    Page<Job> searchPublishedJobsWithFilters(
        @Param("keyword") String keyword,
        @Param("department") String department,
        @Param("employmentType") EmploymentType employmentType,
        Pageable pageable
    );

    long countByStatusAndCreatedById(JobStatus status, UUID userId);
}
```

### Entity Relationship
```
User (1) ──── creates ────> (*) Job
```

### Acceptance Criteria
- [ ] `jobs` table is created on app startup with correct column types
- [ ] `JobStatus` enum values map to `VARCHAR` in DB (not ordinal)
- [ ] `EmploymentType` enum includes `REMOTE` (matches existing frontend `JobType`)
- [ ] `createdBy` FK references the `users` table
- [ ] `JobRepository` supports keyword search + department/type filters
- [ ] Database indexes exist on `status`, `department`, and `created_by` columns
- [ ] `createdAt` / `updatedAt` auto-populate via Hibernate

---

## Issue #17 · Implement Job CRUD REST endpoints

| Field | Value |
|-------|-------|
| **Type** | Backend |
| **Labels** | `backend`, `jobs`, `api`, `priority: critical` |
| **Milestone** | 2.2 — Job Management |
| **Schedule** | Dec 18–19 |
| **Estimate** | 4h |
| **Depends on** | #12 (security filter), #16 (Job entity) |
| **Branch** | `feature/17-job-crud-api` |

### Description
Build the authenticated CRUD API for recruiters and admins to create, view, edit, delete, and transition job postings.

### Files to Create

**1. `backend/src/main/java/com/hiresync/model/dto/job/CreateJobRequest.java`**
```java
public class CreateJobRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String department;
    private String location;

    @NotNull(message = "Employment type is required")
    private EmploymentType employmentType;

    @NotBlank(message = "Description is required")
    private String description;

    private String requirements;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
}
```

**2. `backend/src/main/java/com/hiresync/model/dto/job/UpdateJobRequest.java`**
```java
// Same fields as CreateJobRequest but all optional (nullable)
// Only non-null fields are updated
```

**3. `backend/src/main/java/com/hiresync/model/dto/job/JobResponse.java`**
```java
public class JobResponse {
    private UUID id;
    private String title;
    private String department;
    private String location;
    private String employmentType;
    private String description;
    private String requirements;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String status;
    private String createdByName;
    private UUID createdById;
    private Instant createdAt;
    private Instant updatedAt;
}
```

**4. `backend/src/main/java/com/hiresync/model/dto/job/StatusUpdateRequest.java`**
```java
public class StatusUpdateRequest {
    @NotNull
    private JobStatus status;
}
```

**5. `backend/src/main/java/com/hiresync/service/JobService.java`**
```java
@Service
public class JobService {
    // create(CreateJobRequest, User) → JobResponse
    //   - Set status to DRAFT, set createdBy
    // getById(UUID) → JobResponse
    //   - Throw 404 if not found
    // getMyJobs(User, Pageable) → Page<JobResponse>
    //   - Recruiter sees own jobs, Admin sees all
    // update(UUID, UpdateJobRequest, User) → JobResponse
    //   - Only creator or admin can edit
    //   - Cannot edit ARCHIVED jobs
    // delete(UUID, User)
    //   - Only DRAFT jobs can be deleted
    //   - Only creator or admin can delete
    // updateStatus(UUID, JobStatus, User) → JobResponse
    //   - Valid transitions: DRAFT→PUBLISHED, PUBLISHED→CLOSED, CLOSED→ARCHIVED
    //   - Cannot publish without title + description
}
```

**6. `backend/src/main/java/com/hiresync/controller/JobController.java`**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/jobs` | RECRUITER, ADMIN | Create new job (DRAFT) |
| `GET` | `/api/v1/jobs` | RECRUITER, ADMIN | List my jobs (paginated) |
| `GET` | `/api/v1/jobs/{id}` | RECRUITER, ADMIN | Get job by ID |
| `PUT` | `/api/v1/jobs/{id}` | RECRUITER, ADMIN | Update job details |
| `DELETE` | `/api/v1/jobs/{id}` | RECRUITER, ADMIN | Delete job (DRAFT only) |
| `PATCH` | `/api/v1/jobs/{id}/status` | RECRUITER, ADMIN | Transition job status |

All endpoints:
- Use `@Valid` on request bodies
- Return `ApiResponse<JobResponse>` envelope (using existing [`ApiResponse.java`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/backend/src/main/java/com/hiresync/model/dto/ApiResponse.java))
- Extract authenticated user from `SecurityContextHolder` or `@AuthenticationPrincipal`
- Throw `ApiException` for business rule violations (handled by existing [`GlobalExceptionHandler`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/backend/src/main/java/com/hiresync/exception/GlobalExceptionHandler.java))

### Status Transition Rules
```
DRAFT ──→ PUBLISHED ──→ CLOSED ──→ ARCHIVED
                           │
                           └──→ (cannot go back to PUBLISHED)
```
Invalid transitions throw `400 Bad Request`.

### Acceptance Criteria
- [ ] `POST /api/v1/jobs` creates a job in DRAFT status tied to the authenticated user
- [ ] `GET /api/v1/jobs` returns paginated list (recruiters see their own, admins see all)
- [ ] `PUT /api/v1/jobs/{id}` updates only allowed fields, only by creator or admin
- [ ] `DELETE /api/v1/jobs/{id}` works only for DRAFT jobs
- [ ] `PATCH /api/v1/jobs/{id}/status` enforces valid transitions only
- [ ] Cannot publish a job without a title and description (returns `400`)
- [ ] Candidates get `403` on all these endpoints
- [ ] All responses use the `ApiResponse<T>` envelope
- [ ] Validation errors return `400` with field-level messages

---

## Issue #18 · Implement public job listing API

| Field | Value |
|-------|-------|
| **Type** | Backend |
| **Labels** | `backend`, `jobs`, `api`, `priority: high` |
| **Milestone** | 2.2 — Job Management |
| **Schedule** | Dec 19–20 |
| **Estimate** | 2h |
| **Depends on** | #16 (Job entity & repository) |
| **Branch** | `feature/18-public-job-api` |

### Description
Create the **unauthenticated** public API for the career portal. Only returns `PUBLISHED` jobs with search and filter capabilities.

### Files to Create

**1. `backend/src/main/java/com/hiresync/model/dto/job/JobSummaryResponse.java`**

Lighter DTO for public listings (no internal fields like `createdById`):
```java
public class JobSummaryResponse {
    private UUID id;
    private String title;
    private String department;
    private String location;
    private String employmentType;
    private String description;      // Truncated to ~200 chars for card view
    private String requirements;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private Instant createdAt;
}
```

**2. `backend/src/main/java/com/hiresync/controller/PublicJobController.java`**

| Method | Endpoint | Auth | Query Params |
|--------|----------|------|-------------|
| `GET` | `/api/v1/public/jobs` | None | `keyword`, `department`, `employmentType`, `page`, `size`, `sort` |
| `GET` | `/api/v1/public/jobs/{id}` | None | — |

```java
@RestController
@RequestMapping("/api/v1/public/jobs")
public class PublicJobController {

    @GetMapping
    public ResponseEntity<ApiResponse<Page<JobSummaryResponse>>> listPublishedJobs(
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) String department,
        @RequestParam(required = false) EmploymentType employmentType,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "createdAt,desc") String sort
    ) { ... }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobResponse>> getPublishedJob(@PathVariable UUID id) {
        // Return full JobResponse but only if status == PUBLISHED
        // Else throw 404
    }
}
```

**3. `backend/src/main/java/com/hiresync/service/PublicJobService.java`** (or add methods to existing `JobService`)
- `searchPublicJobs(keyword, department, type, pageable)` → calls repository's `searchPublishedJobsWithFilters`
- `getPublicJobById(id)` → returns only if `PUBLISHED`, else `404`

### Response Format
```json
{
  "timestamp": "2026-12-19T10:00:00Z",
  "success": true,
  "message": "Jobs retrieved successfully",
  "data": {
    "content": [ { ... }, { ... } ],
    "totalElements": 24,
    "totalPages": 3,
    "number": 0,
    "size": 10
  }
}
```

### Acceptance Criteria
- [ ] `GET /api/v1/public/jobs` returns only `PUBLISHED` jobs (never DRAFT/CLOSED/ARCHIVED)
- [ ] `keyword` search matches against title and description (case-insensitive)
- [ ] `department` filter returns exact matches
- [ ] `employmentType` filter works with enum values (`FULL_TIME`, `REMOTE`, etc.)
- [ ] All filters can be combined
- [ ] Default sort is `createdAt` descending (newest first)
- [ ] Pagination returns correct `totalElements`, `totalPages`, `number`, `size`
- [ ] `GET /api/v1/public/jobs/{id}` returns `404` for non-PUBLISHED or non-existent jobs
- [ ] No authentication required for either endpoint
- [ ] `JobSummaryResponse` does not expose internal fields (`createdById`)

---

## Issue #19 · Build public Career Portal page

| Field | Value |
|-------|-------|
| **Type** | Frontend |
| **Labels** | `frontend`, `jobs`, `ui`, `priority: high` |
| **Milestone** | 2.2 — Job Management |
| **Schedule** | Dec 20–21 |
| **Estimate** | 4h |
| **Depends on** | #18 (public job API) |
| **Branch** | `feature/19-career-portal` |

### Description
The existing [`Jobs.tsx`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/frontend/src/pages/Jobs.tsx) page has a hardcoded `INITIAL_JOBS` array (lines 10–58), client-side filtering, and an inline apply modal. This issue upgrades it to fetch from the real API and moves it to the `/careers` route as the public career portal.

### Files to Modify

**1. [`frontend/src/services/jobService.ts`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/frontend/src/services/jobService.ts)**

Add public job API calls:
```typescript
interface JobSearchParams {
  keyword?: string;
  department?: string;
  employmentType?: string;
  page?: number;
  size?: number;
}

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const jobService = {
  // Existing methods...

  async getPublicJobs(params: JobSearchParams): Promise<PaginatedResponse<Job>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Job>>>('/public/jobs', { params });
    return response.data.data!;
  },

  async getPublicJobById(id: string): Promise<Job> {
    const response = await apiClient.get<ApiResponse<Job>>(`/public/jobs/${id}`);
    if (!response.data.data) throw new Error('Job not found');
    return response.data.data;
  },

  async updateJob(id: string, job: Partial<Job>): Promise<Job> { ... },
  async deleteJob(id: string): Promise<void> { ... },
  async updateJobStatus(id: string, status: JobStatus): Promise<Job> { ... },
};
```

**2. [`frontend/src/pages/Jobs.tsx`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/frontend/src/pages/Jobs.tsx) → rename to `Careers.tsx`**

Major changes:
- **Remove `INITIAL_JOBS` array** (lines 10–58) — fetch from API
- **Add `useEffect` with API call**:
  ```tsx
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 0, totalElements: 0 });

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const data = await jobService.getPublicJobs({ keyword: searchTerm, department: selectedDept, employmentType: selectedType, page });
      setJobs(data.content);
      setPagination({ page: data.number, totalPages: data.totalPages, totalElements: data.totalElements });
      setLoading(false);
    };
    fetchJobs();
  }, [searchTerm, selectedDept, selectedType, page]);
  ```
- **Debounce the search input** (300ms) to avoid excessive API calls
- **Add loading skeleton** while fetching
- **Add pagination controls** (Previous / Next / page numbers)
- **Remove the inline apply modal** — clicking "Apply Now" navigates to `/jobs/:id` (Job Detail page, issue #20)
- **Fetch department list from API** or keep static for now

**3. [`frontend/src/types/index.ts`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/frontend/src/types/index.ts)**

Add pagination types:
```typescript
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
```

Update `Job` interface (line 33) to match backend `JobSummaryResponse`:
```typescript
export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;  // was 'type'
  description: string;
  requirements: string;    // was string[] — now a text field from backend
  salaryMin?: number;
  salaryMax?: number;
  status: JobStatus;
  createdAt: string;
  updatedAt?: string;
}
```

**4. [`frontend/src/App.tsx`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/frontend/src/App.tsx)**

Update routes:
```tsx
<Route path="careers" element={<Careers />} />
<Route path="jobs" element={<Navigate to="/careers" replace />} />  {/* Redirect old path */}
```

### Acceptance Criteria
- [ ] Career portal fetches jobs from `GET /api/v1/public/jobs` (no hardcoded data)
- [ ] Search input is debounced (300ms) and calls API with `keyword` param
- [ ] Department and employment type filters pass as query params to API
- [ ] Loading skeleton shows while fetching
- [ ] Pagination controls work (page navigation)
- [ ] Empty state shown when no jobs match filters
- [ ] "Apply Now" / "View Details" navigates to `/jobs/:id`
- [ ] Page is accessible at `/careers` without authentication
- [ ] Old `/jobs` route redirects to `/careers`
- [ ] Responsive layout (grid on desktop, stack on mobile)

---

## Issue #20 · Build Job Detail view with Apply CTA

| Field | Value |
|-------|-------|
| **Type** | Frontend |
| **Labels** | `frontend`, `jobs`, `ui`, `priority: high` |
| **Milestone** | 2.2 — Job Management |
| **Schedule** | Dec 22 |
| **Estimate** | 3h |
| **Depends on** | #18 (public job API) |
| **Branch** | `feature/20-job-detail-page` |

### Description
Create a dedicated Job Detail page at `/jobs/:id` that shows the full job posting and an "Apply Now" call-to-action.

### Files to Create

**1. `frontend/src/pages/JobDetail.tsx`**

```tsx
// Route: /jobs/:id
// Fetches: jobService.getPublicJobById(id)
```

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  ← Back to Careers                              │
│                                                 │
│  Senior Full Stack Engineer (Java + React)      │
│  ┌─────────┐ ┌──────────┐ ┌───────────┐       │
│  │ Eng Dept│ │ SF, CA   │ │ Full Time │       │
│  └─────────┘ └──────────┘ └───────────┘       │
│  💰 $140,000 – $185,000                        │
│  📅 Posted Nov 20, 2026                         │
│                                                 │
│  ─────────────────────────────────────────       │
│                                                 │
│  About This Role                                │
│  [Full description text...]                     │
│                                                 │
│  Requirements                                   │
│  [Requirements text...]                         │
│                                                 │
│  ─────────────────────────────────────────       │
│                                                 │
│  ┌────────────────┐    ┌─────────────────┐     │
│  │  🔗 Share Job  │    │  ✨ Apply Now   │     │
│  └────────────────┘    └─────────────────┘     │
└─────────────────────────────────────────────────┘
```

**Component behavior:**
- `useParams()` to get `id` from URL
- `useEffect` to fetch `jobService.getPublicJobById(id)`
- Loading state with skeleton
- Error state: if job not found → show 404-style message or redirect to `/404`
- **"Apply Now" button logic:**
  - Not logged in → `navigate('/login', { state: { from: location } })` (redirects back after login)
  - Logged in as `CANDIDATE` → `navigate(`/applications/new?jobId=${id}`)` (application form in Week 3)
  - Logged in as `RECRUITER`/`ADMIN` → show "Manage Job" link to `/dashboard/jobs` instead
- **"Share Job" button** → `navigator.clipboard.writeText(window.location.href)` with toast "Link copied!"
- Format salary as currency: `$140,000 – $185,000`
- Format date: `Posted Nov 20, 2026`
- Responsive layout

**2. Update [`frontend/src/App.tsx`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/frontend/src/App.tsx)**

Add route:
```tsx
<Route path="jobs/:id" element={<JobDetail />} />
```

### Acceptance Criteria
- [ ] Job detail page loads at `/jobs/:id` and shows all job information
- [ ] Description and requirements render with proper formatting (paragraphs, line breaks)
- [ ] Salary displays as formatted currency range (or "Not specified" if null)
- [ ] "Apply Now" redirects to login if unauthenticated (with return URL)
- [ ] "Apply Now" navigates to application form if logged in as candidate
- [ ] Recruiters/admins see "Manage Job" instead of "Apply Now"
- [ ] "Share Job" copies URL to clipboard with feedback toast
- [ ] Non-existent job shows 404 message
- [ ] "Back to Careers" link works
- [ ] Page is shareable (direct URL access works)

---

## Issue #21 · Build Recruiter Job Management dashboard

| Field | Value |
|-------|-------|
| **Type** | Frontend |
| **Labels** | `frontend`, `jobs`, `ui`, `dashboard`, `priority: high` |
| **Milestone** | 2.2 — Job Management |
| **Schedule** | Dec 22–24 |
| **Estimate** | 5h |
| **Depends on** | #12 (security/auth), #17 (Job CRUD API) |
| **Branch** | `feature/21-recruiter-job-dashboard` |

### Description
Build the recruiter-only dashboard where they can create, edit, publish, close, and archive job postings. This replaces the hardcoded sample data in the existing [`Dashboard.tsx`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/frontend/src/pages/Dashboard.tsx).

### Files to Create

**1. `frontend/src/pages/recruiter/JobManagement.tsx`**

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Job Management                     [+ Create New Job]       │
│                                                              │
│  ┌──────┐ ┌──────────┐ ┌────────┐ ┌──────────┐ ┌─────────┐│
│  │ All  │ │  Draft   │ │ Active │ │  Closed  │ │Archived ││
│  └──────┘ └──────────┘ └────────┘ └──────────┘ └─────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Title              │ Dept   │ Status    │ Date │ Actions││
│  ├─────────────────────────────────────────────────────────┤│
│  │ Senior Engineer    │ Eng    │ 🟢 ACTIVE │ Nov20│ ✏️ 📋 ││
│  │ AI Engineer        │ AI     │ 🟡 DRAFT  │ Nov22│ ✏️ 🚀 ││
│  │ Product Designer   │ Design │ 🔴 CLOSED │ Nov24│    📦 ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  Showing 1–3 of 3 jobs                   [← Prev] [Next →] │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Fetch jobs from `GET /api/v1/jobs` (authenticated, returns recruiter's own jobs)
- **Status filter tabs**: All, Draft, Published, Closed, Archived — filter via query param or client-side
- **Job table** with columns: Title, Department, Type, Status (color-coded badge), Created Date, Actions
- **Action buttons per row:**
  - Edit (pencil icon) → opens edit modal/form
  - Publish (rocket icon) → `PATCH /api/v1/jobs/{id}/status` with `PUBLISHED`
  - Close (stop icon) → confirmation dialog, then PATCH with `CLOSED`
  - Archive (box icon) → PATCH with `ARCHIVED`
  - Delete (trash icon) → only for DRAFT, with confirmation
  - View (eye icon) → opens `/jobs/:id` in new tab
- **Pagination** matching backend response
- **Empty state** for new recruiters: "No jobs yet. Create your first job posting!"

**2. `frontend/src/pages/recruiter/CreateEditJobModal.tsx`** (or `CreateEditJobPage.tsx`)

**Form fields:**
| Field | Type | Validation |
|-------|------|------------|
| Title | text input | Required |
| Department | text input or select | Optional |
| Location | text input | Optional |
| Employment Type | dropdown (`FULL_TIME`, `PART_TIME`, `CONTRACT`, `REMOTE`, `INTERNSHIP`) | Required |
| Description | textarea (large, 6+ rows) | Required |
| Requirements | textarea | Optional |
| Salary Min | number input | Optional, must be ≥ 0 |
| Salary Max | number input | Optional, must be ≥ salaryMin |

**Behavior:**
- **Create mode**: `POST /api/v1/jobs` → save as DRAFT
- **Edit mode**: pre-fill form with existing data, `PUT /api/v1/jobs/{id}`
- Form validation before submission
- Loading state on submit
- On success: close modal, refresh job list, show success toast
- "Save as Draft" button (default) + "Save & Publish" button (creates then immediately publishes)

**3. Update [`frontend/src/services/jobService.ts`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/frontend/src/services/jobService.ts)**

Add missing methods:
```typescript
async getMyJobs(params?: { status?: string; page?: number; size?: number }): Promise<PaginatedResponse<Job>> {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Job>>>('/jobs', { params });
  return response.data.data!;
},

async updateJob(id: string, job: Partial<Job>): Promise<Job> {
  const response = await apiClient.put<ApiResponse<Job>>(`/jobs/${id}`, job);
  return response.data.data!;
},

async updateJobStatus(id: string, status: JobStatus): Promise<Job> {
  const response = await apiClient.patch<ApiResponse<Job>>(`/jobs/${id}/status`, { status });
  return response.data.data!;
},

async deleteJob(id: string): Promise<void> {
  await apiClient.delete(`/jobs/${id}`);
},
```

**4. Update [`frontend/src/App.tsx`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/frontend/src/App.tsx)**

Add protected route:
```tsx
<Route path="dashboard/jobs" element={
  <ProtectedRoute allowedRoles={['ROLE_RECRUITER', 'ROLE_ADMIN']}>
    <JobManagement />
  </ProtectedRoute>
} />
```

**5. Update [`frontend/src/components/layout/Navbar.tsx`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/frontend/src/components/layout/Navbar.tsx)**

Add "Manage Jobs" link in the nav for recruiter/admin roles (next to Dashboard).

**6. Update [`frontend/src/pages/Dashboard.tsx`](file:///C:/Users/CSE LAB 1/Documents/project/HireSync/frontend/src/pages/Dashboard.tsx)**

Update the "Create Job Requisition" button (line 94) to navigate to `/dashboard/jobs` instead of being a no-op. Update KPI cards to fetch real counts from API (or leave as static for now with a TODO comment).

### Status Badge Colors
| Status | Color | Badge |
|--------|-------|-------|
| `DRAFT` | Yellow | `bg-yellow-100 text-yellow-800` |
| `PUBLISHED` | Green | `bg-green-100 text-green-800` |
| `CLOSED` | Red | `bg-red-100 text-red-800` |
| `ARCHIVED` | Gray | `bg-slate-100 text-slate-600` |

### Acceptance Criteria
- [ ] Page is at `/dashboard/jobs`, protected for `RECRUITER` and `ADMIN` only
- [ ] Job list fetches from `GET /api/v1/jobs` (real API, no mock data)
- [ ] Status filter tabs work (All, Draft, Published, Closed, Archived)
- [ ] Create Job form opens, validates, and saves via `POST /api/v1/jobs`
- [ ] Edit Job form pre-fills data and saves via `PUT /api/v1/jobs/{id}`
- [ ] Publish action calls `PATCH /api/v1/jobs/{id}/status` with `PUBLISHED`
- [ ] Close action shows confirmation, then patches with `CLOSED`
- [ ] Delete action only available for DRAFT jobs, with confirmation
- [ ] Status badges are color-coded
- [ ] Pagination works
- [ ] Empty state shown for new recruiters
- [ ] Candidates cannot access the page (redirected)
- [ ] "Create Job Requisition" button on main Dashboard navigates here

---

## Summary Table

| # | Title | Type | Schedule | Est. | Depends |
|---|-------|------|----------|------|---------|
| 12 | Spring Security filter chain + RBAC | backend | Dec 11–12 | 4h | #10, #11 |
| 13 | Login page (real API) | frontend | Dec 13 | 3h | #10 |
| 14 | Registration page (real API) | frontend | Dec 13–14 | 3h | #9 |
| 15 | Auth store, session & route guards | frontend | Dec 15–16 | 4h | #13, #14 |
| 16 | Job entity & lifecycle states | backend | Dec 18 | 2h | #8 |
| 17 | Job CRUD REST endpoints | backend | Dec 18–19 | 4h | #12, #16 |
| 18 | Public job listing API | backend | Dec 19–20 | 2h | #16 |
| 19 | Career Portal page (real API) | frontend | Dec 20–21 | 4h | #18 |
| 20 | Job Detail view & Apply CTA | frontend | Dec 22 | 3h | #18 |
| 21 | Recruiter Job Management dashboard | frontend | Dec 22–24 | 5h | #12, #17 |
| | | | **Total** | **34h** | |
