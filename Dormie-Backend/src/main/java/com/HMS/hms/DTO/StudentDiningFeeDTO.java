package com.HMS.hms.DTO;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class StudentDiningFeeDTO {
    
    private Long feeId;
    
    @NotNull(message = "Student ID is required")
    private Long studentId;


    
    @NotBlank(message = "Student type is required")
    @Pattern(regexp = "^(resident|attached)$", message = "Student type must be 'resident' or 'attached'")
    private String studentType;
    
    @NotNull(message = "Year is required")
    @Min(value = 2020, message = "Year must be 2020 or later")
    @Max(value = 2030, message = "Year must be 2030 or earlier")
    private Integer year;
    
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    
    @NotNull(message = "End date is required")
    private LocalDate endDate;
    
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(PAID|UNPAID|paid|unpaid)$", message = "Status must be 'PAID', 'UNPAID', 'paid', or 'unpaid'")
    private String status;

    // Add due amount field (for unpaid fees, this equals the dining fee amount; for paid fees, this is 0)
    @DecimalMin(value = "0.00", message = "Due amount must be non-negative")
    @DecimalMax(value = "999999.99", message = "Due amount must be less than 1,000,000")
    private BigDecimal dueAmount;

    // Default constructor
    public StudentDiningFeeDTO() {}

    // Constructor without feeId (for creation)
    public StudentDiningFeeDTO(Long studentId, String studentType, Integer year, 
                             LocalDate startDate, LocalDate endDate, String status) {
        this.studentId = studentId;
        this.studentType = studentType;
        this.year = year;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
    }

    // Constructor with feeId (for responses)
    public StudentDiningFeeDTO(Long feeId, Long studentId, String studentType, Integer year, 
                             LocalDate startDate, LocalDate endDate, String status) {
        this.feeId = feeId;
        this.studentId = studentId;
        this.studentType = studentType;
        this.year = year;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
    }

    // Getters and Setters
    public Long getFeeId() {
        return feeId;
    }

    public void setFeeId(Long feeId) {
        this.feeId = feeId;
    }
    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }



    public String getStudentType() {
        return studentType;
    }

    public void setStudentType(String studentType) {
        this.studentType = studentType;
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

    public BigDecimal getDueAmount() {
        return dueAmount;
    }

    public void setDueAmount(BigDecimal dueAmount) {
        this.dueAmount = dueAmount;
    }

    @Override
    public String toString() {
        return "StudentDiningFeeDTO{" +
                "feeId=" + feeId +
                ", studentId=" + studentId +
                ", studentType='" + studentType + '\'' +
                ", year=" + year +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", status='" + status + '\'' +
                ", dueAmount=" + dueAmount +
                '}';
    }
}
