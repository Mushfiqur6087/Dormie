package com.HMS.hms.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.HMS.hms.Repo.StudentRoomRepo;
import com.HMS.hms.Tables.StudentRoom;

@Service
public class StudentRoomService {

    @Autowired
    private StudentRoomRepo studentRoomRepo;

    // Basic CRUD operations
    public StudentRoom assignStudentToRoom(Long userId, Long studentId, String roomId) {
        StudentRoom studentRoom = new StudentRoom(userId, studentId, roomId);
        return studentRoomRepo.save(studentRoom);
    }

    public List<StudentRoom> getAllStudentRoomAssignments() {
        return studentRoomRepo.findAll();
    }

    public Optional<StudentRoom> getStudentRoomByUserId(Long userId) {
        return studentRoomRepo.findById(userId);
    }

    public List<StudentRoom> getStudentRoomsByStudentId(Long studentId) {
        return studentRoomRepo.findByStudentId(studentId);
    }

    public List<StudentRoom> getStudentRoomsByRoomId(String roomId) {
        return studentRoomRepo.findByRoomId(roomId);
    }

    public List<StudentRoom> getStudentsInRoom(String roomId) {
        return studentRoomRepo.findStudentsInRoom(roomId);
    }

    public long countStudentsInRoom(String roomId) {
        return studentRoomRepo.countStudentsInRoom(roomId);
    }

    public List<StudentRoom> getAllStudentRoomAssignmentsOrderedByRoom() {
        return studentRoomRepo.findAllByOrderByRoomId();
    }

    public List<StudentRoom> getStudentRoomsByRoomIdOrderedByStudent(String roomId) {
        return studentRoomRepo.findByRoomIdOrderByStudentId(roomId);
    }

    public StudentRoom updateStudentRoomAssignment(Long userId, Long studentId, String roomId) {
        Optional<StudentRoom> existingStudentRoomOpt = studentRoomRepo.findById(userId);
        if (existingStudentRoomOpt.isPresent()) {
            StudentRoom existingStudentRoom = existingStudentRoomOpt.get();
            existingStudentRoom.setStudentId(studentId);
            existingStudentRoom.setRoomId(roomId);
            return studentRoomRepo.save(existingStudentRoom);
        }
        return null;
    }

    public boolean removeStudentFromRoom(Long userId) {
        if (studentRoomRepo.existsById(userId)) {
            studentRoomRepo.deleteById(userId);
            return true;
        }
        return false;
    }

    public boolean isStudentAssignedToRoom(Long studentId) {
        return studentRoomRepo.existsByStudentId(studentId);
    }

    public boolean isUserAssignedToRoom(Long userId) {
        return studentRoomRepo.existsByUserId(userId);
    }

    public StudentRoom saveStudentRoom(StudentRoom studentRoom) {
        return studentRoomRepo.save(studentRoom);
    }
}
