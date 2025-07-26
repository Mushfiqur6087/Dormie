package com.HMS.hms.DTO;

import java.math.BigDecimal;

public class FundRequestRequest {

    private BigDecimal amount;
    private String title;
    private String description;

    // Default constructor
    public FundRequestRequest() {
    }

    // Constructor with all fields
    public FundRequestRequest(BigDecimal amount, String title, String description) {
        this.amount = amount;
        this.title = title;
        this.description = description;
    }

    // Getters and Setters
    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

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
}
