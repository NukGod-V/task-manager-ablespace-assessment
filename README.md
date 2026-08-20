# ClearStep - Task Management System (AbleSpace Assessment)

A full-stack, highly interactive Task Management System built to pixel-perfect Figma specifications. Designed with robust architecture, real-time filtering, drag-and-drop functionality, and true multi-user collaboration.

## 🚀 Tech Stack

**Frontend:**

* Next.js (App Router)
* React 18 + TypeScript
* Tailwind CSS (Pixel-perfect utility styling)
* `@dnd-kit` (Robust, accessible Drag & Drop)
* `next-themes` (Dark/Light + Custom Accent Colors)

**Backend:**

* NestJS
* TypeScript
* PostgreSQL
* TypeORM
* Passport.js (JWT & Google OAuth 2.0)

## ✨ Key Features

* **Secure Authentication:** Seamless Guest Login alongside robust Google OAuth 2.0 integration.
* **Dual View Modes:** Seamlessly toggle between a Kanban Board and a grouped List View.
* **Advanced Drag & Drop:** Move cards across Kanban columns or drag rows between status groups in the List View; changes automatically persist to the database.
* **Multi-User Collaboration:** True many-to-many relationships. Add members to projects and assign multiple users to a single task with dynamic UI avatar stacking.
* **Dynamic Filtering:** Filter tasks instantly by Status, Priority, Members, Labels, and Due Dates.
* **Theming Engine:** Full support for Dark/Light mode and 6 custom UI color accents, persisting across sessions.
* **Deep Customization:** Field visibility toggles allow users to strip down or expand the data shown on their boards and lists.

## 🏗️ Intentional Architectural Deviations

To balance the 14-day deadline with production stability, the following calculated tradeoffs were made:

1. **Subtasks & Resources as JSON Columns:** Rather than building three new relational tables (`Resource`, `Subtask`, and join tables) immediately, these are stored as structured JSON arrays on the `Task` entity. This ensures data safety and persistence while maintaining a simple upgrade path to relational tables when cross-task querying is required.
2. **Base64 Avatar Storage:** Uploaded profile pictures are stored as Base64 strings directly in PostgreSQL. While a dedicated S3/Cloudinary bucket is ideal for production, this approach achieves the feature requirement without imposing external infrastructure dependencies for the assessment.
3. **Scoped Filtering:** The "Teams" filter category was omitted as no `Team` entity exists in the core schema. Filters dynamically pull from actual data existing within the project to prevent empty or dead states.

## 🛠️ Local Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd <your-repo-folder>
```

### 2. Backend Setup

Ensure you have PostgreSQL running locally or via Docker.

```bash
cd taskmanager-api
npm install
```

Create a `.env` file in `taskmanager-api`:

```env
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=ablespace_db
JWT_SECRET=super_secret_jwt_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

Run the backend:

```bash
npm run start:dev
```

> **Note:** `synchronize: true` is enabled in TypeORM for this assessment, so tables will be automatically generated on startup.

### 3. Frontend Setup

```bash
cd ../taskmanager-web
npm install
```

Create a `.env.local` file in `taskmanager-web`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Run the frontend:

```bash
npm run dev
```

Visit `http://localhost:3000` to view the application.
