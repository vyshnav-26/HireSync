package com.hiresync.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder


@NoArgsConstructor
@AllArgsConstructor
public class RecruiterProfileDto {
    private String id;
    private String email;
    private String name;
    private String userType;
    private String company;
    private String position;
}
