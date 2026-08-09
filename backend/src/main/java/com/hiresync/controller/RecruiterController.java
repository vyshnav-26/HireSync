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
    private final com.hiresync.service.EmailService emailService;

    @PostMapping("/jobs")
    public ResponseEntity<com.hiresync.dto.JobPostingDto> createJob(@RequestBody com.hiresync.dto.JobPostingDto jobDto, 
                                                @AuthenticationPrincipal CustomUserDetails userDetails) {
        JobPosting job = new JobPosting();
        updateJobFromDto(job, jobDto);
        var user = userDetails.getUser();
        job.setRecruiter(user);
        
        if ((job.getCompany() == null || job.getCompany().isBlank()) && user.getProfile() != null && user.getProfile().getCompany() != null) {
            job.setCompany(user.getProfile().getCompany());
        }
        if ((job.getLocation() == null || job.getLocation().isBlank()) && user.getProfile() != null && user.getProfile().getLocation() != null) {
            job.setLocation(user.getProfile().getLocation());
        }
        
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
    public ResponseEntity<com.hiresync.dto.JobPostingDto> getJob(@PathVariable Long jobId, @AuthenticationPrincipal CustomUserDetails userDetails) {
        JobPosting job = jobPostingRepository.findById(jobId).orElse(null);
        if (job == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(convertToJobDto(job));
    }

    @PatchMapping("/jobs/{jobId}")
    public ResponseEntity<com.hiresync.dto.JobPostingDto> updateJob(@PathVariable Long jobId, @RequestBody com.hiresync.dto.JobPostingDto jobUpdates, @AuthenticationPrincipal CustomUserDetails userDetails) {
        JobPosting job = jobPostingRepository.findById(jobId).orElseThrow();
        if (!job.getRecruiter().getId().equals(userDetails.getUser().getId())) {
            return ResponseEntity.status(403).build();
        }
        updateJobFromDto(job, jobUpdates);
        
        if (job.getSalaryMin() != null && job.getSalaryMax() != null && job.getSalaryMin() > job.getSalaryMax()) {
            return ResponseEntity.badRequest().build();
        }
        
        jobPostingRepository.save(job);
        geminiAiService.recalculateAllCandidatesForJob(jobId);
        return ResponseEntity.ok(convertToJobDto(job));
    }

    @DeleteMapping("/jobs/{jobId}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Void> deleteJob(@PathVariable Long jobId, @AuthenticationPrincipal CustomUserDetails userDetails) {
        JobPosting job = jobPostingRepository.findById(jobId).orElse(null);
        if (job == null) {
            return ResponseEntity.notFound().build();
        }
        if (!job.getRecruiter().getId().equals(userDetails.getUser().getId())) {
            return ResponseEntity.status(403).build();
        }
        List<Application> apps = applicationRepository.findByJobPostingId(jobId);
        if (apps != null && !apps.isEmpty()) {
            applicationRepository.deleteAll(apps);
        }
        
        jobPostingRepository.delete(job);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/jobs/{jobId}/auto-select-top-n")
    public ResponseEntity<?> autoSelectTopN(
            @PathVariable Long jobId,
            @RequestBody java.util.Map<String, Integer> payload,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        JobPosting job = jobPostingRepository.findById(jobId).orElse(null);
        if (job == null) return ResponseEntity.notFound().build();
        if (!job.getRecruiter().getId().equals(userDetails.getUser().getId())) {
            return ResponseEntity.status(403).build();
        }

        int topN = payload.getOrDefault("topN", 5);
        List<Application> apps = applicationRepository.findByJobPostingId(jobId);
        if (apps.isEmpty()) {
            return ResponseEntity.ok(java.util.Map.of("message", "No applications found to select from", "selectedCount", 0));
        }

        // Rank applications by AI Score
        List<Application> rankedApps = new java.util.ArrayList<>(apps);
        rankedApps.sort((a, b) -> Integer.compare(
            b.getFitnessScore() != null ? b.getFitnessScore() : 0,
            a.getFitnessScore() != null ? a.getFitnessScore() : 0
        ));

        int selectedCount = 0;
        int rejectedCount = 0;

        String companyName = (job.getCompany() != null && !job.getCompany().isBlank()) ? job.getCompany() : "HireSync Network";

        for (int i = 0; i < rankedApps.size(); i++) {
            Application app = rankedApps.get(i);
            var candidate = app.getCandidate();
            var profile = candidate.getProfile();
            String candidateName = profile != null && profile.getFullName() != null ? profile.getFullName() : candidate.getEmail();

            if (i < topN) {
                app.setStatus(ApplicationStatus.SHORTLISTED);
                app.setCurrentPhaseIndex(0);
                app.setPhaseStatus("PASSED");
                selectedCount++;
            } else {
                if (app.getStatus() != ApplicationStatus.REJECTED) {
                    app.setStatus(ApplicationStatus.REJECTED);
                    app.setPhaseStatus("REJECTED");
                    rejectedCount++;
                    
                    String emailJson = emailService.sendInitialRejectionEmail(candidate.getEmail(), candidateName, job.getTitle(), companyName);
                    String existingLogs = app.getEmailLogs() != null ? app.getEmailLogs() : "";
                    app.setEmailLogs(existingLogs.isEmpty() ? emailJson : existingLogs + "," + emailJson);
                }
            }
            applicationRepository.save(app);
        }

        return ResponseEntity.ok(java.util.Map.of(
            "message", String.format("Successfully auto-selected top %d candidate(s)", selectedCount),
            "selectedCount", selectedCount,
            "rejectedCount", rejectedCount
        ));
    }

    @PostMapping("/applications/{appId}/advance-phase")
    public ResponseEntity<?> advancePhase(
            @PathVariable Long appId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Application app = applicationRepository.findById(appId).orElse(null);
        if (app == null) return ResponseEntity.notFound().build();
        
        JobPosting job = app.getJobPosting();
        if (!job.getRecruiter().getId().equals(userDetails.getUser().getId())) {
            return ResponseEntity.status(403).build();
        }

        if (app.getStatus() == ApplicationStatus.REJECTED || "REJECTED".equalsIgnoreCase(app.getPhaseStatus())) {
            return ResponseEntity.badRequest().body("Cannot advance a candidate who has been rejected.");
        }

        List<String> hiringPhases = List.of("Screening", "Group Discussion", "Assessment", "Technical Interview", "HR Interview");
        if (job.getHiringPhases() != null && !job.getHiringPhases().isBlank()) {
            try {
                hiringPhases = new com.fasterxml.jackson.databind.ObjectMapper().readValue(
                    job.getHiringPhases(),
                    new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {}
                );
            } catch (Exception e) {}
        }

        int currentIdx = app.getCurrentPhaseIndex() != null ? app.getCurrentPhaseIndex() : 0;
        int nextIdx = currentIdx + 1;

        var candidate = app.getCandidate();
        var profile = candidate.getProfile();
        String candidateName = profile != null && profile.getFullName() != null ? profile.getFullName() : candidate.getEmail();
        String companyName = (job.getCompany() != null && !job.getCompany().isBlank()) ? job.getCompany() : "HireSync Network";

        if (nextIdx >= hiringPhases.size()) {
            app.setStatus(ApplicationStatus.HIRED);
            app.setCurrentPhaseIndex(hiringPhases.size() - 1);
            app.setPhaseStatus("PASSED");

            String emailJson = emailService.sendFinalOfferEmail(candidate.getEmail(), candidateName, job.getTitle(), companyName);
            String existingLogs = app.getEmailLogs() != null ? app.getEmailLogs() : "";
            app.setEmailLogs(existingLogs.isEmpty() ? emailJson : existingLogs + "," + emailJson);
        } else {
            String currentPhaseName = hiringPhases.get(currentIdx);
            String nextPhaseName = hiringPhases.get(nextIdx);

            app.setCurrentPhaseIndex(nextIdx);
            app.setPhaseStatus("IN_PROGRESS");
            app.setStatus(ApplicationStatus.SHORTLISTED);

            String emailJson = emailService.sendPhaseAdvancementEmail(candidate.getEmail(), candidateName, job.getTitle(), companyName, currentPhaseName, nextPhaseName);
            String existingLogs = app.getEmailLogs() != null ? app.getEmailLogs() : "";
            app.setEmailLogs(existingLogs.isEmpty() ? emailJson : existingLogs + "," + emailJson);
        }

        applicationRepository.save(app);

        // Automatically reject all other active candidates in the previous phase who were not advanced
        if (nextIdx < hiringPhases.size()) {
            final int prevIdx = currentIdx;
            final String failedPhaseName = hiringPhases.get(prevIdx);
            List<Application> allJobApps = applicationRepository.findByJobPostingId(job.getId());
            for (Application otherApp : allJobApps) {
                if (!otherApp.getId().equals(app.getId()) &&
                    otherApp.getStatus() != ApplicationStatus.REJECTED &&
                    otherApp.getStatus() != ApplicationStatus.HIRED &&
                    (otherApp.getCurrentPhaseIndex() == null || otherApp.getCurrentPhaseIndex() <= prevIdx)) {
                    
                    otherApp.setStatus(ApplicationStatus.REJECTED);
                    otherApp.setPhaseStatus("REJECTED");
                    
                    var cand = otherApp.getCandidate();
                    var prof = cand.getProfile();
                    String name = prof != null && prof.getFullName() != null ? prof.getFullName() : cand.getEmail();
                    String emailLog = emailService.sendPhaseRejectionEmail(cand.getEmail(), name, job.getTitle(), companyName, failedPhaseName);
                    String logs = otherApp.getEmailLogs() != null ? otherApp.getEmailLogs() : "";
                    otherApp.setEmailLogs(logs.isEmpty() ? emailLog : logs + "," + emailLog);
                    applicationRepository.save(otherApp);
                }
            }
        }

        return ResponseEntity.ok(convertToDto(app));
    }

    @PostMapping("/applications/bulk-advance-phase")
    public ResponseEntity<?> bulkAdvancePhases(
            @RequestBody java.util.Map<String, Object> payload,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Object idsObj = payload.get("applicationIds");
        if (idsObj == null) {
            return ResponseEntity.badRequest().body("applicationIds list is required");
        }

        java.util.List<?> idList = (java.util.List<?>) idsObj;
        int advancedCount = 0;
        int autoRejectedCount = 0;
        java.util.List<com.hiresync.dto.ApplicationDetailDto> updatedList = new java.util.ArrayList<>();
        java.util.Set<Long> advancedAppIds = new java.util.HashSet<>();
        JobPosting targetJob = null;
        int advancedFromPhaseIdx = 0;
        String advancedFromPhaseName = "Screening";

        for (Object idItem : idList) {
            try {
                Long appId = Long.parseLong(idItem.toString());
                Application app = applicationRepository.findById(appId).orElse(null);
                if (app == null) continue;

                JobPosting job = app.getJobPosting();
                targetJob = job;

                if (app.getStatus() == ApplicationStatus.REJECTED || "REJECTED".equalsIgnoreCase(app.getPhaseStatus())) {
                    continue;
                }

                List<String> hiringPhases = List.of("Screening", "Group Discussion", "Assessment", "Technical Interview", "HR Interview");
                if (job.getHiringPhases() != null && !job.getHiringPhases().isBlank()) {
                    try {
                        hiringPhases = new com.fasterxml.jackson.databind.ObjectMapper().readValue(
                            job.getHiringPhases(),
                            new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {}
                        );
                    } catch (Exception e) {}
                }

                int currentIdx = app.getCurrentPhaseIndex() != null ? app.getCurrentPhaseIndex() : 0;
                advancedFromPhaseIdx = currentIdx;
                advancedFromPhaseName = hiringPhases.get(Math.min(currentIdx, hiringPhases.size() - 1));
                int nextIdx = currentIdx + 1;

                var candidate = app.getCandidate();
                var profile = candidate.getProfile();
                String candidateName = profile != null && profile.getFullName() != null ? profile.getFullName() : candidate.getEmail();
                String companyName = (job.getCompany() != null && !job.getCompany().isBlank()) ? job.getCompany() : "HireSync Network";

                if (nextIdx >= hiringPhases.size()) {
                    app.setStatus(ApplicationStatus.HIRED);
                    app.setCurrentPhaseIndex(hiringPhases.size() - 1);
                    app.setPhaseStatus("PASSED");

                    String emailJson = emailService.sendFinalOfferEmail(candidate.getEmail(), candidateName, job.getTitle(), companyName);
                    String existingLogs = app.getEmailLogs() != null ? app.getEmailLogs() : "";
                    app.setEmailLogs(existingLogs.isEmpty() ? emailJson : existingLogs + "," + emailJson);
                } else {
                    String currentPhaseName = hiringPhases.get(currentIdx);
                    String nextPhaseName = hiringPhases.get(nextIdx);

                    app.setCurrentPhaseIndex(nextIdx);
                    app.setPhaseStatus("IN_PROGRESS");
                    app.setStatus(ApplicationStatus.SHORTLISTED);

                    String emailJson = emailService.sendPhaseAdvancementEmail(candidate.getEmail(), candidateName, job.getTitle(), companyName, currentPhaseName, nextPhaseName);
                    String existingLogs = app.getEmailLogs() != null ? app.getEmailLogs() : "";
                    app.setEmailLogs(existingLogs.isEmpty() ? emailJson : existingLogs + "," + emailJson);
                }

                applicationRepository.save(app);
                advancedAppIds.add(app.getId());
                updatedList.add(convertToDto(app));
                advancedCount++;
            } catch (Exception e) {
                System.err.println("Error advancing candidate in bulk: " + e.getMessage());
            }
        }

        // Automatically reject all remaining candidates on this job opening who did not advance
        if (targetJob != null && !advancedAppIds.isEmpty()) {
            List<Application> remainingApps = applicationRepository.findByJobPostingId(targetJob.getId());
            String companyName = (targetJob.getCompany() != null && !targetJob.getCompany().isBlank()) ? targetJob.getCompany() : "HireSync Network";

            for (Application remApp : remainingApps) {
                if (!advancedAppIds.contains(remApp.getId()) &&
                    remApp.getStatus() != ApplicationStatus.REJECTED &&
                    remApp.getStatus() != ApplicationStatus.HIRED &&
                    (remApp.getCurrentPhaseIndex() == null || remApp.getCurrentPhaseIndex() <= advancedFromPhaseIdx)) {
                    
                    remApp.setStatus(ApplicationStatus.REJECTED);
                    remApp.setPhaseStatus("REJECTED");

                    var cand = remApp.getCandidate();
                    var prof = cand.getProfile();
                    String name = prof != null && prof.getFullName() != null ? prof.getFullName() : cand.getEmail();
                    String emailLog = emailService.sendPhaseRejectionEmail(cand.getEmail(), name, targetJob.getTitle(), companyName, advancedFromPhaseName);
                    String logs = remApp.getEmailLogs() != null ? remApp.getEmailLogs() : "";
                    remApp.setEmailLogs(logs.isEmpty() ? emailLog : logs + "," + emailLog);
                    applicationRepository.save(remApp);
                    autoRejectedCount++;
                }
            }
        }

        return ResponseEntity.ok(java.util.Map.of(
            "message", String.format("Advanced %d selected candidate(s). Automatically rejected %d candidate(s) who did not advance.", advancedCount, autoRejectedCount),
            "advancedCount", advancedCount,
            "autoRejectedCount", autoRejectedCount,
            "updatedApplications", updatedList
        ));
    }

    @PostMapping("/applications/{appId}/reject-phase")
    public ResponseEntity<?> rejectPhase(
            @PathVariable Long appId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Application app = applicationRepository.findById(appId).orElse(null);
        if (app == null) return ResponseEntity.notFound().build();
        
        JobPosting job = app.getJobPosting();
        if (!job.getRecruiter().getId().equals(userDetails.getUser().getId())) {
            return ResponseEntity.status(403).build();
        }

        if (app.getStatus() == ApplicationStatus.REJECTED) {
            return ResponseEntity.badRequest().body("Candidate is already rejected.");
        }

        List<String> hiringPhases = List.of("Screening", "Group Discussion", "Assessment", "Technical Interview", "HR Interview");
        if (job.getHiringPhases() != null && !job.getHiringPhases().isBlank()) {
            try {
                hiringPhases = new com.fasterxml.jackson.databind.ObjectMapper().readValue(
                    job.getHiringPhases(),
                    new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {}
                );
            } catch (Exception e) {}
        }

        int currentIdx = app.getCurrentPhaseIndex() != null ? app.getCurrentPhaseIndex() : 0;
        if (currentIdx >= hiringPhases.size()) currentIdx = hiringPhases.size() - 1;
        String phaseName = hiringPhases.get(currentIdx);

        var candidate = app.getCandidate();
        var profile = candidate.getProfile();
        String candidateName = profile != null && profile.getFullName() != null ? profile.getFullName() : candidate.getEmail();
        String companyName = (job.getCompany() != null && !job.getCompany().isBlank()) ? job.getCompany() : "HireSync Network";

        app.setStatus(ApplicationStatus.REJECTED);
        app.setPhaseStatus("REJECTED");

        String emailJson;
        if (currentIdx == 0) {
            emailJson = emailService.sendInitialRejectionEmail(candidate.getEmail(), candidateName, job.getTitle(), companyName);
        } else {
            emailJson = emailService.sendPhaseRejectionEmail(candidate.getEmail(), candidateName, job.getTitle(), companyName, phaseName);
        }
        
        String existingLogs = app.getEmailLogs() != null ? app.getEmailLogs() : "";
        app.setEmailLogs(existingLogs.isEmpty() ? emailJson : existingLogs + "," + emailJson);

        applicationRepository.save(app);
        return ResponseEntity.ok(convertToDto(app));
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
        if (dto.getHiringPhases() != null && !dto.getHiringPhases().isEmpty()) {
            try {
                job.setHiringPhases(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(dto.getHiringPhases()));
            } catch (Exception e) {}
        }
        if (dto.getQuestionnaire() != null && !dto.getQuestionnaire().isEmpty()) {
            try {
                job.setQuestionnaire(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(dto.getQuestionnaire()));
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
        String companyName = job.getCompany();
        if (companyName == null || companyName.isBlank()) {
            if (job.getRecruiter() != null && job.getRecruiter().getProfile() != null && job.getRecruiter().getProfile().getCompany() != null && !job.getRecruiter().getProfile().getCompany().isBlank()) {
                companyName = job.getRecruiter().getProfile().getCompany();
            } else {
                companyName = "HireSync Network";
            }
        }

        List<String> hiringPhases = List.of("Screening", "Group Discussion", "Assessment", "Technical Interview", "HR Interview");
        if (job.getHiringPhases() != null && !job.getHiringPhases().isBlank()) {
            try {
                hiringPhases = new com.fasterxml.jackson.databind.ObjectMapper().readValue(
                    job.getHiringPhases(),
                    new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {}
                );
            } catch (Exception e) {}
        }

        List<String> questionnaire = List.of();
        if (job.getQuestionnaire() != null && !job.getQuestionnaire().isBlank()) {
            try {
                questionnaire = new com.fasterxml.jackson.databind.ObjectMapper().readValue(
                    job.getQuestionnaire(),
                    new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {}
                );
            } catch (Exception e) {}
        }

        int applicantCount = 0;
        try {
            applicantCount = applicationRepository.findByJobPostingId(job.getId()).size();
        } catch (Exception e) {}

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
                .hiringPhases(hiringPhases)
                .questionnaire(questionnaire)
                .applicantCount(applicantCount)
                .build();
    }

    @PostMapping("/applications/{appId}/override")
    public ResponseEntity<com.hiresync.dto.ApplicationDetailDto> overrideApplicationState(
            @PathVariable Long appId,
            @RequestBody java.util.Map<String, Object> overrideData,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Application app = applicationRepository.findById(appId).orElseThrow();
        if (!app.getJobPosting().getRecruiter().getId().equals(userDetails.getUser().getId())) {
            return ResponseEntity.status(403).build();
        }
        if (overrideData.containsKey("status")) {
            String statusStr = overrideData.get("status").toString().toUpperCase();
            try {
                app.setStatus(ApplicationStatus.valueOf(statusStr));
            } catch (Exception e) {}
        }
        if (overrideData.containsKey("currentPhaseIndex") && overrideData.get("currentPhaseIndex") != null) {
            app.setCurrentPhaseIndex(((Number) overrideData.get("currentPhaseIndex")).intValue());
        }
        if (overrideData.containsKey("phaseStatus") && overrideData.get("phaseStatus") != null) {
            app.setPhaseStatus(overrideData.get("phaseStatus").toString());
        }
        if (overrideData.containsKey("fitnessScore") && overrideData.get("fitnessScore") != null) {
            app.setFitnessScore(((Number) overrideData.get("fitnessScore")).intValue());
        }
        applicationRepository.save(app);
        return ResponseEntity.ok(convertToDto(app));
    }

    @GetMapping("/applications/{appId}")
    public ResponseEntity<com.hiresync.dto.ApplicationDetailDto> getApplicationDetails(@PathVariable Long appId, @AuthenticationPrincipal CustomUserDetails userDetails) {
        Application app = applicationRepository.findById(appId).orElseThrow();
        if (!app.getJobPosting().getRecruiter().getId().equals(userDetails.getUser().getId())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(convertToDto(app));
    }

    @PatchMapping("/applications/{appId}")
    public ResponseEntity<com.hiresync.dto.ApplicationDetailDto> updateApplicationStatus(
            @PathVariable Long appId,
            @RequestBody java.util.Map<String, Object> updates,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Application app = applicationRepository.findById(appId).orElseThrow();
        if (!app.getJobPosting().getRecruiter().getId().equals(userDetails.getUser().getId())) {
            return ResponseEntity.status(403).build();
        }
        if (updates.containsKey("status")) {
            String statusStr = updates.get("status").toString().toUpperCase();
            try {
                ApplicationStatus newStatus = ApplicationStatus.valueOf(statusStr);
                app.setStatus(newStatus);
            } catch (Exception e) {}
        }
        if (updates.containsKey("feedback")) {
            app.setAiReasoning(updates.get("feedback").toString());
        }
        if (updates.containsKey("rating") && updates.get("rating") != null) {
            app.setFitnessScore(((Number)updates.get("rating")).intValue() * 20);
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
        candidateMap.put("name", profile != null && profile.getFullName() != null ? profile.getFullName() : candidate.getEmail());
        candidateMap.put("email", candidate.getEmail());
        candidateMap.put("headline", profile != null ? profile.getHeadline() : "");
        candidateMap.put("location", profile != null ? profile.getLocation() : "");
        candidateMap.put("experience", profile != null ? profile.getExperience() : "");
        candidateMap.put("bio", profile != null ? profile.getBio() : "");
        if (profile != null && profile.getSkills() != null && !profile.getSkills().isEmpty()) {
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

        List<String> hiringPhases = List.of("Screening", "Group Discussion", "Assessment", "Technical Interview", "HR Interview");
        if (job.getHiringPhases() != null && !job.getHiringPhases().isBlank()) {
            try {
                hiringPhases = new com.fasterxml.jackson.databind.ObjectMapper().readValue(
                    job.getHiringPhases(),
                    new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {}
                );
            } catch (Exception e) {}
        }

        int currentIdx = app.getCurrentPhaseIndex() != null ? app.getCurrentPhaseIndex() : 0;
        if (currentIdx >= hiringPhases.size()) currentIdx = hiringPhases.size() - 1;
        String currentPhaseName = hiringPhases.get(currentIdx);

        List<Object> emailLogList = new java.util.ArrayList<>();
        if (app.getEmailLogs() != null && !app.getEmailLogs().isBlank()) {
            try {
                String wrapped = "[" + app.getEmailLogs().replaceAll("^\\s*\\[|\\]\\s*$", "") + "]";
                emailLogList = new com.fasterxml.jackson.databind.ObjectMapper().readValue(
                    wrapped,
                    new com.fasterxml.jackson.core.type.TypeReference<List<Object>>() {}
                );
            } catch (Exception e) {}
        }

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
                .hiringPhases(hiringPhases)
                .currentPhaseIndex(currentIdx)
                .currentPhaseName(currentPhaseName)
                .phaseStatus(app.getPhaseStatus() != null ? app.getPhaseStatus() : "IN_PROGRESS")
                .emailLogs(emailLogList)
                .build();
    }

    @GetMapping("/jobs/{jobId}/candidates")
    public ResponseEntity<List<com.hiresync.dto.ApplicationDetailDto>> viewCandidates(@PathVariable Long jobId, @AuthenticationPrincipal CustomUserDetails userDetails) {
        JobPosting job = jobPostingRepository.findById(jobId).orElse(null);
        if (job == null) {
            return ResponseEntity.notFound().build();
        }
        List<Application> apps = applicationRepository.findByJobPostingId(jobId);
        List<com.hiresync.dto.ApplicationDetailDto> dtos = apps.stream()
            .map(this::convertToDto)
            .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/applications")
    public ResponseEntity<List<com.hiresync.dto.ApplicationDetailDto>> getAllApplications(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<Application> apps = applicationRepository.findAllByRecruiterIdWithDetails(userDetails.getUser().getId());
        return ResponseEntity.ok(apps.stream().map(this::convertToDto).toList());
    }

    @GetMapping("/candidates")
    public ResponseEntity<List<java.util.Map<String, Object>>> browseCandidates(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) String search) {
        List<Application> apps = applicationRepository.findAllByRecruiterIdWithDetails(userDetails.getUser().getId());
        java.util.Map<Long, java.util.Map<String, Object>> candidateMap = new java.util.HashMap<>();
        
        for (Application app : apps) {
            var candidate = app.getCandidate();
            var profile = candidate.getProfile();
            
            if (search != null && !search.trim().isEmpty()) {
                String s = search.toLowerCase();
                boolean matchesName = profile != null && profile.getFullName() != null && profile.getFullName().toLowerCase().contains(s);
                boolean matchesSkills = profile != null && profile.getSkills() != null && profile.getSkills().toLowerCase().contains(s);
                if (!matchesName && !matchesSkills) {
                    continue;
                }
            }
            
            int appScore = app.getFitnessScore() != null ? app.getFitnessScore() : 0;

            if (!candidateMap.containsKey(candidate.getId())) {
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", candidate.getId().toString());
                map.put("name", profile != null ? profile.getFullName() : candidate.getEmail());
                map.put("headline", profile != null ? profile.getHeadline() : "");
                map.put("location", profile != null ? profile.getLocation() : "");
                map.put("experience", profile != null ? profile.getExperience() : "");
                
                if (profile != null && profile.getSkills() != null && !profile.getSkills().isEmpty()) {
                    map.put("skills", profile.getSkills().split(","));
                } else {
                    map.put("skills", new String[0]);
                }
                map.put("matchScore", appScore);
                map.put("appliedJobs", 1);
                map.put("applicationId", app.getId().toString());
                map.put("applicationStatus", app.getStatus().name().toLowerCase());
                map.put("currentPhaseIndex", app.getCurrentPhaseIndex() != null ? app.getCurrentPhaseIndex() : 0);
                map.put("phaseStatus", app.getPhaseStatus() != null ? app.getPhaseStatus() : "IN_PROGRESS");
                map.put("jobId", app.getJobPosting().getId().toString());
                map.put("jobTitle", app.getJobPosting().getTitle());
                candidateMap.put(candidate.getId(), map);
            } else {
                var existing = candidateMap.get(candidate.getId());
                int applied = (Integer) existing.get("appliedJobs");
                existing.put("appliedJobs", applied + 1);
                
                int currentScore = (Integer) existing.get("matchScore");
                if (appScore > currentScore) {
                    existing.put("matchScore", appScore);
                    existing.put("applicationId", app.getId().toString());
                    existing.put("applicationStatus", app.getStatus().name().toLowerCase());
                    existing.put("currentPhaseIndex", app.getCurrentPhaseIndex() != null ? app.getCurrentPhaseIndex() : 0);
                    existing.put("phaseStatus", app.getPhaseStatus() != null ? app.getPhaseStatus() : "IN_PROGRESS");
                    existing.put("jobId", app.getJobPosting().getId().toString());
                    existing.put("jobTitle", app.getJobPosting().getTitle());
                }
            }
        }
        
        List<java.util.Map<String, Object>> result = new java.util.ArrayList<>(candidateMap.values());
        result.sort((a, b) -> Integer.compare((Integer) b.get("matchScore"), (Integer) a.get("matchScore")));
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/profile")
    public ResponseEntity<com.hiresync.dto.RecruiterProfileDto> getProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        var user = userDetails.getUser();
        var profile = user.getProfile();
        return ResponseEntity.ok(com.hiresync.dto.RecruiterProfileDto.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .name(profile != null ? profile.getFullName() : user.getEmail())
                .userType(user.getRole().name().toLowerCase())
                .company(profile != null ? profile.getCompany() : "")
                .position(profile != null ? profile.getPosition() : "")
                .build());
    }

    @PatchMapping("/profile")
    public ResponseEntity<com.hiresync.dto.RecruiterProfileDto> updateProfile(
            @RequestBody com.hiresync.dto.RecruiterProfileDto updates,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        var user = userDetails.getUser();
        var profile = user.getProfile();
        
        if (updates.getEmail() != null && !updates.getEmail().isEmpty()) user.setEmail(updates.getEmail());
        if (profile != null) {
            if (updates.getName() != null) profile.setFullName(updates.getName());
            if (updates.getCompany() != null) profile.setCompany(updates.getCompany());
            if (updates.getPosition() != null) profile.setPosition(updates.getPosition());
        }
        
        userRepository.save(user);

        return ResponseEntity.ok(com.hiresync.dto.RecruiterProfileDto.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .name(profile != null ? profile.getFullName() : user.getEmail())
                .userType(user.getRole().name().toLowerCase())
                .company(profile != null ? profile.getCompany() : "")
                .position(profile != null ? profile.getPosition() : "")
                .build());
    }
}
