package com.hiresync.controller;

import com.hiresync.config.CustomUserDetails;
import com.hiresync.entity.Application;
import com.hiresync.entity.ApplicationStatus;
import com.hiresync.entity.JobPosting;
import com.hiresync.repository.ApplicationRepository;
import com.hiresync.repository.JobPostingRepository;
import com.hiresync.service.GeminiAiService;
import com.hiresync.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/job-seeker")
@RequiredArgsConstructor
public class JobSeekerController {

    private final StorageService storageService;
    private final JobPostingRepository jobPostingRepository;
    private final ApplicationRepository applicationRepository;
    private final GeminiAiService geminiAiService;
    private final com.hiresync.repository.UserRepository userRepository;

    @PostMapping("/resume")
    public ResponseEntity<String> uploadResume(@RequestParam("file") MultipartFile file, 
                                               @AuthenticationPrincipal CustomUserDetails userDetails) throws IOException {
        String uri = storageService.uploadFile(file);
        var user = userDetails.getUser();
        user.getProfile().setResumeUri(uri);
        return ResponseEntity.ok(uri);
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<com.hiresync.dto.JobPostingDto>> listJobs() {
        List<JobPosting> jobs = jobPostingRepository.findAll();
        return ResponseEntity.ok(jobs.stream().map(this::convertToJobDto).toList());
    }

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<com.hiresync.dto.JobPostingDto> getJob(@PathVariable Long jobId) {
        JobPosting job = jobPostingRepository.findById(jobId).orElseThrow();
        return ResponseEntity.ok(convertToJobDto(job));
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

    @PostMapping("/jobs/{jobId}/apply")
    public ResponseEntity<String> applyForJob(@PathVariable Long jobId, 
                                              @RequestBody String criteriaAnswers, 
                                              @AuthenticationPrincipal CustomUserDetails userDetails) {
        var user = userDetails.getUser();
        var job = jobPostingRepository.findById(jobId).orElseThrow();
        
        String aiReasoning = geminiAiService.evaluateCandidate(user.getProfile().getResumeUri(), job.getDescription(), criteriaAnswers);

        Application app = Application.builder()
                .candidate(user)
                .jobPosting(job)
                .resumeUriSnapshot(user.getProfile().getResumeUri())
                .customCriteriaAnswers(criteriaAnswers)
                .aiReasoning(aiReasoning)
                .status(ApplicationStatus.APPLIED)
                .fitnessScore(85)
                .build();
        
        applicationRepository.save(app);
        return ResponseEntity.ok("Applied successfully");
    }

    @GetMapping("/applications")
    public ResponseEntity<List<com.hiresync.dto.ApplicationDetailDto>> getMyApplications(@AuthenticationPrincipal CustomUserDetails userDetails) {
        var user = userDetails.getUser();
        List<Application> applications = applicationRepository.findByCandidateId(user.getId());
        List<com.hiresync.dto.ApplicationDetailDto> dtos = applications.stream()
            .map(this::convertToDto)
            .toList();
        return ResponseEntity.ok(dtos);
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
        jobMap.put("company", "HireSync"); 

        return com.hiresync.dto.ApplicationDetailDto.builder()
                .id(app.getId().toString())
                .jobId(job.getId().toString())
                .candidateId(candidate.getId().toString())
                .status(app.getStatus().name().toLowerCase())
                .appliedDate("2026-08-01T00:00:00Z") // mock
                .coverLetter(app.getCustomCriteriaAnswers())
                .aiScore(app.getFitnessScore())
                .aiFeedback(app.getAiReasoning())
                .job(jobMap)
                .candidate(candidateMap)
                .build();
    }

    @GetMapping("/profile")
    public ResponseEntity<com.hiresync.dto.CandidateProfileDto> getProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        var user = userDetails.getUser();
        var profile = user.getProfile();
        return ResponseEntity.ok(com.hiresync.dto.CandidateProfileDto.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .name(profile.getFullName())
                .userType(user.getRole().name().toLowerCase())
                .headline(profile.getHeadline())
                .bio(profile.getBio())
                .location(profile.getLocation())
                .skills(profile.getSkills() != null && !profile.getSkills().isEmpty() ? profile.getSkills().split(",") : new String[0])
                .experience(profile.getExperience())
                .resume(profile.getResumeUri())
                .build());
    }

    @PatchMapping("/profile")
    public ResponseEntity<com.hiresync.dto.CandidateProfileDto> updateProfile(
            @RequestBody com.hiresync.dto.CandidateProfileDto updates,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        var user = userDetails.getUser();
        var profile = user.getProfile();
        
        if (updates.getEmail() != null && !updates.getEmail().isEmpty()) user.setEmail(updates.getEmail());
        if (updates.getName() != null) profile.setFullName(updates.getName());
        if (updates.getBio() != null) profile.setBio(updates.getBio());
        if (updates.getHeadline() != null) profile.setHeadline(updates.getHeadline());
        if (updates.getLocation() != null) profile.setLocation(updates.getLocation());
        if (updates.getResume() != null) profile.setResumeUri(updates.getResume());
        if (updates.getExperience() != null) profile.setExperience(updates.getExperience());
        if (updates.getSkills() != null) profile.setSkills(String.join(",", updates.getSkills()));
        
        userRepository.save(user);

        return ResponseEntity.ok(com.hiresync.dto.CandidateProfileDto.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .name(profile.getFullName())
                .userType(user.getRole().name().toLowerCase())
                .headline(profile.getHeadline())
                .bio(profile.getBio())
                .location(profile.getLocation())
                .skills(profile.getSkills() != null && !profile.getSkills().isEmpty() ? profile.getSkills().split(",") : new String[0])
                .experience(profile.getExperience())
                .resume(profile.getResumeUri())
                .build());
    }
}
