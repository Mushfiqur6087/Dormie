package com.HMS.hms.DTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class MealPlanDTO {
    private Long mealPlanId;
    private Long messManagerId;
    private LocalDate mealDate;
    private String mealType;
    private BigDecimal costPerPerson;
    private List<String> mealItems;

    // Default constructor
    public MealPlanDTO() {
    }

    // Constructor with parameters
    public MealPlanDTO(Long mealPlanId, Long messManagerId, LocalDate mealDate, String mealType, 
                       BigDecimal costPerPerson, List<String> mealItems) {
        this.mealPlanId = mealPlanId;
        this.messManagerId = messManagerId;
        this.mealDate = mealDate;
        this.mealType = mealType;
        this.costPerPerson = costPerPerson;
        this.mealItems = mealItems;
    }

    // Getters and Setters
    public Long getMealPlanId() {
        return mealPlanId;
    }

    public void setMealPlanId(Long mealPlanId) {
        this.mealPlanId = mealPlanId;
    }

    public Long getMessManagerId() {
        return messManagerId;
    }

    public void setMessManagerId(Long messManagerId) {
        this.messManagerId = messManagerId;
    }

    public LocalDate getMealDate() {
        return mealDate;
    }

    public void setMealDate(LocalDate mealDate) {
        this.mealDate = mealDate;
    }

    public String getMealType() {
        return mealType;
    }

    public void setMealType(String mealType) {
        this.mealType = mealType;
    }

    public BigDecimal getCostPerPerson() {
        return costPerPerson;
    }

    public void setCostPerPerson(BigDecimal costPerPerson) {
        this.costPerPerson = costPerPerson;
    }

    public List<String> getMealItems() {
        return mealItems;
    }

    public void setMealItems(List<String> mealItems) {
        this.mealItems = mealItems;
    }

    @Override
    public String toString() {
        return "MealPlanDTO{" +
                "mealPlanId=" + mealPlanId +
                ", messManagerId=" + messManagerId +
                ", mealDate=" + mealDate +
                ", mealType='" + mealType + '\'' +
                ", costPerPerson=" + costPerPerson +
                ", mealItems=" + mealItems +
                '}';
    }
}
