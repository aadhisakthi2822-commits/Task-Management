import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema(
  {
    to: {
      type: String,
      required: true,
    },
    toName: {
      type: String,
      default: '',
    },
    from: {
      type: String,
      default: '',
    },
    subject: {
      type: String,
      required: true,
    },
    bodyHtml: {
      type: String,
      required: true,
    },
    bodyText: {
      type: String,
      default: '',
    },
    triggerEvent: {
      type: String,
      enum: ['TASK_ASSIGNED', 'TASK_STATUS_UPDATED', 'GENERAL'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Sent', 'Simulated', 'Failed'],
      default: 'Sent',
    },
    previewUrl: {
      type: String,
      default: '',
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
    taskTitle: {
      type: String,
      default: '',
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

emailLogSchema.index({ createdAt: -1 });

export const EmailLog = mongoose.model('EmailLog', emailLogSchema);
