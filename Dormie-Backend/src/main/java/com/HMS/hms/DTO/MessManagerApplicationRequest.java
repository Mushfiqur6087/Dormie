package com.HMS.hms.DTO;

public class MessManagerApplicationRequest {

    private String motivation;
    private String previousExperience;

    // Default constructor
    public MessManagerApplicationRequest() {
    }

    // Constructor with all fields
    public MessManagerApplicationRequest(String motivation, String previousExperience) {
        this.motivation = motivation;
        this.previousExperience = previousExperience;
    }

    // Getters and Setters
    public String getMotivation() {
        return motivation;
    }

    public void setMotivation(String motivation) {
        this.motivation = motivation;
    }

    public String getPreviousExperience() {
        return previousExperience;
    }

    public void setPreviousExperience(String previousExperience) {
        this.previousExperience = previousExperience;
    }
}
