package com.HMS.hms.Tables;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "mess_menus")
public class MessMenu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long menuId;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "meal_type", nullable = false)
    private String mealType; // LUNCH, DINNER

    @Column(name = "menu_items", nullable = false, columnDefinition = "TEXT")
    private String menuItems; // JSON or comma-separated list of menu items

    @Column(name = "created_by", nullable = false)
    private Long createdBy; // Mess manager userId

    @ManyToOne
    @JoinColumn(name = "created_by", insertable = false, updatable = false)
    private Users createdByUser;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Default constructor
    public MessMenu() {}

    // Constructor with parameters
    public MessMenu(LocalDate date, String mealType, String menuItems, Long createdBy) {
        this.date = date;
        this.mealType = mealType;
        this.menuItems = menuItems;
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getMenuId() {
        return menuId;
    }

    public void setMenuId(Long menuId) {
        this.menuId = menuId;
    }

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

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public Users getCreatedByUser() {
        return createdByUser;
    }

    public void setCreatedByUser(Users createdByUser) {
        this.createdByUser = createdByUser;
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

    @Override
    public String toString() {
        return "MessMenu{" +
                "menuId=" + menuId +
                ", date=" + date +
                ", mealType='" + mealType + '\'' +
                ", menuItems='" + menuItems + '\'' +
                ", createdBy=" + createdBy +
                ", createdAt=" + createdAt +
                '}';
    }
}
