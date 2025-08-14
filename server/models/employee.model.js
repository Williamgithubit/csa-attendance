import { DataTypes } from 'sequelize';
import { sequelize } from '../config/config.js';

const Employee = sequelize.define('Employee', {
  fullName: { type: DataTypes.STRING, allowNull: false },
  employeeId: { type: DataTypes.STRING, allowNull: false, unique: true },
  department: DataTypes.STRING,
  dutyStation: DataTypes.STRING,
  position: DataTypes.STRING,
  employmentStatus: DataTypes.STRING,
  profilePicture: DataTypes.STRING
}, {
  // Model options
  timestamps: true
  
});

export default Employee;
