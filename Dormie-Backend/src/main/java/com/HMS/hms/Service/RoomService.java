package com.HMS.hms.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.HMS.hms.DTO.RoomDTO;
import com.HMS.hms.Repo.RoomRepo;
import com.HMS.hms.Tables.Room;

@Service
public class RoomService {

    @Autowired
    private RoomRepo roomRepo;

    // DTO Conversion Methods
    public RoomDTO convertToDTO(Room room) {
        return new RoomDTO(
                room.getRoomNo(),
                room.getCurrentStudent(),
                room.getTotalCapacity()
        );
    }

    public Room convertFromDTO(RoomDTO roomDTO) {
        Room room = new Room();
        room.setRoomNo(roomDTO.getRoomNo());
        room.setCurrentStudent(roomDTO.getCurrentStudent());
        room.setTotalCapacity(roomDTO.getTotalCapacity());
        return room;
    }

    public Room convertFromCreateDTO(RoomDTO createDTO) {
        return new Room(
                createDTO.getRoomNo(),
                createDTO.getCurrentStudent(),
                createDTO.getTotalCapacity()
        );
    }

    private List<RoomDTO> convertToDTOList(List<Room> rooms) {
        return rooms.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // DTO-based service methods
    public RoomDTO createRoom(RoomDTO roomDTO) {
        Room room = convertFromCreateDTO(roomDTO);
        Room savedRoom = roomRepo.save(room);
        return convertToDTO(savedRoom);
    }

    public List<RoomDTO> getAllRooms() {
        return convertToDTOList(roomRepo.findAll());
    }

    public Optional<RoomDTO> getRoomByRoomNo(String roomNo) {
        Optional<Room> room = roomRepo.findById(roomNo);
        return room.map(this::convertToDTO);
    }

    public List<RoomDTO> getRoomsByCurrentStudent(Integer currentStudent) {
        return convertToDTOList(roomRepo.findByCurrentStudent(currentStudent));
    }

    public List<RoomDTO> getRoomsByTotalCapacity(Integer totalCapacity) {
        return convertToDTOList(roomRepo.findByTotalCapacity(totalCapacity));
    }

    public List<RoomDTO> getAvailableRooms() {
        return convertToDTOList(roomRepo.findAvailableRooms());
    }

    public List<RoomDTO> getFullRooms() {
        return convertToDTOList(roomRepo.findFullRooms());
    }

    public List<RoomDTO> getEmptyRooms() {
        return convertToDTOList(roomRepo.findEmptyRooms());
    }

    public List<RoomDTO> getRoomsByAvailableSpaces(Integer availableSpaces) {
        return convertToDTOList(roomRepo.findByAvailableSpaces(availableSpaces));
    }

    public List<RoomDTO> getRoomsByMinAvailableSpaces(Integer minAvailableSpaces) {
        return convertToDTOList(roomRepo.findByMinAvailableSpaces(minAvailableSpaces));
    }

    public List<RoomDTO> getAllRoomsOrderedByRoomNo() {
        return convertToDTOList(roomRepo.findAllByOrderByRoomNo());
    }

    public List<RoomDTO> getAllRoomsOrderedByAvailableSpaces() {
        return convertToDTOList(roomRepo.findAllOrderByAvailableSpacesDesc());
    }

    public RoomDTO updateRoom(String roomNo, RoomDTO roomDTO) {
        Optional<Room> existingRoomOpt = roomRepo.findById(roomNo);
        if (existingRoomOpt.isPresent()) {
            Room existingRoom = existingRoomOpt.get();
            existingRoom.setCurrentStudent(roomDTO.getCurrentStudent());
            existingRoom.setTotalCapacity(roomDTO.getTotalCapacity());
            Room updatedRoom = roomRepo.save(existingRoom);
            return convertToDTO(updatedRoom);
        }
        return null;
    }

    public RoomDTO updateCurrentStudentCount(String roomNo, Integer currentStudent) {
        Optional<Room> roomOpt = roomRepo.findById(roomNo);
        if (roomOpt.isPresent()) {
            Room room = roomOpt.get();
            room.setCurrentStudent(currentStudent);
            Room updatedRoom = roomRepo.save(room);
            return convertToDTO(updatedRoom);
        }
        return null;
    }

    public RoomDTO incrementCurrentStudentCount(String roomNo) {
        Optional<Room> roomOpt = roomRepo.findById(roomNo);
        if (roomOpt.isPresent()) {
            Room room = roomOpt.get();
            room.setCurrentStudent(room.getCurrentStudent() + 1);
            Room updatedRoom = roomRepo.save(room);
            return convertToDTO(updatedRoom);
        }
        return null;
    }

    public boolean canAccommodateStudent(String roomNo) {
        Optional<Room> roomOpt = roomRepo.findById(roomNo);
        if (roomOpt.isPresent()) {
            Room room = roomOpt.get();
            return room.getCurrentStudent() < room.getTotalCapacity();
        }
        return false;
    }

    public boolean deleteRoom(String roomNo) {
        if (roomRepo.existsById(roomNo)) {
            roomRepo.deleteById(roomNo);
            return true;
        }
        return false;
    }

    public boolean roomExists(String roomNo) {
        return roomRepo.existsById(roomNo);
    }

    // Statistics methods
    public long getTotalRoomsCount() {
        return roomRepo.count();
    }

    public long getAvailableRoomsCount() {
        return roomRepo.countAvailableRooms();
    }

    public long getFullRoomsCount() {
        return roomRepo.countFullRooms();
    }

    // Original entity-based methods (for backward compatibility)
    public List<Room> getAllRoomsEntity() {
        return roomRepo.findAll();
    }

    public Optional<Room> getRoomByRoomNoEntity(String roomNo) {
        return roomRepo.findById(roomNo);
    }

    public Room saveRoom(Room room) {
        return roomRepo.save(room);
    }
}
