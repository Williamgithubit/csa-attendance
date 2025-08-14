import { Employee } from '../models/index'; // adjust path if needed
import { faker } from '@faker-js/faker';

export async function up(queryInterface, Sequelize) {
  const employees = [];

  for (let i = 1; i <= 40; i++) {
    employees.push({
      fullName: faker.name.fullName(),
      employeeId: `EMP${String(i).padStart(3, '0')}`,
      department: faker.helpers.arrayElement(['IT', 'Finance', 'HR', 'Operations', 'Procurement']),
      dutyStation: faker.helpers.arrayElement(['Monrovia HQ', 'Buchanan Branch', 'Gbarnga Branch']),
      position: faker.name.jobTitle(),
      employmentStatus: faker.helpers.arrayElement(['Active', 'On Leave', 'Inactive']),
      profilePicture: faker.image.avatar(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  await queryInterface.bulkInsert('Employees', employees, {});
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('Employees', null, {});
}