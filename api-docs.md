# AIJon API Documentation

## Overview

This API powers the AIJon platform for managing AI chat applications. It allows administrators to manage organizations, documents, and AI configurations, while providing a dedicated endpoint for end-users to interact with AI bots.

## Base URL

```
http://localhost:3000
```

## Authentication

The API uses two types of authentication:

1.  **Admin Authentication (JWT):** Used for management endpoints (Organizations, Documents, Applications).
    - **Header:** `Authorization: Bearer <access_token>`
    - Obtain token via `/auth/login`.

2.  **Application Authentication (API Key):** Used for the Chat interface.
    - **Header:** `Authorization: Bearer <application_api_key>`
    - The API Key is generated when creating an Application.

---

## 1. Authentication

### Login

Authenticate an admin user to receive a JWT access token.

- **Endpoint:** `POST /auth/login`
- **Access:** Public

**Request Body:**

```json
{
  "username": "admin_user",
  "password": "secret_password"
}
```

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 2. Chat (End-User)

Endpoints for the actual AI chat functionality. These routes require the **Application API Key**.

### Send Chat Message

Send a message to the AI agent associated with the API Key. The system handles context assembly (RAG) using documents assigned to the application.

- **Endpoint:** `POST /v1/chat/completions`
- **Access:** Protected (`Bearer <API_KEY>`)

**Request Body:**

```json
{
  "sessionId": "user-123-session-abc",
  "source": "API",
  "messages": [
    {
      "role": "USER",
      "content": "What does the uploaded document say about pricing?"
    }
  ]
}
```

- `sessionId`: Unique identifier for the end-user or session.
- `source`: Origin of the chat (Allowed: `TELEGRAM`, `API`, `WEB`).
- `messages`: Array of message history. The last message with role `USER` is processed.

**Response (201 Created):**

```json
{
  "id": "uuid-string",
  "role": "ASSISTANT",
  "content": "Based on the document, the pricing is...",
  "created_at": "2023-10-27T10:00:00.000Z"
}
```

---

## 3. Admin Management

Endpoints for managing the platform administrators.

### Create Admin

- **Endpoint:** `POST /admin`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "username": "jdoe",
    "password": "securePassword123"
  }
  ```

### Get All Admins

- **Endpoint:** `GET /admin`

### Get Admin by ID

- **Endpoint:** `GET /admin/:id`

### Update Admin

- **Endpoint:** `PATCH /admin/:id`
- **Body:** (Partial `CreateAdminDto`)

### Delete Admin

- **Endpoint:** `DELETE /admin/:id`

---

## 4. Organization Management

Manage tenants/customers.
**Base Path:** `/admin/organizations`
**Auth:** JWT Required

### Create Organization

- **Endpoint:** `POST /admin/organizations`
- **Body:**
  ```json
  {
    "name": "Acme Corp",
    "slug": "acme-corp",
    "contactInfo": "contact@acme.com",
    "isActive": true
  }
  ```

### Get All Organizations

- **Endpoint:** `GET /admin/organizations`

### Get Organization by ID

- **Endpoint:** `GET /admin/organizations/:id`

### Update Organization

- **Endpoint:** `PATCH /admin/organizations/:id`
- **Body:** (Partial `CreateOrganizationDto`)

### Delete Organization

- **Endpoint:** `DELETE /admin/organizations/:id`
- **Note:** Performs a soft delete (sets `is_active` to false).

---

## 5. Folder Management

Manage folders to organize documents within an organization.
**Base Path:** `/admin/folders`
**Auth:** JWT Required

### Create Folder

- **Endpoint:** `POST /admin/folders`
- **Body:**
  ```json
  {
    "name": "Financial Reports",
    "organizationId": "uuid-of-organization"
  }
  ```

### Get Folders

- **Endpoint:** `GET /admin/folders`
- **Query Params:** `?organizationId=<uuid>` (Optional)

### Update Folder

- **Endpoint:** `PATCH /admin/folders/:id`
- **Body:**
  ```json
  {
    "name": "New Folder Name"
  }
  ```

### Delete Folder

- **Endpoint:** `DELETE /admin/folders/:id`

---

## 6. Document Management

Upload and manage files for RAG (Retrieval-Augmented Generation).
**Base Path:** `/admin/documents`
**Auth:** JWT Required

### Upload Document

Uploads a file to Google Cloud Storage and registers it in the database.

- **Endpoint:** `POST /admin/documents/upload`
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `file`: (Binary file data)
  - `organizationId`: (UUID String)
  - `folderId`: (UUID String, Optional)

### Get Documents

- **Endpoint:** `GET /admin/documents`
- **Query Params:**
  - `organizationId=<uuid>`
  - `folderId=<uuid>`

### Delete Document

- **Endpoint:** `DELETE /admin/documents/:id`

---

## 7. Application (Bot) Management

Manage the AI applications, their prompts, and assigned knowledge base.
**Base Path:** `/admin/applications`
**Auth:** JWT Required (Implied by path structure)

### Create Application

Creates a new bot and automatically generates an API Key.

- **Endpoint:** `POST /admin/applications`
- **Body:**
  ```json
  {
    "name": "Customer Support Bot",
    "system_prompt": "You are a helpful assistant for Acme Corp.",
    "ai_model_id": "uuid-of-ai-model",
    "organization_id": "uuid-of-organization",
    "temperature": 0.7
  }
  ```

### Get All Applications

- **Endpoint:** `GET /admin/applications`

### Get Application by ID

- **Endpoint:** `GET /admin/applications/:id`

### Update Application

- **Endpoint:** `PATCH /admin/applications/:id`
- **Body:** (Partial `CreateApplicationDto`)

### Delete Application

- **Endpoint:** `DELETE /admin/applications/:id`

### Assign Documents to Application

Link specific documents to an application for context.

- **Endpoint:** `POST /admin/applications/:id/documents`
- **Body:**
  ```json
  {
    "documentIds": ["uuid-doc-1", "uuid-doc-2"]
  }
  ```

### Get Assigned Documents

- **Endpoint:** `GET /admin/applications/:id/documents`

### Remove Document from Application

- **Endpoint:** `DELETE /admin/applications/:id/documents/:documentId`

### Regenerate API Key

Revokes the old key and creates a new one for the application.

- **Endpoint:** `POST /admin/applications/:id/regenerate-key`

---

## Data Models (Reference)

### Enums

- **User Source:** `TELEGRAM`, `API`, `WEB`
- **Message Role:** `USER`, `ASSISTANT`
- **Client Status:** `ACTIVE`, `SUSPENDED`, `ARCHIVED`

### Error Handling

- **401 Unauthorized:** Missing or invalid Token/API Key.
- **404 Not Found:** Resource does not exist.
- **422 Unprocessable Entity:** Validation failed (e.g., missing file in upload).
- **500 Internal Server Error:** Server-side issues.
