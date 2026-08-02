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

    @PostMapping("/resume")
    public ResponseEntity<String> uploadResume(@RequestParam("file") MultipartFile file, 
                                               @AuthenticationPrincipal CustomUserDetails userDetails) throws IOException {
        String uri = storageService.uploadFile(file);
        var user = userDetails.getUser();
        user.getProfile().setResumeUri(uri);
        return ResponseEntity.ok(uri);
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<JobPosting>> listJobs() {
        return ResponseEntity.ok(jobPostingRepository.findAll());
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
}
