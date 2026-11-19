import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'sable_secret_luxury_key_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || '',
    savedAddress: user.savedAddress || null,
    createdAt: user.createdAt,
  };
}

// Register ANY user with any name
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields (firstName, lastName, email, password) are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email address already exists.' });
    }

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password,
    });

    const token = signToken(user._id);

    return res.status(201).json({
      data: {
        user: sanitizeUser(user),
        token,
      },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (err) {
    console.error('[Auth Register Error]:', err);
    return res.status(500).json({ message: err.message || 'Error registering user.' });
  }
});

// Login for ANY registered user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user._id);

    return res.json({
      data: {
        user: sanitizeUser(user),
        token,
      },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (err) {
    console.error('[Auth Login Error]:', err);
    return res.status(500).json({ message: err.message || 'Error logging in.' });
  }
});

// Logout
router.post('/logout', (_req, res) => {
  return res.json({
    data: { success: true },
    meta: { timestamp: new Date().toISOString() },
  });
});

// Get Current User Profile
router.get('/me', protect, async (req, res) => {
  return res.json({
    data: sanitizeUser(req.user),
    meta: { timestamp: new Date().toISOString() },
  });
});

// Update Profile & Address
router.patch('/me', protect, async (req, res) => {
  try {
    const { firstName, lastName, phone, savedAddress } = req.body;
    const user = req.user;

    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (savedAddress !== undefined) user.savedAddress = savedAddress;

    await user.save();

    return res.json({
      data: sanitizeUser(user),
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (err) {
    console.error('[Auth Update Error]:', err);
    return res.status(500).json({ message: err.message || 'Error updating profile.' });
  }
});

export default router;
