package com.HMS.hms.Controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.HMS.hms.DTO.StudentHallFeeDTO;
import com.HMS.hms.DTO.StudentHallFeePaymentDTO;
import com.HMS.hms.Service.StudentHallFeeService;
import com.HMS.hms.Tables.StudentPaymentInfo;

@RestController
@RequestMapping("/api/student-hall-fees")
@CrossOrigin(origins = "*", maxAge = 3600)
public class StudentHallFeeController {

    @Autowired
    private StudentHallFeeService studentHallFeeService;


    // Get all student hall fees
    @GetMapping
    public ResponseEntity<List<StudentHallFeeDTO>> getAllStudentHallFees() {
        try {
            List<StudentHallFeeDTO> fees = studentHallFeeService.getAllStudentHallFeesDTO();
            return new ResponseEntity<>(fees, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get student hall fee by ID
    @GetMapping("/{id}")
    public ResponseEntity<StudentHallFeeDTO> getStudentHallFeeById(@PathVariable Long id) {
        try {
            Optional<StudentHallFeeDTO> fee = studentHallFeeService.getStudentHallFeeByIdDTO(id);
            return fee.map(f -> new ResponseEntity<>(f, HttpStatus.OK))
                      .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get student hall fees by user ID
    @GetMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Optional<StudentHallFeeDTO>> getStudentHallFeesByUserId(@PathVariable Long userId) {
        try {
            Optional<StudentHallFeeDTO> fees = studentHallFeeService.getStudentHallFeesByUserIdDTO(userId);
            System.out.println(fees);
            return new ResponseEntity<>(fees, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get student hall fee payment information by user ID
    @GetMapping("/payment/user/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<StudentHallFeePaymentDTO>> getStudentHallFeePaymentsByUserId(@PathVariable Long userId) {
        try {
            List<StudentHallFeePaymentDTO> payments = studentHallFeeService.getHallFeePaymentsByUserId(userId);
            return new ResponseEntity<>(payments, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get student hall fees by student ID
    @GetMapping("/student/{studentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<StudentHallFeeDTO>> getStudentHallFeesByStudentId(@PathVariable Long studentId) {
        try {
            List<StudentHallFeeDTO> fees = studentHallFeeService.getStudentHallFeesByStudentIdDTO(studentId);
            return new ResponseEntity<>(fees, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Debug endpoints for checking payment data
    @GetMapping("/debug/all-payments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<StudentPaymentInfo>> getAllPaymentInfo() {
        try {
            List<StudentPaymentInfo> payments = studentHallFeeService.getAllPaymentInfo();
            return new ResponseEntity<>(payments, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/debug/hall-payments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<StudentPaymentInfo>> getAllHallPaymentInfo() {
        try {
            List<StudentPaymentInfo> payments = studentHallFeeService.getAllHallPaymentInfo();
            return new ResponseEntity<>(payments, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
