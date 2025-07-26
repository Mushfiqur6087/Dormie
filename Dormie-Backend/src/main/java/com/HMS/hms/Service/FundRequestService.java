package com.HMS.hms.Service;

import com.HMS.hms.DTO.FundRequestDTO;
import com.HMS.hms.DTO.FundRequestRequest;
import com.HMS.hms.DTO.FundRequestReviewRequest;
import com.HMS.hms.Repo.FundRequestRepo;
import com.HMS.hms.Repo.MessManagerRepo;
import com.HMS.hms.Tables.FundRequest;
import com.HMS.hms.Tables.Users;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FundRequestService {

    @Autowired
    private FundRequestRepo fundRequestRepo;

    @Autowired
    private MessManagerRepo messManagerRepo;

    @Autowired
    private UserService userService;

    /**
     * Create a fund request (Mess Manager only)
     */
    @Transactional
    public FundRequestDTO createFundRequest(FundRequestRequest request, Long userId) {
        // Verify user exists and is a current mess manager
        Optional<Users> userOpt = userService.findByUserId(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        Users user = userOpt.get();
        if (!"STUDENT".equals(user.getRole())) {
            throw new RuntimeException("User must be a student to request funds");
        }

        // Check if user is currently an active mess manager
        if (!messManagerRepo.findActiveManagerByUserId(userId).isPresent()) {
            throw new RuntimeException("Only active mess managers can request funds");
        }

        // Validate amount
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Amount must be greater than zero");
        }

        // Check for pending requests (optional business rule)
        Long pendingCount = fundRequestRepo.countPendingRequestsByUser(userId);
        if (pendingCount >= 3) {
            throw new RuntimeException("You have too many pending fund requests. Please wait for approval.");
        }

        // Create fund request
        FundRequest fundRequest = new FundRequest();
        fundRequest.setAmount(request.getAmount());
        fundRequest.setTitle(request.getTitle());
        fundRequest.setDescription(request.getDescription());
        fundRequest.setRequestedBy(userId);
        fundRequest.setStatus("PENDING");

        FundRequest savedRequest = fundRequestRepo.save(fundRequest);
        return convertToDTO(savedRequest);
    }

    /**
     * Get all fund requests with optional status filter (Provost/Admin only)
     */
    public List<FundRequestDTO> getAllFundRequests(String status, Long userId) {
        // Verify user has permission
        Optional<Users> userOpt = userService.findByUserId(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        Users user = userOpt.get();
        if (!"PROVOST".equals(user.getRole()) && !"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Only provost and admin can view all fund requests");
        }

        List<FundRequest> requests;
        if (status != null && !status.isEmpty()) {
            requests = fundRequestRepo.findByStatusOrderByRequestedAtDesc(status);
        } else {
            requests = fundRequestRepo.findAllWithCompleteDetails();
        }

        return requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get pending fund requests (Provost/Admin only)
     */
    public List<FundRequestDTO> getPendingFundRequests(Long userId) {
        // Verify user has permission
        Optional<Users> userOpt = userService.findByUserId(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        Users user = userOpt.get();
        if (!"PROVOST".equals(user.getRole()) && !"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Only provost and admin can view pending requests");
        }

        List<FundRequest> requests = fundRequestRepo.findPendingRequests();
        return requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get fund requests by user
     */
    public List<FundRequestDTO> getFundRequestsByUser(Long requestedBy, Long requestingUserId) {
        // Students can only see their own requests
        if (!requestedBy.equals(requestingUserId)) {
            Optional<Users> userOpt = userService.findByUserId(requestingUserId);
            if (userOpt.isEmpty() || (!"PROVOST".equals(userOpt.get().getRole()) && !"ADMIN".equals(userOpt.get().getRole()))) {
                throw new RuntimeException("You can only view your own fund requests");
            }
        }

        List<FundRequest> requests = fundRequestRepo.findByRequestedByOrderByRequestedAtDesc(requestedBy);
        return requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Review fund request (Provost/Admin only)
     */
    @Transactional
    public FundRequestDTO reviewFundRequest(Long requestId, FundRequestReviewRequest reviewRequest, Long reviewerId) {
        // Verify user has permission
        Optional<Users> userOpt = userService.findByUserId(reviewerId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + reviewerId);
        }

        Users user = userOpt.get();
        if (!"PROVOST".equals(user.getRole()) && !"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Only provost and admin can review fund requests");
        }

        Optional<FundRequest> requestOpt = fundRequestRepo.findById(requestId);
        if (requestOpt.isEmpty()) {
            throw new RuntimeException("Fund request not found with ID: " + requestId);
        }

        FundRequest fundRequest = requestOpt.get();
        
        // Check if request is still pending
        if (!"PENDING".equals(fundRequest.getStatus())) {
            throw new RuntimeException("Fund request has already been reviewed");
        }

        // Validate status
        if (!isValidReviewStatus(reviewRequest.getStatus())) {
            throw new RuntimeException("Invalid status. Must be APPROVED or REJECTED");
        }

        // Update request
        fundRequest.setStatus(reviewRequest.getStatus());
        fundRequest.setReviewedBy(reviewerId);
        fundRequest.setReviewedAt(LocalDateTime.now());
        fundRequest.setReviewNotes(reviewRequest.getReviewNotes());

        FundRequest updatedRequest = fundRequestRepo.save(fundRequest);
        return convertToDTO(updatedRequest);
    }

    /**
     * Get fund request by ID
     */
    public FundRequestDTO getFundRequestById(Long requestId, Long userId) {
        Optional<FundRequest> requestOpt = fundRequestRepo.findById(requestId);
        if (requestOpt.isEmpty()) {
            throw new RuntimeException("Fund request not found with ID: " + requestId);
        }

        FundRequest fundRequest = requestOpt.get();

        // Verify user has permission to view
        Optional<Users> userOpt = userService.findByUserId(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        Users user = userOpt.get();
        boolean isAdmin = "ADMIN".equals(user.getRole());
        boolean isProvost = "PROVOST".equals(user.getRole());
        boolean isOwner = fundRequest.getRequestedBy().equals(userId);

        if (!isAdmin && !isProvost && !isOwner) {
            throw new RuntimeException("You do not have permission to view this fund request");
        }

        return convertToDTO(fundRequest);
    }

    /**
     * Delete fund request (Only if pending and by owner or admin)
     */
    @Transactional
    public void deleteFundRequest(Long requestId, Long userId) {
        Optional<FundRequest> requestOpt = fundRequestRepo.findById(requestId);
        if (requestOpt.isEmpty()) {
            throw new RuntimeException("Fund request not found with ID: " + requestId);
        }

        FundRequest fundRequest = requestOpt.get();

        // Verify user has permission
        Optional<Users> userOpt = userService.findByUserId(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        Users user = userOpt.get();
        boolean isAdmin = "ADMIN".equals(user.getRole());
        boolean isOwner = fundRequest.getRequestedBy().equals(userId);

        if (!isAdmin && !isOwner) {
            throw new RuntimeException("You can only delete your own fund requests");
        }

        // Only allow deletion of pending requests
        if (!"PENDING".equals(fundRequest.getStatus())) {
            throw new RuntimeException("Cannot delete a reviewed fund request");
        }

        fundRequestRepo.delete(fundRequest);
    }

    /**
     * Get approved amount total for a user
     */
    public BigDecimal getTotalApprovedAmountByUser(Long userId) {
        return fundRequestRepo.getTotalApprovedAmountByUser(userId);
    }

    /**
     * Get approved amount total for a month
     */
    public BigDecimal getTotalApprovedAmountByMonth(Integer month, Integer year) {
        return fundRequestRepo.getTotalApprovedAmountByMonth(month, year);
    }

    /**
     * Get recent fund requests
     */
    public List<FundRequestDTO> getRecentFundRequests(Long userId) {
        // Verify user has permission
        Optional<Users> userOpt = userService.findByUserId(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        Users user = userOpt.get();
        if (!"PROVOST".equals(user.getRole()) && !"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Only provost and admin can view recent requests");
        }

        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        List<FundRequest> requests = fundRequestRepo.findRecentRequests(thirtyDaysAgo);
        return requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get urgent pending requests (pending for more than 7 days)
     */
    public List<FundRequestDTO> getUrgentPendingRequests(Long userId) {
        // Verify user has permission
        Optional<Users> userOpt = userService.findByUserId(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        Users user = userOpt.get();
        if (!"PROVOST".equals(user.getRole()) && !"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Only provost and admin can view urgent requests");
        }

        LocalDate cutoffDate = LocalDate.now().minusDays(7);
        List<FundRequest> requests = fundRequestRepo.findUrgentPendingRequests(cutoffDate);
        return requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convert FundRequest entity to DTO
     */
    private FundRequestDTO convertToDTO(FundRequest request) {
        FundRequestDTO dto = new FundRequestDTO();
        dto.setId(request.getRequestId());
        dto.setAmount(request.getAmount());
        dto.setTitle(request.getTitle());
        dto.setDescription(request.getDescription());
        dto.setStatus(request.getStatus());
        dto.setRequestedBy(request.getRequestedBy());
        dto.setRequestedAt(request.getRequestedAt());
        dto.setReviewedBy(request.getReviewedBy());
        dto.setReviewedAt(request.getReviewedAt());
        dto.setReviewNotes(request.getReviewNotes());

        // Set requester name
        if (request.getRequestedByUser() != null) {
            dto.setRequestedByName(request.getRequestedByUser().getUsername());
        }

        // Set reviewer name
        if (request.getReviewedByUser() != null) {
            dto.setReviewedByName(request.getReviewedByUser().getUsername());
        }

        return dto;
    }

    /**
     * Validate review status
     */
    private boolean isValidReviewStatus(String status) {
        return status != null && 
               (status.equals("APPROVED") || status.equals("REJECTED"));
    }
}
