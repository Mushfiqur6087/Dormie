package com.HMS.hms.Controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.HMS.hms.DTO.MealPlanDTO;
import com.HMS.hms.Service.MealPlanService;

@RestController
@RequestMapping("/api/meal-plans")
@CrossOrigin(origins = "*")
public class MealPlanController {

    @Autowired
    private MealPlanService mealPlanService;

    // Create or update meal plan (Mess Manager only)
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createOrUpdateMealPlan(@RequestBody MealPlanDTO mealPlanDTO) {
        try {
            MealPlanDTO savedMealPlan = mealPlanService.createOrUpdateMealPlan(mealPlanDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedMealPlan);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error creating/updating meal plan: " + e.getMessage()));
        }
    }

    // Get all meal plans (Admin view)
    @GetMapping
    public ResponseEntity<List<MealPlanDTO>> getAllMealPlans() {
        try {
            // Get all future meals for general viewing
            List<MealPlanDTO> mealPlans = mealPlanService.getFutureMeals();
            return ResponseEntity.ok(mealPlans);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get today's meals (Public access for all students)
    @GetMapping("/today")
    public ResponseEntity<List<MealPlanDTO>> getTodaysMeals() {
        try {
            List<MealPlanDTO> todaysMeals = mealPlanService.getTodaysMeals();
            return ResponseEntity.ok(todaysMeals);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get meal plans by date
    @GetMapping("/date/{date}")
    public ResponseEntity<List<MealPlanDTO>> getMealPlansByDate(@PathVariable String date) {
        try {
            LocalDate mealDate = LocalDate.parse(date);
            List<MealPlanDTO> mealPlans = mealPlanService.getMealPlansByDate(mealDate);
            return ResponseEntity.ok(mealPlans);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get meal plans by date range
    @GetMapping("/date-range")
    public ResponseEntity<List<MealPlanDTO>> getMealPlansByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            List<MealPlanDTO> mealPlans = mealPlanService.getMealPlansByDateRange(start, end);
            return ResponseEntity.ok(mealPlans);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get meal plans by mess manager (Mess Manager view)
    @GetMapping("/mess-manager/{messManagerId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMealPlansByMessManager(@PathVariable Long messManagerId) {
        try {
            List<MealPlanDTO> mealPlans = mealPlanService.getMealPlansByMessManager(messManagerId);
            return ResponseEntity.ok(mealPlans);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving meal plans: " + e.getMessage()));
        }
    }

    // Get meal plans by mess manager and date range
    @GetMapping("/mess-manager/{messManagerId}/date-range")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMealPlansByMessManagerAndDateRange(
            @PathVariable Long messManagerId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            List<MealPlanDTO> mealPlans = mealPlanService.getMealPlansByMessManagerAndDateRange(
                    messManagerId, start, end);
            return ResponseEntity.ok(mealPlans);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving meal plans: " + e.getMessage()));
        }
    }

    // Get meal plan by ID
    @GetMapping("/{mealPlanId}")
    public ResponseEntity<?> getMealPlanById(@PathVariable Long mealPlanId) {
        try {
            Optional<MealPlanDTO> mealPlan = mealPlanService.getMealPlanById(mealPlanId);
            if (mealPlan.isPresent()) {
                return ResponseEntity.ok(mealPlan.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving meal plan: " + e.getMessage()));
        }
    }

    // Update meal plan (Mess Manager only)
    @PutMapping("/{mealPlanId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateMealPlan(@PathVariable Long mealPlanId, @RequestBody MealPlanDTO mealPlanDTO) {
        try {
            mealPlanDTO.setMealPlanId(mealPlanId);
            MealPlanDTO updatedMealPlan = mealPlanService.createOrUpdateMealPlan(mealPlanDTO);
            return ResponseEntity.ok(updatedMealPlan);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating meal plan: " + e.getMessage()));
        }
    }

    // Delete meal plan (Mess Manager only)
    @DeleteMapping("/{mealPlanId}/mess-manager/{messManagerId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteMealPlan(@PathVariable Long mealPlanId, @PathVariable Long messManagerId) {
        try {
            mealPlanService.deleteMealPlan(mealPlanId, messManagerId);
            return ResponseEntity.ok(Map.of("message", "Meal plan deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error deleting meal plan: " + e.getMessage()));
        }
    }

    // Get future meals (Public access)
    @GetMapping("/future")
    public ResponseEntity<List<MealPlanDTO>> getFutureMeals() {
        try {
            List<MealPlanDTO> futureMeals = mealPlanService.getFutureMeals();
            return ResponseEntity.ok(futureMeals);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
