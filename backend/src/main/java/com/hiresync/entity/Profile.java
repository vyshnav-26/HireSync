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

    private String headline;
    
    @Column(length = 2000)
    private String bio;
    
    private String location;
    
    private String skills; // Can store as comma-separated string for now
    
    private String experience;
    
    private String company;
    
    private String position;
}
