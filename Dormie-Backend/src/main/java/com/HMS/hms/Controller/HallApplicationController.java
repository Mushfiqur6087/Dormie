package com.HMS.hms.Controller;

import java.util.List; // Import the new Summary DTO
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired; // Import HallApplication entity for detail view
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity; // Import MediaType
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication; // Make sure this is imported
import org.springframework.security.core.context.SecurityContextHolder; // Make sure this is imported
import org.springframework.web.bind.annotation.CrossOrigin; // Make sure this is imported
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping; // For getApplicationDetails method
import org.springframework.web.bind.annotation.RequestParam; // Ensure this is imported
import org.springframework.web.bind.annotation.RestController; // Ensure this is imported

import com.HMS.hms.DTO.HallApplicationRequest;
import com.HMS.hms.DTO.HallApplicationSummaryDTO;
import com.HMS.hms.DTO.MessageResponse;
import com.HMS.hms.Security.UserDetailsImpl;
import com.HMS.hms.Service.HallApplicationService;
import com.HMS.hms.Tables.HallApplication;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class HallApplicationController {

    // Logger declaration for this controller
    private static final Logger logger = LoggerFactory.getLogger(HallApplicationController.class);

    @Autowired
    private HallApplicationService hallApplicationService;

    /**
     * Endpoint for a student to submit a hall seat application.
     * Accepts JSON data and extracts student ID from JWT token.
     *
     * @param applicationRequest The DTO containing application data (JSON).
     * @return ResponseEntity with success/error message.
     */
    @PostMapping("/seat")
    @PreAuthorize("hasRole('STUDENT')") // Only logged-in students can apply
    public ResponseEntity<?> submitSeatApplication(
            @RequestBody @Valid HallApplicationRequest applicationRequest
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            logger.warn("Unauthorized attempt to submit application: No valid authentication found.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Authentication required. Please log in as a student."));
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        try {
            hallApplicationService.submitHallApplication(applicationRequest, userId);
            return ResponseEntity.ok(new MessageResponse("Hall application submitted successfully!"));
        } catch (IllegalArgumentException e) {
            logger.warn("Bad request for application submission (User ID: {}): {}", userId, e.getMessage());
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("An unexpected error occurred during application submission (User ID: {}): {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }


    /**
     * Get summary list of all hall applications (for Provost/Admin dashboard list view).
     * Supports sorting by family income, distance, or application date.
     * @param sortBy Field to sort by (e.g., "familyIncome", "distanceFromHallKm", "applicationDate", "studentIdNo").
     * @param sortOrder "asc" or "desc".
     * @return List of HallApplicationSummaryDTOs.
     */
    @GetMapping("/all-summaries") // e.g., GET /api/applications/all-summaries?sortBy=familyIncome&sortOrder=asc
    @PreAuthorize("hasRole('PROVOST')") // Only Provosts and Admins can view all summaries
    public ResponseEntity<List<HallApplicationSummaryDTO>> getAllApplicationSummaries(
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortOrder
    ) {
        try {
            List<HallApplicationSummaryDTO> summaries = hallApplicationService.getAllHallApplicationSummaries(sortBy, sortOrder);
            return ResponseEntity.ok(summaries);
        } catch (Exception e) {
            logger.error("Error fetching all application summaries: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get full details of a single hall application by ID.
     * @param applicationId The ID of the application.
     * @return Full HallApplication entity.
     */
    @GetMapping("/{applicationId}")
    @PreAuthorize("hasRole('PROVOST')") // Only Provosts and Admins can view full details
    public ResponseEntity<HallApplication> getApplicationDetails(@PathVariable Long applicationId) {
        try {
            Optional<HallApplication> application = hallApplicationService.getHallApplicationById(applicationId);
            return application.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("Error fetching application details for ID {}: {}", applicationId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Accept a hall application. Updates status to APPROVED and student residency.
     * @param applicationId The ID of the application to accept.
     * @return MessageResponse on success or error.
     */
    @PostMapping("/{applicationId}/accept")
    @PreAuthorize("hasRole('PROVOST') or hasRole('ADMIN')") // Only Provosts and Admins can accept
    public ResponseEntity<?> acceptApplication(@PathVariable Long applicationId) {
        try {
            hallApplicationService.acceptHallApplication(applicationId);
            return ResponseEntity.ok(new MessageResponse("Application " + applicationId + " accepted successfully. Student residency updated."));
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to accept application {}: {}", applicationId, e.getMessage());
            return ResponseEntity.badRequest().body(new MessageResponse("Error accepting application: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("An unexpected error occurred while accepting application {}: {}", applicationId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Reject a hall application. Updates status to REJECTED.
     * @param applicationId The ID of the application to reject.
     * @return MessageResponse on success or error.
     */
    @PostMapping("/{applicationId}/reject") // You can use @PutMapping if it's more semantically correct for 'update'
    @PreAuthorize("hasRole('PROVOST') or hasRole('ADMIN')") // Only Provosts and Admins can reject
    public ResponseEntity<?> rejectApplication(@PathVariable Long applicationId) {
        try {
            hallApplicationService.rejectHallApplication(applicationId);
            return ResponseEntity.ok(new MessageResponse("Application " + applicationId + " rejected successfully."));
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to reject application {}: {}", applicationId, e.getMessage());
            return ResponseEntity.badRequest().body(new MessageResponse("Error rejecting application: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("An unexpected error occurred while rejecting application {}: {}", applicationId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Get the status of the current student's hall application.
     * Extracts student ID from JWT token and checks for existing application.
     * @return MessageResponse with application status or "no application" if none exists.
     */
    @GetMapping("/getstatus")
    @PreAuthorize("hasRole('STUDENT')") // Only logged-in students can check their status
    public ResponseEntity<?> getApplicationStatus() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            logger.warn("Unauthorized attempt to get application status: No valid authentication found.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Authentication required. Please log in as a student."));
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        try {
            Optional<HallApplication> application = hallApplicationService.getHallApplicationByUserId(userId);
            if (application.isPresent()) {
                String status = application.get().getApplicationStatus();
                logger.info("Found application for user {}: status = {}, applicationId = {}, date = {}", 
                    userId, status, application.get().getApplicationId(), application.get().getApplicationDate());
                return ResponseEntity.ok(new MessageResponse("Application status: " + status));
            } else {
                logger.info("No application found for user {}", userId);
                return ResponseEntity.ok(new MessageResponse("no application"));
            }
        } catch (Exception e) {
            logger.error("Error fetching application status for student ID {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Debug endpoint to get all applications for the current student.
     * This can help debug issues with multiple applications.
     * @return List of all applications with their statuses.
     */
    @GetMapping("/debug/all")
    @PreAuthorize("hasRole('STUDENT')") // Only logged-in students can check their applications
    public ResponseEntity<?> getAllApplicationsDebug() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            logger.warn("Unauthorized attempt to get applications debug: No valid authentication found.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Authentication required. Please log in as a student."));
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        try {
            // Get all applications for this user
            List<HallApplication> allApplications = hallApplicationService.getAllApplicationsByUserId(userId);
            
            if (allApplications.isEmpty()) {
                return ResponseEntity.ok(new MessageResponse("No applications found"));
            }
            
            StringBuilder response = new StringBuilder("Found " + allApplications.size() + " applications: ");
            for (HallApplication app : allApplications) {
                response.append("ID=").append(app.getApplicationId())
                       .append(" Status=").append(app.getApplicationStatus())
                       .append(" Date=").append(app.getApplicationDate())
                       .append("; ");
            }
            
            return ResponseEntity.ok(new MessageResponse(response.toString()));
        } catch (Exception e) {
            logger.error("Error fetching all applications for student ID {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }
}