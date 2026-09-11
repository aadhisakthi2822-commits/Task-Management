import nodemailer from 'nodemailer';
import { EmailLog } from '../models/EmailLog.js';
import { getTaskAssignmentTemplate, getTaskStatusUpdateTemplate } from '../utils/emailTemplates.js';

let transporter = null;
let isEthereal = false;
let initPromise = null;

export const initMailer = async () => {
  if (transporter) return transporter;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Check if custom SMTP is configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        console.log(`📧 Configured custom SMTP transport (${process.env.SMTP_HOST})`);
        return transporter;
      } catch (err) {
        console.error('Failed to initialize custom SMTP transporter, falling back:', err.message);
      }
    }

    // Auto fallback to Ethereal test transport
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      isEthereal = true;
      console.log(`📧 Configured Ethereal test mailer (${testAccount.user})`);
    } catch (error) {
      console.warn(`⚠️ Could not create Ethereal account (${error.message}). Emails will be logged to database.`);
      transporter = null;
    }

    return transporter;
  })();

  return initPromise;
};

/**
 * Send email helper that records to database and logs to console
 */
export const sendMail = async ({ to, toName, subject, html, triggerEvent, taskId, taskTitle, meta = {} }) => {
  const fromAddress = process.env.EMAIL_FROM || '"Xplore Intellects" <noreply@xplore.com>';
  
  // 1. Instantly record EmailLog in database so it is immediately visible in UI & audit
  let emailLog = null;
  try {
    emailLog = await EmailLog.create({
      to,
      toName,
      from: fromAddress,
      subject,
      bodyHtml: html,
      triggerEvent,
      status: 'Sent',
      taskId,
      taskTitle,
      meta,
    });
  } catch (logErr) {
    console.error('Failed to record initial EmailLog in database:', logErr.message);
  }

  // 2. Dispatch via mailer in background
  (async () => {
    try {
      const mail = await initMailer();
      if (mail) {
        const info = await mail.sendMail({
          from: fromAddress,
          to,
          subject,
          html,
        });

        let previewUrl = '';
        if (isEthereal) {
          previewUrl = nodemailer.getTestMessageUrl(info) || '';
          console.log(`📨 [Ethereal Email Sent] To: ${to} | Subject: "${subject}"`);
          if (previewUrl) {
            console.log(`🔗 Preview URL: ${previewUrl}`);
          }
        } else {
          console.log(`📨 [SMTP Email Sent] MessageId: ${info.messageId} | To: ${to}`);
        }

        if (emailLog && previewUrl) {
          emailLog.previewUrl = previewUrl;
          await emailLog.save();
        }
      } else {
        console.log(`📨 [Simulated Email Logged] To: ${to} | Subject: "${subject}"`);
      }
    } catch (err) {
      console.error(`❌ Email sending failed for ${to}:`, err.message);
      if (emailLog) {
        emailLog.status = 'Failed';
        emailLog.meta = { ...emailLog.meta, error: err.message };
        await emailLog.save();
      }
    }
  })().catch((err) => console.error('Email dispatch error:', err));

  return emailLog;
};

/**
 * Send email to Employee when Admin assigns a task
 */
export const notifyEmployeeTaskAssigned = async ({ task, employee, assignedBy }) => {
  if (!employee || !employee.email) return null;

  const subject = `New Task Assigned: ${task.title} [Priority: ${task.priority}]`;
  const html = getTaskAssignmentTemplate({ task, employee, assignedBy });

  return await sendMail({
    to: employee.email,
    toName: employee.name,
    subject,
    html,
    triggerEvent: 'TASK_ASSIGNED',
    taskId: task._id,
    taskTitle: task.title,
    meta: {
      priority: task.priority,
      assignedBy: assignedBy ? assignedBy.name : 'Administrator',
      assignedTo: employee.name,
    },
  });
};

/**
 * Send email to Admin when Employee updates task status
 */
export const notifyAdminTaskStatusUpdated = async ({ task, employee, oldStatus, newStatus }) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@xplore.com';
  const subject = `Task Status Updated: "${task.title}" is now ${newStatus}`;
  const html = getTaskStatusUpdateTemplate({ task, employee, oldStatus, newStatus });

  return await sendMail({
    to: adminEmail,
    toName: 'Admin',
    subject,
    html,
    triggerEvent: 'TASK_STATUS_UPDATED',
    taskId: task._id,
    taskTitle: task.title,
    meta: {
      oldStatus,
      newStatus,
      updatedBy: employee.name,
      employeeEmail: employee.email,
    },
  });
};
