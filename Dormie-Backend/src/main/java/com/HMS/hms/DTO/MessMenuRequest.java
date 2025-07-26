package com.HMS.hms.DTO;

import java.time.LocalDate;

public class MessMenuRequest {

    private LocalDate date;
    private String mealType;
    private String menuItems;

    // Default constructor
    public MessMenuRequest() {
    }

    // Constructor with all fields
    public MessMenuRequest(LocalDate date, String mealType, String menuItems) {
        this.date = date;
        this.mealType = mealType;
        this.menuItems = menuItems;
    }

    // Getters and Setters
    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getMealType() {
        return mealType;
    }

    public void setMealType(String mealType) {
        this.mealType = mealType;
    }

    public String getMenuItems() {
        return menuItems;
    }

    public void setMenuItems(String menuItems) {
        this.menuItems = menuItems;
    }
}
