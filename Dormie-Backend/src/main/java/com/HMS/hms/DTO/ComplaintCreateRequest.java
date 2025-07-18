package com.HMS.hms.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ComplaintCreateRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;

    @NotNull(message = "Complaint type is required")
    private String complaintType; // RAGGING or LOST_AND_FOUND

    private String location;

    private String contactInfo;

    private String imageUrl;

    // Default constructor
    public ComplaintCreateRequest() {
    }

    // Constructor with essential fields
    public ComplaintCreateRequest(String title, String description, String complaintType) {
        this.title = title;
        this.description = description;
        this.complaintType = complaintType;
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

    public String getComplaintType() {
        return complaintType;
    }

    public void setComplaintType(String complaintType) {
        this.complaintType = complaintType;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getContactInfo() {
        return contactInfo;
    }

    public void setContactInfo(String contactInfo) {
        this.contactInfo = contactInfo;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    @Override
    public String toString() {
        return "ComplaintCreateRequest{" +
                "title='" + title + '\'' +
                ", complaintType='" + complaintType + '\'' +
                ", location='" + location + '\'' +
                '}';
    }
}
