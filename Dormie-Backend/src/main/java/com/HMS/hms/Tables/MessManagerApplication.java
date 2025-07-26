package com.HMS.hms.Tables;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mess_manager_applications")
public class MessManagerApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long applicationId;

    @Column(name = "call_id", nullable = false)
    private Long callId;

    @ManyToOne
    @JoinColumn(name = "call_id", insertable = false, updatable = false)
    private MessManagerCall messManagerCall;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private Users user;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "motivation", nullable = false, columnDefinition = "TEXT")
    private String motivation; // Why they want to be mess manager

    @Column(name = "experience", columnDefinition = "TEXT")
    private String experience; // Previous experience or relevant skills

    @Column(name = "status", nullable = false)
    private String status = "PENDING"; // PENDING, SELECTED, REJECTED

    @Column(name = "applied_at", nullable = false)
    private LocalDateTime appliedAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Default constructor
    public MessManagerApplication() {}

    // Constructor with parameters
    public MessManagerApplication(Long callId, Long userId, Long studentId, 
                                 String motivation, String experience) {
        this.callId = callId;
        this.userId = userId;
        this.studentId = studentId;
        this.motivation = motivation;
        this.experience = experience;
        this.appliedAt = LocalDateTime.now();
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

    public MessManagerCall getMessManagerCall() {
        return messManagerCall;
    }

    public void setMessManagerCall(MessManagerCall messManagerCall) {
        this.messManagerCall = messManagerCall;
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

    public String getMotivation() {
        return motivation;
    }

    public void setMotivation(String motivation) {
        this.motivation = motivation;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public String toString() {
        return "MessManagerApplication{" +
                "applicationId=" + applicationId +
                ", callId=" + callId +
                ", userId=" + userId +
                ", studentId=" + studentId +
                ", status='" + status + '\'' +
                ", appliedAt=" + appliedAt +
                '}';
    }
}
