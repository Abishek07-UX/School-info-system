# Product Requirements Document (PRD)
## Web-Based School Information System

---

## 1. Introduction

This document describes the plan for a **Web-Based School Information System** — a centralized platform that allows school staff (administrators and teachers) to manage the day-to-day academic and administrative operations of a school in one place, instead of relying on scattered spreadsheets, paper records, and manual processes.

This is a working plan intended to give the whole team a shared understanding of what we are building, why we are building it, and how the different parts of the system connect to one another.

---

## 2. Problem Statement

Most schools still manage student records, attendance, exams, fees, and timetables using disconnected tools — paper registers, Excel sheets, or separate systems that don't talk to each other. This leads to:

- Duplicate or inconsistent student and teacher data
- Time wasted searching for records
- Manual, error-prone attendance and grade calculation
- Difficulty tracking outstanding fee payments
- Timetable conflicts (teachers double-booked, rooms overlapping)

Our system aims to bring all of this into a single, connected platform.

---

## 3. Goal

To design and build a **staff-facing web system** that centralizes student, teacher, attendance, academic, financial, and administrative data for a school — reducing manual work, minimizing errors, and giving staff a single reliable source of truth.

### Objectives
- Store all student and teacher records in one place, accessible to authorized staff
- Make attendance tracking and reporting fast and accurate
- Simplify exam mark entry and report card generation
- Keep fee records and outstanding payments visible and up to date
- Allow administrators to manage users, classes, subjects, and timetables without conflicts

---

## 4. Who Will Use This System

This system is designed **only for school staff** — it is not a student-facing or parent-facing platform.

| Role | Description |
|---|---|
| **Administrator** | Full access. Manages users, classes, subjects, timetables, and oversees all modules. |
| **Principal** | Oversight access — views records and reports across all modules (students, teachers, attendance, academics, finance) for school-wide monitoring. |
| **Teacher** | Manages their assigned classes/subjects — records attendance, enters marks, views their own timetable and student lists. |
| **Finance Staff** | Manages the Finance module — sets up fee structures, records payments already collected, and generates financial reports. |

Students and parents will **not** log into or interact with the system directly.

---

## 5. Scope

### In Scope
- Student record management (registration, updates, profiles, search)
- Teacher record management (details, subject assignment, profiles)
- Daily attendance tracking for both students and teachers, with reports and history
- Exam mark entry, grade calculation, report card generation, and performance tracking
- Fee structure management and **manual recording** of payments already collected offline
- Outstanding/overdue payment tracking and financial reporting
- User and role management (Administrator, Principal, Teacher, and Finance Staff accounts and permissions)
- Class, section, and subject setup
- Timetable creation with conflict checking (no teacher or room double-booked)
- Email notifications for key events (e.g., low attendance alerts, overdue fee reminders, exam schedule updates)
- Internal ticket raising and tracking system for staff to report, assign, and resolve day-to-day operational issues (e.g., data correction requests, technical problems, administrative queries)

### Out of Scope
- Student or parent self-service portals/logins
- Online/gateway-based fee payment collection (system only *records* payments, doesn't *collect* them)
- SMS or push notifications
- Mobile applications (web only)
- Biometric or hardware-based attendance devices
- Library, transport, hostel, or staff payroll/HR management
- Support for multiple schools or branches

---

## 6. Grading Approach

Teachers will enter **numeric marks** per subject per exam. The system will automatically convert these marks into **letter grades** based on a predefined grading scale (e.g., 75–100 = A), so staff don't need to calculate grades manually.

---

## 7. Core Features

The system is built around **seven core modules**. Each module is described below along with its sub-functions and how it connects to the rest of the system.

---

### 7.1 Student Management

The foundation of the system — every other module (attendance, exams, finance) refers back to the student records created here.

- **Register Students** – Creates a new, unique student record (name, DOB, contact details, guardian info, class/section) when a student is admitted.
- **Update Student Details** – Edits existing information such as address, contact number, class promotion, or guardian details as circumstances change.
- **Manage Student Profiles** – A single, centralized page per student showing their personal details, academic history, and enrollment status at a glance.
- **Search Student Records** – Lets staff quickly find a student using filters like name, ID, class, or admission year, instead of manually browsing lists.

**How it connects:** Every attendance entry, exam mark, and fee payment in the system is linked back to a student record created here. Without this module, no other module has anyone to record data *about*.

---

### 7.2 Teacher Management

Maintains staff records and links teachers to the classes and subjects they are responsible for.

- **Manage Teacher Information** – Stores and maintains personal details, qualifications, and employment records for each teacher.
- **Assign Subjects** – Allocates specific subjects and classes to teachers based on expertise and availability.
- **Maintain Teacher Profiles** – A running record of each teacher's teaching history and subjects handled over time.
- **View Teacher Records** – Lets administrators view individual or collective teacher data for reference or reporting.

**How it connects:** Subject assignments made here determine which teacher can record attendance and enter marks for which class in the Attendance and Academic modules, and feed directly into Timetable creation in Administration.

---

### 7.3 Attendance Management

Tracks daily presence for both students and teachers.

- **Record Student Attendance** – Teachers mark students present, absent, or late for each class session.
- **Record Teacher Attendance** – Tracks teacher check-in/check-out or daily presence for administrative monitoring.
- **Generate Attendance Reports** – Summarizes attendance into daily, monthly, or term-wise reports.
- **View Attendance History** – Retrieves past attendance records for a specific student, teacher, or class over a chosen period.

**How it connects:** Uses the class/section structure and teacher-subject assignments set up in Administration and Teacher Management. Attendance trends can also feed into the performance insights generated in Academic Management.

---

### 7.4 Academic and Examination Management

Handles everything related to testing and measuring student progress.

- **Enter Marks and Grades** – Teachers input subject-wise exam scores; the system converts these into letter grades automatically.
- **Manage Examinations** – Handles exam scheduling, timetable creation, and exam-related configuration.
- **Generate Report Cards** – Automatically compiles a student's marks and grades into a formatted report card/transcript.
- **Track Student Performance** – Analyzes marks over time to highlight improvement trends or areas needing attention.

**How it connects:** Pulls student identity from Student Management and subject/teacher assignments from Teacher Management. Report cards and performance tracking are only possible because marks are tied to the correct student and subject.

---

### 7.5 Finance Management

Keeps track of school fees and payment status per student.

- **Manage School Fees** – Defines fee structures per class/term and manages related configurations.
- **Record Payments** – Logs student fee payments already collected offline (method, date, amount).
- **Track Outstanding Payments** – Flags students with unpaid or partially paid fees.
- **Generate Financial Reports** – Summarizes collected fees, pending dues, and overall financial status for administrative review.

**How it connects:** Every payment record is tied to a specific student from Student Management and a fee structure tied to their class. Outstanding payment flags give administrators a clear picture without cross-checking separate records.

---

### 7.6 Administration Management

The control center of the system — sets up the structure that every other module depends on.

- **User & Role Management** – Creates, edits, or deactivates staff accounts and assigns roles (Administrator, Principal, Teacher, or Finance Staff) with appropriate permissions.
- **Class & Section Management** – Creates classes (e.g., Grade 10) and sections (10-A, 10-B), assigns class teachers, and sets capacity.
- **Subject Management** – Defines subjects and links them to classes/grades and the teachers who will teach them.
- **Timetable/Schedule Management** – Builds weekly class timetables, assigning periods to subjects and teachers while avoiding teacher double-booking and room conflicts.
- **Notification Management** – Sends automated email notifications for key events, such as low attendance alerts, overdue fee reminders, and exam schedule updates.

**How it connects:** This module defines the "skeleton" of the school — classes, sections, subjects, and staff accounts — that every other module (Student, Teacher, Attendance, Academic, Finance) relies on to function correctly.

---

### 7.7 Ticket Management

A dedicated internal support module that lets staff raise, track, and resolve day-to-day operational issues (e.g., a data correction request, a technical problem, or an administrative query) without the delay of informal emails or verbal requests.

- **Ticket Registration** – Any staff member logs a new ticket describing the issue or request, with details such as category, description, and priority.
- **Ticket Monitoring & Tracking** – Lets staff and administrators follow a ticket's status (open, in progress, resolved, closed) from creation to close-out.
- **Ticket Modification** – Allows the raiser or an administrator to update ticket details (e.g., add information, change priority) while it is still open.
- **Ticket Assignment & Management** – Administrators assign tickets to the appropriate staff member or team responsible for handling them, and oversee ticket load and turnaround.
- **Ticket Resolution** – The assigned staff member records the resolution taken and closes the ticket, creating a record for future reference.

**How it connects:** Tickets can be raised by any staff role about any part of the system (e.g., a Teacher flagging an incorrect student record, or a Finance Staff member reporting a payment discrepancy), so this module sits alongside the other six as a cross-cutting support layer rather than feeding into a single module. Every ticket is linked to the staff account (from Administration Management) that raised it, and — where relevant — can reference a record from another module (e.g., a specific student profile).

---

## 8. How the Modules Work Together

Although presented as six separate modules, they form one connected system:

1. **Administration** sets up the school's structure — classes, sections, subjects, and staff accounts.
2. **Student Management** and **Teacher Management** populate that structure with real people — students enrolled in classes, and teachers assigned to subjects.
3. **Attendance Management** and **Academic Management** run on top of that structure daily/termly — recording presence and performance for each student in each class.
4. **Finance Management** tracks each student's fee obligations and payments, based on their class and term.
5. All of this comes together in each student's **profile**, giving staff a single place to see a student's personal details, attendance record, academic performance, and payment status — instead of checking four different systems.
6. **Ticket Management** runs alongside all of this as a support layer — any staff member, in any module, can raise a ticket when something needs attention (a data error, a technical issue, an administrative request), and administrators track it through to resolution.

In short: **Administration builds the structure → Student/Teacher Management populate it → Attendance/Academic/Finance record activity within it → Ticket Management lets staff flag and resolve issues that come up along the way.**

---

## 9. Technology Stack

This section outlines the technologies planned for building the system.

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React.js | Builds the staff-facing user interface — dashboards, forms, and reports for all modules |
| **Backend** | Spring Boot (Java) | Handles business logic, REST APIs, and role-based access control across modules |
| **Database** | Neon DB (Cloud-hosted PostgreSQL) | Stores all persistent data — student, teacher, attendance, academic, finance, and ticket records |
| **Authentication** | Clerk | Manages staff login, session handling, and role-based authentication |
| **API Communication** | REST (JSON) | Enables communication between the React frontend and Spring Boot backend |
| **Notifications** | In-app notifications | Displays alerts within the system for attendance, fees, exams, and ticket updates |
| **Version Control** | Git & GitHub | Tracks source code changes and supports team collaboration |
| **API Testing** | Bruno | Used for testing backend REST endpoints during development |
| **Build Tools** | Maven (backend), npm/Vite (frontend) | Manages dependencies and builds for each side of the application |

---

## 10. Sub-Function Access by Role

This table shows, for every sub-function, which roles can access it and what level of access they have.

**Legend:** **Full** = create, edit, and delete · **Edit** = add/update within their own scope (e.g., own class) · **View** = read-only · **—** = no access

| Module | Sub-Function | Administrator | Principal | Teacher | Finance Staff |
|---|---|---|---|---|---|
| Student Management | Register Students | Full | View | View | — |
| Student Management | Update Student Details | Full | View | View | — |
| Student Management | Manage Student Profiles | Full | View | View (own class) | View |
| Student Management | Search Student Records | Full | View | View | View |
| Teacher Management | Manage Teacher Information | Full | View | View (own profile) | — |
| Teacher Management | Assign Subjects | Full | View | — | — |
| Teacher Management | Maintain Teacher Profiles | Full | View | View (own) | — |
| Teacher Management | View Teacher Records | Full | View | — | — |
| Attendance Management | Record Student Attendance | View | View | Edit (own class) | — |
| Attendance Management | Record Teacher Attendance | Edit | View | Edit (own record) | — |
| Attendance Management | Generate Attendance Reports | Full | View | View (own class) | — |
| Attendance Management | View Attendance History | Full | View | View (own class) | — |
| Academic & Examination Management | Enter Marks and Grades | View | View | Edit (own subject) | — |
| Academic & Examination Management | Manage Examinations | Full | View | View | — |
| Academic & Examination Management | Generate Report Cards | Full | View | View (own class) | — |
| Academic & Examination Management | Track Student Performance | View | View | View (own class) | — |
| Finance Management | Manage School Fees | View | View | — | Full |
| Finance Management | Record Payments | View | View | — | Edit |
| Finance Management | Track Outstanding Payments | View | View | — | Edit |
| Finance Management | Generate Financial Reports | View | View | — | Full |
| Administration Management | User & Role Management | Full | — | — | — |
| Administration Management | Class & Section Management | Full | View | — | — |
| Administration Management | Subject Management | Full | View | — | — |
| Administration Management | Timetable/Schedule Management | Full | View | View (own) | — |
| Administration Management | Notification Management | Full | View | — | — |
| Ticket Management | Ticket Registration | Full | View | Edit (own) | Edit (own) |
| Ticket Management | Ticket Monitoring & Tracking | Full | View | View (own) | View (own) |
| Ticket Management | Ticket Modification | Full | View | Edit (own, while open) | Edit (own, while open) |
| Ticket Management | Ticket Assignment & Management | Full | View | — | — |
| Ticket Management | Ticket Resolution | Full | View | View (own) | View (own) |

---


## 11. Per-Module Technical Design

This section gives a high-level (not fully normalized) database schema and API list for each module, mapped directly to the sub-functions defined in **Section 7 (Core Features)**. Exact field types, constraints, and payload details will be finalized during development.

---

### 11.1 Student Management

Covers: Register Students · Update Student Details · Manage Student Profiles · Search Student Records

**High-Level DB Schema**

| Table | Key Fields |
|---|---|
| `students` | id, first_name, last_name, dob, gender, address, contact_number, guardian_name, guardian_contact, class_id (FK), section_id (FK), admission_year, status |

Referenced by `student_attendance`, `marks`, `payments`, and `tickets` in other modules.

**Module APIs (High-Level)**

| Sub-Function | Endpoint |
|---|---|
| Register Students | `POST /api/students` |
| Update Student Details | `PUT /api/students/{id}` |
| Manage Student Profiles | `GET /api/students/{id}` (full profile view) |
| Search Student Records | `GET /api/students?name=&classId=&admissionYear=` |

---

### 11.2 Teacher Management

Covers: Manage Teacher Information · Assign Subjects · Maintain Teacher Profiles · View Teacher Records

**High-Level DB Schema**

| Table | Key Fields |
|---|---|
| `teachers` | id, first_name, last_name, dob, contact_number, qualification, employment_date, status |
| `teacher_subjects` | id, teacher_id (FK), subject_id (FK), class_id (FK) |

**Module APIs (High-Level)**

| Sub-Function | Endpoint |
|---|---|
| Manage Teacher Information | `POST /api/teachers`, `PUT /api/teachers/{id}` |
| Assign Subjects | `POST /api/teachers/{id}/subjects` |
| Maintain Teacher Profiles | `GET /api/teachers/{id}` (profile + teaching history) |
| View Teacher Records | `GET /api/teachers` |

---

### 11.3 Attendance Management

Covers: Record Student Attendance · Record Teacher Attendance · Generate Attendance Reports · View Attendance History

**High-Level DB Schema**

| Table | Key Fields |
|---|---|
| `student_attendance` | id, student_id (FK), class_id (FK), date, status (present/absent/late), recorded_by (FK → users) |
| `teacher_attendance` | id, teacher_id (FK), date, check_in, check_out, status |

**Module APIs (High-Level)**

| Sub-Function | Endpoint |
|---|---|
| Record Student Attendance | `POST /api/attendance/students` |
| Record Teacher Attendance | `POST /api/attendance/teachers` |
| Generate Attendance Reports | `GET /api/attendance/reports?type=daily\|monthly\|term` |
| View Attendance History | `GET /api/attendance/history?studentId=\|teacherId=\|classId=&from=&to=` |

---

### 11.4 Academic and Examination Management

Covers: Enter Marks and Grades · Manage Examinations · Generate Report Cards · Track Student Performance

**High-Level DB Schema**

| Table | Key Fields |
|---|---|
| `exams` | id, name, class_id (FK), term, exam_date |
| `marks` | id, student_id (FK), subject_id (FK), exam_id (FK), score, grade |

Report cards and performance trends are generated on demand from `marks` rather than stored separately.

**Module APIs (High-Level)**

| Sub-Function | Endpoint |
|---|---|
| Enter Marks and Grades | `POST /api/marks` (auto-calculates grade from score) |
| Manage Examinations | `POST /api/exams`, `GET /api/exams`, `PUT /api/exams/{id}` |
| Generate Report Cards | `GET /api/report-cards/{studentId}?examId=` |
| Track Student Performance | `GET /api/performance/{studentId}` |

---

### 11.5 Finance Management

Covers: Manage School Fees · Record Payments · Track Outstanding Payments · Generate Financial Reports

**High-Level DB Schema**

| Table | Key Fields |
|---|---|
| `fee_structures` | id, class_id (FK), term, amount |
| `payments` | id, student_id (FK), fee_structure_id (FK), amount_paid, payment_date, method |

Outstanding balance is calculated (fee_structure amount − sum of payments) rather than stored as its own field.

**Module APIs (High-Level)**

| Sub-Function | Endpoint |
|---|---|
| Manage School Fees | `POST /api/fees/structures`, `GET /api/fees/structures`, `PUT /api/fees/structures/{id}` |
| Record Payments | `POST /api/payments` |
| Track Outstanding Payments | `GET /api/finance/outstanding?classId=` |
| Generate Financial Reports | `GET /api/finance/reports` |

---

### 11.6 Administration Management

Covers: User & Role Management · Class & Section Management · Subject Management · Timetable/Schedule Management · Notification Management

**High-Level DB Schema**

| Table | Key Fields |
|---|---|
| `users` | id, name, email, password_hash (or Clerk external id), role, status |
| `classes` | id, name, class_teacher_id (FK), capacity |
| `sections` | id, name, class_id (FK) |
| `subjects` | id, name, class_id (FK) |
| `timetable` | id, class_id (FK), subject_id (FK), teacher_id (FK), day, period, room |
| `notifications` | id, recipient_id (FK → users), type, message, is_read, created_at |

**Module APIs (High-Level)**

| Sub-Function | Endpoint |
|---|---|
| User & Role Management | `POST /api/users`, `PUT /api/users/{id}`, `DELETE /api/users/{id}` |
| Class & Section Management | `POST /api/classes`, `POST /api/sections` |
| Subject Management | `POST /api/subjects`, `PUT /api/subjects/{id}` |
| Timetable/Schedule Management | `POST /api/timetable` (with conflict check), `GET /api/timetable` |
| Notification Management | `GET /api/notifications`, `POST /api/notifications` (system-triggered) |

---

### 11.7 Ticket Management

Covers: Ticket Registration · Ticket Monitoring & Tracking · Ticket Modification · Ticket Assignment & Management · Ticket Resolution

**High-Level DB Schema**

| Table | Key Fields |
|---|---|
| `tickets` | id, raised_by (FK → users), category, description, priority, status, assigned_to (FK → users), created_at, resolved_at, resolution_notes |

**Module APIs (High-Level)**

| Sub-Function | Endpoint |
|---|---|
| Ticket Registration | `POST /api/tickets` |
| Ticket Monitoring & Tracking | `GET /api/tickets?status=&priority=&raisedBy=` |
| Ticket Modification | `PUT /api/tickets/{id}` (while open) |
| Ticket Assignment & Management | `POST /api/tickets/{id}/assign` |
| Ticket Resolution | `POST /api/tickets/{id}/resolve` |

---

## 12. Error Handling & Response Format

All API responses follow a consistent JSON envelope so the frontend can handle success and error cases the same way across every module.

**Success Response**
```json
{
  "success": true,
  "data": { ... },
  "message": "Student registered successfully"
}
```

**Error Response**
```json
{
  "success": false,
  "error": {
    "code": "STUDENT_NOT_FOUND",
    "message": "No student found with the given ID"
  }
}
```

**Common HTTP Status Codes Used**

| Code | Meaning | Example Use |
|---|---|---|
| 200 | OK | Successful GET/PUT/DELETE |
| 201 | Created | New record created (e.g., student, ticket) |
| 400 | Bad Request | Missing/invalid fields in request body |
| 401 | Unauthorized | Not logged in / invalid session |
| 403 | Forbidden | Logged in but role lacks permission |
| 404 | Not Found | Record doesn't exist (e.g., invalid student ID) |
| 409 | Conflict | e.g., timetable clash, duplicate student record |
| 500 | Internal Server Error | Unexpected server-side failure |

Validation errors and business-rule errors (e.g., timetable conflicts, duplicate registration) are handled centrally in the backend using a global exception handler, so each module returns errors in the same consistent format.

---

## 13. GitHub Flow / Branching Strategy

The team will follow a simple **GitHub Flow** model, kept lightweight for the size of the project.

- `main` – always stable, deployable code
- `feature/<module>-<short-description>` – one branch per task/module, created off `main`
- Work is committed to the feature branch, then opened as a **Pull Request** into `main`
- At least one teammate reviews the PR before merging
- Branch is deleted after merging to keep the repo clean

**Example**
```
main
 └── feature/ticket-management-registration
 └── feature/attendance-student-marking
 └── feature/finance-payment-recording
```

A student working on ticket raising would branch off `main` as `feature/ticket-management-registration`, commit their work, open a PR, get it reviewed, then merge back into `main`.

---

## 14. Module Dependencies

This table shows which modules a given module depends on for data or setup, based on Section 8 (How the Modules Work Together).

| Module | Depends On | Reason |
|---|---|---|
| Student Management | Administration Management | Needs classes/sections to assign a student to |
| Teacher Management | Administration Management | Needs subjects/classes to assign to a teacher |
| Attendance Management | Student Management, Teacher Management, Administration Management | Needs student/teacher records and class structure |
| Academic & Examination Management | Student Management, Teacher Management, Administration Management | Needs student identity, teacher-subject assignment, and class/subject setup |
| Finance Management | Student Management, Administration Management | Needs student records and class/term structure for fee assignment |
| Ticket Management | Administration Management (Users) | Needs staff accounts to know who raised/is assigned a ticket; can reference records from any other module |
| Administration Management | — | Foundational module; other modules depend on it, it does not depend on them |

---

## 15. Object-Oriented Architecture & Design Patterns

To promote clean code, maintainability, extensibility, and separation of concerns, the system leverages core **Object-Oriented Programming (OOP)** principles:

### 15.1 Core OOP Principles Applied

1. **Abstraction**:
   - **Entity Abstraction**: An abstract base class `User` defines common identity attributes (`clerkId`, `email`, `firstName`, `lastName`, `phoneNumber`, `address`, `nicNumber`, `status`) and establishes abstract behavior contracts (`getRole()`, `getPermissions()`, `getRoleDisplayName()`, `canAccessModule(String module)`).
   - **Service Abstraction**: High-level service interfaces (e.g., `UserService`, `StudentService`, `AttendanceService`) decouple service contracts from their underlying implementations (`UserServiceImpl`), supporting dependency inversion and easier unit testing.

2. **Inheritance**:
   - **JPA Single Table Inheritance**: Concrete staff user entities (`AdminUser`, `PrincipalUser`, `TeacherUser`, `FinanceStaffUser`, `PendingUser`) inherit from the abstract `User` base class.
   - Using `@Inheritance(strategy = InheritanceType.SINGLE_TABLE)` and `@DiscriminatorColumn(name = "role")`, all subclasses map cleanly to the single PostgreSQL `users` table without schema overhead.

3. **Polymorphism**:
   - **Dynamic Method Dispatch**: Module access checks (`canAccessModule(...)`) and role-specific permissions (`getPermissions()`) execute polymorphically at runtime on the underlying subclass without procedural `if/else` or `switch` chains on role strings.
   - **Polymorphic Entity References**: Cross-cutting modules like **Ticket Management** reference the base `User` entity (`@ManyToOne private User createdBy;`), allowing tickets to be raised polymorphically by any staff role (`TeacherUser`, `FinanceStaffUser`, `AdminUser`, etc.).
   - **Creational Factory Pattern**: A dedicated `UserFactory` encapsulates the polymorphic instantiation of appropriate `User` subclasses based on `UserRole` enums.

4. **Encapsulation**:
   - **Domain Value Objects & Enums**: Strongly typed `UserRole` and `UserStatus` enums encapsulate role parsing, validation, and metadata.
   - **Internal State Mutation**: Entity state updates (such as profile details and account status transitions) are encapsulated within domain methods (`updateProfileDetails()`, `changeStatus()`, `isProfileComplete()`), guarding business invariants.

---

## 16. Standardized Project Directory & Team Package Structure

To ensure seamless collaboration among team members without file collisions or Git merge conflicts, the project follows a standardized package layout.

### 16.1 Overall Backend Layout (`backend/src/main/java/com/schoolsystem/backend/`)

```text
com.schoolsystem.backend/
├── common/                             # Shared utilities, responses, base exceptions
│   ├── dto/
│   │   ├── ApiResponse.java            # Standard JSON response envelope { success, data, message }
│   │   ├── ApiError.java
│   │   └── ErrorResponse.java
│   └── exception/
│       ├── GlobalExceptionHandler.java
│       └── ResourceNotFoundException.java
│
├── security/                           # Authentication & JWT security (Clerk integration)
│   ├── ClerkJwtAuthConverter.java
│   ├── CurrentUser.java
│   ├── CurrentUserArgumentResolver.java
│   ├── SecurityConfig.java
│   └── UserPrincipal.java
│
├── config/                             # Application configurations (WebConfig, CORS, etc.)
│   └── WebConfig.java
│
├── user/                               # 👤 USER MANAGEMENT MODULE (Core User Domain & OOP Hierarchy)
│   ├── controller/
│   │   ├── UserController.java
│   │   └── AdminUserController.java
│   ├── service/
│   │   ├── UserService.java            # (Interface - Abstraction)
│   │   └── UserServiceImpl.java        # (Concrete Implementation)
│   ├── repository/
│   │   └── UserRepository.java
│   ├── model/
│   │   ├── User.java                   # (Abstract Base Entity)
│   │   ├── AdminUser.java              # (Subclass)
│   │   ├── PrincipalUser.java          # (Subclass)
│   │   ├── TeacherUser.java            # (Subclass)
│   │   ├── FinanceStaffUser.java       # (Subclass)
│   │   ├── PendingUser.java            # (Subclass)
│   │   ├── UserFactory.java            # (Creational Factory)
│   │   ├── UserRole.java               # (Typed Role Enum)
│   │   └── UserStatus.java             # (Typed Status Enum)
│   └── dto/
│       ├── request/
│       │   ├── UpdateRoleRequest.java
│       │   ├── UpdateStatusRequest.java
│       │   └── UserProfileRequest.java
│       └── response/
│           └── UserDTO.java
│
└── [feature_modules]/                  # Domain Feature Modules (student, teacher, attendance, academic, finance, administration, ticket)
```

---

### 16.2 Concrete Example: How a Teammate's Module Must Be Structured

Each developer should structure their assigned feature module as a self-contained domain package. Here is a **complete, concrete example** using the **Student Management Module**:

#### 📂 Backend Module Example: `com.schoolsystem.backend.student`

```text
com.schoolsystem.backend.student/
├── controller/
│   └── StudentController.java          # REST API endpoints (/api/students)
│
├── service/
│   ├── StudentService.java             # Interface defining student business operations (Abstraction)
│   └── StudentServiceImpl.java         # Concrete business logic implementation
│
├── repository/
│   └── StudentRepository.java          # Spring Data JPA interface for Student entity
│
├── model/
│   ├── Student.java                    # JPA Entity mapped to 'students' table
│   ├── StudentStatus.java              # Enum: ACTIVE, INACTIVE, GRADUATED, TRANSFERRED
│   └── GuardianInfo.java               # Embeddable or Value Object for guardian details
│
└── dto/
    ├── request/
    │   ├── CreateStudentRequest.java   # Payload for registering a student (with validation annotations)
    │   ├── UpdateStudentRequest.java   # Payload for editing student profile
    │   └── StudentFilterRequest.java   # Query parameters for search & filtering
    └── response/
        ├── StudentResponseDTO.java     # Sanitized response object for a student record
        └── StudentSummaryDTO.java      # Lightweight DTO for list / table views
```

#### 📂 Frontend Module Example: `frontend/src/` (Student Module)

```text
frontend/src/
├── services/
│   └── studentService.js               # API client functions (fetchStudents, createStudent, updateStudent)
│
└── components/
    └── student/
        ├── StudentList.jsx             # Table component with search and filter controls
        ├── StudentProfileModal.jsx     # View detailed student profile
        ├── StudentRegistrationForm.jsx # Form modal for adding a new student
        └── StudentCard.jsx             # Individual student summary card
```

---

### 16.3 Module Collaboration Rules for Developers

1. **Shared Foundation**: Do not modify files in `model/User.java` or `security/` without team alignment. When referencing staff members (e.g., the teacher who recorded marks or the admin who registered a student), use the shared base `User` entity:
   ```java
   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "recorded_by")
   private User recordedBy;
   ```
2. **Response Standardization**: Always return responses wrapped in the standard `ApiResponse` envelope:
   ```java
   return ApiResponse.success(studentDTO, "Student registered successfully");
   ```
3. **Module Isolation**: Place your feature files inside your assigned domain directory (e.g., `com.schoolsystem.backend.student.*` or `components/student/`) to ensure zero Git merge conflicts.


