package com.HMS.hms.Tables;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "mess_manager_call")
public class MessManagerCall {

    public enum CallStatus {
        ACTIVE("active"),
        EXPIRED("expired"),
        COMPLETED("completed");

        private final String value;

        CallStatus(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public static CallStatus fromString(String value) {
            for (CallStatus status : CallStatus.values()) {
                if (status.value.equalsIgnoreCase(value)) {
                    return status;
                }
            }
            throw new IllegalArgumentException("Invalid call status: " + value);
        }

        @Override
        public String toString() {
            return value;
        }
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "call_id")
    private Long callId;

    @Column(name = "provost_id", nullable = false)
    private Long provostId;

    @Column(name = "dining_fee_id", nullable = false)
    private Long diningFeeId;

    @Column(name = "application_end_date", nullable = false)
    private LocalDate applicationEndDate;

    @Column(name = "manager_activity_start_date", nullable = false)
    private LocalDate managerActivityStartDate;

    @Column(name = "manager_activity_end_date", nullable = false)
    private LocalDate managerActivityEndDate;

    @Column(name = "`year`", nullable = false)
    private Integer year;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private CallStatus status = CallStatus.ACTIVE;

    @Column(name = "max_managers", nullable = false)
    private Integer maxManagers = 5;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Foreign key relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dining_fee_id", referencedColumnName = "id", insertable = false, updatable = false)
    @JsonIgnore
    private DiningFee diningFee;

    // Default constructor
    public MessManagerCall() {
        this.createdAt = LocalDateTime.now();
    }

    // Constructor with parameters
    public MessManagerCall(Long provostId, Long diningFeeId, LocalDate applicationEndDate, 
                          LocalDate managerActivityStartDate, LocalDate managerActivityEndDate, 
                          Integer year, Integer maxManagers) {
        this.provostId = provostId;
        this.diningFeeId = diningFeeId;
        this.applicationEndDate = applicationEndDate;
        this.managerActivityStartDate = managerActivityStartDate;
        this.managerActivityEndDate = managerActivityEndDate;
        this.year = year;
        this.maxManagers = maxManagers != null ? maxManagers : 5;
        this.status = CallStatus.ACTIVE;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getCallId() {
        return callId;
    }

    public void setCallId(Long callId) {
        this.callId = callId;
    }

    public Long getProvostId() {
        return provostId;
    }

    public void setProvostId(Long provostId) {
        this.provostId = provostId;
    }

    public Long getDiningFeeId() {
        return diningFeeId;
    }

    public void setDiningFeeId(Long diningFeeId) {
        this.diningFeeId = diningFeeId;
    }

    public LocalDate getApplicationEndDate() {
        return applicationEndDate;
    }

    public void setApplicationEndDate(LocalDate applicationEndDate) {
        this.applicationEndDate = applicationEndDate;
    }

    public LocalDate getManagerActivityStartDate() {
        return managerActivityStartDate;
    }

    public void setManagerActivityStartDate(LocalDate managerActivityStartDate) {
        this.managerActivityStartDate = managerActivityStartDate;
    }

    public LocalDate getManagerActivityEndDate() {
        return managerActivityEndDate;
    }

    public void setManagerActivityEndDate(LocalDate managerActivityEndDate) {
        this.managerActivityEndDate = managerActivityEndDate;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public CallStatus getStatus() {
        return status;
    }

    public void setStatus(CallStatus status) {
        this.status = status;
    }

    public void setStatus(String status) {
        this.status = CallStatus.fromString(status);
    }

    public String getStatusAsString() {
        return status != null ? status.getValue() : null;
    }

    public Integer getMaxManagers() {
        return maxManagers;
    }

    public void setMaxManagers(Integer maxManagers) {
        this.maxManagers = maxManagers;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public DiningFee getDiningFee() {
        return diningFee;
    }

    public void setDiningFee(DiningFee diningFee) {
        this.diningFee = diningFee;
    }

    @Override
    public String toString() {
        return "MessManagerCall{" +
                "callId=" + callId +
                ", provostId=" + provostId +
                ", diningFeeId=" + diningFeeId +
                ", applicationEndDate=" + applicationEndDate +
                ", managerActivityStartDate=" + managerActivityStartDate +
                ", managerActivityEndDate=" + managerActivityEndDate +
                ", year=" + year +
                ", status=" + status +
                ", maxManagers=" + maxManagers +
                ", createdAt=" + createdAt +
                '}';
    }
}
