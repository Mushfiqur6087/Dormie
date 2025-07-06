package com.HMS.hms.DTO;

/**
 * DTO for student hall fee payment information
 * Combines StudentHallFees and StudentPaymentInfo data
 */
public class StudentHallFeePaymentDTO {
    
    private Integer year;
    private Double amount;
    private Long feeId;
    private String tranId;
    private String valId;
    private String paymentMethod;
    
    // Default constructor
    public StudentHallFeePaymentDTO() {}
    
    // Constructor with parameters
    public StudentHallFeePaymentDTO(Integer year, Double amount, Long feeId, 
                                   String tranId, String valId, String paymentMethod) {
        this.year = year;
        this.amount = amount;
        this.feeId = feeId;
        this.tranId = tranId;
        this.valId = valId;
        this.paymentMethod = paymentMethod;
    }
    
    // Getters and Setters
    public Integer getYear() {
        return year;
    }
    
    public void setYear(Integer year) {
        this.year = year;
    }
    
    public Double getAmount() {
        return amount;
    }
    
    public void setAmount(Double amount) {
        this.amount = amount;
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
    
    @Override
    public String toString() {
        return "StudentHallFeePaymentDTO{" +
                "year=" + year +
                ", amount=" + amount +
                ", feeId=" + feeId +
                ", tranId='" + tranId + '\'' +
                ", valId='" + valId + '\'' +
                ", paymentMethod='" + paymentMethod + '\'' +
                '}';
    }
}
