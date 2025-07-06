package com.HMS.hms.Tables;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @Column(name = "room_no", nullable = false)
    private String roomNo;

    @Column(name = "current_student", nullable = false)
    private Integer currentStudent = 0;

    @Column(name = "total_capacity", nullable = false)
    private Integer totalCapacity;

    // Default constructor
    public Room() {}

    // Constructor with parameters
    public Room(String roomNo, Integer currentStudent, Integer totalCapacity) {
        this.roomNo = roomNo;
        this.currentStudent = currentStudent != null ? currentStudent : 0;
        this.totalCapacity = totalCapacity;
    }

    // Constructor without currentStudent (defaults to 0)
    public Room(String roomNo, Integer totalCapacity) {
        this.roomNo = roomNo;
        this.currentStudent = 0;
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
        return "Room{" +
                "roomNo='" + roomNo + '\'' +
                ", currentStudent=" + currentStudent +
                ", totalCapacity=" + totalCapacity +
                '}';
    }
}
