package com.schoolsystem.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Ensures existing PostgreSQL database tables allow nullable class_id for general/school-wide exams.
 */
@Component
@Order(1)
public class DatabaseMigrationRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseMigrationRunner.class);
    private final JdbcTemplate jdbcTemplate;

    public DatabaseMigrationRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE exams ALTER COLUMN class_id DROP NOT NULL");
            log.info("Database migration: successfully dropped NOT NULL constraint on exams.class_id");
        } catch (Exception e) {
            log.debug("exams.class_id constraint modification skipped or already nullable: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE exam_schedules ALTER COLUMN class_id DROP NOT NULL");
            log.info("Database migration: successfully dropped NOT NULL constraint on exam_schedules.class_id");
        } catch (Exception e) {
            log.debug("exam_schedules.class_id constraint modification skipped or already nullable: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE exam_schedules ALTER COLUMN subject_id DROP NOT NULL");
            log.info("Database migration: successfully dropped NOT NULL constraint on exam_schedules.subject_id");
        } catch (Exception e) {
            log.debug("exam_schedules.subject_id constraint modification skipped or already nullable: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE exam_schedules ADD COLUMN IF NOT EXISTS custom_subject_name VARCHAR(150)");
            log.info("Database migration: successfully ensured custom_subject_name column exists on exam_schedules");
        } catch (Exception e) {
            log.debug("exam_schedules.custom_subject_name column addition skipped: {}", e.getMessage());
        }
    }
}
