package com.HMS.hms.Controller;

import com.HMS.hms.DTO.RoomChangeApplicationDTO;
import com.HMS.hms.DTO.RoomChangeRequest;
import com.HMS.hms.Service.RoomChangeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * REST Controller for handling room change applications
 * Provides endpoints for students to apply for room changes and for provosts to manage applications
 */
@RestController
@RequestMapping("/api/room-change")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000"})
public class RoomChangeController {

    private final RoomChangeService roomChangeService;

    /**
     * Helper method to get userId from username
     * 
     * @param username The username to lookup
     * @return The user's ID
     * @throws IllegalArgumentException if user not found
     */
    private Long getUserIdFromUsername(String username) {
        // This will be implemented using UsersRepo or UserService
        // For now, we'll need to add this functionality to the service layer
        return roomChangeService.getUserIdByUsername(username);
    }

    /**
     * Submit a new room change application
     * Only authenticated students can submit applications
     * 
     * @param request The room change request containing desired room and reason
     * @param principal The authenticated user's principal
     * @return Response with the created application details
     */
    @PostMapping("/apply")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> submitApplication(
            @RequestBody RoomChangeRequest request,
            Principal principal) {
        
        System.out.println("=== Room Change Application Request ===");
        System.out.println("Principal: " + principal);
        System.out.println("Request: " + request);
        
        try {
            // Get the student's username from the authenticated principal
            String username = principal.getName();
            System.out.println("Username from principal: " + username);
            Long userId = getUserIdFromUsername(username);
            System.out.println("User ID: " + userId);
            
            // Submit the application through the service layer
            String result = roomChangeService.submitApplication(userId, request);
            System.out.println("Service result: " + result);
            
            return ResponseEntity.ok().body(result);
            
        } catch (IllegalStateException e) {
            System.out.println("IllegalStateException: " + e.getMessage());
            // Handle business logic violations (e.g., room not available, student already has pending application)
            return ResponseEntity.badRequest().body(e.getMessage());
            
        } catch (Exception e) {
            System.out.println("Exception: " + e.getMessage());
            e.printStackTrace();
            // Handle unexpected errors
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to submit room change application: " + e.getMessage());
        }
    }

    /**
     * Get the current user's room change application status
     * Students can only see their own applications
     * 
     * @param principal The authenticated user's principal
     * @return Response with application details or null if no application exists
     */
    @GetMapping("/my-application")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyApplication(Principal principal) {
        
        try {
            String username = principal.getName();
            Long userId = getUserIdFromUsername(username);
            RoomChangeApplicationDTO application = roomChangeService.getApplicationStatusAsDTO(userId);
            
            if (application != null) {
                return ResponseEntity.ok(application);
            } else {
                return ResponseEntity.ok().body("No room change application found");
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve application: " + e.getMessage());
        }
    }

    /**
     * Cancel a pending room change application
     * Students can only cancel their own pending applications
     * 
     * @param principal The authenticated user's principal
     * @return Response indicating success or failure
     */
    @DeleteMapping("/cancel")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> cancelApplication(Principal principal) {
        
        try {
            String username = principal.getName();
            Long userId = getUserIdFromUsername(username);
            String result = roomChangeService.cancelApplication(userId);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to cancel application: " + e.getMessage());
        }
    }

    /**
     * Get all room change applications (for provosts)
     * Only provosts can view all applications
     * 
     * @return Response with list of all applications
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('PROVOST')")
    public ResponseEntity<?> getAllApplications() {
        
        try {
            List<RoomChangeApplicationDTO> applications = roomChangeService.getAllApplications();
            return ResponseEntity.ok(applications);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve applications: " + e.getMessage());
        }
    }

    /**
     * Get applications by status (for provosts)
     * Only provosts can filter applications by status
     * 
     * @param status The application status to filter by (PENDING, APPROVED, REJECTED)
     * @return Response with filtered list of applications
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('PROVOST')")
    public ResponseEntity<?> getApplicationsByStatus(@PathVariable String status) {
        
        try {
            List<RoomChangeApplicationDTO> applications = roomChangeService.getApplicationsByStatus(status);
            return ResponseEntity.ok(applications);
            
        } catch (IllegalArgumentException e) {
            // Handle invalid status values
            return ResponseEntity.badRequest().body("Invalid status: " + status);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve applications: " + e.getMessage());
        }
    }

    /**
     * Approve a room change application (for provosts)
     * Only provosts can approve applications
     * This will move the student to the new room
     * 
     * @param applicationId The ID of the application to approve
     * @return Response indicating success or failure
     */
    @PutMapping("/approve/{applicationId}")
    @PreAuthorize("hasRole('PROVOST')")
    public ResponseEntity<?> approveApplication(@PathVariable Long applicationId) {
        
        try {
            String result = roomChangeService.approveApplication(applicationId);
            return ResponseEntity.ok(result);
            
        } catch (IllegalStateException e) {
            // Handle business logic violations (e.g., room no longer available)
            return ResponseEntity.badRequest().body(e.getMessage());
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to approve application: " + e.getMessage());
        }
    }

    /**
     * Reject a room change application (for provosts)
     * Only provosts can reject applications
     * 
     * @param applicationId The ID of the application to reject
     * @return Response indicating success or failure
     */
    @PutMapping("/reject/{applicationId}")
    @PreAuthorize("hasRole('PROVOST')")
    public ResponseEntity<?> rejectApplication(@PathVariable Long applicationId) {
        
        try {
            String result = roomChangeService.rejectApplication(applicationId);
            return ResponseEntity.ok(result);
            
        } catch (IllegalStateException e) {
            // Handle business logic violations (e.g., application already processed)
            return ResponseEntity.badRequest().body(e.getMessage());
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to reject application: " + e.getMessage());
        }
    }

    /**
     * Get a specific application by ID (for provosts)
     * Only provosts can view individual applications by ID
     * 
     * @param applicationId The ID of the application to retrieve
     * @return Response with application details
     */
    @GetMapping("/{applicationId}")
    @PreAuthorize("hasRole('PROVOST')")
    public ResponseEntity<?> getApplicationById(@PathVariable Long applicationId) {
        
        try {
            // Find the application in the list of all applications
            List<RoomChangeApplicationDTO> allApplications = roomChangeService.getAllApplications();
            RoomChangeApplicationDTO application = allApplications.stream()
                    .filter(app -> app.getApplicationId().equals(applicationId))
                    .findFirst()
                    .orElse(null);
            
            if (application != null) {
                return ResponseEntity.ok(application);
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve application: " + e.getMessage());
        }
    }
}
