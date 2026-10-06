package com.schoolsystem.backend.teacher.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;

@Component
public class TeacherSyncDatabaseInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(TeacherSyncDatabaseInitializer.class);

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    public TeacherSyncDatabaseInitializer(JdbcTemplate jdbcTemplate, DataSource dataSource) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
    }

    @Override
    public void run(ApplicationArguments args) {
        try (Connection conn = dataSource.getConnection()) {
            String dbProductName = conn.getMetaData().getDatabaseProductName();
            if (dbProductName == null || !dbProductName.toLowerCase().contains("postgresql")) {
                log.info("Skipping PostgreSQL trigger initialization on non-PostgreSQL DB: {}", dbProductName);
                return;
            }

            log.info("Ensuring teachers table and PostgreSQL synchronization triggers exist...");

            // 1. Ensure table exists
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS teachers (
                    id BIGINT PRIMARY KEY,
                    active BOOLEAN NOT NULL DEFAULT true,
                    assigned_class VARCHAR(255),
                    email VARCHAR(255) NOT NULL UNIQUE,
                    employment_status VARCHAR(255),
                    first_name VARCHAR(255) NOT NULL,
                    last_name VARCHAR(255) NOT NULL,
                    phone_number VARCHAR(255),
                    qualification VARCHAR(255),
                    subject VARCHAR(255),
                    teaching_history VARCHAR(255),
                    availability VARCHAR(255),
                    performance_notes VARCHAR(255)
                );
            """);

            // 2. Trigger function for users table
            jdbcTemplate.execute("""
                CREATE OR REPLACE FUNCTION sync_teacher_record()
                RETURNS TRIGGER AS $$
                DECLARE
                    v_assigned_classes TEXT;
                    v_assigned_subjects TEXT;
                BEGIN
                    IF (TG_OP = 'DELETE') THEN
                        DELETE FROM teachers WHERE id = OLD.id;
                        RETURN OLD;
                    END IF;

                    IF NEW.role = 'TEACHER' THEN
                        SELECT 
                            COALESCE(string_agg(DISTINCT c.name, ', '), 'Not Assigned'),
                            COALESCE(string_agg(DISTINCT s.name, ', '), 'Not Assigned')
                        INTO v_assigned_classes, v_assigned_subjects
                        FROM teacher_subjects ts
                        LEFT JOIN classes c ON ts.class_id = c.id
                        LEFT JOIN subjects s ON ts.subject_id = s.id
                        WHERE ts.teacher_id = NEW.id;

                        INSERT INTO teachers (
                            id, active, assigned_class, email, employment_status,
                            first_name, last_name, phone_number, qualification,
                            subject, teaching_history, availability, performance_notes
                        ) VALUES (
                            NEW.id,
                            (NEW.status = 'ACTIVE'),
                            COALESCE(v_assigned_classes, 'Not Assigned'),
                            NEW.email,
                            COALESCE(NEW.status::text, 'ACTIVE'),
                            COALESCE(NEW.first_name, 'Teacher'),
                            COALESCE(NEW.last_name, 'Faculty'),
                            NEW.phone_number,
                            'Qualified Faculty',
                            COALESCE(v_assigned_subjects, 'Not Assigned'),
                            'Appointed teaching faculty',
                            'Full-time (Mon-Fri)',
                            'Good standing'
                        )
                        ON CONFLICT (id) DO UPDATE SET
                            active = EXCLUDED.active,
                            email = EXCLUDED.email,
                            employment_status = EXCLUDED.employment_status,
                            first_name = EXCLUDED.first_name,
                            last_name = EXCLUDED.last_name,
                            phone_number = EXCLUDED.phone_number,
                            assigned_class = CASE 
                                WHEN EXCLUDED.assigned_class <> 'Not Assigned' THEN EXCLUDED.assigned_class 
                                ELSE teachers.assigned_class 
                            END,
                            subject = CASE 
                                WHEN EXCLUDED.subject <> 'Not Assigned' THEN EXCLUDED.subject 
                                ELSE teachers.subject 
                            END;
                    ELSE
                        IF (TG_OP = 'UPDATE' AND OLD.role = 'TEACHER') THEN
                            DELETE FROM teachers WHERE id = NEW.id;
                        END IF;
                    END IF;

                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            """);

            jdbcTemplate.execute("""
                DROP TRIGGER IF EXISTS trg_sync_teachers_from_users ON users;
                CREATE TRIGGER trg_sync_teachers_from_users
                AFTER INSERT OR UPDATE OR DELETE ON users
                FOR EACH ROW
                EXECUTE FUNCTION sync_teacher_record();
            """);

            // 3. Trigger for teacher_subjects table
            jdbcTemplate.execute("""
                CREATE OR REPLACE FUNCTION sync_teacher_subjects_to_teachers()
                RETURNS TRIGGER AS $$
                DECLARE
                    v_teacher_id BIGINT;
                    v_assigned_classes TEXT;
                    v_assigned_subjects TEXT;
                BEGIN
                    IF (TG_OP = 'DELETE') THEN
                        v_teacher_id := OLD.teacher_id;
                    ELSE
                        v_teacher_id := NEW.teacher_id;
                    END IF;

                    SELECT 
                        COALESCE(string_agg(DISTINCT c.name, ', '), 'Not Assigned'),
                        COALESCE(string_agg(DISTINCT s.name, ', '), 'Not Assigned')
                    INTO v_assigned_classes, v_assigned_subjects
                    FROM teacher_subjects ts
                    LEFT JOIN classes c ON ts.class_id = c.id
                    LEFT JOIN subjects s ON ts.subject_id = s.id
                    WHERE ts.teacher_id = v_teacher_id;

                    UPDATE teachers
                    SET 
                        assigned_class = COALESCE(v_assigned_classes, 'Not Assigned'),
                        subject = COALESCE(v_assigned_subjects, 'Not Assigned')
                    WHERE id = v_teacher_id;

                    RETURN NULL;
                END;
                $$ LANGUAGE plpgsql;
            """);

            jdbcTemplate.execute("""
                DROP TRIGGER IF EXISTS trg_sync_teacher_subjects ON teacher_subjects;
                CREATE TRIGGER trg_sync_teacher_subjects
                AFTER INSERT OR UPDATE OR DELETE ON teacher_subjects
                FOR EACH ROW
                EXECUTE FUNCTION sync_teacher_subjects_to_teachers();
            """);

            // 4. Initial Sync pass from users into teachers
            jdbcTemplate.execute("""
                INSERT INTO teachers (
                    id, active, assigned_class, email, employment_status,
                    first_name, last_name, phone_number, qualification,
                    subject, teaching_history, availability, performance_notes
                )
                SELECT 
                    u.id,
                    (u.status = 'ACTIVE'),
                    COALESCE(string_agg(DISTINCT c.name, ', '), 'Not Assigned'),
                    u.email,
                    COALESCE(u.status::text, 'ACTIVE'),
                    COALESCE(u.first_name, 'Teacher'),
                    COALESCE(u.last_name, 'Faculty'),
                    u.phone_number,
                    'Qualified Faculty',
                    COALESCE(string_agg(DISTINCT s.name, ', '), 'Not Assigned'),
                    'Appointed teaching faculty',
                    'Full-time (Mon-Fri)',
                    'Good standing'
                FROM users u
                LEFT JOIN teacher_subjects ts ON ts.teacher_id = u.id
                LEFT JOIN classes c ON ts.class_id = c.id
                LEFT JOIN subjects s ON ts.subject_id = s.id
                WHERE u.role = 'TEACHER'
                GROUP BY u.id, u.status, u.email, u.first_name, u.last_name, u.phone_number
                ON CONFLICT (id) DO UPDATE SET
                    active = EXCLUDED.active,
                    email = EXCLUDED.email,
                    employment_status = EXCLUDED.employment_status,
                    first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name,
                    phone_number = EXCLUDED.phone_number,
                    assigned_class = EXCLUDED.assigned_class,
                    subject = EXCLUDED.subject;
            """);

            log.info("Teachers table synchronization initializer finished successfully.");
        } catch (Exception e) {
            log.warn("Could not initialize PostgreSQL teacher sync triggers: {}", e.getMessage());
        }
    }
}
