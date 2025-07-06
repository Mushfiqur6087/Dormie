package com.HMS.hms.Repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.HMS.hms.Tables.Room;

@Repository
public interface RoomRepo extends JpaRepository<Room, String> {

    // Find rooms by current student count
    List<Room> findByCurrentStudent(Integer currentStudent);

    // Find rooms by total capacity
    List<Room> findByTotalCapacity(Integer totalCapacity);

    // Find available rooms (rooms that are not full)
    @Query("SELECT r FROM Room r WHERE r.currentStudent < r.totalCapacity")
    List<Room> findAvailableRooms();

    // Find full rooms
    @Query("SELECT r FROM Room r WHERE r.currentStudent >= r.totalCapacity")
    List<Room> findFullRooms();

    // Find empty rooms
    @Query("SELECT r FROM Room r WHERE r.currentStudent = 0")
    List<Room> findEmptyRooms();

    // Find rooms with specific available spaces
    @Query("SELECT r FROM Room r WHERE (r.totalCapacity - r.currentStudent) = :availableSpaces")
    List<Room> findByAvailableSpaces(@Param("availableSpaces") Integer availableSpaces);

    // Find rooms with at least minimum available spaces
    @Query("SELECT r FROM Room r WHERE (r.totalCapacity - r.currentStudent) >= :minAvailableSpaces")
    List<Room> findByMinAvailableSpaces(@Param("minAvailableSpaces") Integer minAvailableSpaces);

    // Find rooms ordered by room number
    List<Room> findAllByOrderByRoomNo();

    // Find rooms ordered by available spaces (descending)
    @Query("SELECT r FROM Room r ORDER BY (r.totalCapacity - r.currentStudent) DESC")
    List<Room> findAllOrderByAvailableSpacesDesc();

    // Count available rooms
    @Query("SELECT COUNT(r) FROM Room r WHERE r.currentStudent < r.totalCapacity")
    long countAvailableRooms();

    // Count full rooms
    @Query("SELECT COUNT(r) FROM Room r WHERE r.currentStudent >= r.totalCapacity")
    long countFullRooms();
}
