package com.HMS.hms.Repo;

import com.HMS.hms.Tables.FundRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface FundRequestRepo extends JpaRepository<FundRequest, Long> {

    // Find fund requests by status
    List<FundRequest> findByStatusOrderByRequestedAtDesc(String status);

    // Find fund requests by requesting user (mess manager)
    List<FundRequest> findByRequestedByOrderByRequestedAtDesc(Long requestedBy);

    // Find fund requests reviewed by a specific user (Provost)
    List<FundRequest> findByReviewedByOrderByReviewedAtDesc(Long reviewedBy);

    // Find pending fund requests
    @Query("SELECT f FROM FundRequest f WHERE f.status = 'PENDING' ORDER BY f.requestedAt ASC")
    List<FundRequest> findPendingRequests();

    // Find fund requests within an amount range
    @Query("SELECT f FROM FundRequest f WHERE f.amount >= :minAmount AND f.amount <= :maxAmount ORDER BY f.requestedAt DESC")
    List<FundRequest> findByAmountRange(@Param("minAmount") BigDecimal minAmount, @Param("maxAmount") BigDecimal maxAmount);

    // Find fund requests by date range
    List<FundRequest> findByRequestedAtBetweenOrderByRequestedAtDesc(LocalDate startDate, LocalDate endDate);

    // Find approved fund requests for a specific user
    @Query("SELECT f FROM FundRequest f WHERE f.requestedBy = :userId AND f.status = 'APPROVED' ORDER BY f.requestedAt DESC")
    List<FundRequest> findApprovedRequestsByUser(@Param("userId") Long userId);

    // Calculate total approved amount for a user
    @Query("SELECT COALESCE(SUM(f.amount), 0) FROM FundRequest f WHERE f.requestedBy = :userId AND f.status = 'APPROVED'")
    BigDecimal getTotalApprovedAmountByUser(@Param("userId") Long userId);

    // Calculate total approved amount for a month
    @Query("SELECT COALESCE(SUM(f.amount), 0) FROM FundRequest f WHERE f.status = 'APPROVED' AND YEAR(f.requestedAt) = :year AND MONTH(f.requestedAt) = :month")
    BigDecimal getTotalApprovedAmountByMonth(@Param("month") Integer month, @Param("year") Integer year);

    // Count pending requests for a user
    @Query("SELECT COUNT(f) FROM FundRequest f WHERE f.requestedBy = :userId AND f.status = 'PENDING'")
    Long countPendingRequestsByUser(@Param("userId") Long userId);

    // Find recent fund requests (last 30 days)
    @Query("SELECT f FROM FundRequest f WHERE f.requestedAt >= :thirtyDaysAgo ORDER BY f.requestedAt DESC")
    List<FundRequest> findRecentRequests(@Param("thirtyDaysAgo") LocalDate thirtyDaysAgo);

    // Find fund requests with user details
    @Query("SELECT f FROM FundRequest f LEFT JOIN FETCH f.requestedByUser ORDER BY f.requestedAt DESC")
    List<FundRequest> findAllWithRequesterDetails();

    // Find fund requests with complete details (requester and reviewer)
    @Query("SELECT f FROM FundRequest f LEFT JOIN FETCH f.requestedByUser LEFT JOIN FETCH f.reviewedByUser ORDER BY f.requestedAt DESC")
    List<FundRequest> findAllWithCompleteDetails();

    // Get statistics for fund requests by status
    @Query("SELECT f.status, COUNT(f), COALESCE(SUM(f.amount), 0) FROM FundRequest f GROUP BY f.status")
    List<Object[]> getFundRequestStatistics();

    // Find requests that need urgent review (pending for more than specified days)
    @Query("SELECT f FROM FundRequest f WHERE f.status = 'PENDING' AND f.requestedAt <= :cutoffDate ORDER BY f.requestedAt ASC")
    List<FundRequest> findUrgentPendingRequests(@Param("cutoffDate") LocalDate cutoffDate);
}
