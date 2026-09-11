/**
 * Comprehensive Automated End-to-End API Test Suite using native fetch
 */

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting API Verification Test Suite...\n');
  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  };

  let adminToken = '';
  let employeeToken = '';
  let employeeId = '';
  let createdTaskId = '';

  // 1. Health check
  await test('Server Health Check', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (data.status !== 'online') throw new Error('Health check failed');
  });

  // 2. Admin Login
  await test('Admin Authentication (admin@xplore.com)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@xplore.com',
        password: 'Admin@123',
      }),
    });
    const data = await res.json();
    if (!data.token || data.user.role !== 'admin') {
      throw new Error(`Admin login failed: ${data.message || 'Unknown'}`);
    }
    adminToken = data.token;
  });

  // 3. Employee Login
  await test('Employee Authentication (alex.rivera@xplore.com)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alex.rivera@xplore.com',
        password: 'Employee@123',
      }),
    });
    const data = await res.json();
    if (!data.token || data.user.role !== 'employee') {
      throw new Error(`Employee login failed: ${data.message || 'Unknown'}`);
    }
    employeeToken = data.token;
    employeeId = data.user.id;
  });

  // 4. Invalid Login Attempt
  await test('Handle Invalid Login Attempt (Rejection check)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@xplore.com',
        password: 'WrongPassword123',
      }),
    });
    if (res.status !== 401) {
      throw new Error(`Expected 401 Unauthorized but got ${res.status}`);
    }
  });

  // 5. Admin fetches employees list
  await test('Admin: Get Employees Directory & Workloads', async () => {
    const res = await fetch(`${BASE_URL}/users/employees`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    if (!data.employees || data.employees.length === 0) {
      throw new Error('No employees found');
    }
    if (!data.employees[0].taskStats) {
      throw new Error('Employee taskStats missing');
    }
  });

  // 6. Admin assigns a task to Employee (with email notification trigger)
  await test('Admin: Assign Task to Employee (triggers email notification)', async () => {
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Implement Multi-factor Authentication (MFA)',
        description:
          'Add TOTP authentication using Speakeasy and QR code generation for enhanced security.',
        assignedTo: employeeId,
        priority: 'High',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    });
    const data = await res.json();
    if (!data.task || data.task.title !== 'Implement Multi-factor Authentication (MFA)') {
      throw new Error(`Task creation response invalid: ${data.message || 'Unknown'}`);
    }
    createdTaskId = data.task._id;
  });

  // 7. Verify email log was created for task assignment
  await test('Verify Email Notification Recorded for Task Assignment', async () => {
    await new Promise((r) => setTimeout(r, 1200));
    const res = await fetch(`${BASE_URL}/notifications/emails?limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    const found = data.logs.find(
      (log) => log.triggerEvent === 'TASK_ASSIGNED' && log.taskId === createdTaskId
    );
    if (!found) {
      throw new Error('Email notification log not found for assigned task');
    }
  });

  // 8. Admin Task Statistics
  await test('Admin: Get Task Statistics (Not Started, In Progress, Completed)', async () => {
    const res = await fetch(`${BASE_URL}/tasks/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    const s = data.stats;
    if (
      s.totalTasks === undefined ||
      s.notStarted === undefined ||
      s.inProgress === undefined ||
      s.completed === undefined
    ) {
      throw new Error('Required task statistics missing');
    }
  });

  // 9. Task Listing with Search & Pagination
  await test('Task Listing: Search and Pagination verification', async () => {
    const res = await fetch(`${BASE_URL}/tasks?search=Multi-factor&page=1&limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    if (data.tasks.length === 0) {
      throw new Error('Search did not return matching created task');
    }
    if (!data.pagination || data.pagination.currentPage !== 1) {
      throw new Error('Pagination metadata missing');
    }
  });

  // 10. Employee views only their assigned tasks
  await test('Employee: Retrieve Only Assigned Tasks', async () => {
    const res = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    const data = await res.json();
    const allAssignedToEmployee = data.tasks.every(
      (t) => t.assignedTo._id === employeeId || t.assignedTo === employeeId
    );
    if (!allAssignedToEmployee) {
      throw new Error('Employee saw tasks assigned to other users');
    }
  });

  // 11. Employee updates task status (triggers email notification to Admin)
  await test('Employee: Update Task Status to "Completed" (triggers email to Admin)', async () => {
    const res = await fetch(`${BASE_URL}/tasks/${createdTaskId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeToken}`,
      },
      body: JSON.stringify({
        status: 'Completed',
        remarks: 'MFA implementation completed with full unit test coverage.',
      }),
    });
    const data = await res.json();
    if (data.task?.status !== 'Completed') {
      throw new Error(`Task status was not updated: ${data.message || 'Unknown'}`);
    }
  });

  // 12. Verify email log for status update
  await test('Verify Email Notification Dispatched to Admin for Status Update', async () => {
    await new Promise((r) => setTimeout(r, 1200));
    const res = await fetch(`${BASE_URL}/notifications/emails?limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    const found = data.logs.find(
      (log) => log.triggerEvent === 'TASK_STATUS_UPDATED' && log.taskId === createdTaskId
    );
    if (!found) {
      throw new Error('Status update email notification not recorded');
    }
  });

  // 13. RBAC Access Control Test: Employee cannot create tasks
  await test('RBAC Security: Employee cannot assign tasks (403 Forbidden)', async () => {
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeToken}`,
      },
      body: JSON.stringify({
        title: 'Unauthorized Task',
        description: 'Should fail',
        assignedTo: employeeId,
      }),
    });
    if (res.status !== 403) {
      throw new Error(`Expected 403 Forbidden but got ${res.status}`);
    }
  });

  console.log('\n=============================================');
  console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log('=============================================\n');

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runTests();
