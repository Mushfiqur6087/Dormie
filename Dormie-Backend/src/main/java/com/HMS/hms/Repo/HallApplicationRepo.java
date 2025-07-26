package com.HMS.hms.Repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.HMS.hms.Tables.HallApplication;

@Repository
public interface HallApplicationRepo extends JpaRepository<HallApplication, Long> {
    Optional<HallApplication> findByUserId(Long userId); // Find a specific application by user ID
    List<HallApplication> findAllByUserId(Long userId); // Find all applications by user ID
    List<HallApplication> findByUserIdAndApplicationStatus(Long userId, String applicationStatus); // Find by user and status
    Optional<HallApplication> findByStudentIdNo(Long studentIdNo); // Find by university student ID
    List<HallApplication> findByApplicationStatus(String applicationStatus); // Find by status (PENDING, APPROVED)
}