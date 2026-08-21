# 🚀 School Information System - Developer Setup Guide

This guide will walk you through cloning the repository, installing dependencies, and running both the frontend and backend servers on a Windows environment.

---

## 📋 Prerequisites

Before starting, make sure you have the following installed on your laptop:

1. **Git**: [Download Git](https://git-scm.com/)
2. **Node.js** (v18.0.0 or higher): [Download Node.js](https://nodejs.org/)
3. **Java JDK 21**: [Download JDK 21](https://www.oracle.com/java/technologies/downloads/#java21)

---

## 📥 1. Clone the Repository

Open **Command Prompt (CMD)** and run:

```cmd
git clone https://github.com/Abishek07-UX/School-info-system.git
cd School-info-system
```

---

## 💻 2. Set Up & Run the Frontend (Terminal 1)

Open your first **Command Prompt** window:

1. **Navigate to the frontend directory**:
   ```cmd
   cd frontend
   ```

2. **Install npm packages**:
   ```cmd
   npm install
   ```

3. **Create your environment configuration file**:
   ```cmd
   copy .env.example .env
   ```

4. **Configure environment variables**:
   Open `.env` in VS Code or Notepad and set your Clerk Publishable Key:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   ```

5. **Start the frontend development server**:
   ```cmd
   npm run dev
   ```

> 🌐 **Frontend URL**: [http://localhost:5173](http://localhost:5173)

---

## ⚙️ 3. Set Up & Run the Backend (Terminal 2)

Open a **SECOND Command Prompt** window (keep the first window running the frontend server):

1. **Navigate to the backend directory**:
   ```cmd
   cd School-info-system\backend
   ```

2. **Create your secret database properties file**:
   ```cmd
   copy src\main\resources\application-secret.properties.example src\main\resources\application-secret.properties
   ```

3. **Configure database credentials**:
   Open `src\main\resources\application-secret.properties` in your code editor and update the database credentials:
   ```properties
   spring.datasource.username=your_postgres_username
   spring.datasource.password=your_postgres_password
   ```

4. **Run the Spring Boot backend server**:
   ```cmd
   mvnw.cmd spring-boot:run
   ```

> ⚙️ **Backend REST API URL**: [http://localhost:8080](http://localhost:8080)

---

## 🌿 4. Git Branching Guidelines

Always create a new feature branch before starting your work:

```cmd
git checkout -b feature/your-feature-name
```

Push your changes and create a Pull Request on GitHub once completed:

```cmd
git add .
git commit -m "Add: brief summary of changes"
git push origin feature/your-feature-name
```
