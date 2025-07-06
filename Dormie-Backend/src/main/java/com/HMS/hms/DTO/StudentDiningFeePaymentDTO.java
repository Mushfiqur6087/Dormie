package com.HMS.hms.DTO;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for student dining fee payment information with detailed fee information
 * Combines StudentDiningFees and StudentPaymentInfo data with additional details
 */
public class StudentDiningFeePaymentDTO {
    
    private Integer year;
    private String feeType;
    private Long feeId;
    private String tranId;
    private String valId;
    private String paymentMethod;
    private LocalDate feeStartDate;
    private LocalDate feeEndDate;
    private BigDecimal feeAmount;
    private String studentType;
    
    // Default constructor
    public StudentDiningFeePaymentDTO() {}
    
    // Constructor with parameters
    public StudentDiningFeePaymentDTO(Integer year, String feeType, Long feeId, 
                                     String tranId, String valId, String paymentMethod,
                                     LocalDate feeStartDate, LocalDate feeEndDate, 
                                     BigDecimal feeAmount, String studentType) {
        this.year = year;
        this.feeType = feeType;
        this.feeId = feeId;
        this.tranId = tranId;
        this.valId = valId;
        this.paymentMethod = paymentMethod;
        this.feeStartDate = feeStartDate;
        this.feeEndDate = feeEndDate;
        this.feeAmount = feeAmount;
        this.studentType = studentType;
    }
    
    // Getters and Setters
    public Integer getYear() {
        return year;
    }
    
    public void setYear(Integer year) {
        this.year = year;
    }
    
    public String getFeeType() {
        return feeType;
    }
    
    public void setFeeType(String feeType) {
        this.feeType = feeType;
    }
    
    public Long getFeeId() {
        return feeId;
    }
    
    public void setFeeId(Long feeId) {
        this.feeId = feeId;
    }
    
    public String getTranId() {
        return tranId;
    }
    
    public void setTranId(String tranId) {
        this.tranId = tranId;
    }
    
    public String getValId() {
        return valId;
    }
    
    public void setValId(String valId) {
        this.valId = valId;
    }
    
    public String getPaymentMethod() {
        return paymentMethod;
    }
    
    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    
    public LocalDate getFeeStartDate() {
        return feeStartDate;
    }
    
    public void setFeeStartDate(LocalDate feeStartDate) {
        this.feeStartDate = feeStartDate;
    }
    
    public LocalDate getFeeEndDate() {
        return feeEndDate;
    }
    
    public void setFeeEndDate(LocalDate feeEndDate) {
        this.feeEndDate = feeEndDate;
    }
    
    public BigDecimal getFeeAmount() {
        return feeAmount;
    }
    
    public void setFeeAmount(BigDecimal feeAmount) {
        this.feeAmount = feeAmount;
    }
    
    public String getStudentType() {
        return studentType;
    }
    
    public void setStudentType(String studentType) {
        this.studentType = studentType;
    }
    
    @Override
    public String toString() {
        return "StudentDiningFeePaymentDTO{" +
                "year=" + year +
                ", feeType='" + feeType + '\'' +
                ", feeId=" + feeId +
                ", tranId='" + tranId + '\'' +
                ", valId='" + valId + '\'' +
                ", paymentMethod='" + paymentMethod + '\'' +
                ", feeStartDate=" + feeStartDate +
                ", feeEndDate=" + feeEndDate +
                ", feeAmount=" + feeAmount +
                ", studentType='" + studentType + '\'' +
                '}';
    }
}
