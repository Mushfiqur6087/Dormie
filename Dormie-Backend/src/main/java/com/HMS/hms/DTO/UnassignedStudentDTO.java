package com.HMS.hms.DTO;

/**
 * DTO for unassigned student information
 * Contains userId, studentId, and batch for room assignment purposes
 */
public class UnassignedStudentDTO {
    
    private Long userId;
    private Long studentId;
    private Integer batch;

    // Default constructor
    public UnassignedStudentDTO() {}

    // Constructor
    public UnassignedStudentDTO(Long userId, Long studentId, Integer batch) {
        this.userId = userId;
        this.studentId = studentId;
        this.batch = batch;
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

    public Integer getBatch() {
        return batch;
    }

    public void setBatch(Integer batch) {
        this.batch = batch;
    }

    @Override
    public String toString() {
        return "UnassignedStudentDTO{" +
                "userId=" + userId +
                ", studentId=" + studentId +
                ", batch=" + batch +
                '}';
    }
}
