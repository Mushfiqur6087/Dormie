package com.HMS.hms.Controller;

import com.HMS.hms.DTO.MessManagerDTO;
import com.HMS.hms.DTO.MessageResponse;
import com.HMS.hms.Security.UserDetailsImpl;
import com.HMS.hms.Service.MessManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mess-managers")
@CrossOrigin(origins = "*")
public class MessManagerController {

    @Autowired
    private MessManagerService messManagerService;

    /**
     * Assign mess managers from selected applications (Provost/Admin only)
     */
    @PostMapping("/assign")
    @PreAuthorize("hasRole('PROVOST') or hasRole('ADMIN')")
    public ResponseEntity<?> assignMessManagers(@RequestParam Long callId, 
                                               @RequestParam List<Long> selectedApplicationIds) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            List<MessManagerDTO> assignedManagers = messManagerService.assignMessManagers(callId, selectedApplicationIds, userId);
            return ResponseEntity.ok(assignedManagers);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error assigning mess managers: " + e.getMessage()));
        }
    }

    /**
     * Get current active mess managers
     */
    @GetMapping("/active")
    public ResponseEntity<?> getCurrentActiveManagers() {
        try {
            List<MessManagerDTO> activeManagers = messManagerService.getCurrentActiveManagers();
            return ResponseEntity.ok(activeManagers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching active managers: " + e.getMessage()));
        }
    }

    /**
     * Get mess managers by month and year
     */
    @GetMapping("/month/{month}/year/{year}")
    public ResponseEntity<?> getManagersByMonthAndYear(@PathVariable String month, @PathVariable Integer year) {
        try {
            List<MessManagerDTO> managers = messManagerService.getManagersByMonthAndYear(month, year);
            return ResponseEntity.ok(managers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching managers: " + e.getMessage()));
        }
    }

    /**
     * Get mess managers by user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getManagersByUser(@PathVariable Long userId) {
        try {
            List<MessManagerDTO> managers = messManagerService.getManagersByUser(userId);
            return ResponseEntity.ok(managers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching managers: " + e.getMessage()));
        }
    }

    /**
     * Check if current user is an active mess manager
     */
    @GetMapping("/my-status")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyManagerStatus() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            boolean isManager = messManagerService.isUserCurrentlyMessManager(userId);
            return ResponseEntity.ok(new MessageResponse(isManager ? "Active mess manager" : "Not a mess manager"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error checking status: " + e.getMessage()));
        }
    }

    /**
     * Get all mess managers with optional status filter
     */
    @GetMapping
    public ResponseEntity<?> getAllManagers(@RequestParam(required = false) String status) {
        try {
            List<MessManagerDTO> managers = messManagerService.getAllManagers(status);
            return ResponseEntity.ok(managers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching managers: " + e.getMessage()));
        }
    }

    /**
     * Get mess manager by ID
     */
    @GetMapping("/{managerId}")
    public ResponseEntity<?> getManagerById(@PathVariable Long managerId) {
        try {
            MessManagerDTO manager = messManagerService.getManagerById(managerId);
            return ResponseEntity.ok(manager);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Manager not found: " + e.getMessage()));
        }
    }

    /**
     * Terminate mess manager assignment (Provost/Admin only)
     */
    @PatchMapping("/{managerId}/terminate")
    @PreAuthorize("hasRole('PROVOST') or hasRole('ADMIN')")
    public ResponseEntity<?> terminateManager(@PathVariable Long managerId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            String result = messManagerService.terminateManager(managerId, userId);
            return ResponseEntity.ok(new MessageResponse(result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error terminating manager: " + e.getMessage()));
        }
    }
}
