package com.HMS.hms.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.HMS.hms.Repo.MessManagerApplicationRepo;
import com.HMS.hms.Repo.MessManagerCallRepo;
import com.HMS.hms.Tables.MessManagerApplication;
import com.HMS.hms.Tables.MessManagerCall;

@Service
public class MessManagerApplicationService {

    @Autowired
    private MessManagerApplicationRepo messManagerApplicationRepo;

    @Autowired
    private MessManagerCallRepo messManagerCallRepo;

    // Apply for mess manager position
    @Transactional
    public MessManagerApplication applyForPosition(Long callId, Long studentId, String reason) {
        // Validate: Student can apply
        if (!canStudentApply(studentId)) {
            throw new IllegalStateException("Student cannot apply: either has pending application or is already a mess manager");
        }

        // Validate: Call exists and is active
        Optional<MessManagerCall> callOpt = messManagerCallRepo.findById(callId);
        if (callOpt.isEmpty()) {
            throw new IllegalArgumentException("Mess manager call not found");
        }

        MessManagerCall call = callOpt.get();
        if (!call.getStatus().equals(MessManagerCall.CallStatus.ACTIVE)) {
            throw new IllegalStateException("Cannot apply to expired/completed calls");
        }

        // Validate: Reason length
        if (reason == null || reason.trim().length() < 100) {
            throw new IllegalArgumentException("Reason must be at least 100 characters");
        }

        // Create and save application
        MessManagerApplication application = new MessManagerApplication(callId, studentId, reason.trim());
        return messManagerApplicationRepo.save(application);
    }

    // Check if student can apply
    public boolean canStudentApply(Long studentId) {
        // Check if student has pending application
        if (messManagerApplicationRepo.existsByStudentIdAndStatus(studentId, MessManagerApplication.ApplicationStatus.PENDING)) {
            return false;
        }

        // Check if student is currently an active mess manager
        return !messManagerApplicationRepo.isStudentCurrentlyMessManager(studentId);
    }

    // Get applications for a call (Provost view)
    public List<MessManagerApplication> getApplicationsForCall(Long callId) {
        return messManagerApplicationRepo.findApplicationsForCall(callId);
    }

    // Get student's applications
    public List<MessManagerApplication> getStudentApplications(Long studentId) {
        return messManagerApplicationRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    // Accept/Reject application (Provost action)
    @Transactional
    public MessManagerApplication updateApplicationStatus(Long applicationId, MessManagerApplication.ApplicationStatus status) {
        Optional<MessManagerApplication> applicationOpt = messManagerApplicationRepo.findById(applicationId);
        if (applicationOpt.isEmpty()) {
            throw new IllegalArgumentException("Application not found");
        }

        MessManagerApplication application = applicationOpt.get();

        // If accepting, check if we haven't exceeded max managers
        if (status == MessManagerApplication.ApplicationStatus.ACCEPTED) {
            Optional<MessManagerCall> callOpt = messManagerCallRepo.findById(application.getCallId());
            if (callOpt.isPresent()) {
                MessManagerCall call = callOpt.get();
                int currentAcceptedCount = messManagerApplicationRepo.countByCallIdAndStatus(
                    application.getCallId(), MessManagerApplication.ApplicationStatus.ACCEPTED);
                
                if (currentAcceptedCount >= call.getMaxManagers()) {
                    throw new IllegalStateException("Cannot accept more applications. Maximum managers limit reached.");
                }
            }
        }

        application.setStatus(status);
        return messManagerApplicationRepo.save(application);
    }

    // Get current mess managers for a call
    public List<MessManagerApplication> getCurrentMessManagers(Long callId) {
        return messManagerApplicationRepo.findByCallIdAndStatus(callId, MessManagerApplication.ApplicationStatus.ACCEPTED);
    }

    // End month for all accepted mess managers in a call
    @Transactional
    public int endMonthForCall(Long callId) {
        return messManagerApplicationRepo.updateAcceptedToMonthEnd(callId);
    }

    // Get count of current mess managers for a call
    public int getCurrentMessManagerCount(Long callId) {
        return messManagerApplicationRepo.countByCallIdAndStatus(callId, MessManagerApplication.ApplicationStatus.ACCEPTED);
    }

    // Get pending applications count for a call
    public int getPendingApplicationsCount(Long callId) {
        return messManagerApplicationRepo.countByCallIdAndStatus(callId, MessManagerApplication.ApplicationStatus.PENDING);
    }

    // Get all applications count for a call
    public int getTotalApplicationsCount(Long callId) {
        return messManagerApplicationRepo.findByCallId(callId).size();
    }

    // Get application by ID
    public Optional<MessManagerApplication> getApplicationById(Long applicationId) {
        return messManagerApplicationRepo.findById(applicationId);
    }

    // Get pending applications for a call
    public List<MessManagerApplication> getPendingApplicationsForCall(Long callId) {
        return messManagerApplicationRepo.findByCallIdAndStatus(callId, MessManagerApplication.ApplicationStatus.PENDING);
    }

    // Check if student is currently an active mess manager
    public boolean isStudentActiveMessManager(Long studentId) {
        List<MessManagerApplication> acceptedApplications = messManagerApplicationRepo.findByStudentIdAndStatus(studentId, MessManagerApplication.ApplicationStatus.ACCEPTED);
        return !acceptedApplications.isEmpty();
    }
}
