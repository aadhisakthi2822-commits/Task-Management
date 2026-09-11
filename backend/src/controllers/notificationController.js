import { EmailLog } from '../models/EmailLog.js';

/**
 * @desc    Get sent email notification logs
 * @route   GET /api/notifications/emails
 * @access  Private
 */
export const getEmailLogs = async (req, res, next) => {
  try {
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);
    const query = {};

    // If employee, only show emails where they are the recipient or the actor
    if (req.user.role === 'employee') {
      query.$or = [
        { to: req.user.email },
        { 'meta.employeeEmail': req.user.email },
      ];
    }

    const logs = await EmailLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const totalCount = await EmailLog.countDocuments(query);

    res.status(200).json({
      success: true,
      count: logs.length,
      totalCount,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single email log detail
 * @route   GET /api/notifications/emails/:id
 * @access  Private
 */
export const getEmailLogById = async (req, res, next) => {
  try {
    const log = await EmailLog.findById(req.params.id);

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Email log not found',
      });
    }

    res.status(200).json({
      success: true,
      log,
    });
  } catch (error) {
    next(error);
  }
};
