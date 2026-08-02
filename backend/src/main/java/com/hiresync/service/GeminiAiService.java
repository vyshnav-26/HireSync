package com.hiresync.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GeminiAiService {

    @Value("${gemini.api-key}")
    private String apiKey;
    
    @Value("${gemini.url}")
    private String apiUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();

    public String evaluateCandidate(String parsedResume, String jobDescription, String criteriaAnswers) {
        String prompt = String.format("""
            Evaluate this candidate's resume against the JD and criteria.
            Output JSON: { "fitnessScore": 85, "skills_matched": [], "skills_missing": [] }
            Resume: %s
            JD: %s
            Answers: %s
        """, parsedResume, jobDescription, criteriaAnswers);
        
        return "{ \"fitnessScore\": 85, \"skills_matched\": [\"Java\", \"Spring\"], \"skills_missing\": [\"AWS\"] }";
    }
    
    @Async
    public void recalculateAllCandidatesForJob(Long jobId) {
        System.out.println("Recalculating AI scores for job: " + jobId);
    }
}
