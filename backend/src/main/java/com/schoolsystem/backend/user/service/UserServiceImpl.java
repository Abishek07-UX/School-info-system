package com.schoolsystem.backend.user.service;

import com.schoolsystem.backend.common.exception.ResourceNotFoundException;
import com.schoolsystem.backend.user.dto.request.UserProfileRequest;
import com.schoolsystem.backend.user.dto.response.UserDTO;
import com.schoolsystem.backend.user.model.User;
import com.schoolsystem.backend.user.model.UserFactory;
import com.schoolsystem.backend.user.model.UserRole;
import com.schoolsystem.backend.user.model.UserStatus;
import com.schoolsystem.backend.user.repository.UserRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserFactory userFactory;

    public UserServiceImpl(UserRepository userRepository, UserFactory userFactory) {
        this.userRepository = userRepository;
        this.userFactory = userFactory;
    }

    @Override
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
                            if (firstName != null && (existingByEmail.getFirstName() == null || existingByEmail.getFirstName().isBlank())) {
                                existingByEmail.setFirstName(firstName);
                            }
                            if (lastName != null && (existingByEmail.getLastName() == null || existingByEmail.getLastName().isBlank())) {
                                existingByEmail.setLastName(lastName);
                            }
                            return userRepository.save(existingByEmail);
                        }
                    }

                    // Auto-bootstrap first user as ADMIN only if database is completely empty
                    boolean isFirstUser = userRepository.count() == 0;
                    if (isFirstUser) {
                        User newUser = userFactory.createUserWithDetails(
                                UserRole.ADMIN,
                                clerkId,
                                email != null ? email : (clerkId + "@placeholder.com"),
                                firstName,
                                lastName,
                                null, // phoneNumber
                                null, // address
                                null, // nicNumber
                                UserStatus.ACTIVE
                        );
                        return userRepository.save(newUser);
                    }

                    // Do not persist unsubmitted new users into the database
                    return null;
                });

        if (user == null) {
            return null;
        }

        if (email != null && !email.isBlank() && (user.getEmail() == null || user.getEmail().endsWith("@placeholder.com"))) {
            user.setEmail(email);
            if (firstName != null && user.getFirstName() == null) user.setFirstName(firstName);
            if (lastName != null && user.getLastName() == null) user.setLastName(lastName);
            user = userRepository.save(user);
        }

        return new UserDTO(user);
    }

    @Override
    @Transactional
    public UserDTO updateUserProfile(Jwt jwt, UserProfileRequest request) {
        String clerkId = jwt.getSubject();
        String jwtEmail = extractEmail(jwt);

        User user = userRepository.findByClerkId(clerkId)
                .orElseGet(() -> {
                    // Check if an account with this email was pre-registered by an Admin
                    String emailToCheck = (request.getEmail() != null && !request.getEmail().isBlank())
                            ? request.getEmail().trim()
                            : jwtEmail;

                    if (emailToCheck != null && !emailToCheck.isBlank() && !emailToCheck.endsWith("@placeholder.com")) {
                        User existingByEmail = userRepository.findByEmail(emailToCheck).orElse(null);
                        if (existingByEmail != null) {
                            existingByEmail.setClerkId(clerkId);
                            return existingByEmail;
                        }
                    }

                    boolean isFirstUser = userRepository.count() == 0;
                    UserRole initialRole = isFirstUser ? UserRole.ADMIN : UserRole.PENDING;
                    UserStatus initialStatus = isFirstUser ? UserStatus.ACTIVE : UserStatus.PENDING_APPROVAL;

                    User newUser = userFactory.createUser(initialRole);
                    newUser.setClerkId(clerkId);
                    newUser.setStatus(initialStatus);
                    return newUser;
                });

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail().trim());
        } else if (user.getEmail() == null || user.getEmail().isBlank()) {
            user.setEmail(jwtEmail != null ? jwtEmail : (clerkId + "@placeholder.com"));
        }

        user.updateProfileDetails(
                request.getFirstName(),
                request.getLastName(),
                request.getPhoneNumber(),
                request.getAddress(),
                request.getNicNumber()
        );

        User saved = userRepository.save(user);
        return new UserDTO(saved);
    }

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found with id: " + id));
        return new UserDTO(user);
    }

    @Override
    @Transactional
    public UserDTO updateUserRole(Long id, String rawRole) {
        UserRole targetRole = UserRole.fromString(rawRole);

        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("USER_NOT_FOUND", "User not found with id: " + id);
        }

        UserStatus targetStatus = (targetRole == UserRole.PENDING)
                ? UserStatus.PENDING_APPROVAL
                : UserStatus.ACTIVE;

        userRepository.updateRoleAndStatus(id, targetRole.name(), targetStatus.name());

        User updatedUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found with id: " + id));

        return new UserDTO(updatedUser);
    }

    @Override
    @Transactional
    public UserDTO updateUserStatus(Long id, String rawStatus) {
        UserStatus targetStatus = UserStatus.fromString(rawStatus);

        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("USER_NOT_FOUND", "User not found with id: " + id);
        }

        userRepository.updateStatusOnly(id, targetStatus.name());

        User updatedUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found with id: " + id));

        return new UserDTO(updatedUser);
    }

    @Override
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
