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
- [Future Improvements](#future-improvements)

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
