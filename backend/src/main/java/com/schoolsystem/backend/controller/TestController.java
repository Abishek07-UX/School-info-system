package com.schoolsystem.backend.controller;

import com.schoolsystem.backend.dto.response.ApiResponse;
import com.schoolsystem.backend.exception.ResourceNotFoundException;
import com.schoolsystem.backend.security.CurrentUser;
import com.schoolsystem.backend.security.UserPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/me")
    public ApiResponse<Map<String, Object>> whoAmI(@CurrentUser UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new ResourceNotFoundException("USER_NOT_FOUND", "Authenticated with Clerk, but no matching staff account found");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("id", currentUser.getId());
        result.put("clerkId", currentUser.getClerkId());
        result.put("email", currentUser.getEmail());
        result.put("role", currentUser.getRole());

        return ApiResponse.success(result, "Current authenticated user details");
    }
}