package com.HMS.hms.DTO;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

public class MessManagerCallDTO {

    private Long provostId;
    private Long diningFeeId;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate applicationEndDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate managerActivityStartDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate managerActivityEndDate;
    
    private Integer year;
    private Integer maxManagers;
    private String status;

    // Default constructor
    public MessManagerCallDTO() {}

    // Constructor with parameters
    public MessManagerCallDTO(Long provostId, Long diningFeeId, LocalDate applicationEndDate,
                             LocalDate managerActivityStartDate, LocalDate managerActivityEndDate,
                             Integer year, Integer maxManagers) {
        this.provostId = provostId;
        this.diningFeeId = diningFeeId;
        this.applicationEndDate = applicationEndDate;
        this.managerActivityStartDate = managerActivityStartDate;
        this.managerActivityEndDate = managerActivityEndDate;
        this.year = year;
        this.maxManagers = maxManagers;
    }

    // Getters and Setters
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

    public Integer getMaxManagers() {
        return maxManagers;
    }

    public void setMaxManagers(Integer maxManagers) {
        this.maxManagers = maxManagers;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "MessManagerCallDTO{" +
                "provostId=" + provostId +
                ", diningFeeId=" + diningFeeId +
                ", applicationEndDate=" + applicationEndDate +
                ", managerActivityStartDate=" + managerActivityStartDate +
                ", managerActivityEndDate=" + managerActivityEndDate +
                ", year=" + year +
                ", maxManagers=" + maxManagers +
                ", status='" + status + '\'' +
                '}';
    }
}
