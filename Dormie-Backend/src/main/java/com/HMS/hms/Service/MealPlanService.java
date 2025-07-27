package com.HMS.hms.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.HMS.hms.DTO.MealPlanDTO;
import com.HMS.hms.Repo.MealItemRepo;
import com.HMS.hms.Repo.MealPlanRepo;
import com.HMS.hms.Repo.MessManagerApplicationRepo;
import com.HMS.hms.Tables.MealItem;
import com.HMS.hms.Tables.MealPlan;

@Service
public class MealPlanService {

    @Autowired
    private MealPlanRepo mealPlanRepo;

    @Autowired
    private MealItemRepo mealItemRepo;

    @Autowired
    private MessManagerApplicationRepo messManagerApplicationRepo;

    // DTO Conversion Methods
    public MealPlanDTO convertToDTO(MealPlan mealPlan) {
        List<String> itemNames;
        
        // Always ensure we have a non-null mealItems list
        if (mealPlan.getMealItems() != null && !mealPlan.getMealItems().isEmpty()) {
            itemNames = mealPlan.getMealItems().stream()
                    .sorted((a, b) -> a.getItemOrder().compareTo(b.getItemOrder()))
                    .map(MealItem::getItemName)
                    .collect(Collectors.toList());
        } else {
            // If mealItems is null or empty, fetch them from repository
            if (mealPlan.getMealPlanId() != null) {
                List<MealItem> mealItems = mealItemRepo.findByMealPlanMealPlanIdOrderByItemOrder(mealPlan.getMealPlanId());
                itemNames = mealItems.stream()
                        .map(MealItem::getItemName)
                        .collect(Collectors.toList());
            } else {
                // For new meal plans without ID, return empty list
                itemNames = List.of();
            }
        }

        return new MealPlanDTO(
                mealPlan.getMealPlanId(),
                mealPlan.getMessManagerId(),
                mealPlan.getMealDate(),
                mealPlan.getMealTypeAsString(),
                mealPlan.getCostPerPerson(),
                itemNames
        );
    }

    public List<MealPlanDTO> convertToDTOList(List<MealPlan> mealPlans) {
        return mealPlans.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Validate if user is an active mess manager
    private void validateMessManager(Long userId) {
        boolean isActiveManager = messManagerApplicationRepo.isStudentCurrentlyMessManager(userId, LocalDate.now());
        if (!isActiveManager) {
            throw new IllegalArgumentException("User is not an active mess manager");
        }
    }

    // Create or update meal plan
    @Transactional
    public MealPlanDTO createOrUpdateMealPlan(MealPlanDTO mealPlanDTO) {
        // Validate mess manager
        validateMessManager(mealPlanDTO.getMessManagerId());

        // Validate date (cannot set meals for past dates)
        if (mealPlanDTO.getMealDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot set meal plans for past dates");
        }

        // Validate meal items
        if (mealPlanDTO.getMealItems() == null || mealPlanDTO.getMealItems().isEmpty()) {
            throw new IllegalArgumentException("Meal must have at least one item");
        }

        // Remove empty items
        List<String> validItems = mealPlanDTO.getMealItems().stream()
                .filter(item -> item != null && !item.trim().isEmpty())
                .collect(Collectors.toList());

        if (validItems.isEmpty()) {
            throw new IllegalArgumentException("Meal must have at least one valid item");
        }

        // Validate cost
        if (mealPlanDTO.getCostPerPerson() == null || mealPlanDTO.getCostPerPerson().doubleValue() <= 0) {
            throw new IllegalArgumentException("Cost per person must be greater than 0");
        }

        MealPlan.MealType mealType = MealPlan.MealType.fromString(mealPlanDTO.getMealType());

        // Check if meal plan already exists for this date and type
        Optional<MealPlan> existingPlan = mealPlanRepo.findByMealDateAndMealType(
                mealPlanDTO.getMealDate(), mealType);

        MealPlan mealPlan;
        if (existingPlan.isPresent()) {
            // Update existing meal plan
            mealPlan = existingPlan.get();
            mealPlan.setMessManagerId(mealPlanDTO.getMessManagerId());
            mealPlan.setCostPerPerson(mealPlanDTO.getCostPerPerson());
            mealPlan.setUpdatedAt(LocalDateTime.now());

            // Delete existing meal items
            mealItemRepo.deleteByMealPlanMealPlanId(mealPlan.getMealPlanId());
        } else {
            // Create new meal plan
            mealPlan = new MealPlan(
                    mealPlanDTO.getMessManagerId(),
                    mealPlanDTO.getMealDate(),
                    mealType,
                    mealPlanDTO.getCostPerPerson()
            );
        }

        // Save meal plan
        mealPlan = mealPlanRepo.save(mealPlan);

        // Create meal items
        List<MealItem> createdItems = new ArrayList<>();
        for (int i = 0; i < validItems.size(); i++) {
            MealItem mealItem = new MealItem(mealPlan, validItems.get(i).trim(), i + 1);
            MealItem savedItem = mealItemRepo.save(mealItem);
            createdItems.add(savedItem);
        }

        // Set the meal items directly to avoid lazy loading issues
        mealPlan.setMealItems(createdItems);
        
        // Return DTO without reloading from database
        return new MealPlanDTO(
                mealPlan.getMealPlanId(),
                mealPlan.getMessManagerId(),
                mealPlan.getMealDate(),
                mealPlan.getMealTypeAsString(),
                mealPlan.getCostPerPerson(),
                validItems
        );
    }

    // Get meal plans by date
    public List<MealPlanDTO> getMealPlansByDate(LocalDate date) {
        List<MealPlan> mealPlans = mealPlanRepo.findByMealDate(date);
        return convertToDTOList(mealPlans);
    }

    // Get today's meals
    public List<MealPlanDTO> getTodaysMeals() {
        List<MealPlan> mealPlans = mealPlanRepo.findTodaysMeals(LocalDate.now());
        return convertToDTOList(mealPlans);
    }

    // Get future meals
    public List<MealPlanDTO> getFutureMeals() {
        List<MealPlan> mealPlans = mealPlanRepo.findFutureMeals(LocalDate.now());
        return convertToDTOList(mealPlans);
    }

    // Get meal plans by mess manager
    public List<MealPlanDTO> getMealPlansByMessManager(Long messManagerId) {
        validateMessManager(messManagerId);
        List<MealPlan> mealPlans = mealPlanRepo.findByMessManagerIdOrderByMealDateDescMealTypeAsc(messManagerId);
        return convertToDTOList(mealPlans);
    }

    // Get meal plans by mess manager and date range
    public List<MealPlanDTO> getMealPlansByMessManagerAndDateRange(Long messManagerId, LocalDate startDate, LocalDate endDate) {
        validateMessManager(messManagerId);
        List<MealPlan> mealPlans = mealPlanRepo.findByMessManagerIdAndDateRange(messManagerId, startDate, endDate);
        return convertToDTOList(mealPlans);
    }

    // Get meal plan by ID
    public Optional<MealPlanDTO> getMealPlanById(Long mealPlanId) {
        return mealPlanRepo.findById(mealPlanId)
                .map(this::convertToDTO);
    }

    // Delete meal plan
    @Transactional
    public void deleteMealPlan(Long mealPlanId, Long messManagerId) {
        validateMessManager(messManagerId);
        
        Optional<MealPlan> mealPlanOpt = mealPlanRepo.findById(mealPlanId);
        if (mealPlanOpt.isEmpty()) {
            throw new IllegalArgumentException("Meal plan not found");
        }

        MealPlan mealPlan = mealPlanOpt.get();
        
        // Check if the mess manager owns this meal plan
        if (!mealPlan.getMessManagerId().equals(messManagerId)) {
            throw new IllegalArgumentException("You can only delete your own meal plans");
        }

        // Cannot delete past meal plans
        if (mealPlan.getMealDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot delete past meal plans");
        }

        mealPlanRepo.deleteById(mealPlanId);
    }

    // Get meal plans by date range
    public List<MealPlanDTO> getMealPlansByDateRange(LocalDate startDate, LocalDate endDate) {
        List<MealPlan> mealPlans = mealPlanRepo.findByDateRange(startDate, endDate);
        return convertToDTOList(mealPlans);
    }
}
