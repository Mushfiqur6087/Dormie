package com.HMS.hms.Tables;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "meal_plans")
public class MealPlan {

    public enum MealType {
        LUNCH("lunch"),
        DINNER("dinner");

        private final String value;

        MealType(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public static MealType fromString(String value) {
            for (MealType type : MealType.values()) {
                if (type.value.equalsIgnoreCase(value)) {
                    return type;
                }
            }
            throw new IllegalArgumentException("Invalid meal type: " + value);
        }

        @Override
        public String toString() {
            return value;
        }
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "meal_plan_id")
    private Long mealPlanId;

    @Column(name = "mess_manager_id", nullable = false)
    private Long messManagerId;

    @Column(name = "meal_date", nullable = false)
    private LocalDate mealDate;

    @Column(name = "meal_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private MealType mealType;

    @Column(name = "cost_per_person", nullable = false, precision = 10, scale = 2)
    private BigDecimal costPerPerson;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "mealPlan", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonManagedReference
    private List<MealItem> mealItems;

    // Default constructor
    public MealPlan() {
        this.createdAt = LocalDateTime.now();
    }

    // Constructor with parameters
    public MealPlan(Long messManagerId, LocalDate mealDate, MealType mealType, BigDecimal costPerPerson) {
        this.messManagerId = messManagerId;
        this.mealDate = mealDate;
        this.mealType = mealType;
        this.costPerPerson = costPerPerson;
        this.createdAt = LocalDateTime.now();
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

    public MealType getMealType() {
        return mealType;
    }

    public void setMealType(MealType mealType) {
        this.mealType = mealType;
    }

    public void setMealType(String mealType) {
        this.mealType = MealType.fromString(mealType);
    }

    public String getMealTypeAsString() {
        return mealType != null ? mealType.getValue() : null;
    }

    public BigDecimal getCostPerPerson() {
        return costPerPerson;
    }

    public void setCostPerPerson(BigDecimal costPerPerson) {
        this.costPerPerson = costPerPerson;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<MealItem> getMealItems() {
        return mealItems;
    }

    public void setMealItems(List<MealItem> mealItems) {
        this.mealItems = mealItems;
    }

    @Override
    public String toString() {
        return "MealPlan{" +
                "mealPlanId=" + mealPlanId +
                ", messManagerId=" + messManagerId +
                ", mealDate=" + mealDate +
                ", mealType=" + mealType +
                ", costPerPerson=" + costPerPerson +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
