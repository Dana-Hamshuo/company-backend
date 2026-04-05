```markdown
# Company Backend API Documentation

## Table of Contents

1. [Base Configuration](#base-configuration)
2. [Authentication](#authentication)
3. [Users](#users)
4. [Clients](#clients)
5. [Projects](#projects)
6. [Tasks](#tasks)
7. [Calendar](#calendar)
8. [Notifications](#notifications)
9. [Error Handling](#error-handling)

---

## Base Configuration

| Setting | Value |
|---------|-------|
| Base URL | https://company-backend-o1zw.onrender.com/api |
| Content-Type | application/json |
| Authentication | Bearer Token in Header |
| Time Format | 24-hour (HH:MM) |
| Date Format | ISO 8601 (YYYY-MM-DD) |

### Authentication Header
```
Authorization: Bearer <YOUR_TOKEN>


### Standard Response Format
```json
{
  "success": true,
  "message": "operation message",
  "data": {}
}
```

### Standard Error Format
```json
{
  "success": false,
  "message": "error message",
  "error": {
    "type": "ERROR_TYPE",
    "field": "field_name",
    "details": "more info"
  }
}
```

---

## Authentication

### Register New User

POST /auth

Headers:
```
Content-Type: application/json
```

Body:
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "password": "string (required, min 6 chars)",
  "role": "string (optional: 'scheduler' | 'team', default: 'team')",
  "jobTitle": "string (required, 2-50 chars)",
  "allowOverlap": "boolean (optional, default: false)",
  "maxParallelTasks": "number (optional, 1-10, default: 1)"
}
```

Success Response (201):
```json
{
  "success": true,
  "message": "user created",
  "data": {
    "_id": "64abc123...",
    "name": "BLA ",
    "email": "BLA@example.com",
    "role": "team",
    "jobTitle": " Photographer",
    "allowOverlap": false,
    "maxParallelTasks": 1
  }
}
```

Error Responses:

| Status | Error Type | Field | Cause |
|--------|-----------|-------|-------|
| 400 | VALIDATION_ERROR | name | Name is required or less than 2 chars |
| 400 | VALIDATION_ERROR | email | Invalid email format |
| 400 | VALIDATION_ERROR | password | Password less than 6 characters |
| 409 | ALREADY_EXISTS | email | Email already registered |

---

### Login

POST /auth/login

Body:
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

Success Response (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64abc123...",
      "name": "Sara",
      "role": "team"
    }
  }
}
```

Error Responses:

| Status | Error Type | Cause |
|--------|-----------|-------|
| 400 | VALIDATION_ERROR | Email or password missing |
| 401 | AUTH_ERROR | Invalid email or password |

---

### Get Current User Profile

GET /auth/me

Headers:
```
Authorization: Bearer <YOUR_TOKEN>
```

Success Response (200):
```json
{
  "success": true,
  "message": "User fetched",
  "data": {
    "id": "64abc123...",
    "name": "sandi",
    "email": "sandi@example.com",
    "role": "team",
    "jobTitle": "scheduler",
    "allowOverlap": false,
    "maxParallelTasks": 1,
  }
}
```

Error Responses:

| Status | Error Type | Cause |
|--------|-----------|-------|
| 401 | AUTH_ERROR | Missing or invalid token |

---

## Users

### Get All Users

GET /users

Headers:
```
Authorization: Bearer <YOUR_TOKEN>
```

Success Response (200):
```json
{
  "success": true,
  "message": "Users fetched",
  "data": [
    {
      "_id": "69ce35fe8f5a3244d3684374",
      "name": "sara",
      "email": "sara@gmail.com",
      "role": "team",
      "jobTitle": "photographer",
      "allowOverlap": false,
      "maxParallelTasks": 1
    },
  ]
}
```

---

### Get User By ID

GET /users/:id

Headers:
```
Authorization: Bearer <YOUR_TOKEN>
```

Parameters:
```
id: string (MongoDB ObjectId)
```

Success Response (200):
```json
{
  "success": true,
  "message": "success",
  "data": {
    "_id": "69ce35fe8f5a3244d3684374",
    "name": "sara",
    "email": "sara@gmail.com",
    "role": "team",
    "jobTitle": "photographer",
    "allowOverlap": false,
    "maxParallelTasks": 1,
    "isActive": true
  }
}
```

Error Responses:

| Status | Error Type | Cause |
|--------|-----------|-------|
| 400 | VALIDATION_ERROR | Invalid ObjectId format |
| 404 | NOT_FOUND | User not found |

---

### Update User

PATCH /users/:id

Headers:
```
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json
```

Body (All fields optional):
```json
{
  "jobTitle": "string (2-50 chars)",
  "allowOverlap": "boolean",
  "maxParallelTasks": "number (1-10)",
  "isActive": "boolean"
}
```

Success Response (200):
```json
{
  "success": true,
  "message": "updated successfully",
  "data": null
}
```

Error Responses:

| Status | Error Type | Cause |
|--------|-----------|-------|
| 400 | VALIDATION_ERROR | Invalid field value |
| 404 | NOT_FOUND | User not found |

---

### Delete User

DELETE /users/:id

Headers:
```
Authorization: Bearer <YOUR_TOKEN>
```

Success Response (200):
```json
{
  "success": true,
  "message": "User deleted",
  "data": null
}
```

---

## Clients

### Create Client

POST /clients

Headers:
```
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json
```

Body:
```json
{
  "name": "string (required)",
  "businessType": "string (optional)",
  "notes": "string (optional)"
}
```

Success Response (201):
```json
{
  "success": true,
  "message": "client created",
  "data": {
    "_id": "69ce41a815688a2a6c4772d1",
    "name": "BLAA",
    "businessType": "BLAAA_1",
    "notes": "VIP client - priority support",
    "createdAt": "2026-04-02T10:15:04.624Z",
    "updatedAt": "2026-04-02T10:15:04.624Z"
  }
}
```

Error Responses:

| Status | Error Type | Cause |
|--------|-----------|-------|
| 400 | VALIDATION_ERROR | Name is required |

---

### Get All Clients

GET /clients

Headers:
```
Authorization: Bearer <YOUR_TOKEN>
```

Success Response (200):
```json
{
  "success": true,
  "message": "fetched clients",
  "data": [
    {
      "_id": "69ce41a815688a2a6c4772d1",
      "name": "BLAA",
      "createdAt": "2026-04-02T10:15:04.624Z",
      "updatedAt": "2026-04-04T18:25:50.688Z",
      "__v": 0,
      "businessType": "BLAAA_1"
    },
    {
      "_id": "69d22f19b05e824d4abf6ff2",
      "name": "New Client",
      "businessType": "Marketing Agency",
      "notes": "Important client",
      "createdAt": "2026-04-05T09:44:57.280Z",
      "updatedAt": "2026-04-05T09:44:57.280Z",
      "__v": 0
    }
  ]
}
```

---

### Update Client

PATCH /clients/:id

Headers:
```
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json
```

Body (Any field optional):
```json
{
  "name": "string",
  "businessType": "string",
  "notes": "string"
}
```

Success Response (200):
```json
{
  "success": true,
  "message": "client updated",
  "data": {
    "_id": "69ce41a815688a2a6c4772d1",
    "name": "BLAA",
    "businessType": "Technology",
    "notes": "Updated notes",
    "createdAt": "2026-04-02T10:15:04.624Z",
    "updatedAt": "2026-04-20T14:45:00.000Z"
  }
}
```

Error Responses:

| Status | Error Type | Cause |
|--------|-----------|-------|
| 400 | VALIDATION_ERROR | Empty request body |
| 400 | VALIDATION_ERROR | Invalid ObjectId format |
| 404 | NOT_FOUND | Client not found |

---

### Delete Client

DELETE /clients/:id

Headers:
```
Authorization: Bearer <YOUR_TOKEN>
```

Success Response (200):
```json
{
  "success": true,
  "message": "deleted client",
  "data": null
}
```

---

## Projects

### Create Project

POST /projects

Headers:

Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json


Body:
```json
{
  "clientId": "string (required, valid ObjectId)",
  "title": "string (required)",
  "description": "string (optional)"
}
```

Success Response (201):
```json
{
  "success": true,
  "message": "created project",
  "data": {
    "id": "69ce423915688a2a6c4772d7",
    "clientId": {
      "id": "69ce41a815688a2a6c4772d1",
      "name": "BLAA"
    },
    "title": "BLAAAA",
    "description": "Complete UI/UX overhaul",
    "status": "active"
  }
}
```

Error Responses:

| Status | Error Type | Cause |
|--------|-----------|-------|
| 400 | VALIDATION_ERROR | Invalid clientId format |
| 400 | VALIDATION_ERROR | Title is required |

---

### Get All Projects

GET /projects

Headers:
```
Authorization: Bearer <YOUR_TOKEN>
```

Success Response (200):
```json
{
  "success": true,
  "message": "fetched projects",
  "data": [
    {
      "id": "69ce423915688a2a6c4772d7",
      "clientId": {
        "id": "69ce41a815688a2a6c4772d1",
        "name": "BLAA"
      },
      "title": "BLAAAA",
      "status": "active"
    },
    {
      "id": "69d23096b05e824d4abf6ff7",
      "clientId": {
        "id": "69d22f19b05e824d4abf6ff2",
        "name": "New Client"
      },
      "title": "New Project",
      "description": "Project description",
      "status": "active"
    }
  ]
}
```

---

### Get Project By ID

GET /projects/:id

Headers:
```
Authorization: Bearer <YOUR_TOKEN>
```

Success Response (200):
```json
{
  "success": true,
  "message": "Project fetched successfully",
  "data": {
    "id": "69ce423915688a2a6c4772d7",
    "clientId": {
      "id": "69ce41a815688a2a6c4772d1",
      "name": "BLAA",
      "businessType": "BLAAA_1"
    },
    "createdBy": {
      "id": "69ce36638f5a3244d3684377",
      "name": "sandi",
      "role": "scheduler"
    },
    "title": "BLAAAA",
    "description": "Complete UI/UX overhaul",
    "status": "active",
    "clientRating": null,
    "clientFeedback": null
  }
}
```

Error Responses:

| Status | Error Type | Cause |
|--------|-----------|-------|
| 404 | NOT_FOUND | Project not found |

---

### Update Project

PATCH /projects/:id

Headers:
```
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json
```

Body (Any field optional):
```json
{
  "title": "string",
  "description": "string",
  "status": "string (enum: 'active' | 'completed' | 'paused')",
  "clientRating": "number",
  "clientFeedback": "string"
}
```

Success Response (200):
```json
{
  "success": true,
  "message": "project updated",
  "data": {
    "id": "69ce423915688a2a6c4772d7",
    "clientId": {
      "id": "69ce41a815688a2a6c4772d1",
      "name": "BLAA"
    },
    "title": "BLAAAA - Phase 2",
    "description": "Updated description",
    "status": "active"
  }
}
```

Error Responses:

| Status | Error Type | Cause |
|--------|-----------|-------|
| 404 | NOT_FOUND | Project not found |

---

### Delete Project

DELETE /projects/:id

Headers:
```
Authorization: Bearer <YOUR_TOKEN>
```

Success Response (200):
```json
{
  "success": true,
  "message": "project deleted",
  "data": null
}
```

---

## Tasks

Note: Most task operations require role: "scheduler"

### Create Task

POST /tasks

Headers:
```
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json
```

Body:
```json
{
  "title": "string (required)",
  "projectId": "string (required, valid ObjectId)",
  "assignedUsers": [
    {
      "userId": "string (required, valid ObjectId)",
      "isPrimary": "boolean (optional, default: false)"
    }
  ],
  "schedule": [
    {
      "date": "string (required, ISO 8601, working day only)",
      "startTime": "string (required, HH:mm, 24h format)",
      "endTime": "string (required, HH:mm, 24h format)"
    }
  ],
  "dependencies": [
    "string (taskId)"
  ] (optional)
}
```

Success Response (201):
```json
{
  "success": true,
  "message": "task created",
  "data": {
    "id": "69ce45bfcaf285ea7ba04491",
    "title": "video shoot",
    "project": {
      "id": "69ce423915688a2a6c4772d7",
      "title": "BLAAAA",
      "client": {
        "id": "69ce41a815688a2a6c4772d1",
        "businessType": null
      }
    },
    "status": "pending",
    "progress": 0,
    "assignedUsers": [
      {
        "id": "69ce35fe8f5a3244d3684374",
        "name": "sara"
      }
    ],
    "dependencies": [],
    "schedule": [
      {
        "date": "2026-04-15",
        "startTime": "10:00",
        "endTime": "12:00"
      }
    ],
    "delayReason": null
  }
}
```

Error Responses:

| Status | Error Type | Cause |
|--------|-----------|-------|
| 400 | VALIDATION_ERROR | Missing required fields |
| 400 | VALIDATION_ERROR | Invalid ObjectId format |
| 400 | VALIDATION_ERROR | Invalid date/time format |
| 403 | FORBIDDEN | User role is not 'scheduler' |
| 409 | CONFLICT_ERROR | Schedule conflict |

---

### Get All Tasks

GET /tasks

Headers:
```
Authorization: Bearer <YOUR_TOKEN>
```

Success Response (200):
```json
{
  "success": true,
  "message": "Tasks fetched",
  "data": [
    {
      "id": "69ce45bfcaf285ea7ba04491",
      "title": "video shoot",
      "project": {
        "id": "69ce423915688a2a6c4772d7",
        "title": "BLAAAA",
        "client": {
          "id": "69ce41a815688a2a6c4772d1",
          "businessType": null
        }
      },
      "status": "done",
      "progress": 0,
      "assignedUsers": [
        {
          "id": "69ce35fe8f5a3244d3684374",
          "name": "sara"
        }
      ],
      "dependencies": [],
      "schedule": [
        {
          "date": "2026-04-15",
          "startTime": "10:00",
          "endTime": "12:00"
        }
      ],
      "delayReason": null
    },
    {
      "id": "69ce47aacaf285ea7ba044a2",
      "title": "edit video shoot",
      "project": {
        "id": "69ce423915688a2a6c4772d7",
        "title": "BLAAAA",
        "client": {
          "id": "69ce41a815688a2a6c4772d1",
          "businessType": null
        }
      },
      "status": "blocked",
      "progress": 0,
      "assignedUsers": [
        {
          "id": "69ce445015688a2a6c4772e1",
          "name": "sama"
        }
      ],
      "dependencies": [
        {
          "taskId": "69ce45bfcaf285ea7ba04491",
          "isRequired": true
        }
      ],
      "schedule": [
        {
          "date": "2026-04-15",
          "startTime": "10:00",
          "endTime": "13:00"
        },
        {
          "date": "2026-04-17",
          "startTime": "10:00",
          "endTime": "12:00"
        }
      ],
      "delayReason": null
    }
  ]
}
```

---

### Get Tasks By User

GET /tasks/user/:userId

Headers:
```
Authorization: Bearer <YOUR_TOKEN>
```

Success Response (200):
```json
{
  "success": true,
  "message": "success",
  "data": [
    {
      "id": "69ce45bfcaf285ea7ba04491",
      "title": "video shoot",
      "status": "done",
      "schedule": [...]
    }
  ]
}
```

---

### Get Tasks By Date Range

GET /tasks/range?start=2024-04-01&end=2024-04-30

Headers:
```
Authorization: Bearer <YOUR_TOKEN>
```

Success Response (200):
```json
{
  "success": true,
  "message": "success",
  "data": [
    {
      "id": "69ce45bfcaf285ea7ba04491",
      "title": "video shoot",
      "schedule": [
        {
          "date": "2026-04-15T00:00:00.000Z",
          "startTime": "10:00",
          "endTime": "12:00"
        }
      ]
    }
  ]
}
```

Error Responses:

| Status | Error Type | Cause |
|--------|-----------|-------|
| 400 | VALIDATION_ERROR | Start/End date required |

---

### Get Task By ID

GET /tasks/:id

Headers:
```
Authorization: Bearer <YOUR_TOKEN>
```

Success Response (200):
```json
{
  "success": true,
  "message": "success",
  "data": {
    "id": "69ce47aacaf285ea7ba044a2",
    "title": "edit video shoot",
    "project": {
      "id": "69ce423915688a2a6c4772d7",
      "title": "BLAAAA",
      "client": {
        "id": "69ce41a815688a2a6c4772d1",
        "businessType": null
      }
    },
    "status": "blocked",
    "progress": 0,
    "assignedUsers": [
      {
        "id": "69ce445015688a2a6c4772e1",
        "name": "sama"
      }
    ],
    "dependencies": [
      {
        "taskId": "69ce45bfcaf285ea7ba04491",
        "isRequired": true
      }
    ],
    "schedule": [
      {
        "date": "2026-04-15",
        "startTime": "10:00",
        "endTime": "13:00"
      }
    ],
    "delayReason": null
  }
}
```

Error Responses:

| Status | Error Type | Cause |
|--------|-----------|-------|
| 404 | NOT_FOUND | Task not found |

---

### Update Task

PATCH /tasks/:id

Headers:
```
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json
```

Body:
```json
{
  "title": "string",
  "assignedUsers": [...],
  "schedule": [...]
}
```

Success Response (200):
```json
{
  "success": true,
  "message": "updated successfully",
  "data": null
}
```

Error Responses:

| Status | Error Type | Cause |
|--------|-----------|-------|
| 400 | VALIDATION_ERROR | Cannot modify completed task |
| 404 | NOT_FOUND | Task not found |
| 409 | CONFLICT_ERROR | Schedule conflict |

---

### Complete Task

POST /tasks/:id/complete

Headers:
```
Authorization: Bearer <YOUR_TOKEN>
```

Success Response (200):
```json
{
  "success": true,
  "message": "completed",
  "data": {
    "id": "69ce45bfcaf285ea7ba04491",
    "title": "video shoot",
    "status": "done",
    "progress": 100
  }
}
```

---

### Delay Task

POST /tasks/:id/delay

Headers:
```
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json
```

Body:
```json
{
  "reason": "string (required)",
  "customDate": "string (optional)",
  "customTime": {
    "startTime": "HH:mm",
    "endTime": "HH:mm"
  } (optional)
}
```

Success Response (200):
```json
{
  "success": true,
  "message": "task delayed",
  "data": {
    "id": "69ce47aacaf285ea7ba044a2",
    "title": "edit video shoot",
    "status": "delayed",
    "delayReason": "Client requested content changes",
    "schedule": [
      {
        "date": "2026-04-16",
        "startTime": "10:00",
        "endTime": "13:00"
      }
    ]
  }
}
```

---

### Delete Task

DELETE /tasks/:id

Headers:
```
Authorization: Bearer <YOUR_TOKEN>
```

Success Response (200):
```json
{
  "success": true,
  "message": "task deleted",
  "data": null
}
```

Error Responses:

| Status | Error Type | Cause |
|--------|-----------|-------|
| 409 | CONFLICT_ERROR | Task has dependencies |

---

## Calendar

### Get Month Calendar

GET /calendar/month?year=2024&month=4

Headers:
```
Authorization: Bearer <YOUR_TOKEN>
```

Success Response (200):
```json
{
  "success": true,
  "message": "Calendar fetched",
  "data": [
    {
      "date": "2024-04-15",
      "tasks": [
        {
          "taskId": "69ce45bfcaf285ea7ba04491",
          "task": "video shoot",
          "project": "BLAAAA",
          "client": "BLAA",
          "status": "done",
          "startTime": "10:00",
          "endTime": "12:00",
          "assignedUsers": [
            {
              "name": "sara",
              "role": "photographer"
            }
          ]
        }
      ]
    }
  ]
}
```

Error Responses:

| Status | Error Type | Cause |
|--------|-----------|-------|
| 400 | VALIDATION_ERROR | Year is required |
| 400 | VALIDATION_ERROR | Month is required |

---

### Get My Calendar

GET /calendar/my?year=2024&month=4

Headers:
```
Authorization: Bearer <YOUR_TOKEN>
```

Success Response (200):
```json
{
  "success": true,
  "message": "My calendar fetched",
  "data": [
    {
      "date": "2024-04-15",
      "tasks": [...]
    }
  ]
}
```

---

## Notifications

### Get My Notifications

GET /notifications

Headers:
```
Authorization: Bearer <YOUR_TOKEN>
```

Success Response (200):
```json
{
  "success": true,
  "message": "success",
  "data": [
    {
      "_id": "64notif123...",
      "type": "new_task",
      "message": "New task assigned: video shoot",
      "taskId": "69ce45bfcaf285ea7ba04491",
      "isRead": false,
      "createdAt": "2024-04-01T10:00:00.000Z"
    }
  ]
}
```

Notification Types:
- new_task - Task assigned
- task_update - Status changed
- delay - Task delayed
- dependency - Dependency resolved

---

### Mark as Read

PATCH /notifications/:id/read

Headers:
```
Authorization: Bearer <YOUR_TOKEN>
```

Success Response (200):
```json
{
  "success": true,
  "message": "Marked as read",
  "data": {
    "_id": "64notif123...",
    "isRead": true,
    "updatedAt": "2024-04-01T11:00:00.000Z"
  }
}
```

---

### Mark All as Read

PATCH /notifications/read-all

Headers:
```
Authorization: Bearer <YOUR_TOKEN>
```

Success Response (200):
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": null
}
```

---
## Error Handling & Status Codes

### Combined Error Reference

| Error Type | HTTP Status | Meaning | When It Happens |
|------------|-------------|---------|----------------|
| VALIDATION_ERROR | 400 | Bad Request | Missing field, invalid format, wrong data type |
| AUTH_ERROR | 401 | Unauthorized | Missing token, invalid token, expired token, wrong credentials |
| FORBIDDEN | 403 | Forbidden | User logged in but doesn't have permission for this action |
| NOT_FOUND | 404 | Not Found | Resource ID doesn't exist in database |
| CONFLICT_ERROR | 409 | Conflict | Business rule violation (e.g., schedule overlap, task has dependencies) |
| ALREADY_EXISTS | 409 | Duplicate | Unique field already taken (e.g., email, username) |
| SERVER_ERROR | 500 | Internal Error | Unexpected server failure, database connection issue |

---

### Example Error Response
```json
{
  "success": false,
  "message": "conflict for photographer",
  "error": {
    "type": "CONFLICT_ERROR",
    "field": "schedule",
    "details": "User already has a task at this time slot"
  }
}
```

---

## Role-Based Access

| Endpoint | Role Required |
|----------|--------------|
| POST /auth/* | Public |
| GET /auth/me | Any authenticated |
| CRUD /users | Any authenticated |
| CRUD /clients | Any authenticated |
| CRUD /projects | Any authenticated |
| POST/PATCH/DELETE /tasks | scheduler only |
| GET /tasks* | Any authenticated |
| GET /calendar/* | Any authenticated |
| CRUD /notifications | Any authenticated (own data only) |

---

---

Base URL: https://company-backend-o1zw.onrender.com/api
Last Updated: April 2026
API Version: 1.0

End of Documentation
```

---
