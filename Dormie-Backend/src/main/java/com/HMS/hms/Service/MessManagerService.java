package com.HMS.hms.Service;

import com.HMS.hms.DTO.MessManagerDTO;
import com.HMS.hms.Repo.MessManagerRepo;
import com.HMS.hms.Repo.MessManagerApplicationRepo;
import com.HMS.hms.Tables.MessManager;
import com.HMS.hms.Tables.MessManagerApplication;
import com.HMS.hms.Tables.Students;
import com.HMS.hms.Tables.Users;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MessManagerService {

    @Autowired
    private MessManagerRepo messManagerRepo;

    @Autowired
    private MessManagerApplicationRepo messManagerApplicationRepo;

    @Autowired
    private UserService userService;

    @Autowired
    private StudentsService studentsService;

    /**
     * Assign mess managers from selected applications (Provost/Admin only)
     */
    @Transactional
    public List<MessManagerDTO> assignMessManagers(Long callId, List<Long> selectedApplicationIds, Long assignedBy) {
        // Verify user has permission
        Optional<Users> userOpt = userService.findByUserId(assignedBy);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + assignedBy);
        }

        Users user = userOpt.get();
        if (!"PROVOST".equals(user.getRole()) && !"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Only provost and admin can assign mess managers");
        }

        // Validate selected applications
        List<MessManagerApplication> selectedApplications = messManagerApplicationRepo.findAllById(selectedApplicationIds);
        if (selectedApplications.size() != selectedApplicationIds.size()) {
            throw new RuntimeException("Some applications not found");
        }

        // Verify all applications are for the same call and are selected
        for (MessManagerApplication app : selectedApplications) {
            if (!app.getCallId().equals(callId)) {
                throw new RuntimeException("Application " + app.getApplicationId() + " is not for call " + callId);
            }
            if (!"SELECTED".equals(app.getStatus())) {
                throw new RuntimeException("Application " + app.getApplicationId() + " is not selected");
            }
        }

        // Get call information to determine month and year
        if (selectedApplications.isEmpty()) {
            throw new RuntimeException("No applications selected");
        }

        MessManagerApplication firstApp = selectedApplications.get(0);
        Integer month = firstApp.getMessManagerCall().getMonth();
        Integer year = firstApp.getMessManagerCall().getYear();

        // Check if mess managers are already assigned for this month/year
        List<MessManager> existingManagers = messManagerRepo.findActiveManagersByMonthAndYear(
            month, year);
        if (!existingManagers.isEmpty()) {
            throw new RuntimeException("Mess managers are already assigned for " + 
                convertMonthNumberToName(month) + " " + year);
        }

        // Calculate start and end dates for the assignment
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        // Create mess manager assignments
        List<MessManager> messManagers = selectedApplications.stream()
            .map(app -> {
                MessManager manager = new MessManager();
                manager.setUserId(app.getUserId());
                manager.setMonth(month);
                manager.setYear(year);
                manager.setStartDate(startDate);
                manager.setEndDate(endDate);
                manager.setStatus("ACTIVE");
                manager.setAssignedBy(assignedBy);
                return manager;
            })
            .collect(Collectors.toList());

        List<MessManager> savedManagers = messManagerRepo.saveAll(messManagers);
        return savedManagers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get current active mess managers
     */
    public List<MessManagerDTO> getCurrentActiveManagers() {
        List<MessManager> activeManagers = messManagerRepo.findCurrentActiveManagers();
        return activeManagers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get mess managers by month and year
     */
    public List<MessManagerDTO> getManagersByMonthAndYear(String month, Integer year) {
        Integer monthNumber = convertMonthNameToNumber(month);
        List<MessManager> managers = messManagerRepo.findByMonthAndYear(monthNumber, year);
        return managers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get mess managers by user ID
     */
    public List<MessManagerDTO> getManagersByUser(Long userId) {
        List<MessManager> managers = messManagerRepo.findByUserIdOrderByAssignedAtDesc(userId);
        return managers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Check if user is currently an active mess manager
     */
    public boolean isUserCurrentlyMessManager(Long userId) {
        Optional<MessManager> activeManager = messManagerRepo.findActiveManagerByUserId(userId);
        return activeManager.isPresent();
    }

    /**
     * Get all mess managers with optional filters
     */
    public List<MessManagerDTO> getAllManagers(String status) {
        List<MessManager> managers;
        if (status != null && !status.isEmpty()) {
            managers = messManagerRepo.findByStatusOrderByAssignedAtDesc(status);
        } else {
            managers = messManagerRepo.findAllWithUserDetails();
        }
        
        return managers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Terminate mess manager assignment (Provost/Admin only)
     */
    @Transactional
    public String terminateManager(Long managerId, Long terminatedBy) {
        // Verify user has permission
        Optional<Users> userOpt = userService.findByUserId(terminatedBy);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + terminatedBy);
        }

        Users user = userOpt.get();
        if (!"PROVOST".equals(user.getRole()) && !"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Only provost and admin can terminate mess managers");
        }

        Optional<MessManager> managerOpt = messManagerRepo.findById(managerId);
        if (managerOpt.isEmpty()) {
            throw new RuntimeException("Mess manager not found with ID: " + managerId);
        }

        MessManager manager = managerOpt.get();
        if (!"ACTIVE".equals(manager.getStatus())) {
            throw new RuntimeException("Mess manager is not currently active");
        }

        manager.setStatus("TERMINATED");
        manager.setEndDate(LocalDate.now());
        messManagerRepo.save(manager);

        return "Mess manager terminated successfully";
    }

    /**
     * Get mess manager by ID
     */
    public MessManagerDTO getManagerById(Long managerId) {
        Optional<MessManager> managerOpt = messManagerRepo.findById(managerId);
        if (managerOpt.isEmpty()) {
            throw new RuntimeException("Mess manager not found with ID: " + managerId);
        }
        return convertToDTO(managerOpt.get());
    }

    /**
     * Convert MessManager entity to DTO
     */
    private MessManagerDTO convertToDTO(MessManager manager) {
        MessManagerDTO dto = new MessManagerDTO();
        dto.setId(manager.getManagerId());
        dto.setUserId(manager.getUserId());
        dto.setMonth(convertMonthNumberToName(manager.getMonth()));
        dto.setYear(manager.getYear());
        dto.setStartDate(manager.getStartDate());
        dto.setEndDate(manager.getEndDate());
        dto.setStatus(manager.getStatus());
        dto.setAssignedBy(manager.getAssignedBy());
        dto.setAssignedAt(manager.getAssignedAt());
        dto.setCurrentlyActive(manager.isCurrentlyActive());

        // Set user information
        if (manager.getUser() != null) {
            dto.setUserName(manager.getUser().getUsername());
            dto.setUserEmail(manager.getUser().getEmail());
        }

        // Set assigned by user information
        if (manager.getAssignedByUser() != null) {
            dto.setAssignedByName(manager.getAssignedByUser().getUsername());
        }

        // Set student name
        try {
            Optional<Students> studentOpt = studentsService.findByUserId(manager.getUserId());
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
     * Convert month number to name
     */
    private String convertMonthNumberToName(Integer monthNumber) {
        switch (monthNumber) {
            case 1: return "January";
            case 2: return "February";
            case 3: return "March";
            case 4: return "April";
            case 5: return "May";
            case 6: return "June";
            case 7: return "July";
            case 8: return "August";
            case 9: return "September";
            case 10: return "October";
            case 11: return "November";
            case 12: return "December";
            default: throw new RuntimeException("Invalid month number: " + monthNumber);
        }
    }

    /**
     * Convert month name to number
     */
    private Integer convertMonthNameToNumber(String monthName) {
        switch (monthName.toLowerCase()) {
            case "january": return 1;
            case "february": return 2;
            case "march": return 3;
            case "april": return 4;
            case "may": return 5;
            case "june": return 6;
            case "july": return 7;
            case "august": return 8;
            case "september": return 9;
            case "october": return 10;
            case "november": return 11;
            case "december": return 12;
            default: throw new RuntimeException("Invalid month name: " + monthName);
        }
    }
}
