import { USE_MOCK, createResponse, httpRequest, simulateLatency } from './client';
import productsData from '../data/products.json';

const POSTURE_GUIDANCE = {
  athletic: {
    title: 'Athletic & Broad Frame',
    rationale: 'Soft Neapolitan shoulders and relaxed camp collars drape effortlessly over broad shoulders without adding rigid bulk.',
    recommendedSubs: ['Blazers', 'Shirts', 'Trousers'],
  },
  slim: {
    title: 'Slim & Slender Frame',
    rationale: 'Architectural layering, textured Scottish cashmere, and brushed twill overshirts create silhouette depth and balanced proportions.',
    recommendedSubs: ['Knitwear', 'Outerwear', 'Shirts'],
  },
  broad: {
    title: 'Broad & Inverted-Triangle Posture',
    rationale: 'Clean single-breasted drape, fluid camp collars, and straight-tapered double-pleated trousers elongate the torso and ground the silhouette.',
    recommendedSubs: ['Blazers', 'Shirts', 'Trousers'],
  },
  tall: {
    title: 'Tall & Slender Stature',
    rationale: 'Long-line balmacaan overcoats and generous trouser cuff breaks anchor height with quiet poise.',
    recommendedSubs: ['Outerwear', 'Blazers', 'Loafers'],
  },
  classic: {
    title: 'Balanced Classic Proportions',
    rationale: 'Timeless Italian tailored proportions, fine merino knit polos, and versatile calfskin loafers deliver effortless sartorial confidence.',
    recommendedSubs: ['Knitwear', 'Shirts', 'Loafers'],
  },
};

const COLOR_GUIDANCE = {
  warm: {
    title: 'Warm & Golden / Olive Undertones',
    recommendedColors: ['Sand', 'Cream', 'Olive', 'Taupe'],
    paletteRationale: 'Warm earth tones, Italian vegetable-tanned leather, and antique brass enrich your natural golden undertones.',
  },
  cool: {
    title: 'Cool & Fair / Rosy Undertones',
    recommendedColors: ['Ink', 'Black', 'Taupe'],
    paletteRationale: 'Deep Como ink navy, stark black tailoring, and cool taupe tones provide crisp, regal contrast against cooler skin.',
  },
  deep: {
    title: 'Deep & Rich Complexions',
    recommendedColors: ['Cream', 'Sand', 'Olive', 'Ink'],
    paletteRationale: 'Luminous cream silks, brushed sand twill, and deep ink navy create striking high-contrast quiet luxury.',
  },
  olive: {
    title: 'Olive & Mediterranean Complexions',
    recommendedColors: ['Cream', 'Sand', 'Taupe', 'Olive'],
    paletteRationale: 'Sun-drenched cream knitwear, olive merino wool, and sand calf suede harmonize with natural olive undertones.',
  },
  fair: {
    title: 'Fair Complexions',
    recommendedColors: ['Ink', 'Taupe', 'Sand'],
    paletteRationale: 'Rich ink navy and mid-tone taupe add warmth and depth without washing out delicate undertones.',
  },
  neutral: {
    title: 'Balanced Neutral Undertones',
    recommendedColors: ['Ink', 'Taupe', 'Sand', 'Cream', 'Olive', 'Black'],
    paletteRationale: 'You possess the versatility to wear the entire SABLE seasonal palette with equal ease.',
  },
};

export async function askVirtualStylist(payload) {
  if (!USE_MOCK) {
    try {
      return await httpRequest('/stylist/chat', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('[Stylist API] Fallback to client advisor:', err.message);
    }
  }

  await simulateLatency(300, 500);

  const { bodyPosture = 'athletic', complexion = 'warm', message = '' } = payload;
  const posture = POSTURE_GUIDANCE[bodyPosture] || POSTURE_GUIDANCE.classic;
  const color = COLOR_GUIDANCE[complexion] || COLOR_GUIDANCE.neutral;

  // Filter matching products
  const matching = productsData.filter((p) =>
    p.colors.some((c) => color.recommendedColors.includes(c.name))
  );

  matching.sort((a, b) => {
    const aScore = posture.recommendedSubs.includes(a.subcategory) ? 3 : 0;
    const bScore = posture.recommendedSubs.includes(b.subcategory) ? 3 : 0;
    return bScore - aScore;
  });

  const recommendations = matching.slice(0, 3).map((prod) => {
    const matchingColor =
      prod.colors.find((c) => color.recommendedColors.includes(c.name)) || prod.colors[0];
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
      rationale: `Selected in ${matchingColor.name} to harmonize with ${color.title.toLowerCase()}, tailored for ${posture.title.toLowerCase()}.`,
    };
  });

  const reply = `Based on your **${posture.title}** and **${color.title}**:\n\n• **Silhouette & Cut:** ${posture.rationale}\n• **Palette Harmony:** ${color.paletteRationale}\n\nHere are the atelier pieces curated specifically for your posture and coloring:`;

  return createResponse({
    reply,
    posture: bodyPosture,
    complexion,
    recommendations,
  });
}
