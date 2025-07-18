package com.HMS.hms.Repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.HMS.hms.Tables.Complaint;

@Repository
public interface ComplaintRepo extends JpaRepository<Complaint, Long> {

    // Find complaints by user ID (complainant)
    List<Complaint> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Find complaints by student ID
    List<Complaint> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    // Find complaints by type
    List<Complaint> findByComplaintTypeOrderByCreatedAtDesc(Complaint.ComplaintType complaintType);

    // Find complaints by status
    List<Complaint> findByStatusOrderByCreatedAtDesc(Complaint.ComplaintStatus status);

    // Find complaints by type and status
    List<Complaint> findByComplaintTypeAndStatusOrderByCreatedAtDesc(
            Complaint.ComplaintType complaintType,
            Complaint.ComplaintStatus status);

    // Find all complaints ordered by creation date (newest first)
    List<Complaint> findAllByOrderByCreatedAtDesc();

    // Find complaints visible to a specific user based on type and user role
    @Query("SELECT c FROM Complaint c WHERE " +
            "(:complaintType IS NULL OR c.complaintType = :complaintType) AND " +
            "(c.complaintType = com.HMS.hms.Tables.Complaint$ComplaintType.LOST_AND_FOUND OR " +
            " c.userId = :userId OR " +
            " :userRole IN ('PROVOST', 'ADMIN')) " +
            "ORDER BY c.createdAt DESC")
    List<Complaint> findComplaintsVisibleToUser(
            @Param("userId") Long userId,
            @Param("userRole") String userRole,
            @Param("complaintType") Complaint.ComplaintType complaintType);

    // Find all complaints visible to a user (for admins and provosts)
    @Query("SELECT c FROM Complaint c WHERE " +
            "c.complaintType = com.HMS.hms.Tables.Complaint$ComplaintType.LOST_AND_FOUND OR " +
            "c.userId = :userId OR " +
            ":userRole IN ('PROVOST', 'ADMIN') " +
            "ORDER BY c.createdAt DESC")
    List<Complaint> findAllComplaintsVisibleToUser(
            @Param("userId") Long userId,
            @Param("userRole") String userRole);

    // Find ragging complaints visible to user (only for provost, admin, or
    // complainant)
    @Query("SELECT c FROM Complaint c WHERE " +
            "c.complaintType = com.HMS.hms.Tables.Complaint$ComplaintType.RAGGING AND " +
            "(c.userId = :userId OR :userRole IN ('PROVOST', 'ADMIN')) " +
            "ORDER BY c.createdAt DESC")
    List<Complaint> findRaggingComplaintsVisibleToUser(
            @Param("userId") Long userId,
            @Param("userRole") String userRole);

    // Find lost and found complaints (visible to all students)
    @Query("SELECT c FROM Complaint c WHERE " +
            "c.complaintType = com.HMS.hms.Tables.Complaint$ComplaintType.LOST_AND_FOUND " +
            "ORDER BY c.createdAt DESC")
    List<Complaint> findLostAndFoundComplaints();

    // Count complaints by type
    long countByComplaintType(Complaint.ComplaintType complaintType);

    // Count complaints by status
    long countByStatus(Complaint.ComplaintStatus status);

    // Count complaints by user
    long countByUserId(Long userId);

    // Find complaints with images (for lost and found)
    @Query("SELECT c FROM Complaint c WHERE " +
            "c.complaintType = com.HMS.hms.Tables.Complaint$ComplaintType.LOST_AND_FOUND AND " +
            "(c.imageUrl IS NOT NULL OR c.imageData IS NOT NULL) " +
            "ORDER BY c.createdAt DESC")
    List<Complaint> findLostAndFoundComplaintsWithImages();

    // Search complaints by title or description
    @Query("SELECT c FROM Complaint c WHERE " +
            "(LOWER(c.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            " LOWER(c.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
            "(c.complaintType = com.HMS.hms.Tables.Complaint$ComplaintType.LOST_AND_FOUND OR " +
            " c.userId = :userId OR " +
            " :userRole IN ('PROVOST', 'ADMIN')) " +
            "ORDER BY c.createdAt DESC")
    List<Complaint> searchComplaintsVisibleToUser(
            @Param("searchTerm") String searchTerm,
            @Param("userId") Long userId,
            @Param("userRole") String userRole);
}
