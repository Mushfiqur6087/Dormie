package com.HMS.hms.DTO;

import java.time.LocalDate;

import jakarta.validation.constraints.Size;

/**
 * DTO for student information update requests
 * Contains only the fields that students are allowed to update
 */
public class StudentUpdateRequest {
    
    @Size(max = 20, message = "Contact number cannot exceed 20 characters")
    private String contactNo;
    
    @Size(max = 500, message = "Present address cannot exceed 500 characters")
    private String presentAddress;
    
    @Size(max = 500, message = "Permanent address cannot exceed 500 characters")
    private String permanentAddress;
    
    @Size(max = 50, message = "Registration number cannot exceed 50 characters")
    private String regNo;
    
    private LocalDate dateOfBirth;

    // Constructors
    public StudentUpdateRequest() {}
    
    public StudentUpdateRequest(String contactNo, String presentAddress, String permanentAddress, 
                               String regNo, LocalDate dateOfBirth) {
        this.contactNo = contactNo;
        this.presentAddress = presentAddress;
        this.permanentAddress = permanentAddress;
        this.regNo = regNo;
        this.dateOfBirth = dateOfBirth;
    }
    
    // Getters and Setters
    public String getContactNo() {
        return contactNo;
    }
    
    public void setContactNo(String contactNo) {
        this.contactNo = contactNo;
    }
    
    public String getPresentAddress() {
        return presentAddress;
    }
    
    public void setPresentAddress(String presentAddress) {
        this.presentAddress = presentAddress;
    }
    
    public String getPermanentAddress() {
        return permanentAddress;
    }
    
    public void setPermanentAddress(String permanentAddress) {
        this.permanentAddress = permanentAddress;
    }
    
    public String getRegNo() {
        return regNo;
    }
    
    public void setRegNo(String regNo) {
        this.regNo = regNo;
    }
    
    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }
    
    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }
    
    @Override
    public String toString() {
        return "StudentUpdateRequest{" +
                "contactNo='" + contactNo + '\'' +
                ", presentAddress='" + presentAddress + '\'' +
                ", permanentAddress='" + permanentAddress + '\'' +
                ", regNo='" + regNo + '\'' +
                ", dateOfBirth=" + dateOfBirth +
                '}';
    }
}
