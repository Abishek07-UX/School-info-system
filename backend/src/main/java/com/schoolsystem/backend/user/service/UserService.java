package com.schoolsystem.backend.user.service;

import com.schoolsystem.backend.user.dto.request.UserProfileRequest;
import com.schoolsystem.backend.user.dto.response.UserDTO;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;

public interface UserService {

    UserDTO getOrCreateUser(Jwt jwt);

    UserDTO updateUserProfile(Jwt jwt, UserProfileRequest request);

    List<UserDTO> getAllUsers();

    UserDTO getUserById(Long id);

    UserDTO updateUserRole(Long id, String rawRole);

    UserDTO updateUserStatus(Long id, String rawStatus);

    void deleteUser(Long id);
}
