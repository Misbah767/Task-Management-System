# Taskify - Advanced Task Management System

**Taskify** is a full-featured task management system built with Node.js, Express, and MongoDB. It supports **multi-role access control**, **task assignment**, **user management**, **authentication**, **OTP verification**, **password reset**, and **automated task reminders**.

---

## **Table of Contents**

- [Purpose](#purpose)
- [Features](#features)
- [User Roles & Permissions](#user-roles--permissions)
- [Tech Stack](#tech-stack)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Middleware](#middleware)
- [Utilities](#utilities)
- [Postman Tests](#postman-tests)
- [Future Improvements](#future-improvements)
- [Author](#author)

---

## **Purpose**

Taskify is designed to help teams and individuals:

- Organize tasks efficiently
- Track task progress
- Assign tasks to specific users
- Enforce role-based permissions
- Automate reminders for upcoming tasks
- Securely manage users and passwords

---

## **Features**

- **User Authentication & Authorization**
  - JWT-based authentication
  - Login, Register, Logout
  - OTP-based account verification
  - Password reset via OTP
- **Role-Based Access Control (RBAC)**
  - Admin, Manager, User roles
  - Fine-grained permissions
- **User Management**
  - Admin can create/update/delete users
  - Manager can create "User" accounts
  - Profile update for all users
- **Task Management**
  - Create, Read, Update, Delete tasks
  - Assign tasks to users
  - Update task status (Pending, In Progress, Completed)
  - Task priority (Low, Medium, High, Critical)
  - Due dates and reminders
- **Notifications**
  - Email notifications for OTP, password reset, account verification
- **Security**
  - Password complexity validation
  - Refresh tokens for secure sessions
- **Logging & Auditing**
  - Audit logs for actions like registration, login, password reset
- **REST API**
  - Fully RESTful routes for Users and Tasks
- **CORS Configuration**
  - Supports frontend applications (local and deployed)

---

## **User Roles & Permissions**

| Role    | Users Create     | Tasks Create    | Tasks Update   | Tasks Delete   |
| ------- | ---------------- | --------------- | -------------- | -------------- |
| Admin   | Yes              | Yes (any task)  | Yes (any task) | Yes (any task) |
| Manager | Yes (only Users) | Yes (own tasks) | Own tasks only | No             |
| User    | No               | No              | Own tasks only | No             |

---

## **Tech Stack**

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT, Refresh Tokens
- **Email:** Nodemailer (OTP, verification, password reset)
- **Validation:** Express-Validator
- **Security:** bcrypt, password complexity validation

---

## **Postman Tests**

You can use Postman to test all routes with different roles. Example tests:

1. **Admin**

   - Login
   - Create Manager/User
   - CRUD all tasks
   - Delete users
   - Fetch all users

2. **Manager**

   - Login
   - Create User
   - Create tasks for Users
   - Update tasks they created
   - Fetch tasks assigned to them or created by them

3. **User**

   - Login
   - Fetch own tasks
   - Update task status only

4. **Reminder Test**
   - Seed tasks with `dueDate` set near current date/time
   - Use a cron job or task scheduler to trigger reminders
   - Verify emails are sent using test email accounts (e.g., Mailtrap)

> **Tip:** Use environment variables in Postman for `accessToken` and `refreshToken` for testing different roles.

## **Author**

**Misbah Ilyas**
