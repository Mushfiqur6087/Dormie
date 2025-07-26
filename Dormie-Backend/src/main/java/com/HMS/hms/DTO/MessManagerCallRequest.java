package com.HMS.hms.DTO;

import java.time.LocalDate;

public class MessManagerCallRequest {

    private String title;
    private String description;
    private String month;
    private Integer year;
    private LocalDate deadline;

    // Default constructor
    public MessManagerCallRequest() {
    }

    // Constructor with all fields
    public MessManagerCallRequest(String title, String description, String month, Integer year, LocalDate deadline) {
        this.title = title;
        this.description = description;
        this.month = month;
        this.year = year;
        this.deadline = deadline;
    }

    // Getters and Setters
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
}
