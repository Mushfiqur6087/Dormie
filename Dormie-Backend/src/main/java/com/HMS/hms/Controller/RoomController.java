package com.HMS.hms.Controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.HMS.hms.DTO.MessageResponse;
import com.HMS.hms.DTO.RoomAssignmentRequest;
import com.HMS.hms.DTO.RoomDTO;
import com.HMS.hms.DTO.UnassignedStudentDTO;
import com.HMS.hms.Security.UserDetailsImpl;
import com.HMS.hms.Service.RoomService;
import com.HMS.hms.Service.StudentRoomService;
import com.HMS.hms.Service.StudentsService;
import com.HMS.hms.Tables.StudentRoom;
import com.HMS.hms.Tables.Students;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "*", maxAge = 3600)
public class RoomController {

    @Autowired
    private RoomService roomService;

    @Autowired
    private StudentsService studentsService;

    @Autowired
    private StudentRoomService studentRoomService;

    @PostMapping("/set-room")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> setRooms(@Valid @RequestBody RoomDTO roomDTO) {
        try {
            RoomDTO savedRoom = roomService.createRoom(roomDTO);
            return new ResponseEntity<>(savedRoom, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error creating room: " + e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<RoomDTO>> getAllRooms() {
        try {
            List<RoomDTO> rooms = roomService.getAllRooms();
            return new ResponseEntity<>(rooms, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/assign-room")
    public ResponseEntity<?> assignRoom(@Valid @RequestBody RoomAssignmentRequest request) {
        try {
            // Check if student exists
            Optional<Students> studentOpt = studentsService.findByUserId(request.getUserId());
            if (!studentOpt.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Student not found with user ID: " + request.getUserId()));
            }

            Students student = studentOpt.get();
            
            // Validate that the studentId in request matches the student found by userId
            if (!student.getStudentId().equals(request.getStudentId())) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Student ID mismatch. Expected: " + student.getStudentId() + 
                                                ", Provided: " + request.getStudentId()));
            }
            
            // Check if student is resident
            if (!"resident".equalsIgnoreCase(student.getResidencyStatus())) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Only resident students can be assigned to rooms. Current status: " + student.getResidencyStatus()));
            }

            // Check if student already has a room assignment
            if (studentRoomService.isUserAssignedToRoom(request.getUserId())) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Student is already assigned to a room"));
            }

            // Check if room exists
            Optional<RoomDTO> roomOpt = roomService.getRoomByRoomNo(request.getRoomNo());
            if (!roomOpt.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Room not found: " + request.getRoomNo()));
            }

            RoomDTO room = roomOpt.get();
            
            // Check if room has available capacity (frontend validation)
            if (!roomService.canAccommodateStudent(request.getRoomNo())) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Room " + request.getRoomNo() + " is at full capacity (" + 
                              room.getCurrentStudent() + "/" + room.getTotalCapacity() + ")"));
            }

            // Assign student to room
            studentRoomService.assignStudentToRoom(
                request.getUserId(), 
                request.getStudentId(), 
                request.getRoomNo()
            );

            // Increment room's current student count
            roomService.incrementCurrentStudentCount(request.getRoomNo());

            return new ResponseEntity<>(new MessageResponse("Student successfully assigned to room " + request.getRoomNo()), 
                                      HttpStatus.CREATED);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error assigning room: " + e.getMessage()));
        }
    }

    @GetMapping("/unassigned-students")
    public ResponseEntity<?> getUnassignedStudents() {
        try {
            // Get all resident students
            List<Students> residentStudents = studentsService.findByResidencyStatus("resident");
            
            // Filter out students who already have room assignments
            List<Students> unassignedStudents = residentStudents.stream()
                .filter(student -> !studentRoomService.isUserAssignedToRoom(student.getUserId()))
                .collect(Collectors.toList());
            
            // Convert to DTO with only userId and studentId
            List<UnassignedStudentDTO> unassignedStudentDTOs = unassignedStudents.stream()
                .map(student -> new UnassignedStudentDTO(student.getUserId(), student.getStudentId()))
                .collect(Collectors.toList());
            
            return new ResponseEntity<>(unassignedStudentDTOs, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching unassigned students: " + e.getMessage()));
        }
    }

    @GetMapping("/allocation-status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAllocationStatus() {
        try {
            // Get userId from JWT token using SecurityContextHolder (same as other controllers)
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Long userId = null;
            
            if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                userId = userDetails.getId();
            }
            
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Unable to extract user ID from token"));
            }
            
            // Find student by userId
            Optional<Students> studentOpt = studentsService.findByUserId(userId);
            if (!studentOpt.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Student not found for user ID: " + userId));
            }

            Students student = studentOpt.get();
            String residencyStatus = student.getResidencyStatus();

            // Check if student is attached
            if ("attached".equalsIgnoreCase(residencyStatus)) {
                return ResponseEntity.ok(new MessageResponse("attached"));
            }
            
            // Check if student is resident
            if ("resident".equalsIgnoreCase(residencyStatus)) {
                // Check if student has a room assignment
                Optional<StudentRoom> studentRoomOpt = studentRoomService.getStudentRoomByUserId(userId);
                if (studentRoomOpt.isPresent()) {
                    String roomNo = studentRoomOpt.get().getRoomId();
                    return ResponseEntity.ok(new MessageResponse("room assigned to " + roomNo));
                } else {
                    return ResponseEntity.ok(new MessageResponse("room not assigned"));
                }
            }
            
            // For any other status
            return ResponseEntity.ok(new MessageResponse("unknown status: " + residencyStatus));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error fetching allocation status: " + e.getMessage()));
        }
    }

 @GetMapping("/my-current-room")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getCurrentRoom() {
        try {
            // Get the authenticated user's details
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            // Get student's current room assignment
            Optional<StudentRoom> studentRoomOpt = studentRoomService.getStudentRoomByUserId(userId);
            
            if (studentRoomOpt.isPresent()) {
                StudentRoom studentRoom = studentRoomOpt.get();
                // Return just the room ID to avoid potential serialization issues
                return ResponseEntity.ok().body(studentRoom.getRoomId());
            } else {
                return ResponseEntity.ok().body("No room assignment found");
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Failed to retrieve current room: " + e.getMessage()));
        }
    }

    /**
     * Get room assignment for a specific student (for provost use)
     * 
     * @param studentId the student ID to get room assignment for
     * @return Response with room assignment or "Not Assigned"
     */
    @GetMapping("/student-room/{studentId}")
    @PreAuthorize("hasRole('PROVOST')")
    public ResponseEntity<?> getStudentRoom(@PathVariable Long studentId) {
        try {
            // Get student room assignment
            List<StudentRoom> studentRooms = studentRoomService.getStudentRoomsByStudentId(studentId);
            
            if (!studentRooms.isEmpty()) {
                // Return the first room assignment (assuming one room per student)
                return ResponseEntity.ok().body(studentRooms.get(0).getRoomId());
            } else {
                return ResponseEntity.ok().body("Not Assigned");
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Failed to retrieve student room: " + e.getMessage()));
        }
    }

    /**
     * Get list of available rooms for room change
     * Shows rooms that have available capacity and are suitable for the student
     * 
     * @return Response with list of available rooms
     */
    @GetMapping("/available-for-change")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getAvailableRoomsForChange() {
        try {
            // Get all rooms and filter for availability
            List<RoomDTO> allRooms = roomService.getAllRooms();
            List<RoomDTO> availableRooms = allRooms.stream()
                    .filter(room -> {
                        // Check if room has capacity using the DTO's method
                        return room.hasSpace();
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(availableRooms);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Failed to retrieve available rooms: " + e.getMessage()));
        }
    }
}
