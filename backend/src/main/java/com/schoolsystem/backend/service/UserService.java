package com.schoolsystem.backend.service;

import com.schoolsystem.backend.dto.request.UserProfileRequest;
import com.schoolsystem.backend.dto.response.UserDTO;
import com.schoolsystem.backend.exception.ResourceNotFoundException;
import com.schoolsystem.backend.model.User;
import com.schoolsystem.backend.repository.UserRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final Set<String> VALID_ROLES = Set.of(
            "ADMIN", "PRINCIPAL", "TEACHER", "FINANCE_STAFF", "PENDING"
    );

    private static final Set<String> VALID_STATUSES = Set.of(
            "ACTIVE", "INACTIVE", "PENDING_APPROVAL"
    );

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public UserDTO getOrCreateUser(Jwt jwt) {
        String clerkId = jwt.getSubject();
        String email = extractEmail(jwt);
        String firstName = jwt.getClaimAsString("first_name");
        String lastName = jwt.getClaimAsString("last_name");

        User user = userRepository.findByClerkId(clerkId)
                .orElseGet(() -> {
                    // Check if an account with this email was pre-registered by an Admin
                    if (email != null && !email.isBlank() && !email.endsWith("@placeholder.com")) {
                        User existingByEmail = userRepository.findByEmail(email).orElse(null);
                        if (existingByEmail != null) {
                            existingByEmail.setClerkId(clerkId);
                            if (firstName != null) existingByEmail.setFirstName(firstName);
                            if (lastName != null) existingByEmail.setLastName(lastName);
                            return userRepository.save(existingByEmail);
                        }
                    }

                    // Auto-bootstrap first user as ADMIN if database is empty
                    boolean isFirstUser = userRepository.count() == 0;
                    String initialRole = isFirstUser ? "ADMIN" : "PENDING";
                    String initialStatus = isFirstUser ? "ACTIVE" : "PENDING_APPROVAL";

                    User newUser = new User(
                            clerkId,
                            email != null ? email : (clerkId + "@placeholder.com"),
                            firstName,
                            lastName,
                            null, // phoneNumber
                            null, // address
                            null, // nicNumber
                            initialRole,
                            initialStatus
                    );
                    return userRepository.save(newUser);
                });

        // If user's email was previously placeholder and we now have a real email in token, update it
        if (email != null && !email.isBlank() && (user.getEmail() == null || user.getEmail().endsWith("@placeholder.com"))) {
            user.setEmail(email);
            if (firstName != null && user.getFirstName() == null) user.setFirstName(firstName);
            if (lastName != null && user.getLastName() == null) user.setLastName(lastName);
            user = userRepository.save(user);
        }

        return new UserDTO(user);
    }

    @Transactional
    public UserDTO updateUserProfile(Jwt jwt, UserProfileRequest request) {
        String clerkId = jwt.getSubject();

        User user = userRepository.findByClerkId(clerkId)
                .orElseGet(() -> {
                    boolean isFirstUser = userRepository.count() == 0;
                    String initialRole = isFirstUser ? "ADMIN" : "PENDING";
                    String initialStatus = isFirstUser ? "ACTIVE" : "PENDING_APPROVAL";

                    User newUser = new User();
                    newUser.setClerkId(clerkId);
                    newUser.setRole(initialRole);
                    newUser.setStatus(initialStatus);
                    return newUser;
                });

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail().trim());
        }
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName().trim());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName().trim());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber().trim());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().trim());
        }
        if (request.getNicNumber() != null) {
            user.setNicNumber(request.getNicNumber().trim().toUpperCase());
        }

        User saved = userRepository.save(user);
        return new UserDTO(saved);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDTO::new)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found with id: " + id));
        return new UserDTO(user);
    }

    @Transactional
    public UserDTO updateUserRole(Long id, String rawRole) {
        String role = rawRole != null ? rawRole.trim().toUpperCase() : "";
        if (!VALID_ROLES.contains(role)) {
            throw new IllegalArgumentException("Invalid role '" + rawRole + "'. Allowed: " + VALID_ROLES);
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found with id: " + id));

        user.setRole(role);
        if ("PENDING".equals(role)) {
            user.setStatus("PENDING_APPROVAL");
        } else {
            user.setStatus("ACTIVE");
        }

        return new UserDTO(userRepository.save(user));
    }

    @Transactional
    public UserDTO updateUserStatus(Long id, String rawStatus) {
        String status = rawStatus != null ? rawStatus.trim().toUpperCase() : "";
        if (!VALID_STATUSES.contains(status)) {
            throw new IllegalArgumentException("Invalid status '" + rawStatus + "'. Allowed: " + VALID_STATUSES);
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found with id: " + id));

        user.setStatus(status);
        return new UserDTO(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("USER_NOT_FOUND", "User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    private String extractEmail(Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        if (email != null && !email.isBlank()) {
            return email;
        }
        String primaryEmail = jwt.getClaimAsString("primary_email_address");
        if (primaryEmail != null && !primaryEmail.isBlank()) {
            return primaryEmail;
        }
        return null;
    }
}
