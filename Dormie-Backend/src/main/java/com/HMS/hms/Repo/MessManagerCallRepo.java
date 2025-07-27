package com.HMS.hms.Repo;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.HMS.hms.Tables.MessManagerCall;

@Repository
public interface MessManagerCallRepo extends JpaRepository<MessManagerCall, Long> {

    // Find calls by status
    List<MessManagerCall> findByStatus(MessManagerCall.CallStatus status);

    // Find calls by year
    List<MessManagerCall> findByYear(Integer year);

    // Find calls by provost ID
    List<MessManagerCall> findByProvostId(Long provostId);

    // Find calls by dining fee ID
    List<MessManagerCall> findByDiningFeeId(Long diningFeeId);

    // Find active calls
    @Query("SELECT m FROM MessManagerCall m WHERE m.status = 'ACTIVE'")
    List<MessManagerCall> findActiveCalls();

    // Find calls by status and year
    List<MessManagerCall> findByStatusAndYear(MessManagerCall.CallStatus status, Integer year);

    // Find calls by provost and year
    List<MessManagerCall> findByProvostIdAndYear(Long provostId, Integer year);

    // Find calls where application deadline has not passed
    @Query("SELECT m FROM MessManagerCall m WHERE m.applicationEndDate >= :currentDate AND m.status = 'ACTIVE'")
    List<MessManagerCall> findOpenForApplication(@Param("currentDate") LocalDate currentDate);

    // Find calls by year ordered by created date
    List<MessManagerCall> findByYearOrderByCreatedAtDesc(Integer year);

    // Find all calls ordered by created date descending
    List<MessManagerCall> findAllByOrderByCreatedAtDesc();

    // Check if there's an active call for a specific year
    boolean existsByYearAndStatus(Integer year, MessManagerCall.CallStatus status);

    // Check if a dining fee is already used in any call
    boolean existsByDiningFeeId(Long diningFeeId);

    // Find the latest call for a specific year
    @Query("SELECT m FROM MessManagerCall m WHERE m.year = :year ORDER BY m.createdAt DESC")
    Optional<MessManagerCall> findLatestCallByYear(@Param("year") Integer year);

    // Find calls that have expired (application deadline passed)
    @Query("SELECT m FROM MessManagerCall m WHERE m.applicationEndDate < :currentDate AND m.status = 'ACTIVE'")
    List<MessManagerCall> findExpiredCalls(@Param("currentDate") LocalDate currentDate);

    // Find calls that are completed (manager activity end date passed)
    @Query("SELECT m FROM MessManagerCall m WHERE m.managerActivityEndDate < :currentDate AND m.status != 'COMPLETED'")
    List<MessManagerCall> findCompletedCalls(@Param("currentDate") LocalDate currentDate);

    // Find calls with their dining fee information
    @Query("SELECT m FROM MessManagerCall m JOIN FETCH m.diningFee WHERE m.callId = :callId")
    Optional<MessManagerCall> findByIdWithDiningFee(@Param("callId") Long callId);

    // Find active calls with dining fee information
    @Query("SELECT m FROM MessManagerCall m JOIN FETCH m.diningFee WHERE m.status = 'ACTIVE'")
    List<MessManagerCall> findActiveCallsWithDiningFee();
}
