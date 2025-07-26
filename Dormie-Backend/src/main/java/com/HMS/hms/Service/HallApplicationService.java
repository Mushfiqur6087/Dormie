package com.HMS.hms.Service;

import java.math.BigDecimal; // Import the new Summary DTO
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort; // Import Spring Data Sort
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.HMS.hms.DTO.HallApplicationRequest; // Ensure this is imported
import com.HMS.hms.DTO.HallApplicationSummaryDTO; // Ensure this is imported
import com.HMS.hms.Repo.HallApplicationRepo;
import com.HMS.hms.Repo.StudentsRepo;
import com.HMS.hms.Repo.UsersRepo;
import com.HMS.hms.Tables.HallApplication;
import com.HMS.hms.Tables.Students;
import com.HMS.hms.Tables.Users;

@Service
public class HallApplicationService {

    // Logger declaration for this service
    private static final Logger logger = LoggerFactory.getLogger(HallApplicationService.class);

    // Autowired Repositories and Services
    @Autowired
    private HallApplicationRepo hallApplicationRepo;

    @Autowired
    private UsersRepo usersRepo;

    @Autowired
    private StudentsRepo studentsRepo;

    @Autowired
    private GeocodingService geocodingService;

    @Autowired
    private StudentsService studentsService; // <--- ENSURE THIS IS AUTOWIRED for updating student residency

    /**
     * Processes and saves a new hall application submitted by a student.
     * Includes image storage, distance calculation, and various validations.
     *
     * @param applicationRequest The DTO containing application data.
     * @param userId The ID of the authenticated user submitting the application (from JWT).
     * @return The saved HallApplication entity.
     * @throws IllegalArgumentException if business validation rules are violated.
     */
    @Transactional // Ensures atomicity for DB operations.
    public HallApplication submitHallApplication(HallApplicationRequest applicationRequest, Long userId) {

        // --- 1. Perform Business Validations ---
        // Validate conditional field: localRelativeAddress required if hasLocalRelative is "yes"
        if ("yes".equalsIgnoreCase(applicationRequest.getHasLocalRelative())) {
            String localRelativeAddress = applicationRequest.getLocalRelativeAddress();
            if (localRelativeAddress == null || localRelativeAddress.trim().isEmpty()) {
                throw new IllegalArgumentException("Local relative address is required if 'Yes' for local relative.");
            }
        }

        // Validate that the authenticated user exists
        Optional<Users> userOpt = usersRepo.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Authenticated user not found.");
        }
        Users user = userOpt.get();

        // Get student record and extract student ID from database (not from request)
        Optional<Students> studentOpt = studentsRepo.findByUserId(userId);
        if (studentOpt.isEmpty()) {
            throw new IllegalArgumentException("Student record not found for authenticated user.");
        }
        Students student = studentOpt.get();
        Long studentId = student.getStudentId(); // Extract student ID from database

        // Check if student already has a PENDING application (prevents duplicate active applications)
        List<HallApplication> pendingApplications = hallApplicationRepo.findByUserIdAndApplicationStatus(userId, "PENDING");
        if (!pendingApplications.isEmpty()) {
            throw new IllegalArgumentException("You already have a pending hall application. Please wait for it to be processed.");
        }

        // --- 2. Calculate Distance from Hall ---
        BigDecimal distanceFromHall = null;
        try {
            Double distance = geocodingService.calculateDistanceToHall(applicationRequest.getPostcode());
            if (distance != null) {
                // Convert double to BigDecimal and round to 2 decimal places for precise storage
                distanceFromHall = BigDecimal.valueOf(distance).setScale(2, java.math.RoundingMode.HALF_UP);
                logger.info("Calculated distance for user {} (postcode {}): {} km", user.getUsername(), applicationRequest.getPostcode(), distanceFromHall);
            } else {
                logger.warn("Could not calculate distance for postcode: {}. Saving as null.", applicationRequest.getPostcode());
            }
        } catch (Exception e) {
            logger.error("Error calculating distance for postcode {}: {}", applicationRequest.getPostcode(), e.getMessage());
        }


        // --- 3. Create and Populate HallApplication Entity ---
        HallApplication application = new HallApplication();
        application.setUserId(userId); // Link application to the user's primary ID
        application.setUser(user); // Set the Users entity relationship (for convenience in JPA)
        application.setStudentIdNo(studentId); // The university-assigned student ID from database
        application.setCollege(applicationRequest.getCollege());
        application.setCollegeLocation(applicationRequest.getCollegeLocation());
        application.setFamilyIncome(applicationRequest.getFamilyIncome()); // BigDecimal from DTO
        application.setDistrict(applicationRequest.getDistrict());
        application.setPostcode(applicationRequest.getPostcode());
        // Note: studentImagePath is removed as images are no longer required
        // Convert "yes"/"no" string from frontend to Boolean for database storage
        application.setHasLocalRelative(applicationRequest.getHasLocalRelative().equalsIgnoreCase("yes"));
        application.setLocalRelativeAddress(applicationRequest.getLocalRelativeAddress());
        application.setApplicationDate(LocalDateTime.now()); // Set current timestamp
        application.setApplicationStatus("PENDING"); // Default status upon submission
        application.setDistanceFromHallKm(distanceFromHall);
        // NOTE: application.setApplicationType() is removed as per clarification that all accepted are 'resident'

        // --- 4. Save the HallApplication entity to the database ---
        return hallApplicationRepo.save(application);
    }


    /**
     * Retrieves all hall applications, optionally sorted by a specific field and order.
     * This is used for the Provost's list view.
     * @param sortBy Field to sort by (e.g., "familyIncome", "distanceFromHallKm", "applicationDate", "studentIdNo").
     * @param sortOrder "asc" for ascending, "desc" for descending.
     * @return List of HallApplicationSummaryDTOs.
     */
    public List<HallApplicationSummaryDTO> getAllHallApplicationSummaries(String sortBy, String sortOrder) {
        // Define a whitelist of allowed sortable fields to prevent injection attacks
        List<String> allowedSortFields = List.of("familyIncome", "distanceFromHallKm", "applicationDate", "studentIdNo");
        Sort sort;
        if (sortBy != null && allowedSortFields.contains(sortBy)) {
            Sort.Direction direction = "desc".equalsIgnoreCase(sortOrder) ? Sort.Direction.DESC : Sort.Direction.ASC;
            sort = Sort.by(direction, sortBy);
        } else {
            // Default sort order if no valid sort field is provided: newest applications first
            sort = Sort.by(Sort.Direction.DESC, "applicationDate");
        }

        // Fetch applications from the repository with the determined sort order
        List<HallApplication> applications = hallApplicationRepo.findAll(sort);

        // Convert HallApplication entities to HallApplicationSummaryDTOs for the list view
        // The convertToSummaryDTO method handles fetching the username if needed.
        return applications.stream()
                .map(this::convertToSummaryDTO)
                .collect(Collectors.toList());
    }

    /**
     * Converts a HallApplication entity to a HallApplicationSummaryDTO.
     * Includes a lookup for username if the 'user' object is not eagerly loaded.
     * @param application The HallApplication entity.
     * @return HallApplicationSummaryDTO.
     */
    private HallApplicationSummaryDTO convertToSummaryDTO(HallApplication application) {
        String username = null;
        // Try to get username directly from the 'user' association if it's already loaded by JPA
        Users user = application.getUser();
        if (user != null) {
            username = user.getUsername();
        } else {
            // Fallback: If 'user' association is not eagerly loaded (default for @OneToOne can be lazy),
            // look up the user explicitly by userId to get the username.
            Optional<Users> userOpt = usersRepo.findById(application.getUserId());
            if (userOpt.isPresent()) {
                username = userOpt.get().getUsername();
            }
        }

        // Convert applicationDate to ISO string for DTO
        String applicationDateStr = null;
        if (application.getApplicationDate() != null) {
            applicationDateStr = application.getApplicationDate().toString();
        }

        return new HallApplicationSummaryDTO(
                application.getApplicationId(),
                application.getStudentIdNo(),
                username, // Student's username for the summary list
                application.getApplicationStatus(),
                application.getFamilyIncome(),
                application.getDistanceFromHallKm(),
                applicationDateStr
        );
    }

    /**
     * Retrieves a single HallApplication entity by its ID (for Provost's detail view).
     * @param applicationId The ID of the application.
     * @return Optional containing the HallApplication entity if found.
     */
    public Optional<HallApplication> getHallApplicationById(Long applicationId) {
        // findById should fetch the full entity with all its fields.
        return hallApplicationRepo.findById(applicationId);
    }

    /**
     * Accepts a hall application. This method sets the application status to APPROVED
     * and updates the corresponding student's residency status in the Students table to "resident".
     *
     * @param applicationId The ID of the application to accept.
     * @return The updated HallApplication entity.
     * @throws IllegalArgumentException if the application is not found or is not in a PENDING status.
     */
    @Transactional // Ensures atomicity: if student update fails, application status change is rolled back.
    public HallApplication acceptHallApplication(Long applicationId) {
        Optional<HallApplication> applicationOpt = hallApplicationRepo.findById(applicationId);

        if (applicationOpt.isEmpty()) {
            throw new IllegalArgumentException("Application not found with ID: " + applicationId);
        }

        HallApplication application = applicationOpt.get();

        // Check current status: only PENDING applications can be accepted
        if (!"PENDING".equalsIgnoreCase(application.getApplicationStatus())) {
            throw new IllegalArgumentException("Application with ID " + applicationId + " is already " + application.getApplicationStatus() + ". Only PENDING applications can be accepted.");
        }

        // --- 1. Update HallApplication status to APPROVED ---
        application.setApplicationStatus("APPROVED");
        HallApplication updatedApplication = hallApplicationRepo.save(application);
        logger.info("Application {} accepted. User ID: {}", applicationId, application.getUserId());

        // --- 2. Update the corresponding student's residency status to "resident" ---
        Optional<Students> studentOpt = studentsRepo.findByUserId(application.getUserId());
        if (studentOpt.isPresent()) {
            Students student = studentOpt.get();

            // Per clarification: All accepted applications mean the student becomes 'resident'
            student.setResidencyStatus("resident");

            studentsService.saveStudent(student); // Use studentsService to save the updated student entity
            logger.info("Student {} (User ID {}) residency status updated to '{}'",
                    student.getStudentId(), student.getUserId(), student.getResidencyStatus());
        } else {
            logger.warn("Could not find student record for accepted application with user ID: {}. Data inconsistency.", application.getUserId());
            // Decide error handling: log, throw exception (which would roll back app acceptance), etc.
            // Current approach logs a warning and proceeds with application acceptance.
        }

        return updatedApplication;
    }

    /**
     * Rejects a hall application, setting its status to REJECTED.
     *
     * @param applicationId The ID of the application to reject.
     * @return The updated HallApplication entity.
     * @throws IllegalArgumentException if the application is not found or is not in a PENDING status.
     */
    @Transactional // Ensures atomicity for DB operation.
    public HallApplication rejectHallApplication(Long applicationId) {
        Optional<HallApplication> applicationOpt = hallApplicationRepo.findById(applicationId);

        if (applicationOpt.isEmpty()) {
            throw new IllegalArgumentException("Application not found with ID: " + applicationId);
        }

        HallApplication application = applicationOpt.get();

        // Ensure only PENDING applications can be rejected
        if (!"PENDING".equalsIgnoreCase(application.getApplicationStatus())) {
            throw new IllegalArgumentException("Application with ID " + applicationId + " is already " + application.getApplicationStatus() + ". Only PENDING applications can be rejected.");
        }

        // Update application status to REJECTED
        application.setApplicationStatus("REJECTED");
        HallApplication updatedApplication = hallApplicationRepo.save(application);
        logger.info("Application {} rejected. User ID: {}", applicationId, application.getUserId());

        return updatedApplication;
    }

    /**
     * Retrieves the most relevant HallApplication entity by user ID.
     * Priority: PENDING applications first, then most recent application.
     * @param userId The ID of the user.
     * @return Optional containing the most relevant HallApplication entity if found.
     */
    public Optional<HallApplication> getHallApplicationByUserId(Long userId) {
        // First, check for PENDING applications
        List<HallApplication> pendingApplications = hallApplicationRepo.findByUserIdAndApplicationStatus(userId, "PENDING");
        if (!pendingApplications.isEmpty()) {
            // Return the most recent pending application (if multiple exist, though this shouldn't happen)
            return Optional.of(pendingApplications.stream()
                    .max((a1, a2) -> a1.getApplicationDate().compareTo(a2.getApplicationDate()))
                    .orElse(pendingApplications.get(0)));
        }
        
        // If no pending applications, get all applications and return the most recent one
        List<HallApplication> allApplications = hallApplicationRepo.findAllByUserId(userId);
        if (allApplications.isEmpty()) {
            return Optional.empty();
        }
        
        // Return the most recent application
        return Optional.of(allApplications.stream()
                .max((a1, a2) -> a1.getApplicationDate().compareTo(a2.getApplicationDate()))
                .orElse(allApplications.get(0)));
    }

    /**
     * Retrieves all HallApplication entities for a user ID.
     * Used for debugging and comprehensive status checks.
     * @param userId The ID of the user.
     * @return List of all HallApplication entities for the user.
     */
    public List<HallApplication> getAllApplicationsByUserId(Long userId) {
        return hallApplicationRepo.findAllByUserId(userId);
    }
}