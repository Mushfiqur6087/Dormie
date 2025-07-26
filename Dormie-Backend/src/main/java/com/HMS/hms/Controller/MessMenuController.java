package com.HMS.hms.Controller;

import com.HMS.hms.DTO.MessMenuDTO;
import com.HMS.hms.DTO.MessMenuRequest;
import com.HMS.hms.DTO.MessageResponse;
import com.HMS.hms.Security.UserDetailsImpl;
import com.HMS.hms.Service.MessMenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/mess-menus")
@CrossOrigin(origins = "*")
public class MessMenuController {

    @Autowired
    private MessMenuService messMenuService;

    /**
     * Create or update a menu (Mess Manager only)
     */
    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> createOrUpdateMenu(@Valid @RequestBody MessMenuRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            MessMenuDTO menu = messMenuService.createOrUpdateMenu(request, userId);
            return ResponseEntity.ok(menu);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error creating/updating menu: " + e.getMessage()));
        }
    }

    /**
     * Get today's menus
     */
    @GetMapping("/today")
    public ResponseEntity<?> getTodaysMenus() {
        try {
            List<MessMenuDTO> menus = messMenuService.getTodaysMenus();
            return ResponseEntity.ok(menus);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching today's menus: " + e.getMessage()));
        }
    }

    /**
     * Get menus by date
     */
    @GetMapping("/date/{date}")
    public ResponseEntity<?> getMenusByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<MessMenuDTO> menus = messMenuService.getMenusByDate(date);
            return ResponseEntity.ok(menus);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching menus: " + e.getMessage()));
        }
    }

    /**
     * Get menus by date range
     */
    @GetMapping("/date-range")
    public ResponseEntity<?> getMenusByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<MessMenuDTO> menus = messMenuService.getMenusByDateRange(startDate, endDate);
            return ResponseEntity.ok(menus);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching menus: " + e.getMessage()));
        }
    }

    /**
     * Get current week's menus
     */
    @GetMapping("/current-week")
    public ResponseEntity<?> getCurrentWeekMenus() {
        try {
            List<MessMenuDTO> menus = messMenuService.getCurrentWeekMenus();
            return ResponseEntity.ok(menus);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching current week menus: " + e.getMessage()));
        }
    }

    /**
     * Get upcoming menus
     */
    @GetMapping("/upcoming")
    public ResponseEntity<?> getUpcomingMenus() {
        try {
            List<MessMenuDTO> menus = messMenuService.getUpcomingMenus();
            return ResponseEntity.ok(menus);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching upcoming menus: " + e.getMessage()));
        }
    }

    /**
     * Get menus by month and year
     */
    @GetMapping("/month/{month}/year/{year}")
    public ResponseEntity<?> getMenusByMonthAndYear(@PathVariable Integer month, @PathVariable Integer year) {
        try {
            List<MessMenuDTO> menus = messMenuService.getMenusByMonthAndYear(month, year);
            return ResponseEntity.ok(menus);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching menus: " + e.getMessage()));
        }
    }

    /**
     * Get menus created by a specific user
     */
    @GetMapping("/creator/{createdBy}")
    public ResponseEntity<?> getMenusByCreator(@PathVariable Long createdBy) {
        try {
            List<MessMenuDTO> menus = messMenuService.getMenusByCreator(createdBy);
            return ResponseEntity.ok(menus);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching menus: " + e.getMessage()));
        }
    }

    /**
     * Get my created menus (for mess managers)
     */
    @GetMapping("/my-menus")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyMenus() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            List<MessMenuDTO> menus = messMenuService.getMenusByCreator(userId);
            return ResponseEntity.ok(menus);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching your menus: " + e.getMessage()));
        }
    }

    /**
     * Get latest menus
     */
    @GetMapping("/latest")
    public ResponseEntity<?> getLatestMenus() {
        try {
            List<MessMenuDTO> menus = messMenuService.getLatestMenus();
            return ResponseEntity.ok(menus);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching latest menus: " + e.getMessage()));
        }
    }

    /**
     * Get menu by ID
     */
    @GetMapping("/{menuId}")
    public ResponseEntity<?> getMenuById(@PathVariable Long menuId) {
        try {
            MessMenuDTO menu = messMenuService.getMenuById(menuId);
            return ResponseEntity.ok(menu);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Menu not found: " + e.getMessage()));
        }
    }

    /**
     * Check if menu exists for date and meal type
     */
    @GetMapping("/exists")
    public ResponseEntity<?> checkMenuExists(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String mealType) {
        try {
            boolean exists = messMenuService.menuExistsForDateAndMealType(date, mealType);
            return ResponseEntity.ok(new MessageResponse(exists ? "Menu exists" : "Menu does not exist"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error checking menu existence: " + e.getMessage()));
        }
    }

    /**
     * Delete a menu (Mess Manager or Admin only)
     */
    @DeleteMapping("/{menuId}")
    public ResponseEntity<?> deleteMenu(@PathVariable Long menuId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            messMenuService.deleteMenu(menuId, userId);
            return ResponseEntity.ok(new MessageResponse("Menu deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error deleting menu: " + e.getMessage()));
        }
    }
}
