package com.HMS.hms.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.HMS.hms.DTO.ComplaintCreateRequest;
import com.HMS.hms.DTO.ComplaintDTO;
import com.HMS.hms.DTO.ComplaintUpdateRequest;
import com.HMS.hms.Repo.ComplaintRepo;
import com.HMS.hms.Tables.Complaint;
import com.HMS.hms.Tables.Students;
import com.HMS.hms.Tables.Users;

@Service
public class ComplaintService {

    @Autowired
    private ComplaintRepo complaintRepo;

    @Autowired
    private UserService userService;

    @Autowired
    private StudentsService studentsService;

    /**
     * Create a new complaint
     * 
     * @param createRequest the complaint creation request
     * @param userId        the ID of the user creating the complaint
     * @return the created complaint as DTO
     * @throws RuntimeException if user is not a student or student record not found
     */
    @Transactional
    public ComplaintDTO createComplaint(ComplaintCreateRequest createRequest, Long userId) {
        // Verify user exists and is a student
        Optional<Users> userOpt = userService.findByUserId(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        Users user = userOpt.get();
        if (!"STUDENT".equals(user.getRole())) {
            throw new RuntimeException("Only students can create complaints");
        }

        // Get student information
        Optional<Students> studentOpt = studentsService.findByUserId(userId);
        if (studentOpt.isEmpty()) {
            throw new RuntimeException("Student record not found for user ID: " + userId);
        }

        Students student = studentOpt.get();

        // Create complaint entity
        Complaint complaint = new Complaint();
        complaint.setUserId(userId);
        complaint.setStudentId(student.getStudentId());
        complaint.setTitle(createRequest.getTitle());
        complaint.setDescription(createRequest.getDescription());
        complaint.setComplaintType(createRequest.getComplaintType());
        complaint.setLocation(createRequest.getLocation());
        complaint.setContactInfo(createRequest.getContactInfo());
        complaint.setImageUrl(createRequest.getImageUrl());

        // Save complaint
        Complaint savedComplaint = complaintRepo.save(complaint);

        return convertToDTO(savedComplaint);
    }

    /**
     * Get all complaints visible to a user based on their role and complaint
     * visibility rules
     * 
     * @param userId   the requesting user's ID
     * @param userRole the requesting user's role
     * @return list of complaints visible to the user
     */
    public List<ComplaintDTO> getComplaintsVisibleToUser(Long userId, String userRole) {
        List<Complaint> complaints = complaintRepo.findAllComplaintsVisibleToUser(userId, userRole);
        return complaints.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get complaints by type visible to a user
     * 
     * @param complaintType the complaint type
     * @param userId        the requesting user's ID
     * @param userRole      the requesting user's role
     * @return list of complaints of the specified type visible to the user
     */
    public List<ComplaintDTO> getComplaintsByTypeVisibleToUser(String complaintType, Long userId, String userRole) {
        Complaint.ComplaintType type = Complaint.ComplaintType.fromString(complaintType);
        List<Complaint> complaints = complaintRepo.findComplaintsVisibleToUser(userId, userRole, type);
        return complaints.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get ragging complaints visible to user (only for provost, admin, or
     * complainant)
     * 
     * @param userId   the requesting user's ID
     * @param userRole the requesting user's role
     * @return list of ragging complaints visible to the user
     */
    public List<ComplaintDTO> getRaggingComplaintsVisibleToUser(Long userId, String userRole) {
        List<Complaint> complaints = complaintRepo.findRaggingComplaintsVisibleToUser(userId, userRole);
        return complaints.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all lost and found complaints (visible to all students)
     * 
     * @return list of lost and found complaints
     */
    public List<ComplaintDTO> getLostAndFoundComplaints() {
        List<Complaint> complaints = complaintRepo.findLostAndFoundComplaints();
        return complaints.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get complaints created by a specific user
     * 
     * @param userId the user's ID
     * @return list of complaints created by the user
     */
    public List<ComplaintDTO> getComplaintsByUser(Long userId) {
        List<Complaint> complaints = complaintRepo.findByUserIdOrderByCreatedAtDesc(userId);
        return complaints.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get complaints by user ID and type
     * 
     * @param userId the user ID
     * @param type   the complaint type (RAGGING or LOST_AND_FOUND)
     * @return list of complaints created by the user of specified type
     */
    public List<ComplaintDTO> getComplaintsByUserAndType(Long userId, String type) {
        List<Complaint> complaints = complaintRepo.findByUserIdOrderByCreatedAtDesc(userId);

        // Filter by type
        Complaint.ComplaintType complaintType = Complaint.ComplaintType.fromString(type);
        complaints = complaints.stream()
                .filter(complaint -> complaint.getComplaintType() == complaintType)
                .collect(Collectors.toList());

        return complaints.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update own complaint status (for Lost and Found complaints only)
     * 
     * @param complaintId the complaint ID
     * @param userId      the user ID (must be the owner)
     * @param newStatus   the new status
     * @return success message
     * @throws RuntimeException if user doesn't own the complaint, complaint not
     *                          found, or not allowed to update
     */
    @Transactional
    public String updateOwnComplaintStatus(Long complaintId, Long userId, String newStatus) {
        Optional<Complaint> complaintOpt = complaintRepo.findById(complaintId);
        if (complaintOpt.isEmpty()) {
            throw new RuntimeException("Complaint not found with ID: " + complaintId);
        }

        Complaint complaint = complaintOpt.get();

        // Check if user owns this complaint
        if (!complaint.getUserId().equals(userId)) {
            throw new RuntimeException("You can only update your own complaints");
        }

        // Check if it's a Lost and Found complaint
        if (complaint.getComplaintType() != Complaint.ComplaintType.LOST_AND_FOUND) {
            throw new RuntimeException("You can only update the status of Lost and Found complaints");
        }

        // Validate status
        Complaint.ComplaintStatus status;
        try {
            status = Complaint.ComplaintStatus.fromString(newStatus);
        } catch (Exception e) {
            throw new RuntimeException("Invalid status: " + newStatus);
        }

        // Update the complaint
        complaint.setStatus(status);
        complaint.setUpdatedAt(LocalDateTime.now());

        complaintRepo.save(complaint);

        return "Complaint status updated successfully";
    }

    /**
     * Get a specific complaint by ID, checking visibility permissions
     * 
     * @param complaintId      the complaint ID
     * @param requestingUserId the requesting user's ID
     * @param userRole         the requesting user's role
     * @return the complaint if visible to the user
     * @throws RuntimeException if complaint not found or not visible
     */
    public ComplaintDTO getComplaintById(Long complaintId, Long requestingUserId, String userRole) {
        Optional<Complaint> complaintOpt = complaintRepo.findById(complaintId);
        if (complaintOpt.isEmpty()) {
            throw new RuntimeException("Complaint not found with ID: " + complaintId);
        }

        Complaint complaint = complaintOpt.get();

        // Check if user can view this complaint
        if (!complaint.canUserView(requestingUserId, userRole)) {
            throw new RuntimeException("You do not have permission to view this complaint");
        }

        return convertToDTO(complaint);
    }

    /**
     * Update a complaint (only for provost and admin)
     * 
     * @param complaintId    the complaint ID
     * @param updateRequest  the update request
     * @param updatingUserId the ID of the user making the update
     * @param userRole       the role of the user making the update
     * @return the updated complaint
     * @throws RuntimeException if user doesn't have permission or complaint not
     *                          found
     */
    @Transactional
    public ComplaintDTO updateComplaint(Long complaintId, ComplaintUpdateRequest updateRequest,
            Long updatingUserId, String userRole) {
        // Only provost and admin can update complaints
        if (!"PROVOST".equals(userRole) && !"ADMIN".equals(userRole)) {
            throw new RuntimeException("Only provost and admin can update complaints");
        }

        Optional<Complaint> complaintOpt = complaintRepo.findById(complaintId);
        if (complaintOpt.isEmpty()) {
            throw new RuntimeException("Complaint not found with ID: " + complaintId);
        }

        Complaint complaint = complaintOpt.get();

        // Update fields
        complaint.setStatus(updateRequest.getStatus());
        complaint.setUpdatedAt(LocalDateTime.now());

        if (updateRequest.getResolutionNotes() != null) {
            complaint.setResolutionNotes(updateRequest.getResolutionNotes());
        }

        // If status is RESOLVED or CLOSED, set resolution fields
        if ("RESOLVED".equals(updateRequest.getStatus()) || "CLOSED".equals(updateRequest.getStatus())) {
            complaint.setResolvedBy(updatingUserId);
            complaint.setResolvedAt(LocalDateTime.now());
        }

        Complaint updatedComplaint = complaintRepo.save(complaint);
        return convertToDTO(updatedComplaint);
    }

    /**
     * Delete a complaint (only complaint creator or admin)
     * 
     * @param complaintId      the complaint ID
     * @param requestingUserId the requesting user's ID
     * @param userRole         the requesting user's role
     * @throws RuntimeException if user doesn't have permission or complaint not
     *                          found
     */
    @Transactional
    public void deleteComplaint(Long complaintId, Long requestingUserId, String userRole) {
        Optional<Complaint> complaintOpt = complaintRepo.findById(complaintId);
        if (complaintOpt.isEmpty()) {
            throw new RuntimeException("Complaint not found with ID: " + complaintId);
        }

        Complaint complaint = complaintOpt.get();

        // Only the complaint creator or admin can delete
        if (!complaint.getUserId().equals(requestingUserId) && !"ADMIN".equals(userRole)) {
            throw new RuntimeException("You do not have permission to delete this complaint");
        }

        complaintRepo.delete(complaint);
    }

    /**
     * Search complaints by text
     * 
     * @param searchTerm the search term
     * @param userId     the requesting user's ID
     * @param userRole   the requesting user's role
     * @return list of matching complaints visible to the user
     */
    public List<ComplaintDTO> searchComplaints(String searchTerm, Long userId, String userRole) {
        List<Complaint> complaints = complaintRepo.searchComplaintsVisibleToUser(searchTerm, userId, userRole);
        return complaints.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get complaint statistics
     * 
     * @param userRole the requesting user's role
     * @return complaint statistics
     */
    public ComplaintStatistics getComplaintStatistics(String userRole) {
        ComplaintStatistics stats = new ComplaintStatistics();

        if ("PROVOST".equals(userRole) || "ADMIN".equals(userRole)) {
            // For provost and admin, show all statistics
            stats.totalComplaints = complaintRepo.count();
            stats.raggingComplaints = complaintRepo.countByComplaintType(Complaint.ComplaintType.RAGGING);
            stats.lostAndFoundComplaints = complaintRepo.countByComplaintType(Complaint.ComplaintType.LOST_AND_FOUND);
            stats.openComplaints = complaintRepo.countByStatus(Complaint.ComplaintStatus.OPEN);
            stats.inProgressComplaints = complaintRepo.countByStatus(Complaint.ComplaintStatus.IN_PROGRESS);
            stats.resolvedComplaints = complaintRepo.countByStatus(Complaint.ComplaintStatus.RESOLVED);
            stats.closedComplaints = complaintRepo.countByStatus(Complaint.ComplaintStatus.CLOSED);
        } else {
            // For students, only show public statistics (lost and found)
            stats.totalComplaints = complaintRepo.countByComplaintType(Complaint.ComplaintType.LOST_AND_FOUND);
            stats.raggingComplaints = 0; // Hidden from students
            stats.lostAndFoundComplaints = complaintRepo.countByComplaintType(Complaint.ComplaintType.LOST_AND_FOUND);
            // Status counts for lost and found only
            List<Complaint> lostAndFoundComplaints = complaintRepo.findLostAndFoundComplaints();
            stats.openComplaints = lostAndFoundComplaints.stream()
                    .mapToLong(c -> c.getStatus() == Complaint.ComplaintStatus.OPEN ? 1 : 0)
                    .sum();
            stats.inProgressComplaints = lostAndFoundComplaints.stream()
                    .mapToLong(c -> c.getStatus() == Complaint.ComplaintStatus.IN_PROGRESS ? 1 : 0)
                    .sum();
            stats.resolvedComplaints = lostAndFoundComplaints.stream()
                    .mapToLong(c -> c.getStatus() == Complaint.ComplaintStatus.RESOLVED ? 1 : 0)
                    .sum();
            stats.closedComplaints = lostAndFoundComplaints.stream()
                    .mapToLong(c -> c.getStatus() == Complaint.ComplaintStatus.CLOSED ? 1 : 0)
                    .sum();
        }

        return stats;
    }

    /**
     * Convert Complaint entity to ComplaintDTO
     */
    private ComplaintDTO convertToDTO(Complaint complaint) {
        ComplaintDTO dto = new ComplaintDTO();
        dto.setComplaintId(complaint.getComplaintId());
        dto.setUserId(complaint.getUserId());
        dto.setStudentId(complaint.getStudentId());
        dto.setTitle(complaint.getTitle());
        dto.setDescription(complaint.getDescription());
        dto.setComplaintType(complaint.getComplaintTypeAsString());
        dto.setStatus(complaint.getStatusAsString());
        dto.setLocation(complaint.getLocation());
        dto.setImageUrl(complaint.getImageUrl());
        dto.setContactInfo(complaint.getContactInfo());
        dto.setCreatedAt(complaint.getCreatedAt());
        dto.setUpdatedAt(complaint.getUpdatedAt());
        dto.setResolvedAt(complaint.getResolvedAt());
        dto.setResolvedBy(complaint.getResolvedBy());
        dto.setResolutionNotes(complaint.getResolutionNotes());

        // Set user information
        if (complaint.getUser() != null) {
            dto.setUserName(complaint.getUser().getUsername());
            dto.setUserEmail(complaint.getUser().getEmail());
        }

        // Set resolved by user information
        if (complaint.getResolvedByUser() != null) {
            dto.setResolvedByName(complaint.getResolvedByUser().getUsername());
        }

        // Set student name if available
        try {
            Optional<Students> studentOpt = studentsService.findByUserId(complaint.getUserId());
            if (studentOpt.isPresent()) {
                Students student = studentOpt.get();
                dto.setStudentName(student.getFirstName() + " " + student.getLastName());
            }
        } catch (Exception e) {
            // Ignore if student information can't be retrieved
        }

        return dto;
    }

    /**
     * Inner class for complaint statistics
     */
    public static class ComplaintStatistics {
        public long totalComplaints;
        public long raggingComplaints;
        public long lostAndFoundComplaints;
        public long openComplaints;
        public long inProgressComplaints;
        public long resolvedComplaints;
        public long closedComplaints;

        // Getters and setters
        public long getTotalComplaints() {
            return totalComplaints;
        }

        public void setTotalComplaints(long totalComplaints) {
            this.totalComplaints = totalComplaints;
        }

        public long getRaggingComplaints() {
            return raggingComplaints;
        }

        public void setRaggingComplaints(long raggingComplaints) {
            this.raggingComplaints = raggingComplaints;
        }

        public long getLostAndFoundComplaints() {
            return lostAndFoundComplaints;
        }

        public void setLostAndFoundComplaints(long lostAndFoundComplaints) {
            this.lostAndFoundComplaints = lostAndFoundComplaints;
        }

        public long getOpenComplaints() {
            return openComplaints;
        }

        public void setOpenComplaints(long openComplaints) {
            this.openComplaints = openComplaints;
        }

        public long getInProgressComplaints() {
            return inProgressComplaints;
        }

        public void setInProgressComplaints(long inProgressComplaints) {
            this.inProgressComplaints = inProgressComplaints;
        }

        public long getResolvedComplaints() {
            return resolvedComplaints;
        }

        public void setResolvedComplaints(long resolvedComplaints) {
            this.resolvedComplaints = resolvedComplaints;
        }

        public long getClosedComplaints() {
            return closedComplaints;
        }

        public void setClosedComplaints(long closedComplaints) {
            this.closedComplaints = closedComplaints;
        }
    }
}
