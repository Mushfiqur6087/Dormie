package com.HMS.hms.Tables;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;  
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "room_change_applications")
public class RoomChangeApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long applicationId;

    @Column(name = "user_id", nullable = false)
    private Long userId;  // Foreign key to users.userId
     @OneToOne
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Users user;
    @Column(name ="student_id_no", nullable = false)
    private Long studentIdNo;
    @Column(name="current_room",nullable=false)  // Foreign key to students.studentId
    private String currentRoom;
    @Column(name="preferred_room", nullable=false)  // Foreign key to students.studentId
    private String preferredRoom;
    @Column(nullable = false,length = 1000)
     private String reason;
    @Column(name="application_status", nullable = false)
    private String applicationStatus="PENDING"; // Default status is "PENDING"
    @Column(name = "application_date", nullable = false)
    private LocalDateTime applicationDate; // Default to current date and

    public RoomChangeApplication() {
        this.applicationDate = LocalDateTime.now(); // Set default application date to current date and time
        this.applicationStatus = "PENDING"; // Default status is "PENDING"
    
    }
    public RoomChangeApplication(Long userId, Long studentIdNo, String currentRoom, String preferredRoom, String reason) {
        this(); // Call the default constructor to set applicationDate and applicationStatus
        this.userId = userId;
        this.studentIdNo = studentIdNo;
        this.currentRoom = currentRoom;
        this.preferredRoom = preferredRoom;
        this.reason = reason;
    }


    // Getters and Setters
    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
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
    public Long getStudentIdNo() {
        return studentIdNo;
    }
    public void setStudentIdNo(Long studentIdNo) {
        this.studentIdNo = studentIdNo;
    }
    public String getCurrentRoom() {
        return currentRoom;
    }
    public void setCurrentRoom(String currentRoom) {
        this.currentRoom = currentRoom;
    }
    public String getPreferredRoom() {
        return preferredRoom;
    }
    public void setPreferredRoom(String preferredRoom) {
        this.preferredRoom = preferredRoom;
    }
    public String getReason() {
        return reason;
    }
    public void setReason(String reason) {
        this.reason = reason;
    }
    public String getApplicationStatus() {
        return applicationStatus;
    }
    public void setApplicationStatus(String applicationStatus) {
        this.applicationStatus = applicationStatus;
    }
    public LocalDateTime getApplicationDate() {
        return applicationDate;
    }
    public void setApplicationDate(LocalDateTime applicationDate) {
        this.applicationDate = applicationDate;
    }

    public boolean isPending() {
        return "PENDING".equalsIgnoreCase(this.applicationStatus);
    }
    public boolean isApproved() {
        return "APPROVED".equalsIgnoreCase(this.applicationStatus);
    }
    public boolean isRejected() {
        return "REJECTED".equalsIgnoreCase(this.applicationStatus);
    }
    @Override
    public String toString() {
        return "RoomChangeApplication{" +
                "applicationId=" + applicationId +
                ", userId=" + userId +
                ", studentIdNo=" + studentIdNo +
                ", currentRoom='" + currentRoom + '\'' +
                ", preferredRoom='" + preferredRoom + '\'' +
                ", reason='" + reason + '\'' +
                ", applicationStatus='" + applicationStatus + '\'' +
                ", applicationDate=" + applicationDate +
                '}';
    }
}
