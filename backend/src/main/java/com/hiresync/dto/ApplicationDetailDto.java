package com.hiresync.dto;

import lombok.Builder;
import lombok.Data;
import java.util.Map;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationDetailDto {
    private String id;
    private String jobId;
    private String candidateId;
    private String status;
    private String appliedDate;
    private String coverLetter;
    private Integer aiScore;
    private String aiFeedback;
    private Object customCriteriaAnswers;
    
    private Map<String, Object> job;
    private Map<String, Object> candidate;
    
    private java.util.List<String> hiringPhases;
    private Integer currentPhaseIndex;
    private String currentPhaseName;
    private String phaseStatus;
    private java.util.List<Object> emailLogs;
}
