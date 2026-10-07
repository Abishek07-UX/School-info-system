package com.schoolsystem.backend.security.clerk;

import com.schoolsystem.backend.user.model.UserStatus;
import com.schoolsystem.backend.user.repository.UserRepository;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Component
public class ClerkJwtAuthConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    private final UserRepository userRepository;

    public ClerkJwtAuthConverter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        String clerkId = jwt.getSubject(); // the "sub" claim = Clerk's user id

        // Deactivated accounts keep their login but get no role, so every role-protected
        // endpoint answers 403 while /api/users/me still reports their status.
        return userRepository.findByClerkId(clerkId)
                .filter(user -> user.getStatus() != UserStatus.INACTIVE)
                .map(user -> (Collection<GrantedAuthority>) List.<GrantedAuthority>of(
                        new SimpleGrantedAuthority("ROLE_" + (user.getRole() != null ? user.getRole().name() : "PENDING"))
                ))
                .orElse(Collections.emptyList()); // valid login, but no staff role assigned yet
    }
}