package com.HMS.hms.Tables;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "complaints")
public class Complaint {

    // Enum for complaint types
    public enum ComplaintType {
        RAGGING("RAGGING"),
        LOST_AND_FOUND("LOST_AND_FOUND");

        private final String value;

        ComplaintType(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public static ComplaintType fromString(String value) {
            if (value == null) {
                return LOST_AND_FOUND; // Default type
            }

            for (ComplaintType type : ComplaintType.values()) {
                if (type.value.equalsIgnoreCase(value) || type.name().equalsIgnoreCase(value)) {
                    return type;
                }
            }

            return switch (value.toLowerCase()) {
                case "ragging" -> RAGGING;
                case "lost_and_found", "lost and found" -> LOST_AND_FOUND;
                default -> LOST_AND_FOUND; // Default to lost and found
            };
        }

        @Override
        public String toString() {
            return value;
        }
    }

    // Enum for complaint status
    public enum ComplaintStatus {
        OPEN("OPEN"),
        IN_PROGRESS("IN_PROGRESS"),
        RESOLVED("RESOLVED"),
        CLOSED("CLOSED");

        private final String value;

        ComplaintStatus(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public static ComplaintStatus fromString(String value) {
            if (value == null) {
                return OPEN; // Default status
            }

            for (ComplaintStatus status : ComplaintStatus.values()) {
                if (status.value.equalsIgnoreCase(value) || status.name().equalsIgnoreCase(value)) {
                    return status;
                }
            }

            return switch (value.toLowerCase()) {
                case "open" -> OPEN;
                case "in_progress", "in progress" -> IN_PROGRESS;
                case "resolved" -> RESOLVED;
                case "closed" -> CLOSED;
                default -> OPEN; // Default to open
            };
        }

        @Override
        public String toString() {
            return value;
        }
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long complaintId;

    @Column(name = "user_id", nullable = false)
    private Long userId; // Foreign key to users.userId (complainant)

    @ManyToOne
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private Users user;

    @Column(name = "student_id", nullable = false)
    private Long studentId; // Complainant's student ID

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "complaint_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ComplaintType complaintType;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private ComplaintStatus status = ComplaintStatus.OPEN;

    @Column(name = "location")
    private String location; // Where the incident occurred or item was found/lost

    @Column(name = "image_url")
    private String imageUrl; // For lost and found items

    @Lob
    @Column(name = "image_data")
    private byte[] imageData; // Store image as binary data

    @Column(name = "contact_info")
    private String contactInfo; // Contact information for lost and found

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "resolved_by")
    private Long resolvedBy; // User ID of who resolved the complaint

    @ManyToOne
    @JoinColumn(name = "resolved_by", insertable = false, updatable = false)
    private Users resolvedByUser;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    // Default constructor
    public Complaint() {
        this.createdAt = LocalDateTime.now();
        this.status = ComplaintStatus.OPEN;
    }

    // Constructor with essential fields
    public Complaint(Long userId, Long studentId, String title, String description, ComplaintType complaintType) {
        this();
        this.userId = userId;
        this.studentId = studentId;
        this.title = title;
        this.description = description;
        this.complaintType = complaintType;
    }

    // Getters and Setters
    public Long getComplaintId() {
        return complaintId;
    }

    public void setComplaintId(Long complaintId) {
        this.complaintId = complaintId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Users getUser() {
        return user;
    }

    public void setUser(Users user) {
        this.user = user;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ComplaintType getComplaintType() {
        return complaintType;
    }

    public void setComplaintType(ComplaintType complaintType) {
        this.complaintType = complaintType;
    }

    public void setComplaintType(String complaintType) {
        this.complaintType = ComplaintType.fromString(complaintType);
    }

    public String getComplaintTypeAsString() {
        return complaintType != null ? complaintType.getValue() : null;
    }

    public ComplaintStatus getStatus() {
        return status;
    }

    public void setStatus(ComplaintStatus status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }

    public void setStatus(String status) {
        this.setStatus(ComplaintStatus.fromString(status));
    }

    public String getStatusAsString() {
        return status != null ? status.getValue() : null;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public byte[] getImageData() {
        return imageData;
    }

    public void setImageData(byte[] imageData) {
        this.imageData = imageData;
    }

    public String getContactInfo() {
        return contactInfo;
    }

    public void setContactInfo(String contactInfo) {
        this.contactInfo = contactInfo;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public Long getResolvedBy() {
        return resolvedBy;
    }

    public void setResolvedBy(Long resolvedBy) {
        this.resolvedBy = resolvedBy;
    }

    public Users getResolvedByUser() {
        return resolvedByUser;
    }

    public void setResolvedByUser(Users resolvedByUser) {
        this.resolvedByUser = resolvedByUser;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    // Helper method to resolve complaint
    public void resolveComplaint(Long resolvedByUserId, String notes) {
        this.status = ComplaintStatus.RESOLVED;
        this.resolvedBy = resolvedByUserId;
        this.resolvedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.resolutionNotes = notes;
    }

    // Helper method to close complaint
    public void closeComplaint(Long closedByUserId, String notes) {
        this.status = ComplaintStatus.CLOSED;
        this.resolvedBy = closedByUserId;
        this.resolvedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.resolutionNotes = notes;
    }

    // Helper method to check if user can view this complaint
    public boolean canUserView(Long requestingUserId, String userRole) {
        // For ragging complaints: only visible to the complainant, provost, and admin
        if (this.complaintType == ComplaintType.RAGGING) {
            return this.userId.equals(requestingUserId) ||
                    "PROVOST".equals(userRole) ||
                    "ADMIN".equals(userRole);
        }

        // For lost and found: visible to all students, provost, and admin
        return "STUDENT".equals(userRole) ||
                "PROVOST".equals(userRole) ||
                "ADMIN".equals(userRole);
    }

    @Override
    public String toString() {
        return "Complaint{" +
                "complaintId=" + complaintId +
                ", userId=" + userId +
                ", studentId=" + studentId +
                ", title='" + title + '\'' +
                ", complaintType=" + complaintType +
                ", status=" + status +
                ", location='" + location + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
