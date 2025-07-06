package com.HMS.hms.DTO;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for Room information
 * Used for creating and updating room data
 */
public class RoomDTO {
    
    @NotBlank(message = "Room number is required")
    private String roomNo;
    
    @NotNull(message = "Current student count is required")
    @Min(value = 0, message = "Current student count cannot be negative")
    private Integer currentStudent;
    
    @NotNull(message = "Total capacity is required")
    @Min(value = 1, message = "Total capacity must be at least 1")
    private Integer totalCapacity;

    // Default constructor
    public RoomDTO() {}

    // Constructor
    public RoomDTO(String roomNo, Integer currentStudent, Integer totalCapacity) {
        this.roomNo = roomNo;
        this.currentStudent = currentStudent != null ? currentStudent : 0;
        this.totalCapacity = totalCapacity;
    }

    // Getters and Setters
    public String getRoomNo() {
        return roomNo;
    }

    public void setRoomNo(String roomNo) {
        this.roomNo = roomNo;
    }

    public Integer getCurrentStudent() {
        return currentStudent;
    }

    public void setCurrentStudent(Integer currentStudent) {
        this.currentStudent = currentStudent != null ? currentStudent : 0;
    }

    public Integer getTotalCapacity() {
        return totalCapacity;
    }

    public void setTotalCapacity(Integer totalCapacity) {
        this.totalCapacity = totalCapacity;
    }

    // Utility methods
    public boolean isFull() {
        return currentStudent >= totalCapacity;
    }

    public boolean hasSpace() {
        return currentStudent < totalCapacity;
    }

    public Integer getAvailableSpaces() {
        return totalCapacity - currentStudent;
    }

    @Override
    public String toString() {
        return "RoomDTO{" +
                "roomNo='" + roomNo + '\'' +
                ", currentStudent=" + currentStudent +
                ", totalCapacity=" + totalCapacity +
                '}';
    }
}
