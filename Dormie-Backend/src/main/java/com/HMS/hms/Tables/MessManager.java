package com.HMS.hms.Tables;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "mess_managers")
public class MessManager {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long managerId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private Users user;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "month", nullable = false)
    private Integer month; // 1-12

    @Column(name = "year", nullable = false)
    private Integer year;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "status", nullable = false)
    private String status = "ACTIVE"; // ACTIVE, COMPLETED, RESIGNED

    @Column(name = "assigned_by", nullable = false)
    private Long assignedBy; // Provost userId

    @ManyToOne
    @JoinColumn(name = "assigned_by", insertable = false, updatable = false)
    private Users assignedByUser;

    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Default constructor
    public MessManager() {}

    // Constructor with parameters
    public MessManager(Long userId, Long studentId, Integer month, Integer year, 
                      LocalDate startDate, LocalDate endDate, Long assignedBy) {
        this.userId = userId;
        this.studentId = studentId;
        this.month = month;
        this.year = year;
        this.startDate = startDate;
        this.endDate = endDate;
        this.assignedBy = assignedBy;
        this.assignedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getManagerId() {
        return managerId;
    }

    public void setManagerId(Long managerId) {
        this.managerId = managerId;
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

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getAssignedBy() {
        return assignedBy;
    }

    public void setAssignedBy(Long assignedBy) {
        this.assignedBy = assignedBy;
    }

    public Users getAssignedByUser() {
        return assignedByUser;
    }

    public void setAssignedByUser(Users assignedByUser) {
        this.assignedByUser = assignedByUser;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Helper method to check if the mess manager term is currently active
    public boolean isCurrentlyActive() {
        LocalDate today = LocalDate.now();
        return "ACTIVE".equals(status) && 
               !today.isBefore(startDate) && 
               !today.isAfter(endDate);
    }

    @Override
    public String toString() {
        return "MessManager{" +
                "managerId=" + managerId +
                ", userId=" + userId +
                ", studentId=" + studentId +
                ", month=" + month +
                ", year=" + year +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", status='" + status + '\'' +
                ", assignedBy=" + assignedBy +
                ", assignedAt=" + assignedAt +
                '}';
    }
}
