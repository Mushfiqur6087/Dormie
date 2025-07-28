package com.HMS.hms.Controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.HMS.hms.Security.UserDetailsImpl;
import com.HMS.hms.Service.MessManagerCallService;
import com.HMS.hms.Service.StudentsService;
import com.HMS.hms.Service.UserService;
import com.HMS.hms.Tables.MessManagerCall;
import com.HMS.hms.Tables.Students;
import com.HMS.hms.Tables.Users;

@RestController
@RequestMapping("/api/mess-manager-calls")
@CrossOrigin(origins = "*")
public class MessManagerCallController {

    @Autowired
    private MessManagerCallService messManagerCallService;

    @Autowired
    private StudentsService studentsService;

    @Autowired
    private UserService userService;

    // Create a new mess manager call (Provost only)
    @PostMapping
    public ResponseEntity<?> createCall(@RequestBody MessManagerCall call) {
        try {
            MessManagerCall createdCall = messManagerCallService.createCall(call);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCall);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", "Error creating call: " + e.getMessage()));
        }
    }

    // Get all calls
    @GetMapping
    public ResponseEntity<?> getAllCalls() {
        try {
            // Check if user is a resident student
            if (!isResidentStudent()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(java.util.Map.of("message", "Only resident students can access mess manager calls"));
            }
            
            List<MessManagerCall> calls = messManagerCallService.getAllCalls();
            return ResponseEntity.ok(calls);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get call by ID
    @GetMapping("/{callId}")
    public ResponseEntity<?> getCallById(@PathVariable Long callId) {
        try {
            Optional<MessManagerCall> call = messManagerCallService.getCallById(callId);
            if (call.isPresent()) {
                return ResponseEntity.ok(call.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving call: " + e.getMessage());
        }
    }

    // Get call by ID with dining fee information
    @GetMapping("/{callId}/with-dining-fee")
    public ResponseEntity<?> getCallByIdWithDiningFee(@PathVariable Long callId) {
        try {
            Optional<MessManagerCall> call = messManagerCallService.getCallByIdWithDiningFee(callId);
            if (call.isPresent()) {
                return ResponseEntity.ok(call.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving call: " + e.getMessage());
        }
    }

    // Get active calls
    @GetMapping("/active")
    public ResponseEntity<?> getActiveCalls() {
        try {
            // Check if user is a resident student
            if (!isResidentStudent()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(java.util.Map.of("message", "Only resident students can access mess manager calls"));
            }
            
            List<MessManagerCall> activeCalls = messManagerCallService.getActiveCalls();
            return ResponseEntity.ok(activeCalls);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get active calls with dining fee information
    @GetMapping("/active/with-dining-fee")
    public ResponseEntity<List<MessManagerCall>> getActiveCallsWithDiningFee() {
        try {
            List<MessManagerCall> activeCalls = messManagerCallService.getActiveCallsWithDiningFee();
            return ResponseEntity.ok(activeCalls);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get calls by status
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getCallsByStatus(@PathVariable String status) {
        try {
            MessManagerCall.CallStatus callStatus = MessManagerCall.CallStatus.fromString(status);
            List<MessManagerCall> calls = messManagerCallService.getCallsByStatus(callStatus);
            return ResponseEntity.ok(calls);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Invalid status: " + status));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get calls by year
    @GetMapping("/year/{year}")
    public ResponseEntity<List<MessManagerCall>> getCallsByYear(@PathVariable Integer year) {
        try {
            List<MessManagerCall> calls = messManagerCallService.getCallsByYear(year);
            return ResponseEntity.ok(calls);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get calls by provost ID
    @GetMapping("/provost/{provostId}")
    public ResponseEntity<List<MessManagerCall>> getCallsByProvost(@PathVariable Long provostId) {
        try {
            List<MessManagerCall> calls = messManagerCallService.getCallsByProvost(provostId);
            return ResponseEntity.ok(calls);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get calls by dining fee ID
    @GetMapping("/dining-fee/{diningFeeId}")
    public ResponseEntity<List<MessManagerCall>> getCallsByDiningFeeId(@PathVariable Long diningFeeId) {
        try {
            List<MessManagerCall> calls = messManagerCallService.getCallsByDiningFeeId(diningFeeId);
            return ResponseEntity.ok(calls);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get calls open for application
    @GetMapping("/open-for-application")
    public ResponseEntity<?> getCallsOpenForApplication() {
        try {
            // Check if user is a resident student
            if (!isResidentStudent()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(java.util.Map.of("message", "Only resident students can access mess manager calls"));
            }
            
            List<MessManagerCall> calls = messManagerCallService.getCallsOpenForApplication();
            return ResponseEntity.ok(calls);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Update call status
    @PutMapping("/{callId}/status")
    public ResponseEntity<?> updateCallStatus(@PathVariable Long callId, @RequestBody String status) {
        try {
            MessManagerCall.CallStatus callStatus = MessManagerCall.CallStatus.fromString(status);
            MessManagerCall updatedCall = messManagerCallService.updateCallStatus(callId, callStatus);
            return ResponseEntity.ok(updatedCall);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", "Error updating call status: " + e.getMessage()));
        }
    }

    // Update call
    @PutMapping("/{callId}")
    public ResponseEntity<?> updateCall(@PathVariable Long callId, @RequestBody MessManagerCall updatedCall) {
        try {
            MessManagerCall call = messManagerCallService.updateCall(callId, updatedCall);
            return ResponseEntity.ok(call);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", "Error updating call: " + e.getMessage()));
        }
    }

    // Delete call
    @DeleteMapping("/{callId}")
    public ResponseEntity<?> deleteCall(@PathVariable Long callId) {
        try {
            messManagerCallService.deleteCall(callId);
            return ResponseEntity.ok(java.util.Map.of("message", "Call deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", "Error deleting call: " + e.getMessage()));
        }
    }

    // Update expired calls (admin endpoint)
    @PostMapping("/update-expired")
    public ResponseEntity<?> updateExpiredCalls() {
        try {
            messManagerCallService.updateExpiredCalls();
            return ResponseEntity.ok(java.util.Map.of("message", "Expired calls updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", "Error updating expired calls: " + e.getMessage()));
        }
    }

    // Update completed calls (admin endpoint)
    @PostMapping("/update-completed")
    public ResponseEntity<?> updateCompletedCalls() {
        try {
            messManagerCallService.updateCompletedCalls();
            return ResponseEntity.ok(java.util.Map.of("message", "Completed calls updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", "Error updating completed calls: " + e.getMessage()));
        }
    }

    // Get available dining fees (not used in any mess manager call)
    @GetMapping("/available-dining-fees")
    public ResponseEntity<?> getAvailableDiningFees() {
        try {
            List<com.HMS.hms.Tables.DiningFee> availableFees = messManagerCallService.getAvailableDiningFees();
            return ResponseEntity.ok(availableFees);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving available dining fees: " + e.getMessage());
        }
    }

    // Helper method to validate if user is a resident student
    private boolean isResidentStudent() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String email = userDetails.getEmail();
            
            // Find user by email
            Optional<Users> userOpt = userService.findByEmail(email);
            if (userOpt.isPresent()) {
                Users user = userOpt.get();
                // Check if user is a student and has resident status
                if ("STUDENT".equals(user.getRole())) {
                    Optional<Students> studentOpt = studentsService.findByUserId(user.getUserId());
                    if (studentOpt.isPresent()) {
                        Students student = studentOpt.get();
                        return "resident".equals(student.getResidencyStatus());
                    }
                }
            }
        }
        return false;
    }
}
