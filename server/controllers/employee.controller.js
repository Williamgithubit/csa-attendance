import { Employee } from '../models/index.js';

export const getEmployees = async (req, res) => {
  const employees = await Employee.findAll();
  res.json(employees);
};

export const addEmployee = async (req, res) => {
  const employee = await Employee.create(req.body);
  res.status(201).json(employee);
};

export const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  await Employee.destroy({ where: { id } });
  res.json({ message: 'Employee deleted' });
};
