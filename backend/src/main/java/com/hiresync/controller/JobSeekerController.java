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
        
        // Direct in-PostgreSQL storage option (Base64 data URI)
        try {
            byte[] fileBytes = file.getBytes();
            String base64Data = java.util.Base64.getEncoder().encodeToString(fileBytes);
            user.getProfile().setResumeData(base64Data);
        } catch (Exception e) {
            System.err.println("Could not cache resume in PostgreSQL: " + e.getMessage());
        }
        
        userRepository.save(user);
        return ResponseEntity.ok(uri);
    }

    @GetMapping("/jobs")
    public ResponseEntity<org.springframework.data.domain.Page<com.hiresync.dto.JobPostingDto>> listJobs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String workType,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        
        String searchPattern = (search != null && !search.trim().isEmpty()) ? "%" + search.trim().toLowerCase() + "%" : null;
        String locationPattern = (location != null && !location.trim().isEmpty()) ? "%" + location.trim().toLowerCase() + "%" : null;
        String workTypeParam = (workType != null && !workType.trim().isEmpty()) ? workType.trim().toLowerCase() : null;
        
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(Math.max(0, page - 1), limit);
        org.springframework.data.domain.Page<JobPosting> jobPage = jobPostingRepository.searchOpenJobs(searchPattern, locationPattern, workTypeParam, pageable);
        
        return ResponseEntity.ok(jobPage.map(this::convertToJobDto));
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
        
        String companyName = job.getCompany();
        if (companyName == null || companyName.isBlank()) {
            if (job.getRecruiter() != null && job.getRecruiter().getProfile() != null && job.getRecruiter().getProfile().getCompany() != null && !job.getRecruiter().getProfile().getCompany().isBlank()) {
                companyName = job.getRecruiter().getProfile().getCompany();
            } else {
                companyName = "HireSync Network";
            }
        }

        return com.hiresync.dto.JobPostingDto.builder()
                .id(job.getId().toString())
                .title(job.getTitle() != null ? job.getTitle() : "Untitled")
                .company(companyName)
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
    public ResponseEntity<?> applyForJob(@PathVariable Long jobId, 
                                         @RequestBody(required = false) String criteriaAnswers, 
                                         @AuthenticationPrincipal CustomUserDetails userDetails) {
        var user = userDetails.getUser();
        var profile = user.getProfile();
        
        if (profile == null || profile.getResumeUri() == null || profile.getResumeUri().isBlank() || profile.getSkills() == null || profile.getSkills().isBlank()) {
            return ResponseEntity.badRequest().body("Incomplete profile. Please upload your resume and fill in your skills before applying.");
        }

        var job = jobPostingRepository.findById(jobId).orElseThrow();
        
        if (applicationRepository.findByCandidateIdAndJobPostingId(user.getId(), jobId).isPresent()) {
            return ResponseEntity.badRequest().body("Already applied to this job");
        }
        
        String companyName = (job.getCompany() != null && !job.getCompany().isBlank()) ? job.getCompany() : 
            (job.getRecruiter() != null && job.getRecruiter().getProfile() != null ? job.getRecruiter().getProfile().getCompany() : "HireSync Network");

        String coverLetterText = criteriaAnswers;
        if (coverLetterText == null || coverLetterText.isBlank() || coverLetterText.trim().equals("{}") || coverLetterText.trim().equals("{\"text\": \"\"}")) {
            coverLetterText = geminiAiService.generateCoverLetter(profile.getFullName(), profile.getHeadline(), profile.getSkills(), job.getTitle(), companyName, job.getDescription());
        } else if (!coverLetterText.trim().startsWith("{") && !coverLetterText.trim().startsWith("[")) {
            // Keep plain text as is
        }

        String jsonAnswers = "{\"text\": \"" + coverLetterText.replace("\"", "\\\"").replace("\n", "\\n") + "\"}";

        var eval = geminiAiService.evaluateCandidateWithDetails(profile.getResumeUri(), profile.getSkills(), job.getDescription(), job.getRequirements());

        Application app = Application.builder()
                .candidate(user)
                .jobPosting(job)
                .resumeUriSnapshot(profile.getResumeUri())
                .customCriteriaAnswers(jsonAnswers)
                .aiReasoning(eval.getReasoning())
                .status(ApplicationStatus.APPLIED)
                .fitnessScore(eval.getScore())
                .build();
        
        applicationRepository.save(app);
        return ResponseEntity.ok("Applied successfully");
    }

    @PostMapping("/jobs/auto-apply")
    public ResponseEntity<?> autoApply(@AuthenticationPrincipal CustomUserDetails userDetails) {
        var user = userDetails.getUser();
        var profile = user.getProfile();
        if (profile == null || profile.getResumeUri() == null || profile.getResumeUri().isBlank() || profile.getSkills() == null || profile.getSkills().isBlank()) {
            return ResponseEntity.badRequest().body("Incomplete profile. Please upload your resume and add skills to use AI Auto-Apply.");
        }
        
        List<JobPosting> openJobs = jobPostingRepository.findAll().stream()
            .filter(j -> j.getStatus() == null || "open".equalsIgnoreCase(j.getStatus()) || "active".equalsIgnoreCase(j.getStatus()))
            .toList();

        List<String> autoAppliedJobTitles = new java.util.ArrayList<>();
        for (JobPosting job : openJobs) {
            if (applicationRepository.findByCandidateIdAndJobPostingId(user.getId(), job.getId()).isEmpty()) {
                var eval = geminiAiService.evaluateCandidateWithDetails(profile.getResumeUri(), profile.getSkills(), job.getDescription(), job.getRequirements());
                if (eval.getScore() >= 80) {
                    String companyName = (job.getCompany() != null && !job.getCompany().isBlank()) ? job.getCompany() : 
                        (job.getRecruiter() != null && job.getRecruiter().getProfile() != null ? job.getRecruiter().getProfile().getCompany() : "HireSync Network");
                    
                    String generatedLetter = geminiAiService.generateCoverLetter(profile.getFullName(), profile.getHeadline(), profile.getSkills(), job.getTitle(), companyName, job.getDescription());
                    String jsonAnswers = "{\"auto_applied\": true, \"matched_score\": " + eval.getScore() + ", \"text\": \"" + generatedLetter.replace("\"", "\\\"").replace("\n", "\\n") + "\"}";

                    Application app = Application.builder()
                            .candidate(user)
                            .jobPosting(job)
                            .resumeUriSnapshot(profile.getResumeUri())
                            .customCriteriaAnswers(jsonAnswers)
                            .aiReasoning(eval.getReasoning())
                            .status(ApplicationStatus.APPLIED)
                            .fitnessScore(eval.getScore())
                            .build();
                    applicationRepository.save(app);
                    autoAppliedJobTitles.add(job.getTitle() + " (" + eval.getScore() + "% Match)");
                }
            }
        }
        
        java.util.Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("count", autoAppliedJobTitles.size());
        resp.put("appliedJobs", autoAppliedJobTitles);
        return ResponseEntity.ok(resp);
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

        String companyName = (job.getCompany() != null && !job.getCompany().isBlank()) ? job.getCompany() : 
            (job.getRecruiter() != null && job.getRecruiter().getProfile() != null && job.getRecruiter().getProfile().getCompany() != null && !job.getRecruiter().getProfile().getCompany().isBlank() 
                ? job.getRecruiter().getProfile().getCompany() : "HireSync Network");

        java.util.Map<String, Object> jobMap = new java.util.HashMap<>();
        jobMap.put("id", job.getId().toString());
        jobMap.put("title", job.getTitle());
        jobMap.put("company", companyName); 

        return com.hiresync.dto.ApplicationDetailDto.builder()
                .id(app.getId().toString())
                .jobId(job.getId().toString())
                .candidateId(candidate.getId().toString())
                .status(app.getStatus().name().toLowerCase())
                .appliedDate("2026-08-01T00:00:00Z")
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
        
        if (updates.getEmail() != null && !updates.getEmail().trim().isEmpty()) user.setEmail(updates.getEmail());
        if (updates.getName() != null && !updates.getName().trim().isEmpty()) profile.setFullName(updates.getName());
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

    @GetMapping("/resumes/{filename:.+}")
    public ResponseEntity<org.springframework.core.io.Resource> getResumeFile(@PathVariable String filename) {
        try {
            java.nio.file.Path filePath = java.nio.file.Paths.get("uploads/resumes").resolve(filename).normalize();
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                        .body(resource);
            }
        } catch (Exception e) {
            System.err.println("Could not read local file: " + e.getMessage());
        }
        return ResponseEntity.notFound().build();
    }
}
