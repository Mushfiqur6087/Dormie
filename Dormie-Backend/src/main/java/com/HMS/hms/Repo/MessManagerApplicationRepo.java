package com.HMS.hms.Repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.HMS.hms.Tables.MessManagerApplication;

@Repository
public interface MessManagerApplicationRepo extends JpaRepository<MessManagerApplication, Long> {

    // Find applications by call ID
    List<MessManagerApplication> findByCallId(Long callId);

    // Find applications by student ID
    List<MessManagerApplication> findByStudentId(Long studentId);

    // Find applications by call ID and status
    List<MessManagerApplication> findByCallIdAndStatus(Long callId, MessManagerApplication.ApplicationStatus status);

    // Find applications by student ID and status
    List<MessManagerApplication> findByStudentIdAndStatus(Long studentId, MessManagerApplication.ApplicationStatus status);

    // Find applications by status
    List<MessManagerApplication> findByStatus(MessManagerApplication.ApplicationStatus status);

    // Check if student has pending application
    boolean existsByStudentIdAndStatus(Long studentId, MessManagerApplication.ApplicationStatus status);

    // Count applications by call ID and status
    int countByCallIdAndStatus(Long callId, MessManagerApplication.ApplicationStatus status);

    // Find applications by call ID ordered by created date
    List<MessManagerApplication> findByCallIdOrderByCreatedAtDesc(Long callId);

    // Find applications by student ID ordered by created date
    List<MessManagerApplication> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    // Update all accepted applications for a call to MONTH_END
    @Modifying
    @Query("UPDATE MessManagerApplication m SET m.status = 'MONTH_END' WHERE m.callId = :callId AND m.status = 'ACCEPTED'")
    int updateAcceptedToMonthEnd(@Param("callId") Long callId);

    // Check if student has any accepted application (is currently a mess manager)
    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM MessManagerApplication m WHERE m.studentId = :studentId AND m.status = 'ACCEPTED'")
    boolean isStudentCurrentlyMessManager(@Param("studentId") Long studentId);

    // Get applications with student and call information (for detailed view)
    @Query("SELECT m FROM MessManagerApplication m WHERE m.callId = :callId ORDER BY m.createdAt DESC")
    List<MessManagerApplication> findApplicationsForCall(@Param("callId") Long callId);
}
