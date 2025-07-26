package com.HMS.hms.Repo;

import com.HMS.hms.Tables.MessManagerApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessManagerApplicationRepo extends JpaRepository<MessManagerApplication, Long> {

    // Find applications by call ID
    List<MessManagerApplication> findByCallIdOrderByAppliedAtAsc(Long callId);

    // Find applications by user ID
    List<MessManagerApplication> findByUserIdOrderByAppliedAtDesc(Long userId);

    // Find applications by status
    List<MessManagerApplication> findByStatusOrderByAppliedAtAsc(String status);

    // Find applications by call ID and status
    List<MessManagerApplication> findByCallIdAndStatusOrderByAppliedAtAsc(Long callId, String status);

    // Check if user has already applied for a specific call
    Optional<MessManagerApplication> findByCallIdAndUserId(Long callId, Long userId);

    // Count applications for a specific call
    @Query("SELECT COUNT(a) FROM MessManagerApplication a WHERE a.callId = :callId")
    Long countApplicationsByCallId(@Param("callId") Long callId);

    // Count selected applications for a specific call
    @Query("SELECT COUNT(a) FROM MessManagerApplication a WHERE a.callId = :callId AND a.status = 'SELECTED'")
    Long countSelectedApplicationsByCallId(@Param("callId") Long callId);

    // Find selected applications for a specific call
    List<MessManagerApplication> findByCallIdAndStatus(Long callId, String status);

    // Get all applications with user and call details
    @Query("SELECT a FROM MessManagerApplication a JOIN FETCH a.user JOIN FETCH a.messManagerCall ORDER BY a.appliedAt DESC")
    List<MessManagerApplication> findAllWithDetails();

    // Get applications for a specific call with user details
    @Query("SELECT a FROM MessManagerApplication a JOIN FETCH a.user WHERE a.callId = :callId ORDER BY a.appliedAt ASC")
    List<MessManagerApplication> findByCallIdWithUserDetails(@Param("callId") Long callId);
}
