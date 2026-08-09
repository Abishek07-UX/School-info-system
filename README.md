# Web-Based School Information System

A centralized, staff-facing web platform for managing school operations, including Student Management, Teacher Management, Attendance, Academics & Examinations, Finance, Administration, and Internal Support Tickets.

Detailed requirements and design specifications are documented in [PRD-SE.md](PRD-SE.md).

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Clerk (`@clerk/react`)
- **Backend**: Java 21, Spring Boot 3.5, Spring Data JPA, Spring Validation, Lombok
- **Database**: PostgreSQL (Neon DB)
- **API Specification**: RESTful API (JSON response envelope)
- **API Testing**: Bruno Collections (`api-tests/`)

---

## 🚀 Getting Started for Developers

Follow these steps to set up and run the project locally.

### Prerequisites
Make sure you have installed:
- **Node.js**: v18.0.0 or higher
- **Java JDK**: Version 21
- **Git**

---

### 1. Setup & Run Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create your local `.env` environment file:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Replace `VITE_CLERK_PUBLISHABLE_KEY` in `.env` with your project's Clerk Publishable Key.
4. Start the frontend development server:
   ```bash
   
   npm run dev
   ```
5. Open your browser at `http://localhost:5173`.

---

### 2. Setup & Run Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create your local secret database properties file:
   - Copy `application-secret.properties.example` to `application-secret.properties`:
     ```bash
     cp src/main/resources/application-secret.properties.example src/main/resources/application-secret.properties
     ```
   - Update `spring.datasource.username` and `spring.datasource.password` in `application-secret.properties` with your PostgreSQL database credentials.
3. Run the Spring Boot application using Maven Wrapper:
   - **On Linux/macOS:**
     ```bash
     ./mvnw spring-boot:run
     ```
   - **On Windows:**
     ```cmd
     mvnw.cmd spring-boot:run
     ```
4. The backend REST APIs will be available at `http://localhost:8080`.

---

## 📁 Repository Structure

```text
School-info-system/
├── PRD-SE.md                   # Product Requirements Document & API Specifications
├── api-tests/                  # Bruno API Testing Collections per module
├── frontend/                   # React + Vite Frontend application
│   ├── .env.example            # Template for Clerk auth env variables
│   └── src/                    # Frontend source code
└── backend/                    # Spring Boot Backend application
    ├── src/main/resources/     # Application configuration & secret properties template
    └── src/main/java/          # Java controller, service, repository, and model packages
```

---

## 🤝 Workflow & Branching Guidelines

- **Main Branch**: `main` (kept stable at all times).
- **Feature Branches**: Create a branch off `main` for your module/task:
  ```bash
  git checkout -b feature/<module>-<short-description>
  ```
- Push your feature branch and submit a Pull Request to `main` for code review.
