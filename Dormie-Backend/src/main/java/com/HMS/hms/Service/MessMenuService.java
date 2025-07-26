package com.HMS.hms.Service;

import com.HMS.hms.DTO.MessMenuDTO;
import com.HMS.hms.DTO.MessMenuRequest;
import com.HMS.hms.Repo.MessMenuRepo;
import com.HMS.hms.Repo.MessManagerRepo;
import com.HMS.hms.Tables.MessMenu;
import com.HMS.hms.Tables.Users;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MessMenuService {

    @Autowired
    private MessMenuRepo messMenuRepo;

    @Autowired
    private MessManagerRepo messManagerRepo;

    @Autowired
    private UserService userService;

    /**
     * Create or update a menu (Mess Manager only)
     */
    @Transactional
    public MessMenuDTO createOrUpdateMenu(MessMenuRequest request, Long userId) {
        // Verify user exists and is a current mess manager
        Optional<Users> userOpt = userService.findByUserId(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        Users user = userOpt.get();
        if (!"STUDENT".equals(user.getRole())) {
            throw new RuntimeException("User must be a student to manage menus");
        }

        // Check if user is currently an active mess manager
        if (!messManagerRepo.findActiveManagerByUserId(userId).isPresent()) {
            throw new RuntimeException("Only active mess managers can create/update menus");
        }

        // Validate meal type
        if (!isValidMealType(request.getMealType())) {
            throw new RuntimeException("Invalid meal type. Must be LUNCH or DINNER");
        }

        // Check if menu already exists for this date and meal type
        Optional<MessMenu> existingMenu = messMenuRepo.findByDateAndMealType(request.getDate(), request.getMealType());
        
        MessMenu menu;
        if (existingMenu.isPresent()) {
            // Update existing menu
            menu = existingMenu.get();
            menu.setMenuItems(request.getMenuItems());
            menu.setUpdatedAt(LocalDateTime.now());
        } else {
            // Create new menu
            menu = new MessMenu();
            menu.setDate(request.getDate());
            menu.setMealType(request.getMealType());
            menu.setMenuItems(request.getMenuItems());
            menu.setCreatedBy(userId);
        }

        MessMenu savedMenu = messMenuRepo.save(menu);
        return convertToDTO(savedMenu);
    }

    /**
     * Get today's menus
     */
    public List<MessMenuDTO> getTodaysMenus() {
        List<MessMenu> menus = messMenuRepo.findTodaysMenus();
        return menus.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get menus by date
     */
    public List<MessMenuDTO> getMenusByDate(LocalDate date) {
        List<MessMenu> menus = messMenuRepo.findByDateOrderByMealType(date);
        return menus.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get menus by date range
     */
    public List<MessMenuDTO> getMenusByDateRange(LocalDate startDate, LocalDate endDate) {
        List<MessMenu> menus = messMenuRepo.findByDateBetweenOrderByDateAscMealTypeAsc(startDate, endDate);
        return menus.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get current week's menus
     */
    public List<MessMenuDTO> getCurrentWeekMenus() {
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.minusDays(today.getDayOfWeek().getValue() - 1); // Monday
        LocalDate endOfWeek = startOfWeek.plusDays(6); // Sunday
        
        List<MessMenu> menus = messMenuRepo.findCurrentWeekMenus(startOfWeek, endOfWeek);
        return menus.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get upcoming menus
     */
    public List<MessMenuDTO> getUpcomingMenus() {
        List<MessMenu> menus = messMenuRepo.findUpcomingMenus();
        return menus.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get menus by month and year
     */
    public List<MessMenuDTO> getMenusByMonthAndYear(Integer month, Integer year) {
        List<MessMenu> menus = messMenuRepo.findMenusByMonthAndYear(month, year);
        return menus.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get menus created by a specific user
     */
    public List<MessMenuDTO> getMenusByCreator(Long createdBy) {
        List<MessMenu> menus = messMenuRepo.findByCreatedByOrderByDateDescMealTypeAsc(createdBy);
        return menus.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get menu by ID
     */
    public MessMenuDTO getMenuById(Long menuId) {
        Optional<MessMenu> menuOpt = messMenuRepo.findById(menuId);
        if (menuOpt.isEmpty()) {
            throw new RuntimeException("Menu not found with ID: " + menuId);
        }
        return convertToDTO(menuOpt.get());
    }

    /**
     * Delete a menu (Mess Manager or Admin only)
     */
    @Transactional
    public void deleteMenu(Long menuId, Long userId) {
        Optional<MessMenu> menuOpt = messMenuRepo.findById(menuId);
        if (menuOpt.isEmpty()) {
            throw new RuntimeException("Menu not found with ID: " + menuId);
        }

        MessMenu menu = menuOpt.get();

        // Verify user has permission
        Optional<Users> userOpt = userService.findByUserId(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        Users user = userOpt.get();
        boolean isAdmin = "ADMIN".equals(user.getRole());
        boolean isCreator = menu.getCreatedBy().equals(userId);
        boolean isCurrentMessManager = messManagerRepo.findActiveManagerByUserId(userId).isPresent();

        if (!isAdmin && !isCreator && !isCurrentMessManager) {
            throw new RuntimeException("You do not have permission to delete this menu");
        }

        messMenuRepo.delete(menu);
    }

    /**
     * Get latest menus
     */
    public List<MessMenuDTO> getLatestMenus() {
        List<MessMenu> menus = messMenuRepo.findTop10ByOrderByCreatedAtDesc();
        return menus.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Check if menu exists for date and meal type
     */
    public boolean menuExistsForDateAndMealType(LocalDate date, String mealType) {
        return messMenuRepo.countMenuByDateAndMealType(date, mealType) > 0;
    }

    /**
     * Convert MessMenu entity to DTO
     */
    private MessMenuDTO convertToDTO(MessMenu menu) {
        MessMenuDTO dto = new MessMenuDTO();
        dto.setId(menu.getMenuId());
        dto.setDate(menu.getDate());
        dto.setMealType(menu.getMealType());
        dto.setMenuItems(menu.getMenuItems());
        dto.setCreatedBy(menu.getCreatedBy());
        dto.setCreatedAt(menu.getCreatedAt());
        dto.setUpdatedAt(menu.getUpdatedAt());

        // Set creator name
        if (menu.getCreatedByUser() != null) {
            dto.setCreatedByName(menu.getCreatedByUser().getUsername());
        }

        return dto;
    }

    /**
     * Validate meal type
     */
    private boolean isValidMealType(String mealType) {
        return mealType != null && 
               (mealType.equals("LUNCH") || mealType.equals("DINNER"));
    }
}
