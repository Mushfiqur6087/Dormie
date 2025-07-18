package com.HMS.hms.Controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.HMS.hms.DTO.ComplaintCreateRequest;
import com.HMS.hms.DTO.ComplaintDTO;
import com.HMS.hms.DTO.ComplaintUpdateRequest;
import com.HMS.hms.DTO.MessageResponse;
import com.HMS.hms.Security.UserDetailsImpl;
import com.HMS.hms.Service.ComplaintService;
import com.HMS.hms.Service.UserService;
import com.HMS.hms.Tables.Users;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private UserService userService;

    /**
     * Create a new complaint (only for students)
     * 
     * @param title         the complaint title
     * @param description   the complaint description
     * @param complaintType the complaint type (RAGGING or LOST_AND_FOUND)
     * @param location      the location where incident occurred
     * @param contactInfo   contact information
     * @param images        uploaded images (optional)
     * @return ResponseEntity with created complaint or error message
     */
    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> createComplaint(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("complaintType") String complaintType,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "contactInfo", required = false) String contactInfo,
            @RequestParam(value = "images", required = false) MultipartFile[] images) {
        try {
            // Create request from form parameters
            ComplaintCreateRequest createRequest = new ComplaintCreateRequest();
            createRequest.setTitle(title);
            createRequest.setDescription(description);
            createRequest.setComplaintType(complaintType);
            createRequest.setLocation(location);
            createRequest.setContactInfo(contactInfo);

            // Get current user information
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = null;

            if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                userEmail = userDetails.getEmail();
            }

            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            // Get user by email to get user ID
            var userOpt = userService.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found");
            }

            Users user = userOpt.get();
            ComplaintDTO createdComplaint = complaintService.createComplaint(createRequest, user.getUserId());

            return ResponseEntity.status(HttpStatus.CREATED).body(createdComplaint);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create complaint: " + e.getMessage());
        }
    }

    /**
     * Create a new complaint with JSON (alternative endpoint for JSON requests)
     * 
     * @param createRequest the complaint creation request
     * @return ResponseEntity with created complaint or error message
     */
    @PostMapping(value = "/json", consumes = { MediaType.APPLICATION_JSON_VALUE })
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> createComplaintJson(@Valid @RequestBody ComplaintCreateRequest createRequest) {
        try {
            // Get current user information
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = null;

            if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                userEmail = userDetails.getEmail();
            }

            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            // Get user by email to get user ID
            var userOpt = userService.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found");
            }

            Users user = userOpt.get();
            ComplaintDTO createdComplaint = complaintService.createComplaint(createRequest, user.getUserId());

            return ResponseEntity.status(HttpStatus.CREATED).body(createdComplaint);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create complaint: " + e.getMessage());
        }
    }

    /**
     * Get all complaints visible to the current user
     * 
     * @return ResponseEntity with list of complaints or error message
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAllComplaints() {
        try {
            // Get current user information
            String userEmail = getCurrentUserEmail();
            String userRole = getCurrentUserRole();

            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            // Get user by email to get user ID
            var userOpt = userService.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found");
            }

            Users user = userOpt.get();
            List<ComplaintDTO> complaints = complaintService.getComplaintsVisibleToUser(user.getUserId(), userRole);

            return ResponseEntity.ok(complaints);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch complaints: " + e.getMessage());
        }
    }

    /**
     * Get complaints by type
     * 
     * @param type the complaint type (RAGGING or LOST_AND_FOUND)
     * @return ResponseEntity with list of complaints or error message
     */
    @GetMapping("/type/{type}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getComplaintsByType(@PathVariable String type) {
        try {
            // Get current user information
            String userEmail = getCurrentUserEmail();
            String userRole = getCurrentUserRole();

            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            // Get user by email to get user ID
            var userOpt = userService.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found");
            }

            Users user = userOpt.get();
            List<ComplaintDTO> complaints;

            if ("ragging".equalsIgnoreCase(type)) {
                complaints = complaintService.getRaggingComplaintsVisibleToUser(user.getUserId(), userRole);
            } else if ("lost_and_found".equalsIgnoreCase(type) || "lost-and-found".equalsIgnoreCase(type)) {
                complaints = complaintService.getLostAndFoundComplaints();
            } else {
                complaints = complaintService.getComplaintsByTypeVisibleToUser(type, user.getUserId(), userRole);
            }

            return ResponseEntity.ok(complaints);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch complaints: " + e.getMessage());
        }
    }

    /**
     * Get lost and found complaints (public for all students)
     * 
     * @return ResponseEntity with list of lost and found complaints
     */
    @GetMapping("/lost-and-found")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN') or hasRole('PROVOST')")
    public ResponseEntity<?> getLostAndFoundComplaints() {
        try {
            List<ComplaintDTO> complaints = complaintService.getLostAndFoundComplaints();
            return ResponseEntity.ok(complaints);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch lost and found complaints: " + e.getMessage());
        }
    }

    /**
     * Get user's own complaints
     * 
     * @return ResponseEntity with list of user's complaints
     */
    @GetMapping("/my-complaints")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyComplaints() {
        try {
            // Get current user information
            String userEmail = getCurrentUserEmail();

            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            // Get user by email to get user ID
            var userOpt = userService.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found");
            }

            Users user = userOpt.get();
            List<ComplaintDTO> complaints = complaintService.getComplaintsByUser(user.getUserId());

            return ResponseEntity.ok(complaints);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch your complaints: " + e.getMessage());
        }
    }

    /**
     * Get user's own complaints by type
     * 
     * @param type the complaint type (RAGGING or LOST_AND_FOUND)
     * @return ResponseEntity with list of user's complaints of specified type
     */
    @GetMapping("/my-complaints/type/{type}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyComplaintsByType(@PathVariable String type) {
        try {
            // Get current user information
            String userEmail = getCurrentUserEmail();

            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            // Get user by email to get user ID
            var userOpt = userService.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found");
            }

            Users user = userOpt.get();
            List<ComplaintDTO> complaints = complaintService.getComplaintsByUserAndType(user.getUserId(), type);

            return ResponseEntity.ok(complaints);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch your complaints: " + e.getMessage());
        }
    }

    /**
     * Get user's own reports (alias for my-complaints)
     * 
     * @return ResponseEntity with list of user's complaints
     */
    @GetMapping("/my-reports")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyReports() {
        try {
            // Get current user information
            String userEmail = getCurrentUserEmail();

            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            // Get user by email to get user ID
            var userOpt = userService.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found");
            }

            Users user = userOpt.get();
            List<ComplaintDTO> complaints = complaintService.getComplaintsByUser(user.getUserId());

            return ResponseEntity.ok(complaints);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch your reports: " + e.getMessage());
        }
    }

    /**
     * Get user's own ragging reports
     * 
     * @return ResponseEntity with list of user's ragging reports
     */
    @GetMapping("/my-reports/ragging")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyRaggingReports() {
        try {
            // Get current user information
            String userEmail = getCurrentUserEmail();

            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            // Get user by email to get user ID
            var userOpt = userService.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found");
            }

            Users user = userOpt.get();
            List<ComplaintDTO> complaints = complaintService.getComplaintsByUserAndType(user.getUserId(), "RAGGING");

            return ResponseEntity.ok(complaints);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch your ragging reports: " + e.getMessage());
        }
    }

    /**
     * Get user's own lost and found reports
     * 
     * @return ResponseEntity with list of user's lost and found reports
     */
    @GetMapping("/my-reports/lost_and_found")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyLostAndFoundReports() {
        try {
            // Get current user information
            String userEmail = getCurrentUserEmail();

            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            // Get user by email to get user ID
            var userOpt = userService.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found");
            }

            Users user = userOpt.get();
            List<ComplaintDTO> complaints = complaintService.getComplaintsByUserAndType(user.getUserId(),
                    "LOST_AND_FOUND");

            return ResponseEntity.ok(complaints);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch your lost and found reports: " + e.getMessage());
        }
    }

    /**
     * Get a specific complaint by ID
     * 
     * @param id the complaint ID
     * @return ResponseEntity with complaint details or error message
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getComplaintById(@PathVariable Long id) {
        try {
            // Get current user information
            String userEmail = getCurrentUserEmail();
            String userRole = getCurrentUserRole();

            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            // Get user by email to get user ID
            var userOpt = userService.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found");
            }

            Users user = userOpt.get();
            ComplaintDTO complaint = complaintService.getComplaintById(id, user.getUserId(), userRole);

            return ResponseEntity.ok(complaint);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch complaint: " + e.getMessage());
        }
    }

    /**
     * Update a complaint status (only for provost and admin)
     * 
     * @param id            the complaint ID
     * @param updateRequest the update request
     * @return ResponseEntity with updated complaint or error message
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PROVOST') or hasRole('ADMIN')")
    public ResponseEntity<?> updateComplaint(@PathVariable Long id,
            @Valid @RequestBody ComplaintUpdateRequest updateRequest) {
        try {
            // Get current user information
            String userEmail = getCurrentUserEmail();
            String userRole = getCurrentUserRole();

            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            // Get user by email to get user ID
            var userOpt = userService.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found");
            }

            Users user = userOpt.get();
            ComplaintDTO updatedComplaint = complaintService.updateComplaint(id, updateRequest, user.getUserId(),
                    userRole);

            return ResponseEntity.ok(updatedComplaint);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update complaint: " + e.getMessage());
        }
    }

    /**
     * Update a complaint status using PATCH (alternative endpoint for frontend)
     * 
     * @param id            the complaint ID
     * @param updateRequest the update request
     * @return ResponseEntity with updated complaint or error message
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('PROVOST') or hasRole('ADMIN')")
    public ResponseEntity<?> updateComplaintStatus(@PathVariable Long id,
            @Valid @RequestBody ComplaintUpdateRequest updateRequest) {
        try {
            // Get current user information
            String userEmail = getCurrentUserEmail();
            String userRole = getCurrentUserRole();

            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            // Get user by email to get user ID
            var userOpt = userService.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found");
            }

            Users user = userOpt.get();
            ComplaintDTO updatedComplaint = complaintService.updateComplaint(id, updateRequest, user.getUserId(),
                    userRole);

            return ResponseEntity.ok(updatedComplaint);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update complaint: " + e.getMessage());
        }
    }

    /**
     * Delete a complaint (only complaint creator or admin)
     * 
     * @param id the complaint ID
     * @return ResponseEntity with success message or error
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteComplaint(@PathVariable Long id) {
        try {
            // Get current user information
            String userEmail = getCurrentUserEmail();
            String userRole = getCurrentUserRole();

            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            // Get user by email to get user ID
            var userOpt = userService.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found");
            }

            Users user = userOpt.get();
            complaintService.deleteComplaint(id, user.getUserId(), userRole);

            return ResponseEntity.ok("Complaint deleted successfully");

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete complaint: " + e.getMessage());
        }
    }

    /**
     * Search complaints
     * 
     * @param query the search query
     * @return ResponseEntity with search results or error message
     */
    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> searchComplaints(@RequestParam String query) {
        try {
            // Get current user information
            String userEmail = getCurrentUserEmail();
            String userRole = getCurrentUserRole();

            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            // Get user by email to get user ID
            var userOpt = userService.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found");
            }

            Users user = userOpt.get();
            List<ComplaintDTO> complaints = complaintService.searchComplaints(query, user.getUserId(), userRole);

            return ResponseEntity.ok(complaints);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to search complaints: " + e.getMessage());
        }
    }

    /**
     * Get complaint statistics (for dashboard)
     * 
     * @return ResponseEntity with statistics or error message
     */
    @GetMapping("/statistics")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getComplaintStatistics() {
        try {
            String userRole = getCurrentUserRole();

            if (userRole == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            ComplaintService.ComplaintStatistics stats = complaintService.getComplaintStatistics(userRole);
            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch statistics: " + e.getMessage());
        }
    }

    /**
     * Update own complaint status (for Lost and Found complaints only)
     * 
     * @param id      the complaint ID
     * @param request the status update request
     * @return ResponseEntity with success message or error
     */
    @PutMapping("/my-complaints/{id}/status")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> updateMyComplaintStatus(@PathVariable Long id,
            @RequestBody ComplaintUpdateRequest request) {
        try {
            // Get current user information
            String userEmail = getCurrentUserEmail();

            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            // Get user by email to get user ID
            var userOpt = userService.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found");
            }

            Users user = userOpt.get();

            // Update complaint status (only for own complaints and Lost & Found type)
            String message = complaintService.updateOwnComplaintStatus(id, user.getUserId(), request.getStatus());

            return ResponseEntity.ok(new MessageResponse(message));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Failed to update complaint status: " + e.getMessage()));
        }
    }

    /**
     * Update own complaint status using PATCH (alternative endpoint)
     * 
     * @param id      the complaint ID
     * @param request the status update request
     * @return ResponseEntity with success message or error
     */
    @PatchMapping("/{id}/update-own-status")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> updateOwnComplaintStatus(@PathVariable Long id,
            @RequestBody ComplaintUpdateRequest request) {
        try {
            // Get current user information
            String userEmail = getCurrentUserEmail();

            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            // Get user by email to get user ID
            var userOpt = userService.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found");
            }

            Users user = userOpt.get();

            // Update complaint status (only for own complaints and Lost & Found type)
            String message = complaintService.updateOwnComplaintStatus(id, user.getUserId(), request.getStatus());

            return ResponseEntity.ok(new MessageResponse(message));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Failed to update complaint status: " + e.getMessage()));
        }
    }

    // Helper methods to get current user information
    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            return userDetails.getEmail();
        }
        return null;
    }

    private String getCurrentUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getAuthorities() != null) {
            for (GrantedAuthority authority : authentication.getAuthorities()) {
                String role = authority.getAuthority();
                if (role.startsWith("ROLE_")) {
                    return role.substring(5); // Remove "ROLE_" prefix
                }
            }
        }
        return null;
    }
}
