import express from 'express';
import { Category } from '../models/Category.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const categories = await Category.find({}).lean();
    return res.json({
      data: categories,
      meta: { total: categories.length, timestamp: new Date().toISOString() },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
