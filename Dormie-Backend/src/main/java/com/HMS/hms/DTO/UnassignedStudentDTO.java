package com.HMS.hms.DTO;

/**
 * DTO for unassigned student information
 * Contains only userId and studentId for room assignment purposes
 */
public class UnassignedStudentDTO {
    
    private Long userId;
    private Long studentId;

    // Default constructor
    public UnassignedStudentDTO() {}

    // Constructor
    public UnassignedStudentDTO(Long userId, Long studentId) {
        this.userId = userId;
        this.studentId = studentId;
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

    @Override
    public String toString() {
        return "UnassignedStudentDTO{" +
                "userId=" + userId +
                ", studentId=" + studentId +
                '}';
    }
}
