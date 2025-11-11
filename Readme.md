# Taskify - Advanced Task Management System

Taskify is a full-featured task management system built with Node.js, Express, and MongoDB.  
It supports **multi-role access control**, **task assignment**, **user management**, **authentication**, **OTP verification**, **password reset**, and **automated task reminders**.

---

## 📚 Table of Contents

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
- [Author](#author)

---

## 🎯 Purpose

Taskify is designed to help teams and individuals:

- Organize tasks efficiently
- Track task progress
- Assign tasks to specific users
- Enforce role-based permissions
- Automate reminders for upcoming tasks
- Securely manage users and passwords

---

## Features

### User Authentication & Authorization

- JWT-based authentication
- Login, Register, Logout
- OTP-based account verification
- Password reset via OTP

### Role-Based Access Control (RBAC)

- Admin, Manager, User roles
- Fine-grained permissions

### User Management

- Admin can create/update/delete users
- Manager can create "User" accounts
- Profile update for all users

### Task Management

- Create, Read, Update, Delete tasks
- Assign tasks to users
- Update task status (Pending, In Progress, Completed)
- Task priority (Low, Medium, High, Critical)
- Due dates and reminders

### ✉️ Notifications

- Email notifications for OTP, password reset, and account verification

### Security

- Password complexity validation
- Refresh tokens for secure sessions

### Logging & Auditing

- Audit logs for registration, login, and password reset

### REST API

- Fully RESTful routes for Users and Tasks
- CORS enabled for frontend apps

---

## User Roles & Permissions

| Role        | Users Create     | Tasks Create    | Tasks Update   | Tasks Delete   |
| ----------- | ---------------- | --------------- | -------------- | -------------- |
| **Admin**   | Yes              | Yes (any task)  | Yes (any task) | Yes (any task) |
| **Manager** | Yes (only Users) | Yes (own tasks) | Own tasks only | No             |
| **User**    | No               | No              | Own tasks only | No             |

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT, Refresh Tokens
- **Email:** Nodemailer (OTP, verification, password reset)
- **Validation:** Express-Validator
- **Security:** bcrypt, password complexity validation

---

## Setup & Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Misbah767/Task-Management-System.git
cd Task-Management-System
2️⃣ Install dependencies
bash
Copy code
npm install
3️⃣ Configure environment variables
Create a .env file in the root directory and add:

env
Copy code
# MongoDB
MONGODB_URL="mongodb://localhost:27017"  # Local MongoDB
# MONGODB_URL="mongodb+srv://misbah:misbah321@cluster0.mr1wiiz.mongodb.net/"  # Atlas MongoDB
JWT_SECRET="mySuperSecretKey123"
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT=587
SMTP_USER="9868e2001@smtp-brevo.com"
SMTP_PASS="YdJhIT6psPb4HxNQ"
SMTP_SECURE=false
4️⃣ Run the development server
bash
Copy code
npm run dev
Server will start at: http://localhost:5000

5️⃣ (Optional) Seed Admin
npm run seed-admin


Creates a default Admin from .env values.

🌍 Environment Variables
Variable	Description
PORT	App running port
MONGO_URI	MongoDB connection string
JWT_SECRET	Secret key for JWT
SMTP_HOST	Email service host
SMTP_PORT	SMTP port (default 587)
SMTP_USER	SMTP email
SMTP_PASS	App password
SMTP_SECURE	true/false
🔐 API Endpoints
 Authentication

 Run once to create default Admin

npm run seed-admin

Method	Endpoint	Description	Access
POST	/api/auth/register	Register new user( just for user)
POST	/api/auth/login	Login and receive JWT token	Public
POST	/api/auth/verify-account	Verify account using OTP	Public
POST	/api/auth/forgot-password	Send OTP for password reset	Public
POST	/api/auth/verify-reset-otp	Verify OTP for password reset	Public
POST	/api/auth/reset-password	Reset password after OTP	Public
POST	/api/auth/resend-account-otp	Resend OTP for account verification	Public
POST	/api/auth/resend-reset-otp	Resend OTP for password reset	Public
POST	/api/auth/refresh	Get new access token	Authenticated
POST	/api/auth/logout	Logout and invalidate token	Authenticated
 Users
Method	Endpoint	Description	Access
GET	/api/users	Get all users	Admin
GET	/api/users/:id	Get user by ID	Admin / Self
POST	/api/users	Create user (Admin → Manager / Manager → User)	Admin / Manager
PATCH	/api/users/:id	Update user details	Admin / Self
DELETE	/api/users/:id	Delete user	Admin
Tasks
Method	Endpoint	Description	Access
POST	/api/tasks	Create task	Admin / Manager
GET	/api/tasks	Get all tasks (filtered by role)	Admin / Manager / User
GET	/api/tasks/:id	Get task by ID	Assigned user / Admin
PUT	/api/tasks/:id	Update task (title, status, priority)	Admin / Manager / Assigned user
DELETE	/api/tasks/:id	Delete task	Admin
⏰ Reminders
Type	Endpoint / Schedule	Description	Access
POST	/api/reminders/trigger	Manually trigger reminders	Admin
CRON	*/5 * * * *	Auto-check due tasks every 5 mins and send reminder emails	System

 Uses Node-Cron + Nodemailer for automatic email notifications.

🧭 Flow Summary
Step	Action	Description
1️⃣	npm run seed-admin	Create default Admin
2️⃣	Admin login	/api/auth/login
3️⃣	Admin creates Manager	/api/users
4️⃣	Manager verifies OTP	/api/auth/verify-account
5️⃣	Manager creates User	/api/users
6️⃣	User verifies OTP	/api/auth/verify-account
7️⃣	Manager creates task	/api/tasks
8️⃣	User updates own task	/api/tasks/:id
9️⃣	Cron auto-sends reminders	/api/reminders/trigger (manual optional)

 Author
Misbah Ilyas


```
