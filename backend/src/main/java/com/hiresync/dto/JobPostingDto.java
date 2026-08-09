package com.hiresync.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobPostingDto {
    private String id;
    private String title;
    private String company;
    private String location;
    private String workType;
    private String description;
    private List<String> requirements;
    private String status;
    private String recruiterId;
    private String postedDate;
    private Object customCriteria;
    private Map<String, Object> salary;
    private List<String> hiringPhases;
    private List<String> questionnaire;
    private Integer applicantCount;
}
