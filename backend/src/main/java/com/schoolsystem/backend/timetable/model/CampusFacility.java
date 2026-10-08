package com.schoolsystem.backend.timetable.model;

import java.util.ArrayList;
import java.util.List;

public class CampusFacility {

    public record RoomInfo(String code, String name, String building, int floor, String type, int capacity) {}

    public static List<RoomInfo> getAllCampusRooms() {
        List<RoomInfo> rooms = new ArrayList<>();

        // Building E: Primary Wing (Floors 1-3, Halls E-101 to E-305)
        for (int floor = 1; floor <= 3; floor++) {
            for (int roomNum = 1; roomNum <= 5; roomNum++) {
                String code = String.format("E-%d0%d", floor, roomNum);
                rooms.add(new RoomInfo(code, "Class Hall " + code, "Building E", floor, "CLASSROOM", 45));
            }
        }
        rooms.add(new RoomInfo("E-LIB", "Central School Library", "Building E", 1, "LIBRARY", 80));
        rooms.add(new RoomInfo("E-ACT", "Primary Activity Hall", "Building E", 2, "ACTIVITY_ROOM", 60));

        // Building F: Junior Secondary Wing (Floors 1-3, Halls F-101 to F-305)
        for (int floor = 1; floor <= 3; floor++) {
            for (int roomNum = 1; roomNum <= 5; roomNum++) {
                String code = String.format("F-%d0%d", floor, roomNum);
                rooms.add(new RoomInfo(code, "Class Hall " + code, "Building F", floor, "CLASSROOM", 45));
            }
        }
        rooms.add(new RoomInfo("F-SCI", "General Science Lab", "Building F", 1, "LABORATORY", 50));
        rooms.add(new RoomInfo("F-IT-1", "Computer Laboratory 1", "Building F", 2, "COMPUTER_LAB", 45));

        // Building G: Senior Secondary & A/L Wing (Floors 1-3, Halls G-101 to G-305)
        for (int floor = 1; floor <= 3; floor++) {
            for (int roomNum = 1; roomNum <= 5; roomNum++) {
                String code = String.format("G-%d0%d", floor, roomNum);
                rooms.add(new RoomInfo(code, "Class Hall " + code, "Building G", floor, "CLASSROOM", 45));
            }
        }
        rooms.add(new RoomInfo("G-PHY", "Physics Laboratory", "Building G", 1, "LABORATORY", 50));
        rooms.add(new RoomInfo("G-CHEM", "Chemistry Laboratory", "Building G", 2, "LABORATORY", 50));
        rooms.add(new RoomInfo("G-BIO", "Biology Laboratory", "Building G", 2, "LABORATORY", 50));
        rooms.add(new RoomInfo("G-IT-2", "Computer Laboratory 2", "Building G", 3, "COMPUTER_LAB", 45));
        rooms.add(new RoomInfo("G-AUD", "Main Examination Auditorium", "Building G", 1, "AUDITORIUM", 250));

        return rooms;
    }

    /**
     * Determines the default home classroom code and building for a grade level.
     * Grades 1-5  -> Building E
     * Grades 6-9  -> Building F
     * Grades 10-13 -> Building G
     */
    public static String getDefaultRoomForClass(int gradeLevel, String className) {
        String sectionLetter = "A";
        if (className != null && className.contains("-")) {
            String[] parts = className.split("-");
            if (parts.length > 1) {
                sectionLetter = parts[1].trim();
            }
        }
        int sectionOffset = switch (sectionLetter.toUpperCase()) {
            case "B" -> 2;
            case "C" -> 3;
            default -> 1;
        };

        if (gradeLevel >= 1 && gradeLevel <= 5) {
            int floor = Math.min(3, ((gradeLevel - 1) / 2) + 1);
            return String.format("E-%d0%d", floor, ((gradeLevel % 2) * 2) + sectionOffset);
        } else if (gradeLevel >= 6 && gradeLevel <= 9) {
            int floor = Math.min(3, ((gradeLevel - 6) / 2) + 1);
            return String.format("F-%d0%d", floor, sectionOffset);
        } else {
            int floor = Math.min(3, (gradeLevel - 10) + 1);
            return String.format("G-%d0%d", floor, sectionOffset);
        }
    }

    public static String getBuildingForGrade(int gradeLevel) {
        if (gradeLevel <= 5) return "Building E (Primary Wing)";
        if (gradeLevel <= 9) return "Building F (Junior Secondary)";
        return "Building G (Senior Secondary & A/L)";
    }
}
