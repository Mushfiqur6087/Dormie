package com.HMS.hms.Tables;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "mess_manager_calls")
public class MessManagerCall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long callId;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "month", nullable = false)
    private Integer month; // 1-12

    @Column(name = "year", nullable = false)
    private Integer year;

    @Column(name = "application_deadline", nullable = false)
    private LocalDate applicationDeadline;

    @Column(name = "status", nullable = false)
    private String status = "ACTIVE"; // ACTIVE, CLOSED, SELECTION_COMPLETE

    @Column(name = "created_by", nullable = false)
    private Long createdBy; // Provost userId

    @ManyToOne
    @JoinColumn(name = "created_by", insertable = false, updatable = false)
    private Users createdByUser;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Default constructor
    public MessManagerCall() {}

    // Constructor with parameters
    public MessManagerCall(String title, String description, Integer month, Integer year, 
                          LocalDate applicationDeadline, Long createdBy) {
        this.title = title;
        this.description = description;
        this.month = month;
        this.year = year;
        this.applicationDeadline = applicationDeadline;
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getCallId() {
        return callId;
    }

    public void setCallId(Long callId) {
        this.callId = callId;
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

    public LocalDate getApplicationDeadline() {
        return applicationDeadline;
    }

    public void setApplicationDeadline(LocalDate applicationDeadline) {
        this.applicationDeadline = applicationDeadline;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public Users getCreatedByUser() {
        return createdByUser;
    }

    public void setCreatedByUser(Users createdByUser) {
        this.createdByUser = createdByUser;
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

    @Override
    public String toString() {
        return "MessManagerCall{" +
                "callId=" + callId +
                ", title='" + title + '\'' +
                ", month=" + month +
                ", year=" + year +
                ", applicationDeadline=" + applicationDeadline +
                ", status='" + status + '\'' +
                ", createdBy=" + createdBy +
                ", createdAt=" + createdAt +
                '}';
    }
}
