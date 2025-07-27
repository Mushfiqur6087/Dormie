package com.HMS.hms.Controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
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
            
            // Convert to DTO with userId, studentId, and batch
            List<UnassignedStudentDTO> unassignedStudentDTOs = unassignedStudents.stream()
                .map(student -> new UnassignedStudentDTO(student.getUserId(), student.getStudentId(), student.getBatch()))
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

    /**
     * Randomly assign rooms to all unassigned students with batch pairing probability
     * 
     * @param probability the probability (0-1) of trying to pair students from same batch
     * @return Response with assignment results
     */
    @PostMapping("/assign-random")
    @PreAuthorize("hasRole('PROVOST')")
    public ResponseEntity<?> assignRoomsRandomly(@RequestBody Map<String, Object> request) {
        try {
            // Extract probability from request
            Double probability = 0.0;
            if (request.containsKey("probability")) {
                Object probObj = request.get("probability");
                if (probObj instanceof Number number) {
                    probability = number.doubleValue();
                } else if (probObj instanceof String stringValue) {
                    probability = Double.valueOf(stringValue);
                }
            }

            // Validate probability range
            if (probability < 0.0 || probability > 1.0) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Probability must be between 0 and 1"));
            }

            // Get all unassigned students
            List<Students> residentStudents = studentsService.findByResidencyStatus("resident");
            List<Students> unassignedStudents = residentStudents.stream()
                .filter(student -> !studentRoomService.isUserAssignedToRoom(student.getUserId()))
                .collect(Collectors.toList());

            if (unassignedStudents.isEmpty()) {
                return ResponseEntity.ok(new MessageResponse("No unassigned students found"));
            }

            // Get all available rooms (with space)
            List<RoomDTO> allRooms = roomService.getAllRooms();
            List<RoomDTO> availableRooms = allRooms.stream()
                .filter(room -> room.hasSpace())
                .collect(Collectors.toList());

            if (availableRooms.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("No available rooms with space"));
            }

            // Random assignment with batch pairing
            Random random = new Random();
            List<Students> studentsToAssign = new ArrayList<>(unassignedStudents);
            List<Students> assignedStudents = new ArrayList<>();
            List<String> assignmentResults = new ArrayList<>();
            
            // Safety mechanism to prevent infinite loops
            int maxIterations = studentsToAssign.size() * 3; // Allow some retries
            int iterationCount = 0;
            
            // Refresh room data every 10 assignments to prevent stale data
            int refreshCounter = 0;

            while (!studentsToAssign.isEmpty() && !availableRooms.isEmpty() && iterationCount < maxIterations) {
                iterationCount++;
                
                // Periodically refresh available rooms list to prevent stale data
                if (refreshCounter % 10 == 0 && refreshCounter > 0) {
                    List<RoomDTO> freshRooms = roomService.getAllRooms();
                    availableRooms = freshRooms.stream()
                        .filter(room -> room.hasSpace())
                        .collect(Collectors.toList());
                }
                refreshCounter++;
                
                if (availableRooms.isEmpty()) {
                    break; // No more available rooms
                }
                
                Students currentStudent = studentsToAssign.remove(0);
                boolean assignedWithBatchMate = false;

                // Try batch pairing with given probability
                if (random.nextDouble() <= probability && currentStudent.getBatch() != null) {
                    // Find another student from same batch
                    Students batchMate = studentsToAssign.stream()
                        .filter(s -> currentStudent.getBatch().equals(s.getBatch()))
                        .findFirst()
                        .orElse(null);

                    if (batchMate != null) {
                        // Find a room with capacity for at least 2 students
                        RoomDTO suitableRoom = availableRooms.stream()
                            .filter(room -> (room.getTotalCapacity() - room.getCurrentStudent()) >= 2)
                            .findFirst()
                            .orElse(null);

                        if (suitableRoom != null) {
                            // Double-check room capacity by refreshing from database
                            Optional<RoomDTO> freshRoomOpt = roomService.getRoomByRoomNo(suitableRoom.getRoomNo());
                            if (freshRoomOpt.isPresent()) {
                                RoomDTO freshRoom = freshRoomOpt.get();
                                if ((freshRoom.getTotalCapacity() - freshRoom.getCurrentStudent()) >= 2) {
                                    // Update local DTO with fresh data
                                    suitableRoom.setCurrentStudent(freshRoom.getCurrentStudent());
                                    
                                    try {
                                        // Assign both students to the same room
                                        assignStudent(currentStudent, suitableRoom.getRoomNo());
                                        assignStudent(batchMate, suitableRoom.getRoomNo());
                                        
                                        studentsToAssign.remove(batchMate);
                                        assignedStudents.add(currentStudent);
                                        assignedStudents.add(batchMate);
                                        
                                        assignmentResults.add("Students " + currentStudent.getStudentId() + 
                                            " and " + batchMate.getStudentId() + " (Batch " + currentStudent.getBatch() + 
                                            ") assigned to Room " + suitableRoom.getRoomNo());
                                        
                                        // Update room capacity - increment by 1 for each student (just like normal assignment)
                                        roomService.incrementCurrentStudentCount(suitableRoom.getRoomNo());
                                        roomService.incrementCurrentStudentCount(suitableRoom.getRoomNo());
                                        
                                        // Update local DTO to match database state
                                        suitableRoom.setCurrentStudent(suitableRoom.getCurrentStudent() + 2);
                                        
                                        // Remove room from available list if full
                                        if (!suitableRoom.hasSpace()) {
                                            availableRooms.remove(suitableRoom);
                                        }
                                        
                                        assignedWithBatchMate = true;
                                    } catch (RuntimeException e) {
                                        // If batch assignment fails, put students back to be assigned individually
                                        assignmentResults.add("Batch assignment failed for students " + 
                                            currentStudent.getStudentId() + " and " + batchMate.getStudentId() + 
                                            ": " + e.getMessage() + ". Will attempt individual assignment.");
                                        // Current student will be processed individually in the next if block
                                        // Batch mate stays in the list to be processed later
                                    }
                                } else {
                                    // Room no longer has space for 2 students, remove from available list
                                    
                                    suitableRoom.setCurrentStudent(freshRoom.getCurrentStudent());
                                    if (!suitableRoom.hasSpace()) {
                                        availableRooms.remove(suitableRoom);
                                    }
                                }
                            } else {
                                // Room no longer exists, remove from available list
                                availableRooms.remove(suitableRoom);
                            }
                        }
                    }
                }

                // If no batch pairing happened, assign to random available room
                if (!assignedWithBatchMate && !availableRooms.isEmpty()) {
                    RoomDTO randomRoom = availableRooms.get(random.nextInt(availableRooms.size()));
                    
                    // Double-check room capacity by refreshing from database
                    Optional<RoomDTO> freshRoomOpt = roomService.getRoomByRoomNo(randomRoom.getRoomNo());
                    if (freshRoomOpt.isPresent()) {
                        RoomDTO freshRoom = freshRoomOpt.get();
                        if (freshRoom.hasSpace()) {
                            // Update local DTO with fresh data
                            randomRoom.setCurrentStudent(freshRoom.getCurrentStudent());
                            
                            try {
                                assignStudent(currentStudent, randomRoom.getRoomNo());
                                assignedStudents.add(currentStudent);
                                
                                assignmentResults.add("Student " + currentStudent.getStudentId() + 
                                    " assigned to Room " + randomRoom.getRoomNo());
                                
                                // Update room capacity - increment by 1 (same as normal assignment)
                                roomService.incrementCurrentStudentCount(randomRoom.getRoomNo());
                                
                                // Update local DTO to match database state
                                randomRoom.setCurrentStudent(randomRoom.getCurrentStudent() + 1);
                                
                                // Remove room from available list if full
                                if (!randomRoom.hasSpace()) {
                                    availableRooms.remove(randomRoom);
                                }
                            } catch (RuntimeException e) {
                                // If assignment fails, log and put student back
                                assignmentResults.add("Failed to assign student " + currentStudent.getStudentId() + 
                                    " to Room " + randomRoom.getRoomNo() + ": " + e.getMessage());
                                studentsToAssign.add(0, currentStudent);
                                // Remove the problematic room from available list
                                availableRooms.remove(randomRoom);
                            }
                        } else {
                            // Room became full, remove from available list and try again
                            availableRooms.remove(randomRoom);
                            // Put student back to be processed again
                            studentsToAssign.add(0, currentStudent);
                        }
                    } else {
                        // Room no longer exists, remove from available list
                        availableRooms.remove(randomRoom);
                        // Put student back to be processed again
                        studentsToAssign.add(0, currentStudent);
                    }
                }
            }

            // Prepare response message
            StringBuilder responseMessage = new StringBuilder();
            responseMessage.append("Random assignment completed!\n");
            responseMessage.append("Assigned ").append(assignedStudents.size()).append(" students.\n");
            if (!studentsToAssign.isEmpty()) {
                responseMessage.append(studentsToAssign.size()).append(" students could not be assigned");
                if (iterationCount >= maxIterations) {
                    responseMessage.append(" (reached maximum retry limit)");
                } else if (availableRooms.isEmpty()) {
                    responseMessage.append(" (no available rooms)");
                }
                responseMessage.append(".\n");
            }
            if (iterationCount >= maxIterations) {
                responseMessage.append("Warning: Assignment process stopped due to safety limit to prevent infinite loops.\n");
            }
            responseMessage.append("\nAssignment Details:\n");
            assignmentResults.forEach(result -> responseMessage.append("- ").append(result).append("\n"));

            return ResponseEntity.ok(new MessageResponse(responseMessage.toString()));

        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Invalid probability format: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error during random assignment: " + e.getMessage()));
        }
    }

    /**
     * Helper method to assign a student to a room
     * This method performs the same validation as normal room assignment
     */
    private void assignStudent(Students student, String roomNo) {
        try {
            // Validate student and room before assignment (same as normal assignment)
            if (!"resident".equalsIgnoreCase(student.getResidencyStatus())) {
                throw new RuntimeException("Only resident students can be assigned to rooms. Current status: " + student.getResidencyStatus());
            }
            
            // Check if student already has a room assignment
            if (studentRoomService.isUserAssignedToRoom(student.getUserId())) {
                throw new RuntimeException("Student is already assigned to a room");
            }
            
            // Check if room exists and has space
            if (!roomService.canAccommodateStudent(roomNo)) {
                throw new RuntimeException("Room " + roomNo + " cannot accommodate student (full or doesn't exist)");
            }
            
            // Perform the assignment (same as normal assignment)
            studentRoomService.assignStudentToRoom(
                student.getUserId(), 
                student.getStudentId(), 
                roomNo
            );
        } catch (RuntimeException e) {
            throw new RuntimeException("Failed to assign student " + student.getStudentId() + 
                " to room " + roomNo + ": " + e.getMessage(), e);
        }
    }
}


