import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Login or register
export const loginOrRegister = async (req, res) => {
  const { email, name, image } = req.body;

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email, name, image });
  }

  const token = jwt.sign({ email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res
    .cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({ message: 'Login successful', role: user.role });
};

// Logout
export const logout = (req, res) => {
  res
    .clearCookie('token', { secure: true, sameSite: 'none' })
    .json({ message: 'Logged out' });
};

// Get profile
export const getProfile = async (req, res) => {
  const user = await User.findOne({ email: req.user.email });
  res.json(user);
};

// Create new user manually (if needed)
export const createUser = async (req, res) => {
  try {
    const user = req.body;
    const existingUser = await User.findOne({ email: user.email });

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const newUser = await User.create(user);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ✅ Get user role by email
export const getUserRole = async (req, res) => {
  const { email } = req.params;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ role: user.role });
  } catch (error) {
    console.error('Error fetching user role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
