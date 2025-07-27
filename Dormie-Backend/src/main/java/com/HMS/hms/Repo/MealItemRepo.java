package com.HMS.hms.Repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.HMS.hms.Tables.MealItem;

@Repository
public interface MealItemRepo extends JpaRepository<MealItem, Long> {

    // Find meal items by meal plan ID
    List<MealItem> findByMealPlanMealPlanId(Long mealPlanId);

    // Find meal items by meal plan ID ordered by item order
    List<MealItem> findByMealPlanMealPlanIdOrderByItemOrder(Long mealPlanId);

    // Delete meal items by meal plan ID
    void deleteByMealPlanMealPlanId(Long mealPlanId);
}
