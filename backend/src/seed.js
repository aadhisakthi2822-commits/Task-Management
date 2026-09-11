import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Task } from './models/Task.js';
import { EmailLog } from './models/EmailLog.js';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/task_management_db';

    console.log(`⏳ Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    // Clear existing data
    console.log('🧹 Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Task.deleteMany({}),
      EmailLog.deleteMany({}),
    ]);

    // Create Admin user
    console.log('👤 Creating Admin user...');
    const admin = await User.create({
      name: 'Sarah Connor (Admin)',
      email: 'admin@xplore.com',
      password: 'Admin@123',
      role: 'admin',
      department: 'Operations & Engineering',
      phone: '+1 (555) 019-2831',
    });

    // Create Employee users
    console.log('👥 Creating Employee users...');
    const employees = await User.create([
      {
        name: 'Alex Rivera',
        email: 'alex.rivera@xplore.com',
        password: 'Employee@123',
        role: 'employee',
        department: 'Frontend Engineering',
        phone: '+1 (555) 301-4491',
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@xplore.com',
        password: 'Employee@123',
        role: 'employee',
        department: 'Backend Engineering',
        phone: '+1 (555) 782-9921',
      },
      {
        name: 'David Chen',
        email: 'david.chen@xplore.com',
        password: 'Employee@123',
        role: 'employee',
        department: 'UI/UX Design',
        phone: '+1 (555) 441-2098',
      },
      {
        name: 'Marcus Vance',
        email: 'marcus.vance@xplore.com',
        password: 'Employee@123',
        role: 'employee',
        department: 'DevOps & Cloud',
        phone: '+1 (555) 892-1134',
      },
    ]);

    const [alex, priya, david, marcus] = employees;

    // Create sample Tasks across various priorities and statuses
    console.log('📝 Creating sample tasks...');
    const now = new Date();
    const addDays = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const tasks = await Task.create([
      {
        title: 'Design Responsive Mobile Navigation & Hamburger Menu',
        description:
          'Create a seamless mobile drawer menu with smooth transitions, accessible keyboard navigation, and responsive breakpoints down to 320px width.',
        assignedTo: david._id,
        assignedBy: admin._id,
        priority: 'High',
        status: 'Pending / In Progress',
        dueDate: addDays(3),
        statusHistory: [
          {
            previousStatus: null,
            newStatus: 'Not Started',
            changedBy: admin._id,
            changedAt: addDays(-2),
            remarks: 'Initial task assignment',
          },
          {
            previousStatus: 'Not Started',
            newStatus: 'Pending / In Progress',
            changedBy: david._id,
            changedAt: addDays(-1),
            remarks: 'Started drafting wireframes in Figma',
          },
        ],
      },
      {
        title: 'Implement JWT Refresh Token & Session Revocation',
        description:
          'Enhance authentication security by adding rotating refresh tokens stored in HTTP-only cookies and an endpoint to revoke stale active sessions.',
        assignedTo: priya._id,
        assignedBy: admin._id,
        priority: 'High',
        status: 'Completed',
        dueDate: addDays(-1),
        statusHistory: [
          {
            previousStatus: 'Not Started',
            newStatus: 'Pending / In Progress',
            changedBy: priya._id,
            changedAt: addDays(-3),
            remarks: 'Began JWT middleware overhaul',
          },
          {
            previousStatus: 'Pending / In Progress',
            newStatus: 'Completed',
            changedBy: priya._id,
            changedAt: addDays(-1),
            remarks: 'Implemented Redis blacklist for token revocation and tested with Postman',
          },
        ],
      },
      {
        title: 'Integrate Email Notification Service with Nodemailer',
        description:
          'Connect Nodemailer transport to trigger automated HTML emails when tasks are assigned to team members and when statuses get updated.',
        assignedTo: alex._id,
        assignedBy: admin._id,
        priority: 'High',
        status: 'Completed',
        dueDate: addDays(1),
        statusHistory: [
          {
            previousStatus: 'Not Started',
            newStatus: 'Completed',
            changedBy: alex._id,
            changedAt: now,
            remarks: 'Templates and fallback handlers configured and working',
          },
        ],
      },
      {
        title: 'Build Search & Multi-criteria Filtering in Task Table',
        description:
          'Develop client and server-side debounced search filter allowing admins and employees to search tasks by title, description, priority, and assignee.',
        assignedTo: alex._id,
        assignedBy: admin._id,
        priority: 'Medium',
        status: 'Pending / In Progress',
        dueDate: addDays(4),
        statusHistory: [
          {
            previousStatus: 'Not Started',
            newStatus: 'Pending / In Progress',
            changedBy: alex._id,
            changedAt: addDays(-1),
            remarks: 'Working on regex search and pagination synchronization',
          },
        ],
      },
      {
        title: 'Dockerize Frontend and Backend Services for Production',
        description:
          'Write multi-stage Dockerfile for the Vite frontend (Nginx alpine) and Node.js backend with Docker Compose setup for local orchestration.',
        assignedTo: marcus._id,
        assignedBy: admin._id,
        priority: 'Medium',
        status: 'Not Started',
        dueDate: addDays(6),
        statusHistory: [
          {
            previousStatus: null,
            newStatus: 'Not Started',
            changedBy: admin._id,
            changedAt: now,
            remarks: 'Assigned to DevOps queue',
          },
        ],
      },
      {
        title: 'Conduct Cross-browser UI Audit & Usability Testing',
        description:
          'Audit dashboard views across Chrome, Safari, Firefox, and Edge. Verify layout fidelity, color contrast accessibility (WCAG AA), and touch targets.',
        assignedTo: david._id,
        assignedBy: admin._id,
        priority: 'Low',
        status: 'Not Started',
        dueDate: addDays(8),
        statusHistory: [],
      },
      {
        title: 'Add Pagination Controls & Per-Page Selection',
        description:
          'Implement accessible pagination UI with page numbers, prev/next buttons, and records count indicator on task list tables.',
        assignedTo: priya._id,
        assignedBy: admin._id,
        priority: 'Medium',
        status: 'Completed',
        dueDate: addDays(2),
        statusHistory: [
          {
            previousStatus: 'Not Started',
            newStatus: 'Completed',
            changedBy: priya._id,
            changedAt: now,
            remarks: 'Completed server-side skip/limit and frontend pagination',
          },
        ],
      },
      {
        title: 'Optimize MongoDB Indexing for High Concurrency Queries',
        description:
          'Evaluate query performance using explain() and add compound indexes on assignedTo + status and createdAt to ensure sub-10ms response times.',
        assignedTo: marcus._id,
        assignedBy: admin._id,
        priority: 'High',
        status: 'Not Started',
        dueDate: addDays(5),
        statusHistory: [],
      },
    ]);

    // Create sample initial EmailLogs so reviewer immediately sees sent email audit trail
    console.log('📨 Creating sample Email audit records...');
    await EmailLog.create([
      {
        to: alex.email,
        toName: alex.name,
        from: '"Xplore Intellects" <noreply@xplore.com>',
        subject: `New Task Assigned: ${tasks[2].title} [Priority: ${tasks[2].priority}]`,
        bodyHtml: `<p>Hello ${alex.name}, you have been assigned task "${tasks[2].title}".</p>`,
        triggerEvent: 'TASK_ASSIGNED',
        status: 'Sent',
        taskId: tasks[2]._id,
        taskTitle: tasks[2].title,
        meta: { priority: tasks[2].priority, assignedBy: admin.name },
      },
      {
        to: admin.email,
        toName: 'Admin',
        from: '"Xplore Intellects" <noreply@xplore.com>',
        subject: `Task Status Updated: "${tasks[1].title}" is now Completed`,
        bodyHtml: `<p>Employee Priya Sharma updated status to Completed.</p>`,
        triggerEvent: 'TASK_STATUS_UPDATED',
        status: 'Sent',
        taskId: tasks[1]._id,
        taskTitle: tasks[1].title,
        meta: {
          oldStatus: 'Pending / In Progress',
          newStatus: 'Completed',
          updatedBy: priya.name,
        },
      },
    ]);

    console.log('\n========================================================');
    console.log('🎉 SEED COMPLETED SUCCESSFULLY!');
    console.log('========================================================');
    console.log('🔑 DEMO CREDENTIALS:');
    console.log('--------------------------------------------------------');
    console.log(`👑 ADMIN LOGIN:`);
    console.log(`   Email:    admin@xplore.com`);
    console.log(`   Password: Admin@123`);
    console.log(`   Role:     admin`);
    console.log('--------------------------------------------------------');
    console.log(`💼 SAMPLE EMPLOYEES:`);
    employees.forEach((emp) => {
      console.log(`   • ${emp.name.padEnd(16)} | Email: ${emp.email.padEnd(25)} | Password: Employee@123`);
    });
    console.log('========================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  }
};

seedData();
