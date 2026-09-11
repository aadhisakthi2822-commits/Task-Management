import { User } from '../models/User.js';
import { Task } from '../models/Task.js';

/**
 * @desc    Get all employees with their task statistics (Admin only)
 * @route   GET /api/users/employees
 * @access  Private (Admin)
 */
export const getEmployees = async (req, res, next) => {
  try {
    const employees = await User.find({ role: 'employee' })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    // Attach task count breakdown to each employee for rich admin insights
    const employeesWithStats = await Promise.all(
      employees.map(async (emp) => {
        const [totalTasks, completedTasks, inProgressTasks, notStartedTasks] =
          await Promise.all([
            Task.countDocuments({ assignedTo: emp._id }),
            Task.countDocuments({ assignedTo: emp._id, status: 'Completed' }),
            Task.countDocuments({
              assignedTo: emp._id,
              status: 'Pending / In Progress',
            }),
            Task.countDocuments({
              assignedTo: emp._id,
              status: 'Not Started',
            }),
          ]);

        return {
          ...emp,
          taskStats: {
            total: totalTasks,
            completed: completedTasks,
            inProgress: inProgressTasks,
            notStarted: notStartedTasks,
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      count: employeesWithStats.length,
      employees: employeesWithStats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new employee (Admin only)
 * @route   POST /api/users/employees
 * @access  Private (Admin)
 */
export const createEmployee = async (req, res, next) => {
  try {
    const { name, email, password, department, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    const employee = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'employee',
      department: department || 'Engineering',
      phone: phone || '',
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        phone: employee.phone,
        createdAt: employee.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get employee details by ID
 * @route   GET /api/users/employees/:id
 * @access  Private (Admin)
 */
export const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await User.findOne({ _id: req.params.id, role: 'employee' })
      .select('-password')
      .lean();

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const tasks = await Task.find({ assignedTo: employee._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      employee,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};
