package com.hiresync.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    private String fullName;
    
    private String resumeUri;

    @Column(columnDefinition = "TEXT")
    private String resumeData; // Direct Base64 in-PostgreSQL document storage

    private String headline;
    
    @Column(length = 2000)
    private String bio;
    
    private String location;
    
    private String skills; // Stored skills
    
    private String experience;
    
    private String company;
    
    private String position;

    // AI-Extracted Candidate Attributes for zero-storage lightweight matching
    private String extractedSkills;
    
    private Integer extractedExperienceYears;
    
    private String extractedEducation;
    
    private String extractedRoleSummary;
    
    @Column(length = 2000)
    private String extractedKeyHighlights;
}
