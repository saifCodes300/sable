import express from 'express';
import { Product } from '../models/Product.js';

const router = express.Router();

const POSTURE_ADVICE = {
  athletic: {
    title: 'Athletic & Broad Frame',
    rationale: 'Soft Neapolitan shoulders and relaxed chest cuts drape effortlessly over broad shoulders without adding rigid bulk.',
    favoredCuts: ['Unstructured Double-Breasted Blazer', 'Silk-Wool Camp Collar Shirt', 'Double-Pleated Wool Trousers'],
    favoredSubs: ['Blazers', 'Shirts', 'Trousers'],
  },
  slim: {
    title: 'Slim & Slender Frame',
    rationale: 'Structured layering, ribbed cashmere knits, and architectural overshirts create refined silhouette depth and balanced proportions.',
    favoredCuts: ['Brushed Twill Atelier Overshirt', 'Ribbed Cashmere Crewneck', 'Double-Faced Wool Balmacaan Coat'],
    favoredSubs: ['Knitwear', 'Outerwear', 'Shirts'],
  },
  broad: {
    title: 'Broad & Inverted-Triangle Posture',
    rationale: 'Clean single-breasted drape, fluid camp collars, and straight-tapered double-pleated trousers elongate the torso and ground the silhouette.',
    favoredCuts: ['Relaxed Flannel Single Blazer', 'Silk-Wool Camp Collar Shirt', 'Double-Pleated Wool Trousers'],
    favoredSubs: ['Blazers', 'Shirts', 'Trousers'],
  },
  tall: {
    title: 'Tall & Slender Stature',
    rationale: 'Long-line balmacaan overcoats and generous trouser cuff breaks anchor your height with quiet poise.',
    favoredCuts: ['Double-Faced Wool Balmacaan Coat', 'Unstructured Double-Breasted Blazer', 'Marche Unlined Suede Penny Loafer'],
    favoredSubs: ['Outerwear', 'Blazers', 'Loafers'],
  },
  classic: {
    title: 'Balanced Classic Proportions',
    rationale: 'Timeless Italian tailored proportions, fine merino knit polos, and versatile calfskin loafers deliver effortless sartorial confidence.',
    favoredCuts: ['Fine Merino Zip Polo Knit', 'Relaxed Flannel Single Blazer', 'Marche Unlined Suede Penny Loafer'],
    favoredSubs: ['Knitwear', 'Shirts', 'Loafers'],
  },
};

const COLOR_ADVICE = {
  warm: {
    title: 'Warm & Golden / Olive Undertones',
    recommendedColors: ['Sand', 'Cream', 'Olive', 'Taupe'],
    accent: 'Warm earth tones, Italian vegetable-tanned leather, and antique brass hardware enrich your complexion.',
  },
  cool: {
    title: 'Cool & Fair / Rosy Undertones',
    recommendedColors: ['Ink', 'Black', 'Taupe'],
    accent: 'Deep Como ink, stark black tailoring, and cool taupe tones provide crisp, regal contrast against cooler skin.',
  },
  deep: {
    title: 'Deep & Rich Complexions',
    recommendedColors: ['Cream', 'Sand', 'Olive', 'Ink'],
    accent: 'Luminous cream silks, brushed sand twill, and deep ink navy create striking high-contrast quiet luxury.',
  },
  olive: {
    title: 'Olive & Mediterranean Complexions',
    recommendedColors: ['Cream', 'Sand', 'Taupe', 'Olive'],
    accent: 'Sun-drenched cream knitwear, olive merino wool, and sand calf suede harmonize with natural olive undertones.',
  },
  fair: {
    title: 'Fair Complexions',
    recommendedColors: ['Ink', 'Taupe', 'Sand'],
    accent: 'Rich ink navy and mid-tone taupe add warmth and depth without washing out delicate undertones.',
  },
  neutral: {
    title: 'Balanced Neutral Undertones',
    recommendedColors: ['Ink', 'Taupe', 'Sand', 'Cream', 'Olive', 'Black'],
    accent: 'You possess the versatility to wear the entire SABLE seasonal palette with equal ease.',
  },
};

router.post('/chat', async (req, res) => {
  try {
    const {
      message = '',
      bodyPosture = 'athletic',
      complexion = 'warm',
      occasion = '',
    } = req.body;

    const lowerMsg = message.toLowerCase();

    // Detect posture keywords if user mentions in text
    let detectedPosture = bodyPosture;
    if (lowerMsg.includes('athletic') || lowerMsg.includes('gym') || lowerMsg.includes('muscular')) detectedPosture = 'athletic';
    else if (lowerMsg.includes('slim') || lowerMsg.includes('skinny') || lowerMsg.includes('lean')) detectedPosture = 'slim';
    else if (lowerMsg.includes('broad') || lowerMsg.includes('wide shoulder')) detectedPosture = 'broad';
    else if (lowerMsg.includes('tall') || lowerMsg.includes('height')) detectedPosture = 'tall';

    // Detect color keywords
    let detectedColor = complexion;
    if (lowerMsg.includes('warm') || lowerMsg.includes('golden') || lowerMsg.includes('tan')) detectedColor = 'warm';
    else if (lowerMsg.includes('cool') || lowerMsg.includes('pale') || lowerMsg.includes('pink')) detectedColor = 'cool';
    else if (lowerMsg.includes('deep') || lowerMsg.includes('dark')) detectedColor = 'deep';
    else if (lowerMsg.includes('olive')) detectedColor = 'olive';

    const postureInfo = POSTURE_ADVICE[detectedPosture] || POSTURE_ADVICE.classic;
    const colorInfo = COLOR_ADVICE[detectedColor] || COLOR_ADVICE.neutral;

    // Query matching products from MongoDB
    const targetColors = colorInfo.recommendedColors;
    const matchingProducts = await Product.find({
      'colors.name': { $in: targetColors },
    }).limit(16).lean();

    // Prioritize pieces matching posture favored cuts
    const sorted = [...matchingProducts].sort((a, b) => {
      const aPostureScore = postureInfo.favoredSubs.includes(a.subcategory) ? 3 : 0;
      const bPostureScore = postureInfo.favoredSubs.includes(b.subcategory) ? 3 : 0;
      return bPostureScore - aPostureScore;
    });

    const recommendations = sorted.slice(0, 3).map((prod) => {
      const matchingColor = prod.colors.find((c) => targetColors.includes(c.name)) || prod.colors[0];
      return {
        id: prod.id,
        slug: prod.slug,
        name: prod.name,
        price: prod.price,
        category: prod.category,
        subcategory: prod.subcategory,
        color: matchingColor.name,
        hex: matchingColor.hex,
        image: matchingColor.images[0],
        rationale: `Selected in ${matchingColor.name} to harmonize with ${colorInfo.title.toLowerCase()}, tailored for ${postureInfo.title.toLowerCase()}.`,
      };
    });

    let reply = `Based on your **${postureInfo.title}** and **${colorInfo.title}**:\n\n`;
    reply += `• **Silhouette & Cut:** ${postureInfo.rationale}\n`;
    reply += `• **Palette Harmony:** ${colorInfo.accent}\n\n`;
    reply += `Here are the atelier pieces curated specifically for your posture and coloring:`;

    return res.json({
      data: {
        reply,
        posture: detectedPosture,
        complexion: detectedColor,
        recommendations,
      },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (err) {
    console.error('[Stylist Error]:', err);
    return res.status(500).json({ message: err.message || 'Error running stylist advisor.' });
  }
});

export default router;
