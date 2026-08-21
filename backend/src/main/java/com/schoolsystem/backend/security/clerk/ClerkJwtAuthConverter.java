package com.schoolsystem.backend.security.clerk;

import com.schoolsystem.backend.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import org.springframework.core.convert.converter.Converter;

@Component
public class ClerkJwtAuthConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    private final UserRepository userRepository;

    public ClerkJwtAuthConverter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        String clerkId = jwt.getSubject(); // the "sub" claim = Clerk's user id

        return userRepository.findByClerkId(clerkId)
                .map(user -> (Collection<GrantedAuthority>) List.<GrantedAuthority>of(
                        new SimpleGrantedAuthority("ROLE_" + user.getRole())
                ))
                .orElse(Collections.emptyList()); // valid login, but no staff role assigned yet
    }
}