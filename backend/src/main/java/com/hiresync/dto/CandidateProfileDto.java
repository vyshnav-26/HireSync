package com.hiresync.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateProfileDto {
    private String id;
    private String email;
    private String name;
    private String userType;
    private String headline;
    private String bio;
    private String location;
    private String[] skills;
    private String experience;
    private String resume;
}
