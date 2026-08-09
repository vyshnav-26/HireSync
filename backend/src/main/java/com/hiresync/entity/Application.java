package com.hiresync.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "candidate_id", nullable = false)
    @ToString.Exclude
    private User candidate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_posting_id", nullable = false)
    @ToString.Exclude
    private JobPosting jobPosting;

    private String resumeUriSnapshot;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status;

    @Column(columnDefinition = "TEXT")
    private String customCriteriaAnswers;

    private Integer fitnessScore;

    @Column(columnDefinition = "TEXT")
    private String aiReasoning;

    @Builder.Default
    private Integer currentPhaseIndex = 0;

    @Builder.Default
    private String phaseStatus = "IN_PROGRESS"; // IN_PROGRESS, PASSED, REJECTED

    @Column(columnDefinition = "TEXT")
    private String emailLogs;
}
