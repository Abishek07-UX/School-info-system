package com.schoolsystem.backend.user;

import com.schoolsystem.backend.user.model.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class UserHierarchyTest {

    private final UserFactory userFactory = new UserFactory();

    @Nested
    @DisplayName("Inheritance and Polymorphism Tests")
    class InheritanceAndPolymorphism {

        @Test
        @DisplayName("AdminUser should inherit from User and provide Admin permissions")
        void testAdminUser() {
            User admin = userFactory.createUser(UserRole.ADMIN);

            assertInstanceOf(User.class, admin);
            assertInstanceOf(AdminUser.class, admin);
            assertEquals(UserRole.ADMIN, admin.getRole());
            assertEquals("Administrator", admin.getRoleDisplayName());
            assertTrue(admin.getPermissions().contains("ALL_ACCESS"));
            assertTrue(admin.getPermissions().contains("USER_MANAGEMENT"));
            assertTrue(admin.canAccessModule("ANY_MODULE"));
        }

        @Test
        @DisplayName("PrincipalUser should provide Principal permissions and access rules")
        void testPrincipalUser() {
            User principal = userFactory.createUser(UserRole.PRINCIPAL);

            assertInstanceOf(User.class, principal);
            assertInstanceOf(PrincipalUser.class, principal);
            assertEquals(UserRole.PRINCIPAL, principal.getRole());
            assertEquals("Principal", principal.getRoleDisplayName());
            assertTrue(principal.getPermissions().contains("VIEW_ALL_REPORTS"));
            assertTrue(principal.canAccessModule("ACADEMICS"));
            assertFalse(principal.canAccessModule("USER_ADMINISTRATION"));
        }

        @Test
        @DisplayName("TeacherUser should provide Teacher permissions and access rules")
        void testTeacherUser() {
            User teacher = userFactory.createUser(UserRole.TEACHER);

            assertInstanceOf(User.class, teacher);
            assertInstanceOf(TeacherUser.class, teacher);
            assertEquals(UserRole.TEACHER, teacher.getRole());
            assertEquals("Teacher", teacher.getRoleDisplayName());
            assertTrue(teacher.getPermissions().contains("ATTENDANCE_RECORD"));
            assertTrue(teacher.getPermissions().contains("MARKS_ENTER"));
            assertTrue(teacher.canAccessModule("ATTENDANCE"));
            assertTrue(teacher.canAccessModule("ACADEMICS"));
            assertFalse(teacher.canAccessModule("FINANCE"));
        }

        @Test
        @DisplayName("FinanceStaffUser should provide Finance permissions and access rules")
        void testFinanceStaffUser() {
            User finance = userFactory.createUser(UserRole.FINANCE_STAFF);

            assertInstanceOf(User.class, finance);
            assertInstanceOf(FinanceStaffUser.class, finance);
            assertEquals(UserRole.FINANCE_STAFF, finance.getRole());
            assertEquals("Finance Staff", finance.getRoleDisplayName());
            assertTrue(finance.getPermissions().contains("FEES_MANAGE"));
            assertTrue(finance.getPermissions().contains("PAYMENTS_RECORD"));
            assertTrue(finance.canAccessModule("FINANCE"));
            assertFalse(finance.canAccessModule("ACADEMICS"));
        }

        @Test
        @DisplayName("PendingUser should have no permissions and restricted access")
        void testPendingUser() {
            User pending = userFactory.createUser(UserRole.PENDING);

            assertInstanceOf(User.class, pending);
            assertInstanceOf(PendingUser.class, pending);
            assertEquals(UserRole.PENDING, pending.getRole());
            assertEquals("Pending / Unassigned", pending.getRoleDisplayName());
            assertTrue(pending.getPermissions().isEmpty());
            assertFalse(pending.canAccessModule("STUDENTS"));
        }

        @Test
        @DisplayName("Polymorphic invocation across a heterogeneous collection of Users")
        void testPolymorphicList() {
            List<User> staffList = List.of(
                    userFactory.createUser(UserRole.ADMIN),
                    userFactory.createUser(UserRole.TEACHER),
                    userFactory.createUser(UserRole.FINANCE_STAFF)
            );

            List<UserRole> roles = staffList.stream()
                    .map(User::getRole)
                    .toList();

            assertEquals(List.of(UserRole.ADMIN, UserRole.TEACHER, UserRole.FINANCE_STAFF), roles);
        }
    }

    @Nested
    @DisplayName("Encapsulation & Validation Tests")
    class EncapsulationTests {

        @Test
        @DisplayName("getFullName returns combined formatted name or placeholder")
        void testFullName() {
            User teacher = userFactory.createUserWithDetails(
                    UserRole.TEACHER,
                    "clerk_123",
                    "jane.doe@school.com",
                    "Jane",
                    "Doe",
                    "0771234567",
                    "123 Main St",
                    "199012345678",
                    UserStatus.ACTIVE
            );

            assertEquals("Jane Doe", teacher.getFullName());

            teacher.setFirstName(null);
            teacher.setLastName(null);
            assertEquals("Name Not Provided", teacher.getFullName());
        }

        @Test
        @DisplayName("isProfileComplete accurately validates 12-digit and 9+V NIC formats and 10-digit phone")
        void testProfileCompletion() {
            // 1. Valid with 12-digit NIC and 10-digit phone
            User user12Digit = userFactory.createUserWithDetails(
                    UserRole.TEACHER,
                    "clerk_123",
                    "jane.doe@school.com",
                    "Jane",
                    "Doe",
                    "0771234567",
                    "123 Main St",
                    "199012345678",
                    UserStatus.ACTIVE
            );
            assertTrue(user12Digit.isProfileComplete());

            // 2. Valid with 9-digit + V NIC
            User user9DigitV = userFactory.createUserWithDetails(
                    UserRole.TEACHER,
                    "clerk_124",
                    "john.doe@school.com",
                    "John",
                    "Doe",
                    "0712345678",
                    "456 High St",
                    "901234567V",
                    UserStatus.ACTIVE
            );
            assertTrue(user9DigitV.isProfileComplete());

            // 3. Invalid phone (9 digits or letters or symbols)
            user12Digit.setPhoneNumber("077123456");
            assertFalse(user12Digit.isProfileComplete());

            user12Digit.setPhoneNumber("077-1234567");
            assertFalse(user12Digit.isProfileComplete());

            user12Digit.setPhoneNumber("07712345678"); // 11 digits
            assertFalse(user12Digit.isProfileComplete());

            user12Digit.setPhoneNumber("0771234567"); // restored valid phone

            // 4. Invalid NIC (11 digits or wrong character)
            user12Digit.setNicNumber("19901234567"); // 11 digits
            assertFalse(user12Digit.isProfileComplete());

            user12Digit.setNicNumber("901234567X"); // letter X instead of V
            assertFalse(user12Digit.isProfileComplete());

            // 5. Placeholder email
            user12Digit.setNicNumber("199012345678");
            user12Digit.setEmail("clerk_123@placeholder.com");
            assertFalse(user12Digit.isProfileComplete());
        }

        @Test
        @DisplayName("updateProfileDetails trims, normalizes, and formats NIC to uppercase")
        void testUpdateProfileDetails() {
            User user = userFactory.createUser(UserRole.TEACHER);

            // User passes lowercase 'v' for NIC
            user.updateProfileDetails("  Alice ", " Smith  ", " 0712345678 ", " 45 Park Lane ", " 951234567v ");

            assertEquals("Alice", user.getFirstName());
            assertEquals("Smith", user.getLastName());
            assertEquals("0712345678", user.getPhoneNumber());
            assertEquals("45 Park Lane", user.getAddress());
            assertEquals("951234567V", user.getNicNumber()); // Formatted to uppercase 'V'
        }

        @Test
        @DisplayName("changeStatus encapsulates status changes")
        void testChangeStatus() {
            User user = userFactory.createUser(UserRole.TEACHER);
            assertEquals(UserStatus.ACTIVE, user.getStatus());

            user.changeStatus(UserStatus.INACTIVE);
            assertEquals(UserStatus.INACTIVE, user.getStatus());
        }
    }

    @Nested
    @DisplayName("UserRole and UserStatus Parsing Tests")
    class EnumParsingTests {

        @Test
        @DisplayName("UserRole.fromString correctly parses valid and invalid role names")
        void testRoleParsing() {
            assertEquals(UserRole.ADMIN, UserRole.fromString("admin"));
            assertEquals(UserRole.ADMIN, UserRole.fromString("ADMIN"));
            assertEquals(UserRole.TEACHER, UserRole.fromString("teacher"));
            assertEquals(UserRole.FINANCE_STAFF, UserRole.fromString("FINANCE_STAFF"));
            assertEquals(UserRole.PENDING, UserRole.fromString(null));
            assertEquals(UserRole.PENDING, UserRole.fromString(""));

            assertThrows(IllegalArgumentException.class, () -> UserRole.fromString("INVALID_ROLE"));
        }

        @Test
        @DisplayName("UserStatus.fromString correctly parses valid and invalid status values")
        void testStatusParsing() {
            assertEquals(UserStatus.ACTIVE, UserStatus.fromString("active"));
            assertEquals(UserStatus.INACTIVE, UserStatus.fromString("INACTIVE"));
            assertEquals(UserStatus.PENDING_APPROVAL, UserStatus.fromString("pending_approval"));
            assertEquals(UserStatus.ACTIVE, UserStatus.fromString(null));

            assertThrows(IllegalArgumentException.class, () -> UserStatus.fromString("INVALID_STATUS"));
        }
    }
}
