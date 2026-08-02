package com.hiresync.controller;

import com.hiresync.config.CustomUserDetails;
import com.hiresync.entity.Application;
import com.hiresync.entity.ApplicationStatus;
import com.hiresync.entity.JobPosting;
import com.hiresync.event.ApplicationStatusEvent;
import com.hiresync.repository.ApplicationRepository;
import com.hiresync.repository.JobPostingRepository;
import com.hiresync.service.GeminiAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/recruiter")
@RequiredArgsConstructor
public class RecruiterController {

    private final JobPostingRepository jobPostingRepository;
    private final ApplicationRepository applicationRepository;
    private final GeminiAiService geminiAiService;
    private final ApplicationEventPublisher eventPublisher;
    private final com.hiresync.repository.UserRepository userRepository;

    @PostMapping("/jobs")
    public ResponseEntity<com.hiresync.dto.JobPostingDto> createJob(@RequestBody com.hiresync.dto.JobPostingDto jobDto, 
                                                @AuthenticationPrincipal CustomUserDetails userDetails) {
        JobPosting job = new JobPosting();
        updateJobFromDto(job, jobDto);
        job.setRecruiter(userDetails.getUser());
        job.setStartDate(java.time.LocalDateTime.now());
        job = jobPostingRepository.save(job);
        return ResponseEntity.ok(convertToJobDto(job));
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<com.hiresync.dto.JobPostingDto>> getJobs(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<JobPosting> jobs = jobPostingRepository.findByRecruiterId(userDetails.getUser().getId());
        return ResponseEntity.ok(jobs.stream().map(this::convertToJobDto).toList());
    }

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<com.hiresync.dto.JobPostingDto> getJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(convertToJobDto(jobPostingRepository.findById(jobId).orElseThrow()));
    }

    @PatchMapping("/jobs/{jobId}")
    public ResponseEntity<com.hiresync.dto.JobPostingDto> updateJob(@PathVariable Long jobId, @RequestBody com.hiresync.dto.JobPostingDto jobUpdates) {
        JobPosting job = jobPostingRepository.findById(jobId).orElseThrow();
        updateJobFromDto(job, jobUpdates);
        jobPostingRepository.save(job);
        
        geminiAiService.recalculateAllCandidatesForJob(jobId);
        
        return ResponseEntity.ok(convertToJobDto(job));
    }

    @DeleteMapping("/jobs/{jobId}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long jobId) {
        jobPostingRepository.deleteById(jobId);
        return ResponseEntity.noContent().build();
    }

    private void updateJobFromDto(JobPosting job, com.hiresync.dto.JobPostingDto dto) {
        if (dto.getTitle() != null) job.setTitle(dto.getTitle());
        if (dto.getDescription() != null) job.setDescription(dto.getDescription());
        if (dto.getCompany() != null) job.setCompany(dto.getCompany());
        if (dto.getLocation() != null) job.setLocation(dto.getLocation());
        if (dto.getWorkType() != null) job.setWorkType(dto.getWorkType());
        if (dto.getStatus() != null) job.setStatus(dto.getStatus());
        if (dto.getRequirements() != null) job.setRequirements(dto.getRequirements());
        if (dto.getSalary() != null) {
            if (dto.getSalary().get("min") != null) job.setSalaryMin(((Number)dto.getSalary().get("min")).intValue());
            if (dto.getSalary().get("max") != null) job.setSalaryMax(((Number)dto.getSalary().get("max")).intValue());
            if (dto.getSalary().get("currency") != null) job.setSalaryCurrency(dto.getSalary().get("currency").toString());
        }
        if (dto.getCustomCriteria() != null) {
            try {
                job.setCustomCriteria(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(dto.getCustomCriteria()));
            } catch (Exception e) {}
        }
    }

    private com.hiresync.dto.JobPostingDto convertToJobDto(JobPosting job) {
        java.util.Map<String, Object> salaryMap = null;
        if (job.getSalaryMin() != null || job.getSalaryMax() != null) {
            salaryMap = new java.util.HashMap<>();
            if (job.getSalaryMin() != null) salaryMap.put("min", job.getSalaryMin());
            if (job.getSalaryMax() != null) salaryMap.put("max", job.getSalaryMax());
            if (job.getSalaryCurrency() != null) salaryMap.put("currency", job.getSalaryCurrency());
        }
        Object customCriteria = null;
        if (job.getCustomCriteria() != null) {
            try {
                customCriteria = new com.fasterxml.jackson.databind.ObjectMapper().readValue(job.getCustomCriteria(), Object.class);
            } catch (Exception e) {}
        }
        return com.hiresync.dto.JobPostingDto.builder()
                .id(job.getId().toString())
                .title(job.getTitle() != null ? job.getTitle() : "Untitled")
                .company(job.getCompany() != null ? job.getCompany() : "Unknown Company")
                .location(job.getLocation() != null ? job.getLocation() : "Remote")
                .workType(job.getWorkType() != null ? job.getWorkType() : "full-time")
                .description(job.getDescription() != null ? job.getDescription() : "")
                .requirements(job.getRequirements() != null ? job.getRequirements() : java.util.Collections.emptyList())
                .status(job.getStatus() != null ? job.getStatus() : "open")
                .recruiterId(job.getRecruiter().getId().toString())
                .postedDate(job.getStartDate() != null ? job.getStartDate().toString() : java.time.LocalDateTime.now().toString())
                .customCriteria(customCriteria)
                .salary(salaryMap)
                .build();
    }

    @GetMapping("/jobs/{jobId}/candidates")
    public ResponseEntity<List<com.hiresync.dto.ApplicationDetailDto>> viewCandidates(@PathVariable Long jobId) {
        List<Application> apps = applicationRepository.findByJobPostingId(jobId);
        List<com.hiresync.dto.ApplicationDetailDto> dtos = apps.stream()
            .map(this::convertToDto)
            .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/applications")
    public ResponseEntity<List<com.hiresync.dto.ApplicationDetailDto>> getAllApplications(@AuthenticationPrincipal CustomUserDetails userDetails) {
        // Fetch all jobs for the recruiter
        List<JobPosting> jobs = jobPostingRepository.findByRecruiterId(userDetails.getUser().getId());
        List<com.hiresync.dto.ApplicationDetailDto> dtos = new java.util.ArrayList<>();
        for (JobPosting job : jobs) {
            List<Application> apps = applicationRepository.findByJobPostingId(job.getId());
            for (Application app : apps) {
                dtos.add(convertToDto(app));
            }
        }
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/candidates")
    public ResponseEntity<List<java.util.Map<String, Object>>> browseCandidates(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<JobPosting> jobs = jobPostingRepository.findByRecruiterId(userDetails.getUser().getId());
        java.util.Map<Long, java.util.Map<String, Object>> candidateMap = new java.util.HashMap<>();
        
        for (JobPosting job : jobs) {
            List<Application> apps = applicationRepository.findByJobPostingId(job.getId());
            for (Application app : apps) {
                var candidate = app.getCandidate();
                var profile = candidate.getProfile();
                
                if (!candidateMap.containsKey(candidate.getId())) {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", candidate.getId().toString());
                    map.put("name", profile.getFullName());
                    map.put("headline", profile.getHeadline());
                    map.put("location", profile.getLocation());
                    map.put("experience", profile.getExperience());
                    
                    if (profile.getSkills() != null && !profile.getSkills().isEmpty()) {
                        map.put("skills", profile.getSkills().split(","));
                    } else {
                        map.put("skills", new String[0]);
                    }
                    map.put("matchScore", app.getFitnessScore() != null ? app.getFitnessScore() : 0);
                    map.put("appliedJobs", 1);
                    candidateMap.put(candidate.getId(), map);
                } else {
                    var existing = candidateMap.get(candidate.getId());
                    int applied = (Integer) existing.get("appliedJobs");
                    existing.put("appliedJobs", applied + 1);
                    
                    // Update max matchScore
                    int currentScore = (Integer) existing.get("matchScore");
                    int appScore = app.getFitnessScore() != null ? app.getFitnessScore() : 0;
                    if (appScore > currentScore) {
                        existing.put("matchScore", appScore);
                    }
                }
            }
        }
        
        return ResponseEntity.ok(new java.util.ArrayList<>(candidateMap.values()));
    }

    @GetMapping("/applications/{appId}")
    public ResponseEntity<com.hiresync.dto.ApplicationDetailDto> getApplication(@PathVariable Long appId) {
        Application app = applicationRepository.findById(appId).orElseThrow();
        return ResponseEntity.ok(convertToDto(app));
    }

    @PatchMapping("/applications/{appId}")
    public ResponseEntity<com.hiresync.dto.ApplicationDetailDto> updateApplication(
            @PathVariable Long appId,
            @RequestBody java.util.Map<String, Object> updates) {
        Application app = applicationRepository.findById(appId).orElseThrow();
        
        if (updates.containsKey("status")) {
            ApplicationStatus status = ApplicationStatus.valueOf(updates.get("status").toString().toUpperCase());
            app.setStatus(status);
            eventPublisher.publishEvent(new ApplicationStatusEvent(this, app));
        }
        
        applicationRepository.save(app);
        return ResponseEntity.ok(convertToDto(app));
    }

    private com.hiresync.dto.ApplicationDetailDto convertToDto(Application app) {
        var candidate = app.getCandidate();
        var profile = candidate.getProfile();
        var job = app.getJobPosting();
        
        java.util.Map<String, Object> candidateMap = new java.util.HashMap<>();
        candidateMap.put("id", candidate.getId().toString());
        candidateMap.put("name", profile.getFullName());
        candidateMap.put("email", candidate.getEmail());
        candidateMap.put("headline", profile.getHeadline());
        candidateMap.put("location", profile.getLocation());
        candidateMap.put("experience", profile.getExperience());
        candidateMap.put("bio", profile.getBio());
        if (profile.getSkills() != null && !profile.getSkills().isEmpty()) {
            candidateMap.put("skills", profile.getSkills().split(","));
        } else {
            candidateMap.put("skills", new String[0]);
        }

        java.util.Map<String, Object> jobMap = new java.util.HashMap<>();
        jobMap.put("id", job.getId().toString());
        jobMap.put("title", job.getTitle());
        jobMap.put("company", "HireSync"); // Default or from job if available

        return com.hiresync.dto.ApplicationDetailDto.builder()
                .id(app.getId().toString())
                .jobId(job.getId().toString())
                .candidateId(candidate.getId().toString())
                .status(app.getStatus().name().toLowerCase())
                .appliedDate("2026-08-01T00:00:00Z") // Mocked since Application entity has no appliedDate
                .coverLetter(app.getCustomCriteriaAnswers()) // Use this for cover letter content
                .aiScore(app.getFitnessScore())
                .aiFeedback(app.getAiReasoning())
                .job(jobMap)
                .candidate(candidateMap)
                .build();
    }

    @GetMapping("/profile")
    public ResponseEntity<com.hiresync.dto.RecruiterProfileDto> getProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        var user = userDetails.getUser();
        var profile = user.getProfile();
        return ResponseEntity.ok(com.hiresync.dto.RecruiterProfileDto.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .name(profile.getFullName())
                .userType(user.getRole().name().toLowerCase())
                .company(profile.getCompany())
                .position(profile.getPosition())
                .build());
    }

    @PatchMapping("/profile")
    public ResponseEntity<com.hiresync.dto.RecruiterProfileDto> updateProfile(
            @RequestBody com.hiresync.dto.RecruiterProfileDto updates,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        var user = userDetails.getUser();
        var profile = user.getProfile();
        
        if (updates.getEmail() != null && !updates.getEmail().isEmpty()) user.setEmail(updates.getEmail());
        if (updates.getName() != null) profile.setFullName(updates.getName());
        if (updates.getCompany() != null) profile.setCompany(updates.getCompany());
        if (updates.getPosition() != null) profile.setPosition(updates.getPosition());
        
        userRepository.save(user);

        return ResponseEntity.ok(com.hiresync.dto.RecruiterProfileDto.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .name(profile.getFullName())
                .userType(user.getRole().name().toLowerCase())
                .company(profile.getCompany())
                .position(profile.getPosition())
                .build());
    }
}
