package com.HMS.hms.Repo;
import com.HMS.hms.Tables.RoomChangeApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;





public interface RoomChangeApplicationRepo extends JpaRepository<RoomChangeApplication, Long> {

    Optional<RoomChangeApplication> findByUserId(Long userId);

    List<RoomChangeApplication> findByApplicationStatus(String applicationStatus);

    List<RoomChangeApplication> findAllByOrderByApplicationDateDesc();
 

    @Query("SELECT r FROM RoomChangeApplication r WHERE r.currentRoom = :currentRoom") 
List<RoomChangeApplication> findByCurrentRoom(@Param("currentRoom") String currentRoom);


  @Query("SELECT r FROM RoomChangeApplication r WHERE r.preferredRoom = :preferredRoom AND r.applicationStatus = 'PENDING'") 
List<RoomChangeApplication> findPendingApplicationsForRoom(@Param("preferredRoom") String preferredRoom);


 boolean existsByUserIdAndApplicationStatus(Long userId, String 
applicationStatus); 
// Count applications by status - useful for dashboard statistics 
long countByApplicationStatus(String applicationStatus);






}


