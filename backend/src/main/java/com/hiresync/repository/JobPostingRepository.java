package com.hiresync.repository;

import com.hiresync.entity.JobPosting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    List<JobPosting> findByRecruiterId(Long recruiterId);
    
    @Query("SELECT j FROM JobPosting j WHERE (j.status IS NULL OR LOWER(j.status) = 'open' OR LOWER(j.status) = 'active') " +
           "AND (:search IS NULL OR LOWER(j.title) LIKE :search OR LOWER(j.company) LIKE :search) " +
           "AND (:location IS NULL OR LOWER(j.location) LIKE :location) " +
           "AND (:workType IS NULL OR LOWER(j.workType) = :workType)")
    Page<JobPosting> searchOpenJobs(
            @Param("search") String search,
            @Param("location") String location,
            @Param("workType") String workType,
            Pageable pageable);
}
