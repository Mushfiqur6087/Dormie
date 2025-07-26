package com.HMS.hms.Service;

import com.HMS.hms.DTO.MessManagerApplicationDTO;
import com.HMS.hms.DTO.MessManagerApplicationRequest;
import com.HMS.hms.Repo.MessManagerApplicationRepo;
import com.HMS.hms.Repo.MessManagerCallRepo;
import com.HMS.hms.Tables.MessManagerApplication;
import com.HMS.hms.Tables.MessManagerCall;
import com.HMS.hms.Tables.Students;
import com.HMS.hms.Tables.Users;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MessManagerApplicationService {

    @Autowired
    private MessManagerApplicationRepo messManagerApplicationRepo;

    @Autowired
    private MessManagerCallRepo messManagerCallRepo;

    @Autowired
    private UserService userService;

    @Autowired
    private StudentsService studentsService;

    /**
     * Submit an application for mess manager position (Students only)
     */
    @Transactional
    public MessManagerApplicationDTO submitApplication(Long callId, MessManagerApplicationRequest request, Long userId) {
        // Verify user exists and is a student
        Optional<Users> userOpt = userService.findByUserId(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        Users user = userOpt.get();
        if (!"STUDENT".equals(user.getRole())) {
            throw new RuntimeException("Only students can apply for mess manager positions");
        }

        // Verify student record exists
        Optional<Students> studentOpt = studentsService.findByUserId(userId);
        if (studentOpt.isEmpty()) {
            throw new RuntimeException("Student record not found for user ID: " + userId);
        }

        // Verify call exists and is active
        Optional<MessManagerCall> callOpt = messManagerCallRepo.findById(callId);
        if (callOpt.isEmpty()) {
            throw new RuntimeException("Call not found with ID: " + callId);
        }

        MessManagerCall call = callOpt.get();
        if (!"ACTIVE".equals(call.getStatus())) {
            throw new RuntimeException("This call is no longer accepting applications");
        }

        // Check if deadline has passed
        if (call.getApplicationDeadline().isBefore(LocalDate.now())) {
            throw new RuntimeException("Application deadline has passed");
        }

        // Check if user has already applied for this call
        Optional<MessManagerApplication> existingApplication = messManagerApplicationRepo.findByCallIdAndUserId(callId, userId);
        if (existingApplication.isPresent()) {
            throw new RuntimeException("You have already applied for this call");
        }

        // Create application
        MessManagerApplication application = new MessManagerApplication();
        application.setCallId(callId);
        application.setUserId(userId);
        application.setStudentId(studentOpt.get().getStudentId());
        application.setMotivation(request.getMotivation());
        application.setExperience(request.getPreviousExperience());
        application.setStatus("SUBMITTED");

        MessManagerApplication savedApplication = messManagerApplicationRepo.save(application);
        return convertToDTO(savedApplication);
    }

    /**
     * Get all applications for a call (Provost/Admin only)
     */
    public List<MessManagerApplicationDTO> getApplicationsForCall(Long callId, Long userId) {
        // Verify user has permission
        Optional<Users> userOpt = userService.findByUserId(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        Users user = userOpt.get();
        if (!"PROVOST".equals(user.getRole()) && !"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Only provost and admin can view applications");
        }

        List<MessManagerApplication> applications = messManagerApplicationRepo.findByCallIdWithUserDetails(callId);
        return applications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get applications by user (for students to see their own applications)
     */
    public List<MessManagerApplicationDTO> getApplicationsByUser(Long userId, Long requestingUserId) {
        // Students can only see their own applications
        if (!userId.equals(requestingUserId)) {
            Optional<Users> userOpt = userService.findByUserId(requestingUserId);
            if (userOpt.isEmpty() || (!"PROVOST".equals(userOpt.get().getRole()) && !"ADMIN".equals(userOpt.get().getRole()))) {
                throw new RuntimeException("You can only view your own applications");
            }
        }

        List<MessManagerApplication> applications = messManagerApplicationRepo.findByUserIdOrderByAppliedAtDesc(userId);
        return applications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update application status (Provost/Admin only)
     */
    @Transactional
    public MessManagerApplicationDTO updateApplicationStatus(Long applicationId, String newStatus, Long userId) {
        // Verify user has permission
        Optional<Users> userOpt = userService.findByUserId(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        Users user = userOpt.get();
        if (!"PROVOST".equals(user.getRole()) && !"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Only provost and admin can update application status");
        }

        Optional<MessManagerApplication> applicationOpt = messManagerApplicationRepo.findById(applicationId);
        if (applicationOpt.isEmpty()) {
            throw new RuntimeException("Application not found with ID: " + applicationId);
        }

        MessManagerApplication application = applicationOpt.get();
        
        // Validate status
        if (!isValidStatus(newStatus)) {
            throw new RuntimeException("Invalid status: " + newStatus);
        }

        application.setStatus(newStatus);
        application.setUpdatedAt(LocalDateTime.now());

        MessManagerApplication updatedApplication = messManagerApplicationRepo.save(application);
        return convertToDTO(updatedApplication);
    }

    /**
     * Get all applications with optional status filter
     */
    public List<MessManagerApplicationDTO> getAllApplications(String status, Long userId) {
        // Verify user has permission
        Optional<Users> userOpt = userService.findByUserId(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        Users user = userOpt.get();
        if (!"PROVOST".equals(user.getRole()) && !"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Only provost and admin can view all applications");
        }

        List<MessManagerApplication> applications;
        if (status != null && !status.isEmpty()) {
            applications = messManagerApplicationRepo.findByStatusOrderByAppliedAtAsc(status);
        } else {
            applications = messManagerApplicationRepo.findAllWithDetails();
        }

        return applications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Delete an application (Student can delete their own, Admin can delete any)
     */
    @Transactional
    public void deleteApplication(Long applicationId, Long userId) {
        Optional<MessManagerApplication> applicationOpt = messManagerApplicationRepo.findById(applicationId);
        if (applicationOpt.isEmpty()) {
            throw new RuntimeException("Application not found with ID: " + applicationId);
        }

        MessManagerApplication application = applicationOpt.get();

        // Verify user has permission
        Optional<Users> userOpt = userService.findByUserId(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        Users user = userOpt.get();
        boolean isAdmin = "ADMIN".equals(user.getRole());
        boolean isOwner = application.getUserId().equals(userId);

        if (!isAdmin && !isOwner) {
            throw new RuntimeException("You can only delete your own applications");
        }

        // Check if application can be deleted (not selected)
        if ("SELECTED".equals(application.getStatus())) {
            throw new RuntimeException("Cannot delete a selected application");
        }

        messManagerApplicationRepo.delete(application);
    }

    /**
     * Get application by ID
     */
    public MessManagerApplicationDTO getApplicationById(Long applicationId, Long userId) {
        Optional<MessManagerApplication> applicationOpt = messManagerApplicationRepo.findById(applicationId);
        if (applicationOpt.isEmpty()) {
            throw new RuntimeException("Application not found with ID: " + applicationId);
        }

        MessManagerApplication application = applicationOpt.get();

        // Verify user has permission to view
        Optional<Users> userOpt = userService.findByUserId(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        Users user = userOpt.get();
        boolean isAdmin = "ADMIN".equals(user.getRole());
        boolean isProvost = "PROVOST".equals(user.getRole());
        boolean isOwner = application.getUserId().equals(userId);

        if (!isAdmin && !isProvost && !isOwner) {
            throw new RuntimeException("You do not have permission to view this application");
        }

        return convertToDTO(application);
    }

    /**
     * Convert MessManagerApplication entity to DTO
     */
    private MessManagerApplicationDTO convertToDTO(MessManagerApplication application) {
        MessManagerApplicationDTO dto = new MessManagerApplicationDTO();
        dto.setId(application.getApplicationId());
        dto.setCallId(application.getCallId());
        dto.setUserId(application.getUserId());
        dto.setMotivation(application.getMotivation());
        dto.setPreviousExperience(application.getExperience());
        dto.setStatus(application.getStatus());
        dto.setAppliedAt(application.getAppliedAt());
        dto.setUpdatedAt(application.getUpdatedAt());

        // Set user information
        if (application.getUser() != null) {
            dto.setUserName(application.getUser().getUsername());
            dto.setUserEmail(application.getUser().getEmail());
        }

        // Set call information
        if (application.getMessManagerCall() != null) {
            dto.setCallTitle(application.getMessManagerCall().getTitle());
        }

        // Set student name
        try {
            Optional<Students> studentOpt = studentsService.findByUserId(application.getUserId());
            if (studentOpt.isPresent()) {
                Students student = studentOpt.get();
                String fullName = (student.getFirstName() != null ? student.getFirstName() : "") + 
                                 (student.getLastName() != null ? " " + student.getLastName() : "");
                dto.setStudentName(fullName.trim());
            }
        } catch (Exception e) {
            // Ignore if student not found
        }

        return dto;
    }

    /**
     * Validate application status
     */
    private boolean isValidStatus(String status) {
        return status != null && 
               (status.equals("SUBMITTED") || 
                status.equals("UNDER_REVIEW") || 
                status.equals("SELECTED") || 
                status.equals("REJECTED"));
    }
}
