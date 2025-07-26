package com.HMS.hms.Controller;

import com.HMS.hms.DTO.MessManagerCallDTO;
import com.HMS.hms.DTO.MessManagerCallRequest;
import com.HMS.hms.DTO.MessageResponse;
import com.HMS.hms.Security.UserDetailsImpl;
import com.HMS.hms.Service.MessManagerCallService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/mess-manager-calls")
@CrossOrigin(origins = "*")
public class MessManagerCallController {

    @Autowired
    private MessManagerCallService messManagerCallService;

    /**
     * Create a new mess manager call (Provost/Admin only)
     */
    @PostMapping
    @PreAuthorize("hasRole('PROVOST') or hasRole('ADMIN')")
    public ResponseEntity<?> createCall(@Valid @RequestBody MessManagerCallRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            MessManagerCallDTO createdCall = messManagerCallService.createCall(request, userId);
            return ResponseEntity.ok(createdCall);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error creating call: " + e.getMessage()));
        }
    }

    /**
     * Get all calls
     */
    @GetMapping
    public ResponseEntity<?> getAllCalls() {
        try {
            List<MessManagerCallDTO> calls = messManagerCallService.getAllCalls();
            return ResponseEntity.ok(calls);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching calls: " + e.getMessage()));
        }
    }

    /**
     * Get active calls (open for applications)
     */
    @GetMapping("/active")
    public ResponseEntity<?> getActiveCalls() {
        try {
            List<MessManagerCallDTO> activeCalls = messManagerCallService.getActiveCalls();
            return ResponseEntity.ok(activeCalls);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching active calls: " + e.getMessage()));
        }
    }

    /**
     * Get call by ID
     */
    @GetMapping("/{callId}")
    public ResponseEntity<?> getCallById(@PathVariable Long callId) {
        try {
            MessManagerCallDTO call = messManagerCallService.getCallById(callId);
            return ResponseEntity.ok(call);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Call not found: " + e.getMessage()));
        }
    }

    /**
     * Get calls by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getCallsByStatus(@PathVariable String status) {
        try {
            List<MessManagerCallDTO> calls = messManagerCallService.getCallsByStatus(status);
            return ResponseEntity.ok(calls);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching calls by status: " + e.getMessage()));
        }
    }

    /**
     * Get calls by month and year
     */
    @GetMapping("/month/{month}/year/{year}")
    public ResponseEntity<?> getCallsByMonthAndYear(@PathVariable String month, @PathVariable Integer year) {
        try {
            List<MessManagerCallDTO> calls = messManagerCallService.getCallsByMonthAndYear(month, year);
            return ResponseEntity.ok(calls);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching calls: " + e.getMessage()));
        }
    }

    /**
     * Close a call (Provost/Admin only)
     */
    @PatchMapping("/{callId}/close")
    @PreAuthorize("hasRole('PROVOST') or hasRole('ADMIN')")
    public ResponseEntity<?> closeCall(@PathVariable Long callId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            String result = messManagerCallService.closeCall(callId, userId);
            return ResponseEntity.ok(new MessageResponse(result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error closing call: " + e.getMessage()));
        }
    }

    /**
     * Delete a call (Admin only)
     */
    @DeleteMapping("/{callId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCall(@PathVariable Long callId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            messManagerCallService.deleteCall(callId, userId);
            return ResponseEntity.ok(new MessageResponse("Call deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error deleting call: " + e.getMessage()));
        }
    }
}
