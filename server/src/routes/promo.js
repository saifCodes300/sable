import express from 'express';
import { PromoCode } from '../models/PromoCode.js';

const router = express.Router();

router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Please enter a promo code.' });
    }

    const normalized = String(code).trim().toUpperCase();
    const promo = await PromoCode.findOne({ code: normalized, active: true }).lean();

    if (!promo) {
      return res.status(404).json({
        message: `Code "${normalized}" is not valid. Try SABLE10, WELCOME15, or FREESHIP.`,
      });
    }

    return res.json({
      data: promo,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
