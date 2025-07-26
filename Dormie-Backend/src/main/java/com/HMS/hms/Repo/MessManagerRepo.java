package com.HMS.hms.Repo;

import com.HMS.hms.Tables.MessManager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MessManagerRepo extends JpaRepository<MessManager, Long> {

    // Find current active mess managers
    @Query("SELECT m FROM MessManager m WHERE m.status = 'ACTIVE' AND m.startDate <= CURRENT_DATE AND (m.endDate IS NULL OR m.endDate >= CURRENT_DATE)")
    List<MessManager> findCurrentActiveManagers();

    // Find mess managers by user ID
    List<MessManager> findByUserIdOrderByAssignedAtDesc(Long userId);

    // Find mess managers by month and year
    List<MessManager> findByMonthAndYear(Integer month, Integer year);

    // Find active mess managers by month and year
    @Query("SELECT m FROM MessManager m WHERE m.month = :month AND m.year = :year AND m.status = 'ACTIVE'")
    List<MessManager> findActiveManagersByMonthAndYear(@Param("month") Integer month, @Param("year") Integer year);

    // Find mess managers by status
    List<MessManager> findByStatusOrderByAssignedAtDesc(String status);

    // Check if user is currently an active mess manager
    @Query("SELECT m FROM MessManager m WHERE m.userId = :userId AND m.status = 'ACTIVE' AND m.startDate <= CURRENT_DATE AND (m.endDate IS NULL OR m.endDate >= CURRENT_DATE)")
    Optional<MessManager> findActiveManagerByUserId(@Param("userId") Long userId);

    // Find mess managers assigned by a specific user (Provost)
    List<MessManager> findByAssignedByOrderByAssignedAtDesc(Long assignedBy);

    // Get all mess managers with user details
    @Query("SELECT m FROM MessManager m JOIN FETCH m.user ORDER BY m.assignedAt DESC")
    List<MessManager> findAllWithUserDetails();

    // Find mess managers within a date range
    @Query("SELECT m FROM MessManager m WHERE m.startDate <= :endDate AND (m.endDate IS NULL OR m.endDate >= :startDate)")
    List<MessManager> findManagersInDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // Count active mess managers
    @Query("SELECT COUNT(m) FROM MessManager m WHERE m.status = 'ACTIVE' AND m.startDate <= CURRENT_DATE AND (m.endDate IS NULL OR m.endDate >= CURRENT_DATE)")
    Long countActiveManagers();

    // Find mess managers by assignment date range
    List<MessManager> findByAssignedAtBetweenOrderByAssignedAtDesc(LocalDate startDate, LocalDate endDate);
}
