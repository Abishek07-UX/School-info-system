package com.schoolsystem.backend.controller;

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
    public Map<String, Object> whoAmI(@CurrentUser UserPrincipal currentUser) {
        Map<String, Object> result = new HashMap<>();

        if (currentUser == null) {
            result.put("message", "Authenticated with Clerk, but no matching staff account found (currentUser is null)");
            return result;
        }

        result.put("id", currentUser.getId());
        result.put("clerkId", currentUser.getClerkId());
        result.put("email", currentUser.getEmail());
        result.put("role", currentUser.getRole());
        return result;
    }
}