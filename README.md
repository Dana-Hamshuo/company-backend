#  Company Task Management System - Backend API

A comprehensive backend system for managing tasks, employees, and real-time notifications in a company environment.

##  Features

### Core Functionality
- **Task Management**: Create, assign, track, and manage tasks with dependencies
- **User Management**: Multi-role authentication (Scheduler, Team Member, Manager)
- **Real-time Notifications**: Push notifications via Firebase Cloud Messaging
- **Schedule Management**: Date-based task scheduling with conflict detection
- **Project Management**: Organize tasks by projects and clients

### Advanced Features
-  JWT-based authentication & authorization
-  Role-based access control (RBAC)
-  Task dependencies and workflow management
-  Automated notification system
-  Device token management for mobile apps
-  Work hours validation and overlap prevention
-  Task status tracking (Pending, In Progress, Blocked, Completed)

##  Tech Stack

**Backend Framework:**
- Node.js + Express.js

**Database:**
- MongoDB with Mongoose ODM

**Authentication:**
- JWT (JSON Web Tokens)
- Bcrypt.js for password hashing

**Notifications:**
- Firebase Cloud Messaging (FCM)
- Firebase Admin SDK

**Architecture:**
- MVC (Model-View-Controller) pattern
- Service-oriented architecture
- Event-driven architecture (EventBus pattern)
- Middleware-based validation

