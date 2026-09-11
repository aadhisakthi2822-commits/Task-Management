# Task Management System — MERN Stack

> **Technical Assessment for MERN Stack Intern at Xplore Intellects**  
> A full-featured, responsive, and secure Task Management System with Role-Based Access Control (Admin & Employee), automated email notifications via Nodemailer, real-time-like dashboard statistics, search, pagination, and built-in email audit previewer.

---

## 🌟 Key Features

### 🔐 1. Authentication & Role-Based Access Control (RBAC)
- **Role-based Portals**: Separate, intuitive login portals for **Administrator** and **Employee**.
- **Credential Validation**: Validates formats and handles invalid logins with structured error banners.
- **Protected Routing**: Role-guarded routes on frontend (`ProtectedRoute`) and secure JWT middleware on backend (`protect`, `isAdmin`, `isEmployee`).
- **1-Click Quick Demo Login**: Instant login buttons for reviewers to test both Admin and Employee workflows without typing credentials.

### 👑 2. Admin Module
- **Dashboard Statistics**:
  - ⚪ **Not Started** count
  - 🟡 **Pending / In Progress** count
  - 🟢 **Completed** count
  - 📊 Total Tasks & Completion Percentage Progress
  - 🎯 Priority breakdown (High, Medium, Low)
- **Employee Directory**:
  - View all registered employees with contact details and department.
  - Live task workload statistics per employee (Total, Active, Completed).
  - Ability to add/onboard new employees directly from the dashboard.
- **Task Management**:
  - Assign new tasks to employees with **Title**, **Description**, **Assignee**, **Priority** (High, Medium, Low), and **Due Date**.
  - Edit task details, reassign to another team member, or adjust priority/status.
  - Delete tasks with safe confirmation modals.
  - Full audit trail of status changes with timestamps and remarks.
- **Search & Pagination**:
  - Real-time search across task titles, descriptions, and assigned employee names.
  - Multi-criteria filtering by Status, Priority, and Assignee.
  - Server-side pagination with configurable page size (5, 10, 20, 50) and page jump navigation.

### 💼 3. Employee Module
- **Dedicated Employee Dashboard**:
  - Personalized task metrics (My Total, Not Started, In Progress, Completed).
  - View all tasks assigned exclusively to the logged-in employee.
  - Personal search and status/priority filters.
- **Status Progression**:
  - Transition task status between:
    - **Not Started**
    - **Pending / In Progress**
    - **Completed**
  - Add progress remarks/notes on status transitions.

### 📧 4. Email Notification Integration
- **Event 1 (Task Assigned)**: Whenever an Admin creates or reassigns a task, an automated HTML email notification is sent to the employee with task title, description, priority badge, and due date.
- **Event 2 (Task Status Updated)**: Whenever an Employee updates the status of an assigned task, an automated HTML email notification is sent to the Administrator (`admin@xplore.com`) with previous status, new status, timestamp, and notes.
- **Built-in Email Notification Center**: An interactive in-app modal allowing reviewers to inspect every sent email (HTML preview, recipient, timestamps, and Ethereal preview URLs) even without configuring third-party SMTP!

---

## 🛠️ Tech Stack

- **Frontend**:
  - React 18 (Vite)
  - Tailwind CSS
  - Lucide React Icons
  - Axios with JWT Interceptors
  - React Router DOM v6
- **Backend**:
  - Node.js & Express.js (ES Modules)
  - MongoDB & Mongoose ORM
  - JSON Web Tokens (JWT) & bcryptjs
  - Nodemailer (SMTP + Ethereal auto-fallback)
  - CORS & Dotenv
- **Database**:
  - MongoDB (Local / Atlas)

---

## 📁 Project Architecture

```text
Task-Management/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB connection
│   │   │   └── mailer.js          # Nodemailer config & email sender helpers
│   │   ├── controllers/
│   │   │   ├── authController.js  # Login, register, demo credentials
│   │   │   ├── taskController.js  # Task CRUD, search, pagination, stats
│   │   │   ├── userController.js  # Employee listing, workloads, creation
│   │   │   └── notificationController.js # Email logs for in-app viewer
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js  # JWT token verification
│   │   │   ├── roleMiddleware.js  # Role authorization (Admin/Employee)
│   │   │   └── errorMiddleware.js # Centralized error & 404 handler
│   │   ├── models/
│   │   │   ├── User.js            # User schema with bcrypt password hashing
│   │   │   ├── Task.js            # Task schema with history & indexing
│   │   │   └── EmailLog.js        # Audit log of dispatched emails
│   │   ├── routes/
│   │   │   ├── authRoutes.js      # /api/auth
│   │   │   ├── taskRoutes.js      # /api/tasks
│   │   │   ├── userRoutes.js      # /api/users
│   │   │   └── notificationRoutes.js # /api/notifications
│   │   ├── utils/
│   │   │   └── emailTemplates.js  # Responsive HTML email templates
│   │   ├── seed.js                # Database seeder script
│   │   └── server.js              # Express app bootstrap
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js          # Axios instance with interceptors
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Badge.jsx      # Status & Priority badges
│   │   │   │   ├── Modal.jsx      # Reusable dialog modal
│   │   │   │   ├── Navbar.jsx     # Navigation bar with role badge
│   │   │   │   ├── Sidebar.jsx    # Role-based sidebar navigation
│   │   │   │   ├── Layout.jsx     # App layout frame
│   │   │   │   ├── Pagination.jsx # Table pagination controls
│   │   │   │   ├── StatsCard.jsx  # Metric cards
│   │   │   │   ├── ProtectedRoute.jsx # Role-guarded route wrapper
│   │   │   │   └── EmailLogsModal.jsx # In-app email inspection modal
│   │   │   ├── admin/
│   │   │   │   └── TaskFormModal.jsx  # Task creation & edit modal
│   │   │   └── employee/
│   │   │       └── StatusUpdateModal.jsx # Task status changer modal
│   │   ├── context/
│   │   │   ├── AuthContext.jsx         # Auth state & user session
│   │   │   └── NotificationContext.jsx # Toast notifications & drawer state
│   │   ├── pages/
│   │   │   ├── Login.jsx               # Tabbed login with 1-click demo logins
│   │   │   ├── AdminDashboard.jsx      # Admin overview & stats
│   │   │   ├── AdminTasks.jsx          # Admin task table with search & pagination
│   │   │   ├── AdminEmployees.jsx      # Employee directory & creation
│   │   │   ├── EmployeeDashboard.jsx   # Employee tasks & status updates
│   │   │   └── NotFound.jsx            # 404 page
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── README.md
└── package.json
```

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI.

### 2. Clone and Install Dependencies
From the root directory:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

*(Alternatively from root: `npm run install:all`)*

### 3. Configure Environment Variables
In `backend/.env` (pre-configured for instant local use):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/task_management_db
JWT_SECRET=super_secret_jwt_key_xplore_intellects_2026_secure
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@xplore.com

# Optional: Real SMTP Configuration (Gmail, Mailtrap, etc.)
# If left commented out, system automatically uses Ethereal test accounts + in-app Email Audit Center
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# EMAIL_FROM="Xplore Task Manager <noreply@xplore.com>"
```

### 4. Seed the Database
Populate the database with default Admin, sample Employees, realistic Tasks, and sample Email logs:

```bash
cd backend
npm run seed
```

### 5. Start Development Servers

**Terminal 1: Start Backend API (Port 5000)**
```bash
cd backend
npm run dev
```

**Terminal 2: Start Frontend (Port 5173)**
```bash
cd frontend
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 🔑 Pre-seeded Demo Credentials

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | Sarah Connor (Admin) | `admin@xplore.com` | `Admin@123` |
| **Employee** | Alex Rivera | `alex.rivera@xplore.com` | `Employee@123` |
| **Employee** | Priya Sharma | `priya.sharma@xplore.com` | `Employee@123` |
| **Employee** | David Chen | `david.chen@xplore.com` | `Employee@123` |
| **Employee** | Marcus Vance | `marcus.vance@xplore.com` | `Employee@123` |

> 💡 **Tip for Reviewers**: On the login page, you can simply click the **"1-Click Quick Demo Login"** buttons to log in instantly as Admin or Employee!

---

## 📡 API Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `POST` | `/api/auth/register` | Public/Admin | Register new user account |
| `GET` | `/api/auth/me` | Private | Get currently authenticated user profile |
| `GET` | `/api/auth/demo-credentials` | Public | Retrieve sample credentials for 1-click login |

### 📋 Tasks (`/api/tasks`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks/stats` | Private | Aggregated stats (Not Started, In Progress, Completed, Priorities) |
| `GET` | `/api/tasks` | Private | Get tasks with search (`?search=`), status, priority, and pagination (`?page=1&limit=10`) |
| `POST` | `/api/tasks` | Admin | Create & assign task (triggers email notification to employee) |
| `GET` | `/api/tasks/:id` | Private | Get single task details & status history |
| `PUT` | `/api/tasks/:id` | Admin | Update task details & reassignment |
| `PATCH` | `/api/tasks/:id/status` | Private | Update task status (triggers email notification to admin) |
| `DELETE` | `/api/tasks/:id` | Admin | Permanently delete a task |

### 👥 Users & Employees (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/employees` | Admin | List all employees with workload counts |
| `POST` | `/api/users/employees` | Admin | Create a new employee profile |
| `GET` | `/api/users/employees/:id` | Admin | Get employee details with assigned tasks |

### 📬 Notifications & Email Audit (`/api/notifications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications/emails` | Private | List dispatched email notifications |
| `GET` | `/api/notifications/emails/:id` | Private | Get single email notification details & HTML body |

---

## 🧪 Testing the Complete Workflow

### 1. Testing Admin Workflow:
1. Log in using the **Admin** button or credentials (`admin@xplore.com` / `Admin@123`).
2. Verify **Dashboard Statistics**: Not Started, In Progress, Completed, Priority Distribution.
3. Click **"Assign New Task"**:
   - Fill in Title, Description, select employee (e.g. `Alex Rivera`), choose `High` priority, and set a due date.
   - Click **"Assign Task"**.
4. Open the **"Email Logs"** button in the top navigation bar:
   - Notice the new email entry dispatched to `alex.rivera@xplore.com`.
   - Click it to view the rendered HTML email template and Ethereal preview link!
5. Navigate to **"Task Management"**:
   - Test the **Search Bar**: type a keyword (e.g. `Navigation` or `Alex`) to observe instant filtering.
   - Test the **Status** and **Priority** dropdown filters.
   - Test **Pagination** (switch to 5 per page, click next/previous pages).

### 2. Testing Employee Workflow:
1. Click **Log out** and log in as **Employee** (`alex.rivera@xplore.com` / `Employee@123`).
2. Notice only tasks assigned to Alex are visible.
3. On a task with status `Not Started`, click **"Change Status"**:
   - Change status to `Pending / In Progress` or `Completed`.
   - Add an optional progress remark.
   - Click **"Save & Notify Admin"**.
4. A success toast appears confirming status update and email dispatch.
5. Click **"Email Logs"** in the navigation bar to inspect the email sent to `admin@xplore.com` with the transition details!

---

## 🛡️ Validation & Error Handling
- **Frontend**: Real-time required field checks, password length checks, user-friendly toast alerts for both successes and errors.
- **Backend**: Mongoose schema validations, unique email constraints, centralized error handler formatting clean JSON errors, and JWT protection against expired/invalid tokens.

---

## 👨‍💻 Submission Details
- **Candidate Position**: MERN Stack Intern
- **Company**: Xplore Intellects
- **Assessment**: Task Management System
