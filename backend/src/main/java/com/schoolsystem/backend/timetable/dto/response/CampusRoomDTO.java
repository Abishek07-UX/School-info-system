package com.schoolsystem.backend.timetable.dto.response;

public class CampusRoomDTO {

    private String code;
    private String name;
    private String building;
    private int floor;
    private String type; // 'CLASSROOM', 'LABORATORY', 'COMPUTER_LAB', 'LIBRARY', 'AUDITORIUM'
    private int capacity;

    public CampusRoomDTO() {
    }

    public CampusRoomDTO(String code, String name, String building, int floor, String type, int capacity) {
        this.code = code;
        this.name = name;
        this.building = building;
        this.floor = floor;
        this.type = type;
        this.capacity = capacity;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBuilding() {
        return building;
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    public int getFloor() {
        return floor;
    }

    public void setFloor(int floor) {
        this.floor = floor;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }
}
