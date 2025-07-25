package com.HMS.hms.DTO;

import java.time.LocalDateTime;
import com.HMS.hms.Tables.RoomChangeApplication;

public class RoomChangeApplicationDTO {
     private Long applicationId; 
private Long userId; 
private String studentName; // Combined first and last name 
private Long studentIdNo; 
private String currentRoom; 
private String preferredRoom; 
private String reason; 
private String applicationStatus; 
private LocalDateTime applicationDate; 
private String studentEmail; // For contact purposes 
// Default constructor 
public RoomChangeApplicationDTO() {} 
// Constructor that converts from entity to DTO 
public RoomChangeApplicationDTO(RoomChangeApplication application, String 
studentName, String studentEmail) { 
this.applicationId = application.getApplicationId(); 
this.userId = application.getUserId(); 
this.studentName = studentName; 
this.studentIdNo = application.getStudentIdNo(); 
this.currentRoom = application.getCurrentRoom(); 
this.preferredRoom = application.getPreferredRoom(); 
this.reason = application.getReason(); 
this.applicationStatus = application.getApplicationStatus(); 
this.applicationDate = application.getApplicationDate(); 
this.studentEmail = studentEmail; 
    } 
// Complete getters and setters 
public Long getApplicationId() { 
    return applicationId; 
} 

public void setApplicationId(Long applicationId) { 
    this.applicationId = applicationId; 
} 

public Long getUserId() { 
    return userId; 
} 

public void setUserId(Long userId) { 
    this.userId = userId; 
} 

public String getStudentName() { 
    return studentName; 
} 

public void setStudentName(String studentName) { 
    this.studentName = studentName; 
} 

public Long getStudentIdNo() { 
    return studentIdNo; 
} 

public void setStudentIdNo(Long studentIdNo) { 
    this.studentIdNo = studentIdNo; 
} 

public String getCurrentRoom() { 
    return currentRoom; 
} 

public void setCurrentRoom(String currentRoom) { 
    this.currentRoom = currentRoom; 
} 

public String getPreferredRoom() { 
    return preferredRoom; 
} 

public void setPreferredRoom(String preferredRoom) { 
    this.preferredRoom = preferredRoom; 
}

 public String getReason() { return reason; }

public void setReason(String reason) { 
    this.reason = reason; 
} 

public String getApplicationStatus() { 
    return applicationStatus; 
} 

public void setApplicationStatus(String applicationStatus) { 
    this.applicationStatus = applicationStatus; 
} 

public LocalDateTime getApplicationDate() { 
    return applicationDate; 
} 

public void setApplicationDate(LocalDateTime applicationDate) { 
    this.applicationDate = applicationDate; 
} 

public String getStudentEmail() { 
    return studentEmail; 
} 

public void setStudentEmail(String studentEmail) { 
    this.studentEmail = studentEmail; 
} 
    
}
