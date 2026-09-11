/**
 * HTML Email Templates for Task Management System
 */

export const getTaskAssignmentTemplate = ({ task, employee, assignedBy }) => {
  const priorityColors = {
    High: '#ef4444',
    Medium: '#f59e0b',
    Low: '#10b981',
  };

  const priorityColor = priorityColors[task.priority] || '#6366f1';
  const dueDateStr = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Not Specified';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>New Task Assigned</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 24px; color: #1f2937; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb; }
      .header { background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.025em; }
      .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
      .content { padding: 28px 24px; }
      .task-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
      .task-title { font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 10px; }
      .task-desc { color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 16px; white-space: pre-wrap; }
      .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #ffffff; }
      .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; padding-top: 14px; border-top: 1px solid #e5e7eb; font-size: 13px; color: #6b7280; }
      .meta-item strong { color: #374151; display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
      .footer { background: #f9fafb; padding: 18px 24px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Xplore Intellects</h1>
        <p>Task Management Notification</p>
      </div>
      <div class="content">
        <p>Hello <strong>${employee.name}</strong>,</p>
        <p>You have been assigned a new task by <strong>${assignedBy ? assignedBy.name : 'Administrator'}</strong>.</p>
        
        <div class="task-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span class="badge" style="background-color: ${priorityColor};">${task.priority} Priority</span>
            <span style="font-size: 12px; color: #6b7280;">Status: <strong>${task.status}</strong></span>
          </div>
          <h2 class="task-title">${task.title}</h2>
          <p class="task-desc">${task.description}</p>
          
          <div class="meta-grid">
            <div class="meta-item">
              <strong>Due Date</strong>
              <span>${dueDateStr}</span>
            </div>
            <div class="meta-item">
              <strong>Assigned By</strong>
              <span>${assignedBy ? assignedBy.name : 'Administrator'} (${assignedBy ? assignedBy.email : 'admin@xplore.com'})</span>
            </div>
          </div>
        </div>

        <p style="font-size: 14px; color: #4b5563;">
          Please log in to your employee dashboard to review the task details and update the status as you make progress.
        </p>
      </div>
      <div class="footer">
        <p>Xplore Intellects Task Management System &bull; Automated System Notification</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

export const getTaskStatusUpdateTemplate = ({ task, employee, oldStatus, newStatus }) => {
  const statusColors = {
    'Not Started': '#6b7280',
    'Pending / In Progress': '#3b82f6',
    'Completed': '#10b981',
  };

  const newStatusColor = statusColors[newStatus] || '#6366f1';
  const updatedDateStr = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Task Status Updated</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 24px; color: #1f2937; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb; }
      .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.025em; }
      .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
      .content { padding: 28px 24px; }
      .task-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
      .task-title { font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 10px; }
      .status-transition { display: flex; align-items: center; gap: 10px; margin: 16px 0; background: #ffffff; padding: 12px 16px; border-radius: 6px; border: 1px dashed #d1d5db; }
      .pill { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
      .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; padding-top: 14px; border-top: 1px solid #e5e7eb; font-size: 13px; color: #6b7280; }
      .meta-item strong { color: #374151; display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
      .footer { background: #f9fafb; padding: 18px 24px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Task Status Update</h1>
        <p>Employee Activity Notification</p>
      </div>
      <div class="content">
        <p>Hello <strong>Admin</strong>,</p>
        <p>Employee <strong>${employee.name}</strong> (${employee.email}) has updated the status of an assigned task.</p>
        
        <div class="task-card">
          <h2 class="task-title">${task.title}</h2>
          
          <div class="status-transition">
            <div>
              <span style="font-size: 11px; color: #6b7280; display: block;">Previous:</span>
              <span class="pill" style="background: #e5e7eb; color: #374151;">${oldStatus}</span>
            </div>
            <span style="font-size: 18px; color: #9ca3af;">&rarr;</span>
            <div>
              <span style="font-size: 11px; color: #6b7280; display: block;">New Status:</span>
              <span class="pill" style="background: ${newStatusColor}; color: #ffffff;">${newStatus}</span>
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-item">
              <strong>Updated At</strong>
              <span>${updatedDateStr}</span>
            </div>
            <div class="meta-item">
              <strong>Priority</strong>
              <span>${task.priority}</span>
            </div>
          </div>
        </div>

        <p style="font-size: 14px; color: #4b5563;">
          You can review the full progress on the Admin Dashboard.
        </p>
      </div>
      <div class="footer">
        <p>Xplore Intellects Task Management System &bull; Automated System Notification</p>
      </div>
    </div>
  </body>
  </html>
  `;
};
