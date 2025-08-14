import { DataTypes } from 'sequelize';
import { sequelize } from '../config/config.js';
import Employee from './employee.model.js';

const Attendance = sequelize.define('Attendance', {
  daysMissed: { type: DataTypes.INTEGER, allowNull: false },
  consequence: { type: DataTypes.STRING, allowNull: false },
  comments: DataTypes.TEXT,
  startDate: DataTypes.DATE,
  endDate: DataTypes.DATE
}, {
  timestamps: true
});

Attendance.belongsTo(Employee, { foreignKey: 'employeeId' });

export default Attendance;
