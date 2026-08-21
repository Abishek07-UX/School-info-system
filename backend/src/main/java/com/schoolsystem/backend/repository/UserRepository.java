package com.schoolsystem.backend.repository;

import com.schoolsystem.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByClerkId(String clerkId);

}