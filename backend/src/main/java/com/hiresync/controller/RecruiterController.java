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

    @PostMapping("/jobs")
    public ResponseEntity<JobPosting> createJob(@RequestBody JobPosting job, 
                                                @AuthenticationPrincipal CustomUserDetails userDetails) {
        job.setRecruiter(userDetails.getUser());
        return ResponseEntity.ok(jobPostingRepository.save(job));
    }

    @PutMapping("/jobs/{jobId}")
    public ResponseEntity<JobPosting> updateJob(@PathVariable Long jobId, @RequestBody JobPosting jobUpdates) {
        JobPosting job = jobPostingRepository.findById(jobId).orElseThrow();
        job.setDescription(jobUpdates.getDescription());
        job.setCustomCriteria(jobUpdates.getCustomCriteria());
        jobPostingRepository.save(job);
        
        geminiAiService.recalculateAllCandidatesForJob(jobId);
        
        return ResponseEntity.ok(job);
    }

    @GetMapping("/jobs/{jobId}/candidates")
    public ResponseEntity<List<Application>> viewCandidates(@PathVariable Long jobId) {
        return ResponseEntity.ok(applicationRepository.findByJobPostingId(jobId));
    }

    @PatchMapping("/applications/{appId}/status")
    public ResponseEntity<String> updateStatus(@PathVariable Long appId, @RequestParam ApplicationStatus status) {
        Application app = applicationRepository.findById(appId).orElseThrow();
        app.setStatus(status);
        applicationRepository.save(app);
        
        eventPublisher.publishEvent(new ApplicationStatusEvent(this, app));
        
        return ResponseEntity.ok("Status updated and email event fired.");
    }
}
