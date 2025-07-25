package com.HMS.hms.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.HMS.hms.DTO.RoomChangeRequest;
import com.HMS.hms.DTO.RoomChangeApplicationDTO;
import com.HMS.hms.Repo.RoomChangeApplicationRepo;
import com.HMS.hms.Repo.StudentsRepo;
import com.HMS.hms.Repo.UsersRepo;
import com.HMS.hms.Repo.StudentRoomRepo;
import com.HMS.hms.Repo.RoomRepo;
import com.HMS.hms.Tables.RoomChangeApplication;
import com.HMS.hms.Tables.Students;
import com.HMS.hms.Tables.Users;
import com.HMS.hms.Tables.StudentRoom;
import com.HMS.hms.Tables.Room;

@Service
public class RoomChangeService {

    private static final Logger logger = LoggerFactory.getLogger(RoomChangeService.class);

    @Autowired
    private RoomChangeApplicationRepo roomChangeApplicationRepo;

    @Autowired
    private StudentsRepo studentsRepo;

    @Autowired
    private UsersRepo usersRepo;

    @Autowired
    private StudentRoomRepo studentRoomRepo;

    @Autowired
    private RoomRepo roomRepo;

    /**
     * Helper method to get userId from username
     * 
     * @param username The username to lookup
     * @return The user's ID
     * @throws IllegalArgumentException if user not found
     */
    public Long getUserIdByUsername(String username) {
        System.out.println("=== getUserIdByUsername ===");
        System.out.println("Looking up username: " + username);
        
        // Use findAll and filter to handle multiple results
        List<Users> users = usersRepo.findAll().stream()
                .filter(user -> username.equals(user.getUsername()))
                .collect(Collectors.toList());
        
        System.out.println("Found " + users.size() + " users with username: " + username);
        
        if (users.isEmpty()) {
            throw new IllegalArgumentException("User not found with username: " + username);
        }
        
        if (users.size() > 1) {
            System.out.println("Warning: Multiple users found with username: " + username);
            System.out.println("Using the first user found");
            // For now, use the first user found
            // In production, this should be handled differently (usernames should be unique)
        }
        
        Users user = users.get(0);
        System.out.println("Selected user ID: " + user.getUserId());
        return user.getUserId();
    }

    /**
     * Submit a new room change application
     * Business Rules:
     * 1. Student must have current room assignment
     * 2. Cannot have pending application already
     * 3. Preferred room must exist and have available space
     * 4. Cannot request same room as current
     */
    @Transactional
    public String submitApplication(Long userId, RoomChangeRequest request) {
        System.out.println("=== RoomChangeService.submitApplication ===");
        System.out.println("User ID: " + userId);
        System.out.println("Request: " + request);
        logger.info("Processing room change application for user: {}", userId);

        // 1. Validate user exists and get student info
        Optional<Students> studentOpt = studentsRepo.findByUserId(userId);
        System.out.println("Student found: " + studentOpt.isPresent());
        if (!studentOpt.isPresent()) {
            return "Student record not found";
        }
        Students student = studentOpt.get();

        // 2. Check if student has current room assignment
        StudentRoom currentRoomAssignment = studentRoomRepo.findByUserId(userId);
        System.out.println("Current room assignment: " + currentRoomAssignment);
        if (currentRoomAssignment == null) {
            return "No current room assignment found. Cannot apply for room change.";
        }
        String currentRoom = currentRoomAssignment.getRoomId();
        System.out.println("Current room: " + currentRoom);

        // 3. Validate preferred room is different from current
        if (currentRoom.equals(request.getPreferredRoom())) {
            return "Cannot request the same room you currently occupy";
        }

        // 4. Check if student already has pending application
        boolean hasPending = roomChangeApplicationRepo.existsByUserIdAndApplicationStatus(userId, "PENDING");
        System.out.println("Has pending application: " + hasPending);
        if (hasPending) {
            return "You already have a pending room change application";
        }

        // 5. Validate preferred room exists and has space
        Optional<Room> preferredRoomOpt = roomRepo.findById(request.getPreferredRoom());
        System.out.println("Preferred room found: " + preferredRoomOpt.isPresent());
        if (!preferredRoomOpt.isPresent()) {
            return "Requested room does not exist";
        }
        
        Room preferredRoom = preferredRoomOpt.get();
        System.out.println("Preferred room has space: " + preferredRoom.hasSpace());
        if (!preferredRoom.hasSpace()) {
            return "Requested room is currently full";
        }

        // 6. Create and save application
        RoomChangeApplication application = new RoomChangeApplication(
            userId,
            student.getStudentId(),
            currentRoom,
            request.getPreferredRoom(),
            request.getReason()
        );
        
        // Explicitly set application date and status to ensure they're not null
        application.setApplicationDate(LocalDateTime.now());
        application.setApplicationStatus("PENDING");

        System.out.println("Created application: " + application);
        roomChangeApplicationRepo.save(application);
        System.out.println("Application saved successfully");
        logger.info("Room change application submitted successfully for user: {}", userId);
        
        return "Application submitted successfully";
    }

    /**
     * Get application status for a student
     */
    public Optional<RoomChangeApplication> getApplicationStatus(Long userId) {
        return roomChangeApplicationRepo.findByUserId(userId);
    }

    /**
     * Get application status for a student as DTO
     */
    public RoomChangeApplicationDTO getApplicationStatusAsDTO(Long userId) {
        Optional<RoomChangeApplication> applicationOpt = roomChangeApplicationRepo.findByUserId(userId);
        
        if (applicationOpt.isPresent()) {
            RoomChangeApplication app = applicationOpt.get();
            
            // Get student details for display
            Optional<Students> studentOpt = studentsRepo.findByUserId(app.getUserId());
            Optional<Users> userOpt = usersRepo.findById(app.getUserId());
            
            String studentName = "Unknown";
            String studentEmail = "";
            
            if (studentOpt.isPresent() && userOpt.isPresent()) {
                Students student = studentOpt.get();
                Users user = userOpt.get();
                studentName = (student.getFirstName() != null ? student.getFirstName() : "") + 
                             " " + (student.getLastName() != null ? student.getLastName() : "");
                studentName = studentName.trim();
                if (studentName.isEmpty()) {
                    studentName = user.getUsername();
                }
                studentEmail = user.getEmail() != null ? user.getEmail() : "";
            }
            
            // Use the existing constructor
            RoomChangeApplicationDTO dto = new RoomChangeApplicationDTO(app, studentName, studentEmail);
            return dto;
        }
        
        return null;
    }

    /**
     * Get all applications for provost review
     * Converts entities to DTOs with additional student information
     */
    public List<RoomChangeApplicationDTO> getAllApplications() {
        List<RoomChangeApplication> applications = roomChangeApplicationRepo.findAllByOrderByApplicationDateDesc();
        
        return applications.stream().map(app -> {
            // Get student details for display
            Optional<Students> studentOpt = studentsRepo.findByUserId(app.getUserId());
            Optional<Users> userOpt = usersRepo.findById(app.getUserId());
            
            String studentName = "Unknown Student";
            String studentEmail = "Unknown Email";
            
            if (studentOpt.isPresent()) {
                Students student = studentOpt.get();
                studentName = (student.getFirstName() != null ? student.getFirstName() : "") + 
                             " " + (student.getLastName() != null ? student.getLastName() : "");
                studentName = studentName.trim();
                if (studentName.isEmpty()) {
                    studentName = "Student ID: " + student.getStudentId();
                }
            }
            
            if (userOpt.isPresent()) {
                studentEmail = userOpt.get().getEmail();
            }
            
            return new RoomChangeApplicationDTO(app, studentName, studentEmail);
        }).collect(Collectors.toList());
    }

    /**
     * Approve room change application
     * Business Logic:
     * 1. Verify application exists and is pending
     * 2. Check preferred room still has space
     * 3. Update room occupancy counts
     * 4. Move student to new room
     * 5. Update application status
     */
    @Transactional
    public String approveApplication(Long applicationId) {
        logger.info("Processing approval for application: {}", applicationId);

        // 1. Get application
        Optional<RoomChangeApplication> appOpt = roomChangeApplicationRepo.findById(applicationId);
        if (!appOpt.isPresent()) {
            return "Application not found";
        }

        RoomChangeApplication application = appOpt.get();
        if (!"PENDING".equals(application.getApplicationStatus())) {
            return "Application is not in pending status";
        }

        // 2. Verify preferred room still has space
        Optional<Room> preferredRoomOpt = roomRepo.findById(application.getPreferredRoom());
        if (!preferredRoomOpt.isPresent()) {
            return "Preferred room no longer exists";
        }

        Room preferredRoom = preferredRoomOpt.get();
        if (!preferredRoom.hasSpace()) {
            return "Preferred room is now full";
        }

        // 3. Get current room for occupancy update
        Optional<Room> currentRoomOpt = roomRepo.findById(application.getCurrentRoom());
        if (!currentRoomOpt.isPresent()) {
            return "Current room record not found";
        }
        Room currentRoom = currentRoomOpt.get();

        // 4. Update room assignments
        try {
            // Update student's room assignment
            StudentRoom studentRoom = studentRoomRepo.findByUserId(application.getUserId());
            if (studentRoom != null) {
                studentRoom.setRoomId(application.getPreferredRoom());
                studentRoomRepo.save(studentRoom);
            } else {
                return "Student room assignment not found";
            }

            // Update room occupancy counts
            currentRoom.setCurrentStudent(currentRoom.getCurrentStudent() - 1);
            preferredRoom.setCurrentStudent(preferredRoom.getCurrentStudent() + 1);
            
            roomRepo.save(currentRoom);
            roomRepo.save(preferredRoom);

            // Update application status
            application.setApplicationStatus("APPROVED");
            roomChangeApplicationRepo.save(application);

            logger.info("Room change approved: User {} moved from {} to {}", 
                       application.getUserId(), application.getCurrentRoom(), application.getPreferredRoom());
            
            return "Application approved successfully";

        } catch (Exception e) {
            logger.error("Error approving application: ", e);
            return "Error processing approval: " + e.getMessage();
        }
    }

    /**
     * Reject room change application
     */
    @Transactional
    public String rejectApplication(Long applicationId) {
        logger.info("Processing rejection for application: {}", applicationId);

        Optional<RoomChangeApplication> appOpt = roomChangeApplicationRepo.findById(applicationId);
        if (!appOpt.isPresent()) {
            return "Application not found";
        }

        RoomChangeApplication application = appOpt.get();
        if (!"PENDING".equals(application.getApplicationStatus())) {
            return "Application is not in pending status";
        }

        application.setApplicationStatus("REJECTED");
        roomChangeApplicationRepo.save(application);
        
        logger.info("Room change application rejected for user: {}", application.getUserId());
        return "Application rejected successfully";
    }

    /**
     * Get applications by status for filtering
     */
    public List<RoomChangeApplicationDTO> getApplicationsByStatus(String status) {
        List<RoomChangeApplication> applications = roomChangeApplicationRepo.findByApplicationStatus(status);
        
        return applications.stream().map(app -> {
            Optional<Students> studentOpt = studentsRepo.findByUserId(app.getUserId());
            Optional<Users> userOpt = usersRepo.findById(app.getUserId());
            
            String studentName = studentOpt.map(s -> 
                (s.getFirstName() != null ? s.getFirstName() : "") + " " + 
                (s.getLastName() != null ? s.getLastName() : "")
            ).orElse("Unknown Student").trim();
            
            if (studentName.isEmpty()) {
                studentName = "Student ID: " + studentOpt.map(s -> s.getStudentId().toString()).orElse("Unknown");
            }
            
            String studentEmail = userOpt.map(Users::getEmail).orElse("Unknown Email");
            
            return new RoomChangeApplicationDTO(app, studentName, studentEmail);
        }).collect(Collectors.toList());
    }

    /**
     * Cancel pending application (for students)
     */
    @Transactional
    public String cancelApplication(Long userId) {
        Optional<RoomChangeApplication> appOpt = roomChangeApplicationRepo.findByUserId(userId);
        if (!appOpt.isPresent()) {
            return "No application found";
        }

        RoomChangeApplication application = appOpt.get();
        if (!"PENDING".equals(application.getApplicationStatus())) {
            return "Can only cancel pending applications";
        }

        roomChangeApplicationRepo.delete(application);
        logger.info("Application cancelled by user: {}", userId);
        
        return "Application cancelled successfully";
    }
}
