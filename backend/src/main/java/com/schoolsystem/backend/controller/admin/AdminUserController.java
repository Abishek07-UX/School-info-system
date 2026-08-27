package com.schoolsystem.backend.controller.admin;

import com.schoolsystem.backend.dto.request.UpdateRoleRequest;
import com.schoolsystem.backend.dto.request.UpdateStatusRequest;
import com.schoolsystem.backend.dto.response.ApiResponse;
import com.schoolsystem.backend.dto.response.UserDTO;
import com.schoolsystem.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ApiResponse<List<UserDTO>> listAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ApiResponse.success(users, "Users retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ApiResponse.success(user, "User retrieved successfully");
    }

    @PatchMapping("/{id}/role")
    public ApiResponse<UserDTO> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request
    ) {
        UserDTO updated = userService.updateUserRole(id, request.getRole());
        return ApiResponse.success(updated, "Role updated to " + updated.getRole() + " successfully");
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<UserDTO> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request
    ) {
        UserDTO updated = userService.updateUserStatus(id, request.getStatus());
        return ApiResponse.success(updated, "Status updated to " + updated.getStatus() + " successfully");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ApiResponse.message("User account deleted successfully");
    }
}
