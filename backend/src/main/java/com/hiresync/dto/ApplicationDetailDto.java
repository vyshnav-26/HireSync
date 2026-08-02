package com.hiresync.dto;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
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
}
