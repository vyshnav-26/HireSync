package com.hiresync.repository;

import com.hiresync.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByCandidateId(Long candidateId);
    List<Application> findByJobPostingId(Long jobPostingId);
    Optional<Application> findByCandidateIdAndJobPostingId(Long candidateId, Long jobPostingId);
}
