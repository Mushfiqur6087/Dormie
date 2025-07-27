package com.HMS.hms.Controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.HMS.hms.Service.MessManagerApplicationService;
import com.HMS.hms.Tables.MessManagerApplication;

@RestController
@RequestMapping("/api/mess-manager-applications")
@CrossOrigin(origins = "*")
public class MessManagerApplicationController {

    @Autowired
    private MessManagerApplicationService applicationService;

    // Student applies for mess manager position
    @PostMapping("/apply")
    public ResponseEntity<?> applyForPosition(@RequestBody Map<String, Object> request) {
        try {
            Long callId = Long.valueOf(request.get("callId").toString());
            Long studentId = Long.valueOf(request.get("studentId").toString());
            String reason = request.get("reason").toString();

            MessManagerApplication application = applicationService.applyForPosition(callId, studentId, reason);
            return ResponseEntity.status(HttpStatus.CREATED).body(application);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error creating application: " + e.getMessage()));
        }
    }

    // Get student's applications
    @GetMapping("/my-applications/{studentId}")
    public ResponseEntity<List<MessManagerApplication>> getMyApplications(@PathVariable Long studentId) {
        try {
            List<MessManagerApplication> applications = applicationService.getStudentApplications(studentId);
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Check if student can apply
    @GetMapping("/can-apply/{studentId}")
    public ResponseEntity<?> canStudentApply(@PathVariable Long studentId) {
        try {
            boolean canApply = applicationService.canStudentApply(studentId);
            return ResponseEntity.ok(Map.of("canApply", canApply));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to check application eligibility"));
        }
    }

    // Get applications for a call (Provost view)
    @GetMapping("/call/{callId}")
    public ResponseEntity<List<MessManagerApplication>> getApplicationsForCall(@PathVariable Long callId) {
        try {
            List<MessManagerApplication> applications = applicationService.getApplicationsForCall(callId);
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get pending applications for a call (Provost view)
    @GetMapping("/call/{callId}/pending")
    public ResponseEntity<List<MessManagerApplication>> getPendingApplicationsForCall(@PathVariable Long callId) {
        try {
            List<MessManagerApplication> applications = applicationService.getPendingApplicationsForCall(callId);
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get current mess managers for a call (Provost view)
    @GetMapping("/call/{callId}/current-managers")
    public ResponseEntity<List<MessManagerApplication>> getCurrentManagers(@PathVariable Long callId) {
        try {
            List<MessManagerApplication> managers = applicationService.getCurrentMessManagers(callId);
            return ResponseEntity.ok(managers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get application summary for a call
    @GetMapping("/call/{callId}/summary")
    public ResponseEntity<Map<String, Integer>> getApplicationSummary(@PathVariable Long callId) {
        try {
            Map<String, Integer> summary = Map.of(
                "total", applicationService.getTotalApplicationsCount(callId),
                "pending", applicationService.getPendingApplicationsCount(callId),
                "currentManagers", applicationService.getCurrentMessManagerCount(callId)
            );
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Accept/Reject application (Provost action)
    @PutMapping("/{applicationId}/status")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable Long applicationId, @RequestBody String status) {
        try {
            MessManagerApplication.ApplicationStatus applicationStatus = 
                MessManagerApplication.ApplicationStatus.fromString(status);
            MessManagerApplication updatedApplication = 
                applicationService.updateApplicationStatus(applicationId, applicationStatus);
            return ResponseEntity.ok(updatedApplication);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating application status: " + e.getMessage()));
        }
    }

    // End month for all current mess managers in a call (Provost action)
    @PostMapping("/call/{callId}/end-month")
    public ResponseEntity<?> endMonthForCall(@PathVariable Long callId) {
        try {
            int updatedCount = applicationService.endMonthForCall(callId);
            return ResponseEntity.ok(Map.of(
                "message", "Month ended successfully",
                "updatedManagers", updatedCount
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error ending month: " + e.getMessage()));
        }
    }

    // Get application by ID
    @GetMapping("/{applicationId}")
    public ResponseEntity<?> getApplicationById(@PathVariable Long applicationId) {
        try {
            Optional<MessManagerApplication> application = applicationService.getApplicationById(applicationId);
            if (application.isPresent()) {
                return ResponseEntity.ok(application.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving application: " + e.getMessage()));
        }
    }

    // Check if student is currently an active mess manager
    @GetMapping("/is-active-manager/{studentId}")
    public ResponseEntity<?> isActiveMessManager(@PathVariable Long studentId) {
        try {
            boolean isActiveManager = applicationService.isStudentActiveMessManager(studentId);
            return ResponseEntity.ok(Map.of("isActiveManager", isActiveManager));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to check mess manager status"));
        }
    }
}
