package com.HMS.hms.DTO;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class MessManagerCallDTO {

    private Long id;
    private String title;
    private String description;
    private String month;
    private Integer year;
    private LocalDate deadline;
    private String status;
    private Long createdBy;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long totalApplications;
    private Long selectedApplications;

    // Default constructor
    public MessManagerCallDTO() {
    }

    // Constructor with essential fields
    public MessManagerCallDTO(Long id, String title, String month, Integer year, LocalDate deadline, String status) {
        this.id = id;
        this.title = title;
        this.month = month;
        this.year = year;
        this.deadline = deadline;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
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

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
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

    public Long getTotalApplications() {
        return totalApplications;
    }

    public void setTotalApplications(Long totalApplications) {
        this.totalApplications = totalApplications;
    }

    public Long getSelectedApplications() {
        return selectedApplications;
    }

    public void setSelectedApplications(Long selectedApplications) {
        this.selectedApplications = selectedApplications;
    }
}
