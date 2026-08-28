package com.schoolsystem.backend.user.controller;

import com.schoolsystem.backend.common.dto.response.ApiResponse;
import com.schoolsystem.backend.user.dto.request.UserProfileRequest;
import com.schoolsystem.backend.user.dto.response.UserDTO;
import com.schoolsystem.backend.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ApiResponse<UserDTO> getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        UserDTO user = userService.getOrCreateUser(jwt);
        return ApiResponse.success(user, "User profile retrieved successfully");
    }

    @PutMapping("/profile")
    public ApiResponse<UserDTO> updateProfile(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UserProfileRequest request
    ) {
        UserDTO updated = userService.updateUserProfile(jwt, request);
        return ApiResponse.success(updated, "Staff profile details updated successfully");
    }
}
