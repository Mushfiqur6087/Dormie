package com.HMS.hms.Controller;

import com.HMS.hms.DTO.MessManagerApplicationDTO;
import com.HMS.hms.DTO.MessManagerApplicationRequest;
import com.HMS.hms.DTO.MessageResponse;
import com.HMS.hms.Security.UserDetailsImpl;
import com.HMS.hms.Service.MessManagerApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/mess-manager-applications")
@CrossOrigin(origins = "*")
public class MessManagerApplicationController {

    @Autowired
    private MessManagerApplicationService applicationService;

    /**
     * Submit application for mess manager position (Students only)
     */
    @PostMapping("/call/{callId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> submitApplication(@PathVariable Long callId, 
                                             @Valid @RequestBody MessManagerApplicationRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            MessManagerApplicationDTO application = applicationService.submitApplication(callId, request, userId);
            return ResponseEntity.ok(application);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error submitting application: " + e.getMessage()));
        }
    }

    /**
     * Get applications for a specific call (Provost/Admin only)
     */
    @GetMapping("/call/{callId}")
    @PreAuthorize("hasRole('PROVOST') or hasRole('ADMIN')")
    public ResponseEntity<?> getApplicationsForCall(@PathVariable Long callId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            List<MessManagerApplicationDTO> applications = applicationService.getApplicationsForCall(callId, userId);
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("Error fetching applications: " + e.getMessage()));
        }
    }

    /**
     * Get applications by user (students can see their own, provost/admin can see any)
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getApplicationsByUser(@PathVariable Long userId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long requestingUserId = userDetails.getId();

            List<MessManagerApplicationDTO> applications = applicationService.getApplicationsByUser(userId, requestingUserId);
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("Error fetching applications: " + e.getMessage()));
        }
    }

    /**
     * Get current user's applications
     */
    @GetMapping("/my-applications")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyApplications() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            List<MessManagerApplicationDTO> applications = applicationService.getApplicationsByUser(userId, userId);
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching your applications: " + e.getMessage()));
        }
    }

    /**
     * Get all applications with optional status filter (Provost/Admin only)
     */
    @GetMapping
    @PreAuthorize("hasRole('PROVOST') or hasRole('ADMIN')")
    public ResponseEntity<?> getAllApplications(@RequestParam(required = false) String status) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            List<MessManagerApplicationDTO> applications = applicationService.getAllApplications(status, userId);
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("Error fetching applications: " + e.getMessage()));
        }
    }

    /**
     * Update application status (Provost/Admin only)
     */
    @PatchMapping("/{applicationId}/status")
    @PreAuthorize("hasRole('PROVOST') or hasRole('ADMIN')")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable Long applicationId, 
                                                   @RequestParam String status) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            MessManagerApplicationDTO updatedApplication = applicationService.updateApplicationStatus(applicationId, status, userId);
            return ResponseEntity.ok(updatedApplication);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error updating application status: " + e.getMessage()));
        }
    }

    /**
     * Get application by ID
     */
    @GetMapping("/{applicationId}")
    public ResponseEntity<?> getApplicationById(@PathVariable Long applicationId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            MessManagerApplicationDTO application = applicationService.getApplicationById(applicationId, userId);
            return ResponseEntity.ok(application);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Application not found: " + e.getMessage()));
        }
    }

    /**
     * Delete application (Students can delete their own, Admin can delete any)
     */
    @DeleteMapping("/{applicationId}")
    public ResponseEntity<?> deleteApplication(@PathVariable Long applicationId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            applicationService.deleteApplication(applicationId, userId);
            return ResponseEntity.ok(new MessageResponse("Application deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error deleting application: " + e.getMessage()));
        }
    }
}
