import { Sequelize, DataTypes } from 'sequelize';
import { sequelize as dbConnection } from '../config/config.js';
import Employee from './employee.model.js';
import Attendance from './attendance.model.js';
import User, { ROLES } from './user.model.js';

const db = {
  User: User,
  Employee: Employee,
  Attendance: Attendance,
  sequelize: dbConnection,
  Sequelize: Sequelize,
  ROLES: ROLES
};

// Set up associations if they exist
Object.keys(db).forEach(modelName => {
  if (db[modelName] && db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Set up associations
User.hasMany(Attendance, {
  foreignKey: 'userId',
  as: 'attendances'
});

Attendance.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Export models and sequelize instance
export { User, Employee, Attendance, ROLES };
export const sequelize = dbConnection;
export default db;