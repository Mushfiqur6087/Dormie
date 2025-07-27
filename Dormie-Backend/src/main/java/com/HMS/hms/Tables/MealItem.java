package com.HMS.hms.Tables;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "meal_items")
public class MealItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "meal_item_id")
    private Long mealItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meal_plan_id", referencedColumnName = "meal_plan_id", nullable = false)
    @JsonBackReference
    private MealPlan mealPlan;

    @Column(name = "item_name", nullable = false, length = 255)
    private String itemName;

    @Column(name = "item_order", nullable = false)
    private Integer itemOrder;

    // Default constructor
    public MealItem() {
    }

    // Constructor with parameters
    public MealItem(MealPlan mealPlan, String itemName, Integer itemOrder) {
        this.mealPlan = mealPlan;
        this.itemName = itemName;
        this.itemOrder = itemOrder;
    }

    // Getters and Setters
    public Long getMealItemId() {
        return mealItemId;
    }

    public void setMealItemId(Long mealItemId) {
        this.mealItemId = mealItemId;
    }

    public MealPlan getMealPlan() {
        return mealPlan;
    }

    public void setMealPlan(MealPlan mealPlan) {
        this.mealPlan = mealPlan;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public Integer getItemOrder() {
        return itemOrder;
    }

    public void setItemOrder(Integer itemOrder) {
        this.itemOrder = itemOrder;
    }

    @Override
    public String toString() {
        return "MealItem{" +
                "mealItemId=" + mealItemId +
                ", itemName='" + itemName + '\'' +
                ", itemOrder=" + itemOrder +
                '}';
    }
}
