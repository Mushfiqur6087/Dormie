package com.HMS.hms.Service;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.HMS.hms.DTO.UnpaidFeesSummaryDTO;
import com.HMS.hms.Payment.TransactionResponseValidator;
import com.HMS.hms.Payment.Utility.PaymentTransactionHelper;
import com.HMS.hms.Payment.Utility.PaymentTransactionResponse;
import com.HMS.hms.Repo.StudentDiningFeesRepo;
import com.HMS.hms.Repo.StudentHallFeesRepo;
import com.HMS.hms.Repo.StudentPaymentInfoRepo;
import com.HMS.hms.Repo.UsersRepo;
import com.HMS.hms.Tables.StudentDiningFees;
import com.HMS.hms.Tables.StudentHallFees;
import com.HMS.hms.Tables.StudentPaymentInfo;
import com.HMS.hms.Tables.Users;

@Service
public class PaymentService {
    
    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);
    
    @Autowired
    private PaymentTransactionHelper paymentTransactionHelper;
    
    @Autowired
    private StudentHallFeesRepo studentHallFeesRepo;
    
    @Autowired
    private StudentDiningFeesRepo studentDiningFeesRepo;
    
    @Autowired
    private StudentPaymentInfoRepo studentPaymentInfoRepo;
    
    @Autowired
    private UsersRepo usersRepo;
    
    @Autowired
    private TransactionResponseValidator transactionResponseValidator;

    /**
     * Initiates a payment transaction for a user based on their unpaid fees
     * 
     * @param userId The user ID
     * @param email The user's email
     * @param username The username
     * @return PaymentInitiationResult containing success status and relevant data
     * @throws IOException If there's an I/O error during payment processing
     * @throws UnsupportedEncodingException If there's an encoding error
     */
    public PaymentInitiationResult initiatePayment(Long userId, String email, String username) 
            throws IOException, UnsupportedEncodingException {
        
        logger.info("Initiating payment for user: {}, email: {}", username, email);
        
        // Validate input parameters
        if (email == null || email.trim().isEmpty()) {
            logger.error("Email is null or empty for user: {}", username);
            return PaymentInitiationResult.failure("User email is required for payment processing");
        }
        
        logger.info("Creating payment request with email: {}", email);
        
        // Get the user's unpaid fees summary
        UnpaidFeesSummaryDTO hallFeesSummary = studentHallFeesRepo.getUnpaidFeesSummaryByUserId(userId);
        UnpaidFeesSummaryDTO diningFeesSummary = studentDiningFeesRepo.getUnpaidFeesSummaryByUserId(userId);
        
        // Calculate total unpaid amount
        BigDecimal totalUnpaidAmount = calculateTotalUnpaidAmount(hallFeesSummary, diningFeesSummary);
        String feeDescription = generateFeeDescription(hallFeesSummary, diningFeesSummary);
        
        // Check if user has any unpaid fees
        if (totalUnpaidAmount.compareTo(BigDecimal.ZERO) <= 0) {
            logger.warn("No unpaid fees found for user: {}", username);
            return PaymentInitiationResult.failure("No unpaid fees found for payment");
        }
        
        // Create a payment transaction request with user data
        PaymentTransactionHelper.PaymentTransactionRequest paymentRequest = 
                paymentTransactionHelper.createPaymentRequest(username, email, totalUnpaidAmount.toString(), feeDescription);
        
        // Validate the payment request
        try {
            paymentTransactionHelper.validatePaymentRequest(paymentRequest);
        } catch (IllegalArgumentException e) {
            logger.error("Payment request validation failed for user: {} - {}", username, e.getMessage());
            return PaymentInitiationResult.failure("Invalid payment request: " + e.getMessage());
        }
        
        // Initialize the transaction using the new response method
        PaymentTransactionResponse paymentResponse = 
                paymentTransactionHelper.initiatePaymentTransactionWithResponse(paymentRequest);
        
        if (paymentResponse.isSuccess()) {
            logger.info("Payment transaction initiated successfully for user: {}, transaction ID: {}", 
                       username, paymentResponse.getTransactionId());
            return PaymentInitiationResult.success(
                paymentResponse.getRedirectUrl(), 
                paymentResponse.getTransactionId()
            );
        } else {
            logger.error("Payment transaction failed for user: {} - {}", username, paymentResponse.getErrorMessage());
            return PaymentInitiationResult.failure("Payment initiation failed: " + paymentResponse.getErrorMessage());
        }
    }

    /**
     * Initiates a payment transaction for hall fees only (excluding dining fees)
     * 
     * @param userId The user ID
     * @param email The user's email
     * @param username The username
     * @return PaymentInitiationResult containing success status and relevant data
     * @throws IOException If there's an I/O error during payment processing
     * @throws UnsupportedEncodingException If there's an encoding error
     */
    public PaymentInitiationResult initiateHallFeesPayment(Long userId, String email, String username) 
            throws IOException, UnsupportedEncodingException {
        
        logger.info("Initiating hall fees payment for user: {}, email: {}", username, email);
        
        // Validate input parameters
        if (email == null || email.trim().isEmpty()) {
            logger.error("Email is null or empty for user: {}", username);
            return PaymentInitiationResult.failure("User email is required for payment processing");
        }
        
        logger.info("Creating hall fees payment request with email: {}", email);
        
        // Get only the user's unpaid hall fees summary (excluding dining fees)
        UnpaidFeesSummaryDTO hallFeesSummary = studentHallFeesRepo.getUnpaidFeesSummaryByUserId(userId);
        
        // Calculate total unpaid hall fees amount only
        BigDecimal totalHallFeesAmount = calculateHallFeesAmount(hallFeesSummary);
        String feeDescription = generateHallFeeDescription(hallFeesSummary);
        
        // Check if user has any unpaid hall fees
        if (totalHallFeesAmount.compareTo(BigDecimal.ZERO) <= 0) {
            logger.warn("No unpaid hall fees found for user: {}", username);
            return PaymentInitiationResult.failure("No unpaid hall fees found for payment");
        }
        
        // Create a payment transaction request with user data for hall fees only
        PaymentTransactionHelper.PaymentTransactionRequest paymentRequest = 
                paymentTransactionHelper.createPaymentRequest(username, email, totalHallFeesAmount.toString(), feeDescription);
        
        // Validate the payment request
        try {
            paymentTransactionHelper.validatePaymentRequest(paymentRequest);
        } catch (IllegalArgumentException e) {
            logger.error("Hall fees payment request validation failed for user: {} - {}", username, e.getMessage());
            return PaymentInitiationResult.failure("Invalid payment request: " + e.getMessage());
        }
        
        // Initialize the transaction using the new response method
        PaymentTransactionResponse paymentResponse = 
                paymentTransactionHelper.initiatePaymentTransactionWithResponse(paymentRequest);
        
        if (paymentResponse.isSuccess()) {
            logger.info("Hall fees payment transaction initiated successfully for user: {}, transaction ID: {}", 
                       username, paymentResponse.getTransactionId());
            return PaymentInitiationResult.success(
                paymentResponse.getRedirectUrl(), 
                paymentResponse.getTransactionId()
            );
        } else {
            logger.error("Hall fees payment transaction failed for user: {} - {}", username, paymentResponse.getErrorMessage());
            return PaymentInitiationResult.failure("Hall fees payment initiation failed: " + paymentResponse.getErrorMessage());
        }
    }

    /**
     * Initiates a payment transaction for dining fees only (excluding hall fees)
     * 
     * @param userId The user ID
     * @param email The user's email
     * @param username The username
     * @return PaymentInitiationResult containing success status and relevant data
     * @throws IOException If there's an I/O error during payment processing
     * @throws UnsupportedEncodingException If there's an encoding error
     */
    public PaymentInitiationResult initiateDiningFeesPayment(Long userId, String email, String username) 
            throws IOException, UnsupportedEncodingException {
        
        logger.info("Initiating dining fees payment for user: {}, email: {}", username, email);
        
        // Validate input parameters
        if (email == null || email.trim().isEmpty()) {
            logger.error("Email is null or empty for user: {}", username);
            return PaymentInitiationResult.failure("User email is required for payment processing");
        }
        
        logger.info("Creating dining fees payment request with email: {}", email);
        
        // Get only the user's unpaid dining fees summary (excluding hall fees)
        UnpaidFeesSummaryDTO diningFeesSummary = studentDiningFeesRepo.getUnpaidFeesSummaryByUserId(userId);
        
        // Calculate total unpaid dining fees amount only
        BigDecimal totalDiningFeesAmount = calculateDiningFeesAmount(diningFeesSummary);
        String feeDescription = generateDiningFeeDescription(diningFeesSummary);
        
        // Check if user has any unpaid dining fees
        if (totalDiningFeesAmount.compareTo(BigDecimal.ZERO) <= 0) {
            logger.warn("No unpaid dining fees found for user: {}", username);
            return PaymentInitiationResult.failure("No unpaid dining fees found for payment");
        }
        
        // Create a payment transaction request with user data for dining fees only
        PaymentTransactionHelper.PaymentTransactionRequest paymentRequest = 
                paymentTransactionHelper.createPaymentRequest(username, email, totalDiningFeesAmount.toString(), feeDescription);
        
        // Validate the payment request
        try {
            paymentTransactionHelper.validatePaymentRequest(paymentRequest);
        } catch (IllegalArgumentException e) {
            logger.error("Dining fees payment request validation failed for user: {} - {}", username, e.getMessage());
            return PaymentInitiationResult.failure("Invalid payment request: " + e.getMessage());
        }
        
        // Initialize the transaction using the new response method
        PaymentTransactionResponse paymentResponse = 
                paymentTransactionHelper.initiatePaymentTransactionWithResponse(paymentRequest);
        
        if (paymentResponse.isSuccess()) {
            logger.info("Dining fees payment transaction initiated successfully for user: {}, transaction ID: {}", 
                       username, paymentResponse.getTransactionId());
            return PaymentInitiationResult.success(
                paymentResponse.getRedirectUrl(), 
                paymentResponse.getTransactionId()
            );
        } else {
            logger.error("Dining fees payment transaction failed for user: {} - {}", username, paymentResponse.getErrorMessage());
            return PaymentInitiationResult.failure("Dining fees payment initiation failed: " + paymentResponse.getErrorMessage());
        }
    }

    /**
     * Processes payment success callback data
     * 
     * @param params The callback parameters from payment gateway
     * @return PaymentCallbackResult with processed data
     */
    @Transactional
    public PaymentCallbackResult processSuccessCallback(Map<String, String> params) {
        logger.info("Payment success callback received with params: {}", params);
        
        try {
            // Extract callback parameters
            String tranId = params.getOrDefault("tran_id", "");
            String valId = params.getOrDefault("val_id", "");
            String status = params.getOrDefault("status", "");
            String customerEmail = params.getOrDefault("value_a", "");
            String paymentMethod = params.getOrDefault("card_type", "");
            
            // Validate required parameters
            if (tranId.isEmpty() || valId.isEmpty()) {
                logger.error("Missing required parameters in callback: tran_id={}, val_id={}", 
                           tranId, valId);
                return new PaymentCallbackResult(false, "/payment-error.html", tranId, valId, status, 
                                                "Missing required payment parameters");
            }
            
            // CRITICAL: Check for duplicate transaction FIRST to prevent race conditions
            if (studentPaymentInfoRepo.existsByTranId(tranId)) {
                logger.warn("Duplicate transaction detected: {}", tranId);
                String redirectUrl = "/payment-success.html?tran_id=" + tranId + "&val_id=" + valId + "&status=" + status;
                return new PaymentCallbackResult(true, redirectUrl, tranId, valId, status, "Transaction already processed");
            }
            
            logger.info("Processing payment callback with tran_id: {}, val_id: {}, customerEmail: '{}'", 
                       tranId, valId, customerEmail);
            
            // If customerEmail is empty from value_a, we need an alternative approach
            // We can look up all users and find who has unpaid fees matching the transaction amount
            Users user = null;
            if (customerEmail == null || customerEmail.trim().isEmpty()) {
                logger.warn("Customer email is empty in callback, attempting to find user by transaction amount");
                
                // Get transaction amount
                String amountStr = params.getOrDefault("amount", "");
                if (!amountStr.isEmpty()) {
                    try {
                        BigDecimal transactionAmount = new BigDecimal(amountStr);
                        logger.info("Looking for user with unpaid fees totaling: {}", transactionAmount);
                        
                        // This is a fallback - find user with matching unpaid amount
                        // Note: This approach has limitations in production with multiple users having same amounts
                        List<Users> allUsers = usersRepo.findByRole("STUDENT");
                        for (Users testUser : allUsers) {
                            UnpaidFeesSummaryDTO hallFees = studentHallFeesRepo.getUnpaidFeesSummaryByUserId(testUser.getUserId());
                            UnpaidFeesSummaryDTO diningFees = studentDiningFeesRepo.getUnpaidFeesSummaryByUserId(testUser.getUserId());
                            BigDecimal totalUnpaid = calculateTotalUnpaidAmount(hallFees, diningFees);
                            
                            if (totalUnpaid.compareTo(transactionAmount) == 0) {
                                user = testUser;
                                logger.info("Found matching user by amount: {} ({})", user.getEmail(), user.getUserId());
                                break;
                            }
                        }
                        
                        if (user == null) {
                            logger.error("No user found with unpaid amount matching transaction: {}", transactionAmount);
                            return new PaymentCallbackResult(false, "/payment-error.html", tranId, valId, status, 
                                                            "Unable to identify user for payment");
                        }
                    } catch (NumberFormatException e) {
                        logger.error("Invalid amount format in callback: {}", amountStr);
                        return new PaymentCallbackResult(false, "/payment-error.html", tranId, valId, status, 
                                                        "Invalid transaction amount format");
                    }
                } else {
                    logger.error("No amount found in callback parameters");
                    return new PaymentCallbackResult(false, "/payment-error.html", tranId, valId, status, 
                                                    "Missing transaction amount");
                }
            } else {
                // Original approach - find user by email
                Optional<Users> userOpt = usersRepo.findByEmail(customerEmail);
                if (!userOpt.isPresent()) {
                    logger.error("User not found with email: {}", customerEmail);
                    return new PaymentCallbackResult(false, "/payment-error.html", tranId, valId, status, 
                                                    "User not found");
                }
                user = userOpt.get();
            }
            
            // Check for duplicate transaction
            if (studentPaymentInfoRepo.existsByTranId(tranId)) {
                logger.warn("Duplicate transaction detected: {}", tranId);
                String redirectUrl = "/payment-success.html?tran_id=" + tranId + "&val_id=" + valId + "&status=" + status;
                return new PaymentCallbackResult(true, redirectUrl, tranId, valId, status, "Transaction already processed");
            }
            
            // Validate transaction with SSLCommerz
            boolean isValidTransaction = transactionResponseValidator.receiveSuccessResponse(params);
            if (!isValidTransaction) {
                logger.error("Transaction validation failed for tran_id: {}", tranId);
                return new PaymentCallbackResult(false, "/payment-error.html", tranId, valId, status, 
                                                "Transaction validation failed");
            }
            
            logger.info("Processing payment for user: {} (ID: {})", user.getEmail(), user.getUserId());
            
            // Create payment info records and update fee statuses
            try {
                boolean hasHallFees = false;
                boolean hasDiningFees = false;
                
                // Find and update hall fees
                List<StudentHallFees> unpaidHallFees = studentHallFeesRepo.findByUserIdAndStatus(
                    user.getUserId(), StudentHallFees.PaymentStatus.UNPAID);
                
                for (StudentHallFees hallFee : unpaidHallFees) {
                    // Double-check the fee is still unpaid (optimistic check)
                    if (hallFee.getStatus() == StudentHallFees.PaymentStatus.UNPAID) {
                        hallFee.setStatus(StudentHallFees.PaymentStatus.PAID);
                        studentHallFeesRepo.save(hallFee);
                        logger.info("Updated hall fee {} to PAID for user {}", hallFee.getFeeId(), user.getUserId());
                        hasHallFees = true;
                    } else {
                        logger.warn("Hall fee {} was already paid for user {}", hallFee.getFeeId(), user.getUserId());
                    }
                }
                
                // Find and update dining fees
                List<StudentDiningFees> unpaidDiningFees = studentDiningFeesRepo.findByUserIdAndStatus(
                    user.getUserId(), StudentDiningFees.PaymentStatus.UNPAID);
                
                for (StudentDiningFees diningFee : unpaidDiningFees) {
                    // Double-check the fee is still unpaid (optimistic check)
                    if (diningFee.getStatus() == StudentDiningFees.PaymentStatus.UNPAID) {
                        diningFee.setStatus(StudentDiningFees.PaymentStatus.PAID);
                        studentDiningFeesRepo.save(diningFee);
                        logger.info("Updated dining fee {} to PAID for user {}", diningFee.getFeeId(), user.getUserId());
                        hasDiningFees = true;
                    } else {
                        logger.warn("Dining fee {} was already paid for user {}", diningFee.getFeeId(), user.getUserId());
                    }
                }
                
                // Create payment records for each fee that was paid
                if (hasHallFees || hasDiningFees) {
                    // Double-check that we haven't already created a payment record for this transaction
                    if (!studentPaymentInfoRepo.existsByTranId(tranId)) {
                        
                        // Create payment records for hall fees
                        if (hasHallFees) {
                            List<StudentHallFees> paidHallFees = studentHallFeesRepo.findByUserIdAndStatus(
                                user.getUserId(), StudentHallFees.PaymentStatus.PAID);
                            
                            for (StudentHallFees hallFee : paidHallFees) {
                                StudentPaymentInfo hallPaymentInfo = new StudentPaymentInfo(
                                    hallFee.getFeeId(),
                                    StudentPaymentInfo.FeeType.HALL,
                                    tranId,
                                    valId,
                                    paymentMethod
                                );
                                studentPaymentInfoRepo.save(hallPaymentInfo);
                                logger.info("Created hall payment record for feeId: {} with transaction: {}", 
                                          hallFee.getFeeId(), tranId);
                            }
                        }
                        
                        // Create payment records for dining fees
                        if (hasDiningFees) {
                            List<StudentDiningFees> paidDiningFees = studentDiningFeesRepo.findByUserIdAndStatus(
                                user.getUserId(), StudentDiningFees.PaymentStatus.PAID);
                            
                            for (StudentDiningFees diningFee : paidDiningFees) {
                                StudentPaymentInfo diningPaymentInfo = new StudentPaymentInfo(
                                    diningFee.getFeeId(),
                                    StudentPaymentInfo.FeeType.DINING,
                                    tranId,
                                    valId,
                                    paymentMethod
                                );
                                studentPaymentInfoRepo.save(diningPaymentInfo);
                                logger.info("Created dining payment record for feeId: {} with transaction: {}", 
                                          diningFee.getFeeId(), tranId);
                            }
                        }
                        
                        logger.info("Created payment records for transaction: {} with fee types - Hall: {}, Dining: {}", 
                                  tranId, hasHallFees, hasDiningFees);
                    } else {
                        logger.info("Payment record already exists for transaction: {}, skipping creation", tranId);
                    }
                } else {
                    logger.warn("No unpaid fees found to update for user {} in transaction {}", 
                              user.getUserId(), tranId);
                }
                
                logger.info("Payment processing completed successfully for transaction: {}", tranId);
                
                // Return success response with redirect URL
                String redirectUrl = "/payment-success.html?tran_id=" + tranId + "&val_id=" + valId + "&status=" + status;
                return new PaymentCallbackResult(true, redirectUrl, tranId, valId, status, "Payment processed successfully");
                
            } catch (Exception e) {
                logger.error("Error updating fee records for transaction {}: {}", tranId, e.getMessage(), e);
                return new PaymentCallbackResult(false, "/payment-error.html", tranId, valId, status, 
                                                "Error updating payment records");
            }
            
        } catch (Exception e) {
            logger.error("Error processing payment callback: {}", e.getMessage(), e);
            return new PaymentCallbackResult(false, "/payment-error.html", "", "", "", 
                                            "Internal error processing payment");
        }
    }

    /**
     * Processes payment failure callback data
     * 
     * @param params The callback parameters from payment gateway
     * @return PaymentCallbackResult with processed data
     */
    public PaymentCallbackResult processFailureCallback(Map<String, String> params) {
        logger.info("Payment failed callback received: {}", params);
        
        String message = "Payment Failed<br><br>" + params.entrySet().stream()
                .map(e -> e.getKey() + ": " + e.getValue())
                .reduce("", (a, b) -> a + "<br>" + b);
        
        return new PaymentCallbackResult(false, null, null, null, null, message);
    }

    /**
     * Processes payment cancellation callback data
     * 
     * @param params The callback parameters from payment gateway
     * @return PaymentCallbackResult with processed data
     */
    public PaymentCallbackResult processCancellationCallback(Map<String, String> params) {
        logger.info("Payment cancelled callback received: {}", params);
        
        String message = "Payment Cancelled<br><br>" + params.entrySet().stream()
                .map(e -> e.getKey() + ": " + e.getValue())
                .reduce("", (a, b) -> a + "<br>" + b);
        
        return new PaymentCallbackResult(false, null, null, null, null, message);
    }

    /**
     * Calculates the total unpaid amount from hall and dining fees
     */
    private BigDecimal calculateTotalUnpaidAmount(UnpaidFeesSummaryDTO hallFeesSummary, 
                                                 UnpaidFeesSummaryDTO diningFeesSummary) {
        BigDecimal totalUnpaidAmount = BigDecimal.ZERO;
        
        if (hallFeesSummary != null && hallFeesSummary.getTotalUnpaidAmount() != null) {
            totalUnpaidAmount = totalUnpaidAmount.add(hallFeesSummary.getTotalUnpaidAmount());
        }
        
        if (diningFeesSummary != null && diningFeesSummary.getTotalUnpaidAmount() != null) {
            totalUnpaidAmount = totalUnpaidAmount.add(diningFeesSummary.getTotalUnpaidAmount());
        }
        
        return totalUnpaidAmount;
    }

    /**
     * Calculates the total unpaid amount from hall fees only
     */
    private BigDecimal calculateHallFeesAmount(UnpaidFeesSummaryDTO hallFeesSummary) {
        BigDecimal totalHallFeesAmount = BigDecimal.ZERO;
        
        if (hallFeesSummary != null && hallFeesSummary.getTotalUnpaidAmount() != null) {
            totalHallFeesAmount = hallFeesSummary.getTotalUnpaidAmount();
        }
        
        return totalHallFeesAmount;
    }

    /**
     * Calculates the total unpaid amount from dining fees only
     */
    private BigDecimal calculateDiningFeesAmount(UnpaidFeesSummaryDTO diningFeesSummary) {
        BigDecimal totalDiningFeesAmount = BigDecimal.ZERO;
        
        if (diningFeesSummary != null && diningFeesSummary.getTotalUnpaidAmount() != null) {
            totalDiningFeesAmount = diningFeesSummary.getTotalUnpaidAmount();
        }
        
        return totalDiningFeesAmount;
    }

    /**
     * Generates an appropriate fee description based on what types of fees are unpaid
     */
    private String generateFeeDescription(UnpaidFeesSummaryDTO hallFeesSummary, 
                                        UnpaidFeesSummaryDTO diningFeesSummary) {
        boolean hasHallFees = hallFeesSummary != null && hallFeesSummary.getTotalUnpaidAmount() != null 
                             && hallFeesSummary.getTotalUnpaidAmount().compareTo(BigDecimal.ZERO) > 0;
        boolean hasDiningFees = diningFeesSummary != null && diningFeesSummary.getTotalUnpaidAmount() != null 
                               && diningFeesSummary.getTotalUnpaidAmount().compareTo(BigDecimal.ZERO) > 0;
        
        if (hasHallFees && hasDiningFees) {
            return "Hall and Dining Fees";
        } else if (hasHallFees) {
            return "Hall Fees";
        } else if (hasDiningFees) {
            return "Dining Fees";
        } else {
            return "Dormitory Fees";
        }
    }

    /**
     * Generates fee description for hall fees only
     */
    private String generateHallFeeDescription(UnpaidFeesSummaryDTO hallFeesSummary) {
        if (hallFeesSummary != null && hallFeesSummary.getTotalUnpaidAmount() != null 
            && hallFeesSummary.getTotalUnpaidAmount().compareTo(BigDecimal.ZERO) > 0) {
            return "Hall Fees Payment";
        }
        return "No Hall Fees";
    }

    /**
     * Generates fee description for dining fees only
     */
    private String generateDiningFeeDescription(UnpaidFeesSummaryDTO diningFeesSummary) {
        if (diningFeesSummary != null && diningFeesSummary.getTotalUnpaidAmount() != null 
            && diningFeesSummary.getTotalUnpaidAmount().compareTo(BigDecimal.ZERO) > 0) {
            return "Dining Fees Payment";
        }
        return "No Dining Fees";
    }

    /**
     * Result class for payment initiation operations
     */
    public static class PaymentInitiationResult {
        private final boolean success;
        private final String redirectUrl;
        private final String transactionId;
        private final String errorMessage;

        private PaymentInitiationResult(boolean success, String redirectUrl, String transactionId, String errorMessage) {
            this.success = success;
            this.redirectUrl = redirectUrl;
            this.transactionId = transactionId;
            this.errorMessage = errorMessage;
        }

        public static PaymentInitiationResult success(String redirectUrl, String transactionId) {
            return new PaymentInitiationResult(true, redirectUrl, transactionId, null);
        }

        public static PaymentInitiationResult failure(String errorMessage) {
            return new PaymentInitiationResult(false, null, null, errorMessage);
        }

        // Getters
        public boolean isSuccess() { return success; }
        public String getRedirectUrl() { return redirectUrl; }
        public String getTransactionId() { return transactionId; }
        public String getErrorMessage() { return errorMessage; }
    }

    /**
     * Result class for payment callback operations
     */
    public static class PaymentCallbackResult {
        private final boolean success;
        private final String redirectUrl;
        private final String transactionId;
        private final String validationId;
        private final String status;
        private final String message;

        public PaymentCallbackResult(boolean success, String redirectUrl, String transactionId, 
                                   String validationId, String status) {
            this(success, redirectUrl, transactionId, validationId, status, null);
        }

        public PaymentCallbackResult(boolean success, String redirectUrl, String transactionId, 
                                   String validationId, String status, String message) {
            this.success = success;
            this.redirectUrl = redirectUrl;
            this.transactionId = transactionId;
            this.validationId = validationId;
            this.status = status;
            this.message = message;
        }

        // Getters
        public boolean isSuccess() { return success; }
        public String getRedirectUrl() { return redirectUrl; }
        public String getTransactionId() { return transactionId; }
        public String getValidationId() { return validationId; }
        public String getStatus() { return status; }
        public String getMessage() { return message; }
    }
}
