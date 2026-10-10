# Real-Time Collaborative Code Editor (MERN Stack + Yjs CRDT + Docker Sandbox)

A production-grade, full-stack collaborative online IDE built with the **MERN Stack** (MongoDB, Express.js, React, Node.js). Multiple developers can collaborate on projects in real time, simultaneously edit files without conflict, see live remote cursors and user presence, and safely execute code inside isolated Docker sandbox containers.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [MERN Architecture & Real-Time Sync](#mern-architecture--real-time-sync)
4. [Folder Structure](#folder-structure)
5. [Prerequisites](#prerequisites)
6. [Environment Variables](#environment-variables)
7. [Installation & Local Setup](#installation--local-setup)
   - [Backend Startup](#backend-startup)
   - [Frontend Startup](#frontend-startup)
   - [Running via Docker Compose](#running-via-docker-compose)
8. [How Collaboration Works](#how-collaboration-works)
9. [How CRDT (Conflict-free Replicated Data Types) Works](#how-crdt-conflict-free-replicated-data-types-works)
10. [How Code Execution Works (Docker Sandbox)](#how-code-execution-works-docker-sandbox)
11. [Security Considerations](#security-considerations)
12. [API Documentation](#api-documentation)
13. [Verification & Testing](#verification--testing)
14. [Troubleshooting](#troubleshooting)

---

## Project Overview

The **Real-Time Collaborative Code Editor** provides a desktop-grade online IDE experience inspired by VS Code and Cursor. It combines:
- **Persistent Project & File Management** using MongoDB.
- **Sub-millisecond Real-Time Collaboration** using Yjs Conflict-free Replicated Data Types (CRDT) and WebSockets.
- **Remote Cursors & Awareness** displaying active users, selections, and typing positions with distinct user colors.
- **Air-Gapped Docker Sandbox** that isolates user-submitted code in disposable Linux containers with strict CPU, RAM, process, and execution time limits.

---

## Key Features

- **Monaco Code Editor**:
  - Full syntax highlighting for JavaScript, Python, C++, HTML, CSS, Markdown, and JSON.
  - Multi-tab management, active file tabs, close buttons, and unsaved changes indicators.
  - Auto-indentation, line numbers, bracket matching, dark theme (`vs-dark`), and autocomplete.
  - Keyboard shortcuts (`Ctrl+S` / `Cmd+S` for saving).
- **Multi-User Collaboration**:
  - Zero-overwrite CRDT synchronization using `Yjs` and `y-websocket`.
  - Remote cursors showing collaborator name tags, cursor movements, and highlighted text selections in real time via `y-monaco`.
  - Project presence badges displaying online collaborators.
  - Automatic reconnection and state catch-up on network drops.
- **Multi-File Explorer**:
  - Create, rename, delete files and folders.
  - Tree explorer with language-specific file icons.
  - Starter templates for JavaScript, Python, and C++ upon project creation.
- **Secure Code Execution**:
  - Isolated execution for JavaScript (`node`), Python (`python3`), and C++ (`g++`).
  - CPU quotas, memory ceilings (256MB), fork-bomb mitigation (`--pids-limit 64`), and 5-second execution timeout.
  - Strict air-gap (`--network none`) preventing unauthorized network requests.
  - Ephemeral root filesystem (`--read-only` with limited `--tmpfs`).
- **Interactive Terminal & Output Panel**:
  - Real-time execution indicators ("Running JavaScript...").
  - Formatted stdout, stderr, execution duration in milliseconds, and exit statuses.
  - "Problems" tab displaying syntax, runtime, and compilation errors.
- **Authentication & Project Access**:
  - Secure registration and login using `bcryptjs` (salt factor 10) and `JWT`.
  - Share modal to copy workspace invite links and invite team members by email.
  - Strict role-based authorization ensuring only project owners and invited collaborators can view or modify projects.

---

## MERN Architecture & Real-Time Sync

```
[ Browser / React Client ]
       │
       ├── REST API (HTTP) ───────────► [ Express REST API ] ──► [ MongoDB (Mongoose) ]
       │                                       │
       ├── Yjs CRDT (WebSocket) ──────► [ Node.js WS Server ]
       │                                  - Room Manager
       │                                  - Awareness Protocol
       │                                  - Debounced DB Persistence
       │
       └── Code Execution (HTTP) ─────► [ Execution Manager ]
                                               │
                                       [ Docker Sandbox ]
                                         - JavaScript (Node)
                                         - Python (Python3)
                                         - C++ (GCC/G++)
```

---

## Folder Structure

```
collaborative-code-editor/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Common/              # Button, Input, Modal, Toast, Spinner
│   │   │   ├── Editor/              # MonacoEditor, EditorTabs
│   │   │   ├── FileExplorer/        # FileExplorer, FileTreeItem, NewItemModal
│   │   │   ├── Navbar/              # Navbar, ShareModal
│   │   │   ├── Terminal/            # TerminalPanel, OutputViewer
│   │   │   └── UserPresence/        # UserPresence, UserAvatar
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Authentication state and tokens
│   │   │   └── CollaborationContext.jsx
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── pages/
│   │   │   ├── Dashboard/           # Project list and project creation
│   │   │   ├── Login/               # Sign in page
│   │   │   ├── Register/            # Sign up page
│   │   │   └── Workspace/           # Main collaborative IDE workspace
│   │   ├── services/
│   │   │   ├── api.js               # REST client for backend
│   │   │   └── collaboration.js     # Yjs provider and awareness manager
│   │   ├── utils/
│   │   │   ├── colors.js            # User cursor color hash generator
│   │   │   └── languageDetection.js # File extension to Monaco language mapper
│   │   ├── App.jsx                  # React Router routes
│   │   ├── main.jsx                 # Entrypoint
│   │   └── index.css                # Tailwind directives & Monaco cursor CSS
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── server/
│   ├── config/
│   │   └── db.js                    # Mongoose database connection
│   ├── controllers/
│   │   ├── authController.js        # Register, login, getMe
│   │   ├── projectController.js     # Project CRUD & collaborators
│   │   ├── fileController.js        # File and folder operations
│   │   └── executionController.js   # Code execution endpoint
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT verification
│   │   └── errorMiddleware.js       # Central error handler
│   ├── models/
│   │   ├── User.js                  # User schema with hashed passwords
│   │   ├── Project.js               # Project schema with collaborators
│   │   └── File.js                  # File schema with path indexing
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── fileRoutes.js
│   │   └── executionRoutes.js
│   ├── sandbox/
│   │   ├── dockerRunner.js          # Isolated Docker container runner
│   │   ├── executionManager.js      # Input sanitization and language router
│   │   └── limits.js                # Memory, CPU, timeout limits
│   ├── websocket/
│   │   ├── collaborationServer.js   # Yjs WebSocket server & heartbeats
│   │   └── roomManager.js           # Document rooms & awareness states
│   ├── test-suite.js                # Full automated verification suite
│   ├── server.js                    # Express and WebSocket server entry
│   └── package.json
│
├── docker/
│   ├── javascript/
│   │   └── Dockerfile               # Node.js alpine execution image
│   ├── python/
│   │   └── Dockerfile               # Python 3 alpine execution image
│   └── cpp/
│       └── Dockerfile               # GCC/G++ alpine execution image
│
├── docker-compose.yml               # Local infrastructure compose file
├── .env.example                     # Environment template
├── .gitignore
└── README.md
```

---

## Prerequisites

- **Node.js**: v18.0.0 or later (v20+ recommended).
- **npm**: v9.0.0 or later.
- **MongoDB**: MongoDB 6.0+ running locally (`mongodb://localhost:27017`) or a remote MongoDB Atlas URI.
- **Docker Desktop** (Optional, for code execution): Docker 20.10+ running with the Docker daemon active.

---

## Environment Variables

Copy `.env.example` to `server/.env` (or configure in the deployment environment):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/collaborative_editor
JWT_SECRET=super_secret_jwt_key_collaborative_code_editor_2026
CLIENT_URL=http://localhost:5173
WS_URL=ws://localhost:5000
```

For the frontend client, create `client/.env` if customizing ports:
```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
```

---

## Installation & Local Setup

### 1. Install Dependencies

In the root directory:

```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 2. Backend Startup

Make sure your MongoDB server is running:

```bash
cd server
npm start
```
The server will start on port `5000`:
- Express REST API: `http://localhost:5000`
- WebSocket Collaboration Server: `ws://localhost:5000/ws`

### 3. Frontend Startup

In another terminal:

```bash
cd client
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 4. Running via Docker Compose

To start the complete infrastructure (MongoDB, Server, and Client) with a single command:

```bash
docker compose up --build
```

To stop all services:
```bash
docker compose down
```

---

## How Collaboration Works

1. **Room Creation & Join**:
   When a user opens `/workspace/:projectId` and selects a file, the client connects to a dedicated WebSocket room:
   ```
   ws://localhost:5000/ws?room=project_{projectId}_{fileId}
   ```
2. **Yjs State Vector Handshake**:
   - The server immediately responds with a **Sync Step 1** containing the current document state vector.
   - The client calculates any delta updates missing between its local state and the server's state, returning **Sync Step 2**.
   - Any document changes cached in MongoDB are preloaded by `RoomManager`.
3. **Continuous Two-Way Sync**:
   - As any user types, the `MonacoBinding` converts editor edits into compact binary Yjs operations.
   - Updates are sent over the WebSocket and broadcast to all other collaborators in that room.
   - Remote changes are applied directly to Monaco editor models without re-rendering or losing cursor focus.
4. **Awareness & Presence**:
   - Collaborators broadcast their cursor coordinates, selection ranges, username, and assigned color.
   - The `y-monaco` binding attaches colored cursor carats and username labels above the cursors of other connected developers.

---

## How CRDT (Conflict-free Replicated Data Types) Works

Traditional collaborative applications frequently rely on Last-Write-Wins (LWW) or operational transformation (OT) with central authoritative locks. LWW can overwrite a user's code when simultaneous typing occurs.

**Yjs CRDT guarantees Strong Eventual Consistency (SEC)**:
- Every character inserted is assigned a unique logical timestamp and parent item identifier.
- When User A types `const x = 10;` and User B simultaneously types `console.log(x);`, both changes are treated as deterministic mathematical tree operations.
- All peers arrive at the exact same sequence of code characters regardless of network latency, packet arrival order, or transient disconnections.

---

## How Code Execution Works (Docker Sandbox)

Code execution follows a zero-trust model: **User-submitted code is never executed directly on the host machine.**

```
Client (Run Button) 
  ──► POST /api/execute { language: "javascript", code: "..." }
  ──► Express Server
  ──► ExecutionManager (Input sanitization & limits check)
  ──► DockerRunner
        - Spawns isolated container:
          docker run -i --rm --network none --memory 256m --cpus 0.5 --pids-limit 64 ...
        - Pipes user code via STDIN directly into container
        - Collects stdout & stderr
        - Terminates process if execution time exceeds 5000ms
  ──► JSON Response { success, stdout, stderr, executionTime }
  ──► IDE Terminal Display
```

### Docker Sandbox Security Controls
- `--network none`: Container has zero internet access (cannot make outbound calls, download malware, or scan internal networks).
- `--memory 256m`: Prevents memory exhaustion and out-of-memory crashes.
- `--cpus 0.5`: Restricts CPU usage to half a core to prevent CPU starvation.
- `--pids-limit 64`: Thwarts fork bombs and runaway subprocesses.
- `--cap-drop ALL`: Strips all Linux capabilities from the container.
- `--security-opt no-new-privileges:true`: Prevents privilege escalation attacks.
- `--read-only`: Root filesystem is read-only; ephemeral writes restricted to bounded `--tmpfs /tmp:size=64m`.
- `--rm`: Container is completely destroyed and cleaned up immediately upon termination.

---

## Security Considerations

1. **Authentication**: Passwords are encrypted using `bcryptjs` with 10 salt rounds. JWTs are signed with a secure 256-bit key and expire after 7 days.
2. **Access Control**: Users can only read and modify projects that they own or where they have been explicitly added as collaborators.
3. **Helmet HTTP Headers**: Express uses `helmet` to protect against cross-site scripting (XSS), clickjacking, and MIME-type sniffing.
4. **CORS Restrictions**: Configured to restrict incoming requests to approved client origins (`CLIENT_URL`).
5. **Rate Limiting**: `express-rate-limit` prevents brute-force login attempts and API flooding (500 requests per 15 minutes per IP).
6. **No Host Execution**: Child process execution on the host machine is strictly disabled. If Docker is not running, the API returns a clear configuration error rather than falling back to host execution.

---

## API Documentation

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user (`name`, `email`, `password`) | No |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user's profile | Yes (Bearer Token) |

### Project Routes

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/projects` | List all owned and shared projects | Yes |
| `POST` | `/api/projects` | Create a new project with starter files | Yes |
| `GET` | `/api/projects/:id` | Get project details, collaborators, and file tree | Yes |
| `PUT` | `/api/projects/:id` | Update project name or add collaborator (`collaboratorEmail`) | Yes |
| `DELETE` | `/api/projects/:id` | Delete project and all associated files | Yes (Owner only) |

### File Routes

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/projects/:projectId/files` | Create a file or folder (`name`, `path`, `type`, `content`) | Yes |
| `PUT` | `/api/files/:id` | Update file content, rename file, or change path | Yes |
| `DELETE` | `/api/files/:id` | Delete file or folder (and its recursive contents) | Yes |

### Code Execution Routes

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/execute` | Execute code in Docker container (`language`, `code`) | Yes |

#### Sample Execution Request:
```json
{
  "language": "javascript",
  "code": "console.log('Hello from Docker!');"
}
```

#### Sample Execution Response:
```json
{
  "success": true,
  "stdout": "Hello from Docker!\n",
  "stderr": "",
  "executionTime": 145
}
```

---

## Verification & Testing

The project includes an end-to-end automated test suite covering all 24 verification requirements specified in the project roadmap:
- User registration, login, and JWT validation.
- Project creation with default starter templates.
- Collaborator invitations and authorization boundaries (verifying 403 Forbidden on unauthorized project access).
- Multi-file operations (create, update, delete).
- Real-time multi-client WebSocket synchronization using Yjs CRDT.
- Awareness protocol and presence tracking across concurrent clients.
- Conflict-free simultaneous editing convergence.
- Disconnection and automatic reconnection catch-up.
- Docker sandbox security checks, input validation, and timeout handling.

To execute the test suite:
```bash
cd server
node test-suite.js
```

---

## Troubleshooting

- **MongoDB Connection Refused**:
  - Verify MongoDB service is running (`mongod` or Docker `mongo`).
  - Check the `MONGODB_URI` setting in `server/.env`.
- **WebSocket Disconnection or Status "Reconnecting..."**:
  - Ensure the backend server is running on port `5000`.
  - Check browser console for network blocks or CORS / firewall issues.
- **Docker Sandbox Error: "Docker is not running..."**:
  - Ensure Docker Desktop is installed and the daemon is active.
  - Test by running `docker info` in your system terminal.
- **Port Conflict (Port 5000 or 5173 already in use)**:
  - You can change the `PORT` variable in `server/.env` or configure `client/vite.config.js`.
