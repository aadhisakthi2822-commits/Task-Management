import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned employee is required'],
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator/Admin reference is required'],
    },
    priority: {
      type: String,
      enum: {
        values: ['High', 'Medium', 'Low'],
        message: 'Priority must be High, Medium, or Low',
      },
      default: 'Medium',
    },
    status: {
      type: String,
      enum: {
        values: ['Not Started', 'Pending / In Progress', 'Completed'],
        message: 'Status must be Not Started, Pending / In Progress, or Completed',
      },
      default: 'Not Started',
    },
    dueDate: {
      type: Date,
    },
    statusHistory: [
      {
        previousStatus: String,
        newStatus: String,
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        remarks: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for fast searching and filtering
taskSchema.index({ title: 'text', description: 'text' });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ status: 1, priority: 1, createdAt: -1 });

export const Task = mongoose.model('Task', taskSchema);
