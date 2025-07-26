package com.HMS.hms.Repo;

import com.HMS.hms.Tables.MessMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MessMenuRepo extends JpaRepository<MessMenu, Long> {

    // Find menu by date and meal type
    Optional<MessMenu> findByDateAndMealType(LocalDate date, String mealType);

    // Find menus by date
    List<MessMenu> findByDateOrderByMealType(LocalDate date);

    // Find menus by date range
    List<MessMenu> findByDateBetweenOrderByDateAscMealTypeAsc(LocalDate startDate, LocalDate endDate);

    // Find menus by meal type
    List<MessMenu> findByMealTypeOrderByDateDesc(String mealType);

    // Find menus created by a specific user (mess manager)
    List<MessMenu> findByCreatedByOrderByDateDescMealTypeAsc(Long createdBy);

    // Find current week's menus
    @Query("SELECT m FROM MessMenu m WHERE m.date >= :startOfWeek AND m.date <= :endOfWeek ORDER BY m.date ASC, m.mealType ASC")
    List<MessMenu> findCurrentWeekMenus(@Param("startOfWeek") LocalDate startOfWeek, @Param("endOfWeek") LocalDate endOfWeek);

    // Find today's menus
    @Query("SELECT m FROM MessMenu m WHERE m.date = CURRENT_DATE ORDER BY m.mealType")
    List<MessMenu> findTodaysMenus();

    // Find upcoming menus (from today onwards)
    @Query("SELECT m FROM MessMenu m WHERE m.date >= CURRENT_DATE ORDER BY m.date ASC, m.mealType ASC")
    List<MessMenu> findUpcomingMenus();

    // Find menus for a specific month and year
    @Query("SELECT m FROM MessMenu m WHERE YEAR(m.date) = :year AND MONTH(m.date) = :month ORDER BY m.date ASC, m.mealType ASC")
    List<MessMenu> findMenusByMonthAndYear(@Param("month") Integer month, @Param("year") Integer year);

    // Check if menu exists for a specific date and meal type
    @Query("SELECT COUNT(m) FROM MessMenu m WHERE m.date = :date AND m.mealType = :mealType")
    Long countMenuByDateAndMealType(@Param("date") LocalDate date, @Param("mealType") String mealType);

    // Find latest menus (most recently created)
    List<MessMenu> findTop10ByOrderByCreatedAtDesc();

    // Find menus with user details
    @Query("SELECT m FROM MessMenu m LEFT JOIN FETCH m.createdByUser ORDER BY m.date DESC, m.mealType ASC")
    List<MessMenu> findAllWithUserDetails();

    // Find menus created in a date range
    List<MessMenu> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDate startDate, LocalDate endDate);
}
