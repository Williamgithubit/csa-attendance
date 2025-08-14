import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import User from '../models/user.model.js';

// Hardcoded admin user
const ADMIN_EMAIL = 'admin@csa.gov.lr';
const ADMIN_PASSWORD = 'admin123';

// Hash the admin password (in production, this should be in your .env file)
let adminHash;
(async () => {
  adminHash = await argon2.hash(ADMIN_PASSWORD);
})();

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);
    console.log('Admin hash exists:', !!adminHash);

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    let user;
    let isAdmin = email === ADMIN_EMAIL;
    console.log('Is admin login:', isAdmin);

    if (isAdmin) {
      // Handle admin login
      console.log('Verifying admin password');
      const validPassword = await argon2.verify(adminHash, password);
      console.log('Password valid:', validPassword);
      if (!validPassword) {
        console.log('Invalid admin password');
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      user = {
        id: 'admin-1',
        email: ADMIN_EMAIL,
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User'
      };
    } else {
      // Handle regular user login from database
      user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const validPassword = await argon2.verify(user.password, password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Convert Sequelize instance to plain object
      user = user.get({ plain: true });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    // Remove password from output
    delete user.password;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};
