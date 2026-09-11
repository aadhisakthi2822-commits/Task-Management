import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import {
  notifyEmployeeTaskAssigned,
  notifyAdminTaskStatusUpdated,
} from '../config/mailer.js';

/**
 * @desc    Create and assign a new task (Admin only)
 * @route   POST /api/tasks
 * @access  Private (Admin)
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;

    if (!title || !description || !assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and assigned employee are required.',
      });
    }

    // Verify assigned employee exists and is an employee
    const employee = await User.findById(assignedTo);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Assigned employee was not found in the database.',
      });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      assignedBy: req.user._id,
      priority: priority || 'Medium',
      status: 'Not Started',
      dueDate: dueDate || null,
      statusHistory: [
        {
          previousStatus: null,
          newStatus: 'Not Started',
          changedBy: req.user._id,
          remarks: 'Task created and assigned',
        },
      ],
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email department')
      .populate('assignedBy', 'name email');

    // Asynchronously send email notification to employee
    notifyEmployeeTaskAssigned({
      task: populatedTask,
      employee,
      assignedBy: req.user,
    }).catch((err) =>
      console.error('Error sending task assignment email:', err.message)
    );

    res.status(201).json({
      success: true,
      message: 'Task created and email notification dispatched to employee.',
      task: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tasks with Search, Filtering, and Pagination
 *          - If Admin: can view all tasks or filter by employee
 *          - If Employee: restricted to their assigned tasks only
 * @route   GET /api/tasks
 * @access  Private (Admin, Employee)
 */
export const getTasks = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const { search, status, priority, employeeId, sortBy, sortOrder } = req.query;

    const query = {};

    // Role restriction: Employees only see tasks assigned to them
    if (req.user.role === 'employee') {
      query.assignedTo = req.user._id;
    } else if (employeeId) {
      // Admin filtering by a specific employee
      query.assignedTo = employeeId;
    }

    // Status filter
    if (status && ['Not Started', 'Pending / In Progress', 'Completed'].includes(status)) {
      query.status = status;
    }

    // Priority filter
    if (priority && ['High', 'Medium', 'Low'].includes(priority)) {
      query.priority = priority;
    }

    // Search functionality: across title, description, and employee name
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');

      // Find any employees whose name matches search to include in query
      const matchingEmployees = await User.find({
        name: searchRegex,
        role: 'employee',
      }).select('_id');
      const employeeIds = matchingEmployees.map((e) => e._id);

      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { assignedTo: { $in: employeeIds } },
      ];
    }

    // Sorting
    const sortField = sortBy || 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortDirection };

    const [tasks, totalTasks] = await Promise.all([
      Task.find(query)
        .populate('assignedTo', 'name email department')
        .populate('assignedBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalTasks / limit) || 1;

    res.status(200).json({
      success: true,
      tasks,
      pagination: {
        totalTasks,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single task by ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email department phone')
      .populate('assignedBy', 'name email')
      .populate('statusHistory.changedBy', 'name email role');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check authorization: Admin can view any; Employee only if assigned to them
    if (
      req.user.role === 'employee' &&
      task.assignedTo._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view tasks assigned to you.',
      });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update task details (Admin only)
 * @route   PUT /api/tasks/:id
 * @access  Private (Admin)
 */
export const updateTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, priority, status, dueDate } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const previousAssignedTo = task.assignedTo.toString();

    if (title) task.title = title;
    if (description) task.description = description;
    if (priority) task.priority = priority;
    if (status) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate;

    let reAssigned = false;
    if (assignedTo && assignedTo !== previousAssignedTo) {
      const newEmployee = await User.findById(assignedTo);
      if (!newEmployee) {
        return res.status(404).json({
          success: false,
          message: 'Newly assigned employee does not exist',
        });
      }
      task.assignedTo = assignedTo;
      reAssigned = true;
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email department')
      .populate('assignedBy', 'name email');

    // If re-assigned, notify new employee
    if (reAssigned) {
      const employee = await User.findById(assignedTo);
      notifyEmployeeTaskAssigned({
        task: updatedTask,
        employee,
        assignedBy: req.user,
      }).catch((err) =>
        console.error('Error sending reassignment email:', err.message)
      );
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update task status (Employee or Admin)
 *          - Sends email notification to Admin when Employee updates status
 * @route   PATCH /api/tasks/:id/status
 * @access  Private
 */
export const updateTaskStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    const validStatuses = ['Not Started', 'Pending / In Progress', 'Completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email department')
      .populate('assignedBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Role check: Employee can only update their own task
    if (
      req.user.role === 'employee' &&
      task.assignedTo._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only update tasks assigned to you.',
      });
    }

    const oldStatus = task.status;
    task.status = status;

    // Track status change history
    task.statusHistory.push({
      previousStatus: oldStatus,
      newStatus: status,
      changedBy: req.user._id,
      changedAt: new Date(),
      remarks: remarks || `Status updated from ${oldStatus} to ${status}`,
    });

    await task.save();

    // Trigger email notification to Admin if updated by Employee
    if (req.user.role === 'employee') {
      notifyAdminTaskStatusUpdated({
        task,
        employee: req.user,
        oldStatus,
        newStatus: status,
      }).catch((err) =>
        console.error('Error sending status update email to admin:', err.message)
      );
    }

    res.status(200).json({
      success: true,
      message: `Task status updated from "${oldStatus}" to "${status}"`,
      task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a task (Admin only)
 * @route   DELETE /api/tasks/:id
 * @access  Private (Admin)
 */
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      deletedTaskId: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get task statistics for dashboards
 *          - Not Started
 *          - Pending / In Progress
 *          - Completed
 *          - Plus breakdown by priority and overall completion rate
 * @route   GET /api/tasks/stats
 * @access  Private
 */
export const getTaskStats = async (req, res, next) => {
  try {
    const filter = {};

    // If employee, only get their stats
    if (req.user.role === 'employee') {
      filter.assignedTo = req.user._id;
    }

    const [
      totalTasks,
      notStartedCount,
      inProgressCount,
      completedCount,
      highPriorityCount,
      mediumPriorityCount,
      lowPriorityCount,
    ] = await Promise.all([
      Task.countDocuments(filter),
      Task.countDocuments({ ...filter, status: 'Not Started' }),
      Task.countDocuments({ ...filter, status: 'Pending / In Progress' }),
      Task.countDocuments({ ...filter, status: 'Completed' }),
      Task.countDocuments({ ...filter, priority: 'High' }),
      Task.countDocuments({ ...filter, priority: 'Medium' }),
      Task.countDocuments({ ...filter, priority: 'Low' }),
    ]);

    const completionRate =
      totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalTasks,
        notStarted: notStartedCount,
        inProgress: inProgressCount,
        completed: completedCount,
        completionRate,
        priorities: {
          high: highPriorityCount,
          medium: mediumPriorityCount,
          low: lowPriorityCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
