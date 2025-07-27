package com.HMS.hms.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.HMS.hms.Repo.DiningFeeRepo;
import com.HMS.hms.Repo.MessManagerCallRepo;
import com.HMS.hms.Tables.MessManagerCall;

@Service
public class MessManagerCallService {

    @Autowired
    private MessManagerCallRepo messManagerCallRepo;

    @Autowired
    private DiningFeeRepo diningFeeRepo;

    // Create a new mess manager call
    public MessManagerCall createCall(MessManagerCall call) {
        // Validate dining fee exists
        if (!diningFeeRepo.existsById(call.getDiningFeeId())) {
            throw new IllegalArgumentException("Dining fee with ID " + call.getDiningFeeId() + " does not exist");
        }

        // Check if dining fee is already used
        if (messManagerCallRepo.existsByDiningFeeId(call.getDiningFeeId())) {
            throw new IllegalStateException("This dining fee has already been used for another mess manager call");
        }

        // Validate dates
        validateCallDates(call);

        // Check if there's already an active call for the year
        if (messManagerCallRepo.existsByYearAndStatus(call.getYear(), MessManagerCall.CallStatus.ACTIVE)) {
            throw new IllegalStateException("An active call already exists for year " + call.getYear());
        }

        return messManagerCallRepo.save(call);
    }

    // Get all calls
    public List<MessManagerCall> getAllCalls() {
        return messManagerCallRepo.findAllByOrderByCreatedAtDesc();
    }

    // Get call by ID
    public Optional<MessManagerCall> getCallById(Long callId) {
        return messManagerCallRepo.findById(callId);
    }

    // Get call by ID with dining fee information
    public Optional<MessManagerCall> getCallByIdWithDiningFee(Long callId) {
        return messManagerCallRepo.findByIdWithDiningFee(callId);
    }

    // Get calls by status
    public List<MessManagerCall> getCallsByStatus(MessManagerCall.CallStatus status) {
        return messManagerCallRepo.findByStatus(status);
    }

    // Get active calls
    public List<MessManagerCall> getActiveCalls() {
        return messManagerCallRepo.findActiveCalls();
    }

    // Get active calls with dining fee information
    public List<MessManagerCall> getActiveCallsWithDiningFee() {
        return messManagerCallRepo.findActiveCallsWithDiningFee();
    }

    // Get calls by year
    public List<MessManagerCall> getCallsByYear(Integer year) {
        return messManagerCallRepo.findByYearOrderByCreatedAtDesc(year);
    }

    // Get calls by provost
    public List<MessManagerCall> getCallsByProvost(Long provostId) {
        return messManagerCallRepo.findByProvostId(provostId);
    }

    // Get calls by dining fee ID
    public List<MessManagerCall> getCallsByDiningFeeId(Long diningFeeId) {
        return messManagerCallRepo.findByDiningFeeId(diningFeeId);
    }

    // Get calls open for application
    public List<MessManagerCall> getCallsOpenForApplication() {
        return messManagerCallRepo.findOpenForApplication(LocalDate.now());
    }

    // Update call status
    public MessManagerCall updateCallStatus(Long callId, MessManagerCall.CallStatus status) {
        Optional<MessManagerCall> callOpt = messManagerCallRepo.findById(callId);
        if (callOpt.isEmpty()) {
            throw new IllegalArgumentException("Call with ID " + callId + " not found");
        }

        MessManagerCall call = callOpt.get();
        call.setStatus(status);
        return messManagerCallRepo.save(call);
    }

    // Update call
    public MessManagerCall updateCall(Long callId, MessManagerCall updatedCall) {
        Optional<MessManagerCall> existingCallOpt = messManagerCallRepo.findById(callId);
        if (existingCallOpt.isEmpty()) {
            throw new IllegalArgumentException("Call with ID " + callId + " not found");
        }

        MessManagerCall existingCall = existingCallOpt.get();

        // Validate dining fee exists if it's being updated
        if (updatedCall.getDiningFeeId() != null && 
            !updatedCall.getDiningFeeId().equals(existingCall.getDiningFeeId())) {
            if (!diningFeeRepo.existsById(updatedCall.getDiningFeeId())) {
                throw new IllegalArgumentException("Dining fee with ID " + updatedCall.getDiningFeeId() + " does not exist");
            }
            // Check if the new dining fee is already used by another call
            if (messManagerCallRepo.existsByDiningFeeId(updatedCall.getDiningFeeId())) {
                throw new IllegalStateException("This dining fee has already been used for another mess manager call");
            }
            existingCall.setDiningFeeId(updatedCall.getDiningFeeId());
        }

        // Update other fields
        if (updatedCall.getApplicationEndDate() != null) {
            existingCall.setApplicationEndDate(updatedCall.getApplicationEndDate());
        }
        if (updatedCall.getManagerActivityStartDate() != null) {
            existingCall.setManagerActivityStartDate(updatedCall.getManagerActivityStartDate());
        }
        if (updatedCall.getManagerActivityEndDate() != null) {
            existingCall.setManagerActivityEndDate(updatedCall.getManagerActivityEndDate());
        }
        if (updatedCall.getMaxManagers() != null) {
            existingCall.setMaxManagers(updatedCall.getMaxManagers());
        }
        if (updatedCall.getStatus() != null) {
            existingCall.setStatus(updatedCall.getStatus());
        }

        // Validate dates after update
        validateCallDates(existingCall);

        return messManagerCallRepo.save(existingCall);
    }

    // Delete call
    public void deleteCall(Long callId) {
        if (!messManagerCallRepo.existsById(callId)) {
            throw new IllegalArgumentException("Call with ID " + callId + " not found");
        }
        messManagerCallRepo.deleteById(callId);
    }

    // Update expired calls (should be called periodically)
    public void updateExpiredCalls() {
        List<MessManagerCall> expiredCalls = messManagerCallRepo.findExpiredCalls(LocalDate.now());
        for (MessManagerCall call : expiredCalls) {
            call.setStatus(MessManagerCall.CallStatus.EXPIRED);
            messManagerCallRepo.save(call);
        }
    }

    // Update completed calls (should be called periodically)
    public void updateCompletedCalls() {
        List<MessManagerCall> completedCalls = messManagerCallRepo.findCompletedCalls(LocalDate.now());
        for (MessManagerCall call : completedCalls) {
            call.setStatus(MessManagerCall.CallStatus.COMPLETED);
            messManagerCallRepo.save(call);
        }
    }

    // Private helper method to validate call dates
    private void validateCallDates(MessManagerCall call) {
        if (call.getManagerActivityStartDate().isBefore(call.getApplicationEndDate())) {
            throw new IllegalArgumentException("Manager activity start date must be after application end date");
        }
        
        if (call.getManagerActivityEndDate().isBefore(call.getManagerActivityStartDate())) {
            throw new IllegalArgumentException("Manager activity end date must be after start date");
        }
        
        if (call.getMaxManagers() <= 0) {
            throw new IllegalArgumentException("Maximum managers must be greater than 0");
        }
    }

    // Get available dining fees (not used in any mess manager call)
    public List<com.HMS.hms.Tables.DiningFee> getAvailableDiningFees() {
        List<com.HMS.hms.Tables.DiningFee> allDiningFees = diningFeeRepo.findAll();
        return allDiningFees.stream()
                .filter(diningFee -> !messManagerCallRepo.existsByDiningFeeId(diningFee.getId()))
                .collect(java.util.stream.Collectors.toList());
    }
}
