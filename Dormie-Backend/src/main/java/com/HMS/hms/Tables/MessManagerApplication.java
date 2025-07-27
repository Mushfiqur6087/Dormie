package com.HMS.hms.Tables;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "mess_manager_application")
public class MessManagerApplication {

    public enum ApplicationStatus {
        PENDING("pending"),
        ACCEPTED("accepted"),
        REJECTED("rejected"),
        MONTH_END("month_end");

        private final String value;

        ApplicationStatus(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public static ApplicationStatus fromString(String value) {
            for (ApplicationStatus status : ApplicationStatus.values()) {
                if (status.value.equalsIgnoreCase(value)) {
                    return status;
                }
            }
            throw new IllegalArgumentException("Invalid application status: " + value);
        }

        @Override
        public String toString() {
            return value;
        }
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "application_id")
    private Long applicationId;

    @Column(name = "call_id", nullable = false)
    private Long callId;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Default constructor
    public MessManagerApplication() {
        this.createdAt = LocalDateTime.now();
    }

    // Constructor with parameters
    public MessManagerApplication(Long callId, Long studentId, String reason) {
        this.callId = callId;
        this.studentId = studentId;
        this.reason = reason;
        this.status = ApplicationStatus.PENDING;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
    }

    public Long getCallId() {
        return callId;
    }

    public void setCallId(Long callId) {
        this.callId = callId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public void setStatus(String status) {
        this.status = ApplicationStatus.fromString(status);
    }

    public String getStatusAsString() {
        return status != null ? status.getValue() : null;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "MessManagerApplication{" +
                "applicationId=" + applicationId +
                ", callId=" + callId +
                ", studentId=" + studentId +
                ", reason='" + reason + '\'' +
                ", status=" + status +
                ", createdAt=" + createdAt +
                '}';
    }
}
