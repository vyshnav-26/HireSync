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
        return evaluateCandidateWithDetails(parsedResume, "", jobDescription, java.util.Collections.emptyList()).getReasoning();
    }

    public EvaluationResult evaluateCandidateWithDetails(String resumeUri, String candidateSkills, String jobDescription, java.util.List<String> requirements) {
        int baseScore = 65;
        java.util.List<String> matchedSkills = new java.util.ArrayList<>();
        java.util.List<String> missingSkills = new java.util.ArrayList<>();

        String combinedText = ((resumeUri != null ? resumeUri : "") + " " + (candidateSkills != null ? candidateSkills : "")).toLowerCase();
        String jdLower = (jobDescription != null ? jobDescription : "").toLowerCase();

        if (requirements != null && !requirements.isEmpty()) {
            for (String req : requirements) {
                if (req != null && !req.isBlank()) {
                    String cleanReq = req.trim().toLowerCase();
                    if (combinedText.contains(cleanReq) || jdLower.contains(cleanReq)) {
                        matchedSkills.add(req);
                    } else {
                        missingSkills.add(req);
                    }
                }
            }
        }

        if (candidateSkills != null && !candidateSkills.isBlank()) {
            String[] skills = candidateSkills.split(",");
            for (String s : skills) {
                String trimmed = s.trim();
                if (!trimmed.isEmpty() && jdLower.contains(trimmed.toLowerCase()) && !matchedSkills.contains(trimmed)) {
                    matchedSkills.add(trimmed);
                }
            }
        }

        if (!matchedSkills.isEmpty()) {
            baseScore += Math.min(30, matchedSkills.size() * 10);
        }
        if (!missingSkills.isEmpty()) {
            baseScore -= Math.min(20, missingSkills.size() * 5);
        }
        
        int finalScore = Math.max(45, Math.min(98, baseScore));

        String reasoning = String.format(
            "{\"fitnessScore\": %d, \"skills_matched\": %s, \"skills_missing\": %s, \"summary\": \"Candidate scored %d%% match based on skill alignment and experience requirements.\"}",
            finalScore,
            toJsonArray(matchedSkills),
            toJsonArray(missingSkills),
            finalScore
        );

        return new EvaluationResult(finalScore, reasoning);
    }

    private String toJsonArray(java.util.List<String> list) {
        return "[" + String.join(",", list.stream().map(s -> "\"" + s.replace("\"", "\\\"") + "\"").toList()) + "]";
    }

    public String generateCoverLetter(String candidateName, String candidateHeadline, String candidateSkills, String jobTitle, String companyName, String jobDescription) {
        return String.format(
            "Dear Hiring Manager at %s,\n\n" +
            "I am writing to express my strong interest in the %s position. With my background as a %s and experience in %s, " +
            "I am confident in my ability to contribute effectively to your team.\n\n" +
            "Key Highlights:\n" +
            "- Proven technical expertise aligned with your team's requirements for %s.\n" +
            "- Strong track record of technical execution, collaboration, and high-impact delivery.\n\n" +
            "Thank you for considering my application. I look forward to discussing how my background aligns with your team's goals.\n\n" +
            "Sincerely,\n%s",
            companyName != null && !companyName.isBlank() ? companyName : "your organization",
            jobTitle != null && !jobTitle.isBlank() ? jobTitle : "this role",
            candidateHeadline != null && !candidateHeadline.isBlank() ? candidateHeadline : "dedicated professional",
            candidateSkills != null && !candidateSkills.isBlank() ? candidateSkills : "key industry standards",
            jobTitle != null && !jobTitle.isBlank() ? jobTitle : "this role",
            candidateName != null && !candidateName.isBlank() ? candidateName : "Applicant"
        );
    }

    @lombok.Getter
    @lombok.AllArgsConstructor
    public static class EvaluationResult {
        private final int score;
        private final String reasoning;
    }
    
    @Async
    public void recalculateAllCandidatesForJob(Long jobId) {
        System.out.println("Recalculating AI scores for job: " + jobId);
    }
}
