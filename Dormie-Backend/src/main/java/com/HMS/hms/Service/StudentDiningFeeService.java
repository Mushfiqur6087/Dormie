package com.HMS.hms.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.HMS.hms.DTO.StudentDiningFeeDTO;
import com.HMS.hms.DTO.StudentDiningFeePaymentDTO;
import com.HMS.hms.Repo.DiningFeeRepo;
import com.HMS.hms.Repo.StudentDiningFeesRepo;
import com.HMS.hms.Repo.StudentPaymentInfoRepo;
import com.HMS.hms.Tables.DiningFee;
import com.HMS.hms.Tables.StudentDiningFees;
import com.HMS.hms.Tables.StudentPaymentInfo;


@Service
public class StudentDiningFeeService {

    @Autowired
    private StudentDiningFeesRepo studentDiningFeesRepo;
    
    @Autowired
    private DiningFeeRepo diningFeeRepo;

    @Autowired
    private StudentPaymentInfoRepo studentPaymentInfoRepo;


// DTO Conversion Methods
    private StudentDiningFeeDTO convertToDTO(StudentDiningFees entity) {
        StudentDiningFeeDTO dto = new StudentDiningFeeDTO(
                entity.getFeeId(),
                entity.getStudentId(),
                entity.getStudentType(),
                entity.getYear(),
                entity.getStartDate(),
                entity.getEndDate(),
                entity.getStatus().toString()
        );
        
        // Calculate and set due amount
        BigDecimal dueAmount = calculateDueAmount(entity);
        dto.setDueAmount(dueAmount);
        
        return dto;
    }
    
    /**
     * Calculates the due amount for a student dining fee.
     * If status is UNPAID, returns the dining fee amount for that year.
     * If status is PAID, returns 0.
     */
    private BigDecimal calculateDueAmount(StudentDiningFees entity) {
        if (entity.getStatus() == StudentDiningFees.PaymentStatus.PAID) {
            return BigDecimal.ZERO;
        }
        
        // For unpaid fees, get the dining fee amount for that year
        Optional<DiningFee> diningFee = diningFeeRepo.findByTypeAndYear(
                DiningFee.ResidencyType.RESIDENT, 
                entity.getYear()
        );
        
        return diningFee.map(DiningFee::getFee).orElse(BigDecimal.ZERO);
    }

    private List<StudentDiningFeeDTO> convertToDTOList(List<StudentDiningFees> entities) {
        return entities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }


// DTO-based service methods

    public List<StudentDiningFeeDTO> getAllStudentDiningFeesDTO() {

        return convertToDTOList(studentDiningFeesRepo.findAll());

    }


    public Optional<StudentDiningFeeDTO> getStudentDiningFeeByIdDTO(Long id) {

        return studentDiningFeesRepo.findById(id)

                .map(this::convertToDTO);

    }


    public List<StudentDiningFeeDTO> getStudentDiningFeesByUserIdDTO(Long userId) {

        return convertToDTOList(studentDiningFeesRepo.findByUserId(userId));

    }


    public List<StudentDiningFeeDTO> getStudentDiningFeesByStudentIdDTO(Long studentId) {

        return convertToDTOList(studentDiningFeesRepo.findByStudentId(studentId));

    }


    public List<StudentDiningFeeDTO> getStudentDiningFeesByYearDTO(Integer year) {

        return convertToDTOList(studentDiningFeesRepo.findByYear(year));

    }


    public List<StudentDiningFeeDTO> getStudentDiningFeesByTypeDTO(String studentType) {

        return convertToDTOList(studentDiningFeesRepo.findByStudentType(studentType));

    }


    public List<StudentDiningFeeDTO> getStudentDiningFeesByStatusDTO(String status) {

        return convertToDTOList(studentDiningFeesRepo.findByStatus(status));

    }


    public List<StudentDiningFeeDTO> getUnpaidStudentDiningFeesByUserIdDTO(Long userId) {

        return convertToDTOList(studentDiningFeesRepo.findUnpaidByUserId(userId));

    }


    public List<StudentDiningFeeDTO> getPaidStudentDiningFeesByUserIdDTO(Long userId) {

        return convertToDTOList(studentDiningFeesRepo.findPaidByUserId(userId));

    }


    public List<StudentDiningFeeDTO> getActiveStudentDiningFeesDTO() {

        LocalDate currentDate = LocalDate.now();

        return convertToDTOList(studentDiningFeesRepo.findAllActive(currentDate));

    }


    public List<StudentDiningFeeDTO> getActiveStudentDiningFeesByStudentIdDTO(Long studentId) {

        LocalDate currentDate = LocalDate.now();

        return convertToDTOList(studentDiningFeesRepo.findActiveByStudentId(studentId, currentDate));

    }


    public List<StudentDiningFeeDTO> getStudentDiningFeesByUserIdAndYearDTO(Long userId, Integer year) {

        return convertToDTOList(studentDiningFeesRepo.findByUserIdAndYear(userId, year));

    }


    public List<StudentDiningFeeDTO> getStudentDiningFeesByYearAndStatusDTO(Integer year, StudentDiningFees.PaymentStatus status) {

        return convertToDTOList(studentDiningFeesRepo.findByYearAndStatus(year, status));

    }


// Original entity-based methods (keeping for backward compatibility)

// Get all student dining fees

    public List<StudentDiningFees> getAllStudentDiningFees() {

        return studentDiningFeesRepo.findAll();

    }


// Get student dining fee by ID

    public Optional<StudentDiningFees> getStudentDiningFeeById(Long id) {

        return studentDiningFeesRepo.findById(id);

    }


// Get student dining fees by user ID

    public List<StudentDiningFees> getStudentDiningFeesByUserId(Long userId) {

        return studentDiningFeesRepo.findByUserId(userId);

    }


// Get student dining fees by student ID

    public List<StudentDiningFees> getStudentDiningFeesByStudentId(Long studentId) {

        return studentDiningFeesRepo.findByStudentId(studentId);

    }


// Get student dining fees by year

    public List<StudentDiningFees> getStudentDiningFeesByYear(Integer year) {

        return studentDiningFeesRepo.findByYear(year);

    }


// Get student dining fees by student type

    public List<StudentDiningFees> getStudentDiningFeesByType(String studentType) {

        return studentDiningFeesRepo.findByStudentType(studentType);

    }


// Get student dining fees by payment status

    public List<StudentDiningFees> getStudentDiningFeesByStatus(String status) {

        return studentDiningFeesRepo.findByStatus(status);

    }


// Get unpaid student dining fees for a specific user

    public List<StudentDiningFees> getUnpaidStudentDiningFeesByUserId(Long userId) {

        return studentDiningFeesRepo.findUnpaidByUserId(userId);

    }


// Get paid student dining fees for a specific user

    public List<StudentDiningFees> getPaidStudentDiningFeesByUserId(Long userId) {

        return studentDiningFeesRepo.findPaidByUserId(userId);

    }


// Get active student dining fees (current date within fee period)

    public List<StudentDiningFees> getActiveStudentDiningFees() {

        LocalDate currentDate = LocalDate.now();

        return studentDiningFeesRepo.findAllActive(currentDate);

    }


// Get active student dining fees by student ID

    public List<StudentDiningFees> getActiveStudentDiningFeesByStudentId(Long studentId) {

        LocalDate currentDate = LocalDate.now();

        return studentDiningFeesRepo.findActiveByStudentId(studentId, currentDate);

    }


// Get student dining fees by user ID and year

    public List<StudentDiningFees> getStudentDiningFeesByUserIdAndYear(Long userId, Integer year) {

        return studentDiningFeesRepo.findByUserIdAndYear(userId, year);

    }


// Get student dining fees by year and status
    public List<StudentDiningFees> getStudentDiningFeesByYearAndStatus(Integer year, StudentDiningFees.PaymentStatus status) {
        return studentDiningFeesRepo.findByYearAndStatus(year, status);
    }

    /**
     * Get payment information for paid dining fees by user ID
     * Returns list combining StudentDiningFees and StudentPaymentInfo data with detailed information
     */
    public List<StudentDiningFeePaymentDTO> getDiningFeePaymentsByUserId(Long userId) {
        List<StudentDiningFeePaymentDTO> paymentDTOs = new ArrayList<>();

        // Get all paid dining fees for the user
        List<StudentDiningFees> paidDiningFees = studentDiningFeesRepo.findByUserIdAndStatus(userId, StudentDiningFees.PaymentStatus.PAID);

        // For each paid dining fee, find corresponding payment info
        for (StudentDiningFees diningFee : paidDiningFees) {
            // Find payment info for dining fees with the same feeId
            List<StudentPaymentInfo> paymentInfos = studentPaymentInfoRepo.findByFeeIdAndFeeType(diningFee.getFeeId(), StudentPaymentInfo.FeeType.DINING);

            // Get the dining fee amount from DiningFee table
            BigDecimal feeAmount = BigDecimal.ZERO;
            Optional<DiningFee> diningFeeInfo = diningFeeRepo.findByTypeAndYear(
                DiningFee.ResidencyType.RESIDENT, 
                diningFee.getYear()
            );
            if (diningFeeInfo.isPresent()) {
                feeAmount = diningFeeInfo.get().getFee();
            }

            for (StudentPaymentInfo paymentInfo : paymentInfos) {
                StudentDiningFeePaymentDTO paymentDTO = new StudentDiningFeePaymentDTO(
                        diningFee.getYear(),
                        "dining",
                        paymentInfo.getFeeId(),
                        paymentInfo.getTranId(),
                        paymentInfo.getValId(),
                        paymentInfo.getPaymentMethod(),
                        diningFee.getStartDate(),
                        diningFee.getEndDate(),
                        feeAmount,
                        diningFee.getStudentType()
                );
                paymentDTOs.add(paymentDTO);
            }
        }

        return paymentDTOs;
    }

}