package com.HMS.hms.DTO;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ComplaintUpdateRequest {

    @NotNull(message = "Status is required")
    private String status; // OPEN, IN_PROGRESS, RESOLVED, CLOSED

    @Size(max = 5000, message = "Resolution notes must not exceed 5000 characters")
    private String resolutionNotes;

    // Default constructor
    public ComplaintUpdateRequest() {
    }

    // Constructor with essential fields
    public ComplaintUpdateRequest(String status, String resolutionNotes) {
        this.status = status;
        this.resolutionNotes = resolutionNotes;
    }

    // Getters and Setters
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    @Override
    public String toString() {
        return "ComplaintUpdateRequest{" +
                "status='" + status + '\'' +
                ", resolutionNotes='" + resolutionNotes + '\'' +
                '}';
    }
}
