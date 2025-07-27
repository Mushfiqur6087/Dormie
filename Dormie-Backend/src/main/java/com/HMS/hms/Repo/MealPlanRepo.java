package com.HMS.hms.Repo;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.HMS.hms.Tables.MealPlan;

@Repository
public interface MealPlanRepo extends JpaRepository<MealPlan, Long> {

    // Find meal plans by date
    List<MealPlan> findByMealDate(LocalDate mealDate);

    // Find meal plans by date and meal type
    Optional<MealPlan> findByMealDateAndMealType(LocalDate mealDate, MealPlan.MealType mealType);

    // Find meal plans by mess manager ID
    List<MealPlan> findByMessManagerId(Long messManagerId);

    // Find meal plans by mess manager ID and date
    List<MealPlan> findByMessManagerIdAndMealDate(Long messManagerId, LocalDate mealDate);

    // Find meal plans by date range
    @Query("SELECT m FROM MealPlan m WHERE m.mealDate BETWEEN :startDate AND :endDate ORDER BY m.mealDate DESC, m.mealType")
    List<MealPlan> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // Find today's meal plans
    @Query("SELECT m FROM MealPlan m WHERE m.mealDate = :today ORDER BY m.mealType")
    List<MealPlan> findTodaysMeals(@Param("today") LocalDate today);

    // Find future meal plans
    @Query("SELECT m FROM MealPlan m WHERE m.mealDate > :today ORDER BY m.mealDate, m.mealType")
    List<MealPlan> findFutureMeals(@Param("today") LocalDate today);

    // Find meal plans by mess manager ID ordered by date descending
    List<MealPlan> findByMessManagerIdOrderByMealDateDescMealTypeAsc(Long messManagerId);

    // Check if meal plan exists for date and type
    boolean existsByMealDateAndMealType(LocalDate mealDate, MealPlan.MealType mealType);

    // Find meal plans created by mess manager in date range
    @Query("SELECT m FROM MealPlan m WHERE m.messManagerId = :messManagerId AND m.mealDate BETWEEN :startDate AND :endDate ORDER BY m.mealDate DESC")
    List<MealPlan> findByMessManagerIdAndDateRange(@Param("messManagerId") Long messManagerId, 
                                                   @Param("startDate") LocalDate startDate, 
                                                   @Param("endDate") LocalDate endDate);
}
