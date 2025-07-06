package com.HMS.hms.Tables;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

@Entity
@Table(name = "student_payment_info")
@IdClass(StudentPaymentInfo.PaymentInfoId.class)
public class StudentPaymentInfo {

    // Composite Primary Key Class
    public static class PaymentInfoId implements Serializable {
        private Long feeId;
        private FeeType feeType;

        public PaymentInfoId() {}

        public PaymentInfoId(Long feeId, FeeType feeType) {
            this.feeId = feeId;
            this.feeType = feeType;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            PaymentInfoId that = (PaymentInfoId) o;
            return Objects.equals(feeId, that.feeId) && feeType == that.feeType;
        }

        @Override
        public int hashCode() {
            return Objects.hash(feeId, feeType);
        }

        // Getters and setters
        public Long getFeeId() { return feeId; }
        public void setFeeId(Long feeId) { this.feeId = feeId; }
        public FeeType getFeeType() { return feeType; }
        public void setFeeType(FeeType feeType) { this.feeType = feeType; }
    }

    // Enum for fee type
    public enum FeeType {
        HALL("hall"),
        DINING("dining");

        private final String value;

        FeeType(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public static FeeType fromString(String value) {
            for (FeeType type : FeeType.values()) {
                if (type.value.equalsIgnoreCase(value)) {
                    return type;
                }
            }
            throw new IllegalArgumentException("Invalid fee type: " + value + ". Must be 'hall' or 'dining'.");
        }

        @Override
        public String toString() {
            return value;
        }
    }

    @Id
    @Column(name = "fee_id", nullable = false)
    private Long feeId; // Foreign key to StudentHallFees.feeId or StudentDiningFees.feeId

    @Id
    @Column(name = "fee_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private FeeType feeType;

    @Column(name = "tran_id")
    private String tranId;

    @Column(name = "val_id")
    private String valId;

    @Column(name = "payment_method")
    private String paymentMethod;

    // Default constructor
    public StudentPaymentInfo() {}

    // Constructor with parameters
    public StudentPaymentInfo(Long feeId, FeeType feeType, String tranId, String valId, String paymentMethod) {
        this.feeId = feeId;
        this.feeType = feeType;
        this.tranId = tranId;
        this.valId = valId;
        this.paymentMethod = paymentMethod;
    }

    // Constructor with string values for convenience
    public StudentPaymentInfo(Long feeId, String feeType, String tranId, String valId, String paymentMethod) {
        this.feeId = feeId;
        this.feeType = FeeType.fromString(feeType);
        this.tranId = tranId;
        this.valId = valId;
        this.paymentMethod = paymentMethod;
    }

    // Getters and Setters
    public Long getFeeId() {
        return feeId;
    }

    // Note: feeId is part of composite primary key, should not be changed after construction

    public FeeType getFeeType() {
        return feeType;
    }

    // Note: feeType is part of composite primary key, should not be changed after construction

    public String getFeeTypeAsString() {
        return feeType != null ? feeType.getValue() : null;
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
        return "StudentPaymentInfo{" +
                "feeId=" + feeId +
                ", feeType=" + feeType +
                ", tranId='" + tranId + '\'' +
                ", valId='" + valId + '\'' +
                ", paymentMethod='" + paymentMethod + '\'' +
                '}';
    }
}
