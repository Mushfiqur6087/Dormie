package com.HMS.hms.Service;

import com.HMS.hms.DTO.MessManagerCallDTO;
import com.HMS.hms.DTO.MessManagerCallRequest;
import com.HMS.hms.Repo.MessManagerCallRepo;
import com.HMS.hms.Repo.MessManagerApplicationRepo;
import com.HMS.hms.Tables.MessManagerCall;
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
public class MessManagerCallService {

    @Autowired
    private MessManagerCallRepo messManagerCallRepo;

    @Autowired
    private MessManagerApplicationRepo messManagerApplicationRepo;

    @Autowired
    private UserService userService;

    /**
     * Create a new mess manager call (Provost only)
     */
    @Transactional
    public MessManagerCallDTO createCall(MessManagerCallRequest request, Long createdBy) {
        // Verify user exists and is a provost
        Optional<Users> userOpt = userService.findByUserId(createdBy);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + createdBy);
        }

        Users user = userOpt.get();
        if (!"PROVOST".equals(user.getRole()) && !"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Only provost and admin can create mess manager calls");
        }

        // Check if there's already an active call for this month/year
        // Convert month name to number
        Integer monthNumber = convertMonthNameToNumber(request.getMonth());
        Optional<MessManagerCall> existingCall = messManagerCallRepo.findActiveCallForMonthYear(
            monthNumber, request.getYear());
        if (existingCall.isPresent()) {
            throw new RuntimeException("There is already an active call for " + request.getMonth() + " " + request.getYear());
        }

        // Validate deadline is in the future
        if (request.getDeadline().isBefore(LocalDate.now())) {
            throw new RuntimeException("Deadline must be in the future");
        }

        // Create the call
        MessManagerCall call = new MessManagerCall();
        call.setTitle(request.getTitle());
        call.setDescription(request.getDescription());
        call.setMonth(convertMonthNameToNumber(request.getMonth()));
        call.setYear(request.getYear());
        call.setApplicationDeadline(request.getDeadline());
        call.setStatus("ACTIVE");
        call.setCreatedBy(createdBy);

        MessManagerCall savedCall = messManagerCallRepo.save(call);
        return convertToDTO(savedCall);
    }

    /**
     * Get all calls
     */
    public List<MessManagerCallDTO> getAllCalls() {
        List<MessManagerCall> calls = messManagerCallRepo.findAllByOrderByCreatedAtDesc();
        return calls.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get active calls (open for applications)
     */
    public List<MessManagerCallDTO> getActiveCalls() {
        List<MessManagerCall> activeCalls = messManagerCallRepo.findActiveCalls(LocalDate.now());
        return activeCalls.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific call by ID
     */
    public MessManagerCallDTO getCallById(Long callId) {
        Optional<MessManagerCall> callOpt = messManagerCallRepo.findById(callId);
        if (callOpt.isEmpty()) {
            throw new RuntimeException("Call not found with ID: " + callId);
        }
        return convertToDTO(callOpt.get());
    }

    /**
     * Close a call (Provost only)
     */
    @Transactional
    public String closeCall(Long callId, Long userId) {
        // Verify user has permission
        Optional<Users> userOpt = userService.findByUserId(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        Users user = userOpt.get();
        if (!"PROVOST".equals(user.getRole()) && !"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Only provost and admin can close calls");
        }

        Optional<MessManagerCall> callOpt = messManagerCallRepo.findById(callId);
        if (callOpt.isEmpty()) {
            throw new RuntimeException("Call not found with ID: " + callId);
        }

        MessManagerCall call = callOpt.get();
        call.setStatus("CLOSED");
        call.setUpdatedAt(LocalDateTime.now());
        messManagerCallRepo.save(call);

        return "Call closed successfully";
    }

    /**
     * Delete a call (Admin only)
     */
    @Transactional
    public void deleteCall(Long callId, Long userId) {
        // Verify user has permission
        Optional<Users> userOpt = userService.findByUserId(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        Users user = userOpt.get();
        if (!"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Only admin can delete calls");
        }

        Optional<MessManagerCall> callOpt = messManagerCallRepo.findById(callId);
        if (callOpt.isEmpty()) {
            throw new RuntimeException("Call not found with ID: " + callId);
        }

        MessManagerCall call = callOpt.get();
        
        // Check if there are applications for this call
        Long applicationCount = messManagerApplicationRepo.countApplicationsByCallId(callId);
        if (applicationCount > 0) {
            throw new RuntimeException("Cannot delete call with existing applications. Close the call instead.");
        }

        messManagerCallRepo.delete(call);
    }

    /**
     * Get calls by status
     */
    public List<MessManagerCallDTO> getCallsByStatus(String status) {
        List<MessManagerCall> calls = messManagerCallRepo.findByStatus(status);
        return calls.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get calls for a specific month and year
     */
    public List<MessManagerCallDTO> getCallsByMonthAndYear(String month, Integer year) {
        Integer monthNumber = convertMonthNameToNumber(month);
        List<MessManagerCall> calls = messManagerCallRepo.findByMonthAndYear(monthNumber, year);
        return calls.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convert MessManagerCall entity to DTO
     */
    private MessManagerCallDTO convertToDTO(MessManagerCall call) {
        MessManagerCallDTO dto = new MessManagerCallDTO();
        dto.setId(call.getCallId());
        dto.setTitle(call.getTitle());
        dto.setDescription(call.getDescription());
        dto.setMonth(convertMonthNumberToName(call.getMonth()));
        dto.setYear(call.getYear());
        dto.setDeadline(call.getApplicationDeadline());
        dto.setStatus(call.getStatus());
        dto.setCreatedBy(call.getCreatedBy());
        dto.setCreatedAt(call.getCreatedAt());
        dto.setUpdatedAt(call.getUpdatedAt());

        // Set creator name
        if (call.getCreatedByUser() != null) {
            dto.setCreatedByName(call.getCreatedByUser().getUsername());
        }

        // Set application counts
        Long totalApplications = messManagerApplicationRepo.countApplicationsByCallId(call.getCallId());
        Long selectedApplications = messManagerApplicationRepo.countSelectedApplicationsByCallId(call.getCallId());
        dto.setTotalApplications(totalApplications);
        dto.setSelectedApplications(selectedApplications);

        return dto;
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
}
