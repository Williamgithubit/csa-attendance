import { Attendance, Employee, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

export const getStats = async (req, res) => {
  try {
    // Get attendance statistics
    const attendanceStats = await Attendance.findAll({
      attributes: ['consequence', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['consequence']
    });

    // Get total employee count
    const totalEmployees = await Employee.count();

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysAttendance = await Attendance.count({
      where: {
        createdAt: {
          [Op.gte]: today
        }
      }
    });

    res.json({
      attendanceStats,
      totalEmployees,
      todaysAttendance
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    console.log('Fetching dashboard statistics...');
    
    // Test database connection first
    try {
      await sequelize.authenticate();
      console.log('Database connection has been established successfully.');
    } catch (dbError) {
      console.error('Unable to connect to the database:', dbError);
      return res.status(500).json({ 
        message: 'Database connection error',
        error: dbError.message 
      });
    }

    // Get attendance statistics
    let attendanceStats = [];
    try {
      attendanceStats = await Attendance.findAll({
        attributes: ['consequence', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['consequence']
      });
      console.log('Attendance stats fetched successfully');
    } catch (attendanceError) {
      console.error('Error fetching attendance stats:', attendanceError);
      return res.status(500).json({ 
        message: 'Error fetching attendance statistics',
        error: attendanceError.message 
      });
    }

    // Get total employee count
    let totalEmployees = 0;
    try {
      totalEmployees = await Employee.count();
      console.log('Employee count:', totalEmployees);
    } catch (employeeError) {
      console.error('Error fetching employee count:', employeeError);
      // Don't fail the whole request for this
    }

    // Get today's attendance
    let todaysAttendance = 0;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      todaysAttendance = await Attendance.count({
        where: {
          createdAt: {
            [Op.gte]: today
          }
        }
      });
      console.log("Today's attendance:", todaysAttendance);
    } catch (todayError) {
      console.error('Error fetching today\'s attendance:', todayError);
      // Don't fail the whole request for this
    }

    res.json({
      success: true,
      data: {
        attendanceStats,
        totalEmployees,
        todaysAttendance
      }
    });
  } catch (error) {
    console.error('Unexpected error in getDashboardStats:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      success: false,
      message: 'Unexpected error fetching dashboard statistics',
      error: error.message,
      name: error.name
    });
  }
};
