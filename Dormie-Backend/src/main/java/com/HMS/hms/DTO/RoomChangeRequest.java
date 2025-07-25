package com.HMS.hms.DTO;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


public class RoomChangeRequest {
  

    @NotBlank(message = "Preferred room cannot be blank")
    private String preferredRoom;

    @NotBlank(message = "Reason for change cannot be blank")
    @Size(max = 1000, message = "Reason must not exceed 1000 characters")
    private String reason;

    public RoomChangeRequest() {
    }

    public RoomChangeRequest( String preferredRoom, String reason) {
        this.preferredRoom = preferredRoom;
        this.reason = reason;
    }

    // Getters and Setters
    public String getPreferredRoom() {
        return preferredRoom;
    }

    public void setPreferredRoom(String preferredRoom) {
        this.preferredRoom = preferredRoom;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }


    public boolean isValid() {
        return preferredRoom != null && !preferredRoom.trim().isEmpty() &&
               reason != null && !reason.trim().isEmpty() &&
               reason.length() <= 1000;
    }

    public String toString() {
        return "RoomChangeRequest{" +
                "preferredRoom='" + preferredRoom + '\'' +
                ", reason='" + reason + '\'' +
                '}';
            }
}
