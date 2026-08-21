package com.schoolsystem.backend.security;

import com.schoolsystem.backend.model.User;
import com.schoolsystem.backend.repository.UserRepository;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

@Component
public class CurrentUserArgumentResolver implements HandlerMethodArgumentResolver {

    private final UserRepository userRepository;

    public CurrentUserArgumentResolver(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(CurrentUser.class)
                && parameter.getParameterType().equals(UserPrincipal.class);
    }

    @Override
    public Object resolveArgument(MethodParameter parameter,
                                  ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest,
                                  WebDataBinderFactory binderFactory) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication instanceof JwtAuthenticationToken)) {
            return null;
        }

        JwtAuthenticationToken auth = (JwtAuthenticationToken) authentication;
        Jwt jwt = auth.getToken();
        String clerkId = jwt.getSubject();

        if (clerkId == null) {
            return null;
        }

        return userRepository.findByClerkId(clerkId)
                .map(this::toPrincipal)
                .orElse(null);
    }

    private UserPrincipal toPrincipal(User user) {
        return new UserPrincipal(user.getId(), user.getClerkId(), user.getEmail(), user.getRole());
    }
}
