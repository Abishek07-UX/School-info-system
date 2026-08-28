package com.schoolsystem.backend.user.repository;

import com.schoolsystem.backend.user.model.User;
import com.schoolsystem.backend.user.model.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByClerkId(String clerkId);

    Optional<User> findByEmail(String email);

    List<User> findByStatus(UserStatus status);

    @Modifying
    @Query(value = "UPDATE users SET role = :role, status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :id", nativeQuery = true)
    void updateRoleAndStatus(@Param("id") Long id, @Param("role") String role, @Param("status") String status);

    @Modifying
    @Query(value = "UPDATE users SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :id", nativeQuery = true)
    void updateStatusOnly(@Param("id") Long id, @Param("status") String status);
}
