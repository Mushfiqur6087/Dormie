package com.HMS.hms.Repo;

import com.HMS.hms.Tables.MessManagerCall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MessManagerCallRepo extends JpaRepository<MessManagerCall, Long> {

    // Find active calls (not closed and deadline not passed)
    @Query("SELECT c FROM MessManagerCall c WHERE c.status = 'ACTIVE' AND c.applicationDeadline >= :currentDate")
    List<MessManagerCall> findActiveCalls(@Param("currentDate") LocalDate currentDate);

    // Find calls by status
    List<MessManagerCall> findByStatus(String status);

    // Find calls by month and year
    List<MessManagerCall> findByMonthAndYear(Integer month, Integer year);

    // Find the most recent active call
    @Query("SELECT c FROM MessManagerCall c WHERE c.status = 'ACTIVE' ORDER BY c.createdAt DESC")
    List<MessManagerCall> findActiveCallsOrderByCreatedAtDesc();

    // Find calls created by specific provost
    List<MessManagerCall> findByCreatedByOrderByCreatedAtDesc(Long createdBy);

    // Check if there's an active call for a specific month/year
    @Query("SELECT c FROM MessManagerCall c WHERE c.month = :month AND c.year = :year AND c.status IN ('ACTIVE', 'SELECTION_COMPLETE')")
    Optional<MessManagerCall> findActiveCallForMonthYear(@Param("month") Integer month, @Param("year") Integer year);

    // Get all calls ordered by creation date (newest first)
    List<MessManagerCall> findAllByOrderByCreatedAtDesc();
}
