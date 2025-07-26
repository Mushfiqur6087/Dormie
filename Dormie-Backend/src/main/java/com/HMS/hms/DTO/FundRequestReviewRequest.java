package com.HMS.hms.DTO;

public class FundRequestReviewRequest {

    private String status;
    private String reviewNotes;

    // Default constructor
    public FundRequestReviewRequest() {
    }

    // Constructor with all fields
    public FundRequestReviewRequest(String status, String reviewNotes) {
        this.status = status;
        this.reviewNotes = reviewNotes;
    }

    // Getters and Setters
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReviewNotes() {
        return reviewNotes;
    }

    public void setReviewNotes(String reviewNotes) {
        this.reviewNotes = reviewNotes;
    }
}
