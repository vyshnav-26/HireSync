package com.hiresync.repository;

import com.hiresync.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByCandidateId(Long candidateId);
    List<Application> findByJobPostingId(Long jobPostingId);
    Optional<Application> findByCandidateIdAndJobPostingId(Long candidateId, Long jobPostingId);

    @Query("SELECT a FROM Application a " +
           "JOIN FETCH a.candidate c " +
           "JOIN FETCH c.profile p " +
           "JOIN FETCH a.jobPosting j " +
           "WHERE j.recruiter.id = :recruiterId")
    List<Application> findAllByRecruiterIdWithDetails(@Param("recruiterId") Long recruiterId);
}
