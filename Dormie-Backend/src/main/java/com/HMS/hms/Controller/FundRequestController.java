package com.HMS.hms.Controller;

import com.HMS.hms.DTO.FundRequestDTO;
import com.HMS.hms.DTO.FundRequestRequest;
import com.HMS.hms.DTO.FundRequestReviewRequest;
import com.HMS.hms.DTO.MessageResponse;
import com.HMS.hms.Security.UserDetailsImpl;
import com.HMS.hms.Service.FundRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/fund-requests")
@CrossOrigin(origins = "*")
public class FundRequestController {

    @Autowired
    private FundRequestService fundRequestService;

    /**
     * Create a fund request (Mess Manager only)
     */
    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> createFundRequest(@Valid @RequestBody FundRequestRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            FundRequestDTO fundRequest = fundRequestService.createFundRequest(request, userId);
            return ResponseEntity.ok(fundRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error creating fund request: " + e.getMessage()));
        }
    }

    /**
     * Get all fund requests with optional status filter (Provost/Admin only)
     */
    @GetMapping
    @PreAuthorize("hasRole('PROVOST') or hasRole('ADMIN')")
    public ResponseEntity<?> getAllFundRequests(@RequestParam(required = false) String status) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            List<FundRequestDTO> requests = fundRequestService.getAllFundRequests(status, userId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("Error fetching fund requests: " + e.getMessage()));
        }
    }

    /**
     * Get pending fund requests (Provost/Admin only)
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('PROVOST') or hasRole('ADMIN')")
    public ResponseEntity<?> getPendingFundRequests() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            List<FundRequestDTO> requests = fundRequestService.getPendingFundRequests(userId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("Error fetching pending requests: " + e.getMessage()));
        }
    }

    /**
     * Get fund requests by user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getFundRequestsByUser(@PathVariable Long userId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long requestingUserId = userDetails.getId();

            List<FundRequestDTO> requests = fundRequestService.getFundRequestsByUser(userId, requestingUserId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("Error fetching fund requests: " + e.getMessage()));
        }
    }

    /**
     * Get current user's fund requests
     */
    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyFundRequests() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            List<FundRequestDTO> requests = fundRequestService.getFundRequestsByUser(userId, userId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching your requests: " + e.getMessage()));
        }
    }

    /**
     * Review fund request (Provost/Admin only)
     */
    @PatchMapping("/{requestId}/review")
    @PreAuthorize("hasRole('PROVOST') or hasRole('ADMIN')")
    public ResponseEntity<?> reviewFundRequest(@PathVariable Long requestId, 
                                             @Valid @RequestBody FundRequestReviewRequest reviewRequest) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            FundRequestDTO updatedRequest = fundRequestService.reviewFundRequest(requestId, reviewRequest, userId);
            return ResponseEntity.ok(updatedRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error reviewing fund request: " + e.getMessage()));
        }
    }

    /**
     * Get fund request by ID
     */
    @GetMapping("/{requestId}")
    public ResponseEntity<?> getFundRequestById(@PathVariable Long requestId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            FundRequestDTO request = fundRequestService.getFundRequestById(requestId, userId);
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Fund request not found: " + e.getMessage()));
        }
    }

    /**
     * Delete fund request (Only if pending and by owner or admin)
     */
    @DeleteMapping("/{requestId}")
    public ResponseEntity<?> deleteFundRequest(@PathVariable Long requestId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            fundRequestService.deleteFundRequest(requestId, userId);
            return ResponseEntity.ok(new MessageResponse("Fund request deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error deleting fund request: " + e.getMessage()));
        }
    }

    /**
     * Get total approved amount for current user
     */
    @GetMapping("/my-total-approved")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyTotalApprovedAmount() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            BigDecimal totalAmount = fundRequestService.getTotalApprovedAmountByUser(userId);
            return ResponseEntity.ok(new MessageResponse("Total approved amount: $" + totalAmount));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching total amount: " + e.getMessage()));
        }
    }

    /**
     * Get total approved amount for a month (Provost/Admin only)
     */
    @GetMapping("/total-approved/month/{month}/year/{year}")
    @PreAuthorize("hasRole('PROVOST') or hasRole('ADMIN')")
    public ResponseEntity<?> getTotalApprovedAmountByMonth(@PathVariable Integer month, @PathVariable Integer year) {
        try {
            BigDecimal totalAmount = fundRequestService.getTotalApprovedAmountByMonth(month, year);
            return ResponseEntity.ok(new MessageResponse("Total approved amount for " + month + "/" + year + ": $" + totalAmount));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching total amount: " + e.getMessage()));
        }
    }

    /**
     * Get recent fund requests (Provost/Admin only)
     */
    @GetMapping("/recent")
    @PreAuthorize("hasRole('PROVOST') or hasRole('ADMIN')")
    public ResponseEntity<?> getRecentFundRequests() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            List<FundRequestDTO> requests = fundRequestService.getRecentFundRequests(userId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("Error fetching recent requests: " + e.getMessage()));
        }
    }

    /**
     * Get urgent pending requests (Provost/Admin only)
     */
    @GetMapping("/urgent")
    @PreAuthorize("hasRole('PROVOST') or hasRole('ADMIN')")
    public ResponseEntity<?> getUrgentPendingRequests() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            List<FundRequestDTO> requests = fundRequestService.getUrgentPendingRequests(userId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("Error fetching urgent requests: " + e.getMessage()));
        }
    }
}
