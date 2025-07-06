package com.HMS.hms.DTO;

import jakarta.validation.constraints.NotNull;

/**
 * DTO for room assignment request
 */
public class RoomAssignmentRequest {
    
    @NotNull(message = "User ID is required")
    private Long userId;
    
    @NotNull(message = "Student ID is required")
    private Long studentId;
    
    @NotNull(message = "Room number is required")
    private String roomNo;

    // Default constructor
    public RoomAssignmentRequest() {}

    // Constructor
    public RoomAssignmentRequest(Long userId, Long studentId, String roomNo) {
        this.userId = userId;
        this.studentId = studentId;
        this.roomNo = roomNo;
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getRoomNo() {
        return roomNo;
    }

    public void setRoomNo(String roomNo) {
        this.roomNo = roomNo;
    }

    @Override
    public String toString() {
        return "RoomAssignmentRequest{" +
                "userId=" + userId +
                ", studentId=" + studentId +
                ", roomNo='" + roomNo + '\'' +
                '}';
    }
}
