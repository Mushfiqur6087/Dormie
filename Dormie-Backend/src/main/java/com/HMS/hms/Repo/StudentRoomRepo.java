package com.HMS.hms.Repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.HMS.hms.Tables.StudentRoom;

@Repository
public interface StudentRoomRepo extends JpaRepository<StudentRoom, Long> {

    // Find student room assignments by student ID
    List<StudentRoom> findByStudentId(Long studentId);

    // Find student room assignments by room ID
    List<StudentRoom> findByRoomId(String roomId);

    // Find all students in a specific room
    @Query("SELECT sr FROM StudentRoom sr WHERE sr.roomId = :roomId")
    List<StudentRoom> findStudentsInRoom(@Param("roomId") String roomId);

    // Count students in a specific room
    @Query("SELECT COUNT(sr) FROM StudentRoom sr WHERE sr.roomId = :roomId")
    long countStudentsInRoom(@Param("roomId") String roomId);

    // Check if a student is assigned to any room
    boolean existsByStudentId(Long studentId);

    // Check if a user is assigned to any room
    boolean existsByUserId(Long userId);

    // Find room assignment by user ID (since userId is unique primary key)
    // This is redundant since we can use findById, but kept for clarity
    @Query("SELECT sr FROM StudentRoom sr WHERE sr.userId = :userId")
    StudentRoom findByUserId(@Param("userId") Long userId);

    // Get all room assignments ordered by room ID
    List<StudentRoom> findAllByOrderByRoomId();

    // Get all room assignments for a specific room ordered by student ID
    List<StudentRoom> findByRoomIdOrderByStudentId(String roomId);
}
