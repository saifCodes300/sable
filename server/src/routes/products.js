import express from 'express';
import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';

const router = express.Router();

// GET /products with full query filtering
router.get('/', async (req, res) => {
  try {
    const {
      category,
      subcategories,
      sizes,
      colors,
      minPrice,
      maxPrice,
      inStock,
      search,
      sort = 'featured',
      page = 1,
      limit = 12,
      ids,
    } = req.query;

    const query = {};

    if (ids) {
      const idList = ids.split(',').map((s) => s.trim()).filter(Boolean);
      if (idList.length > 0) query.id = { $in: idList };
    }

    if (category && category !== 'all') {
      query.category = category.toLowerCase();
    }

    if (subcategories) {
      const subs = subcategories.split(',').map((s) => new RegExp(`^${s.trim()}$`, 'i'));
      if (subs.length > 0) query.subcategory = { $in: subs };
    }

    if (sizes) {
      const sizeArr = sizes.split(',').map((s) => s.trim().toUpperCase());
      if (sizeArr.length > 0) {
        query.sizes = {
          $elemMatch: {
            label: { $in: sizeArr },
            stock: { $gt: 0 },
          },
        };
      }
    }

    if (colors) {
      const colorArr = colors.split(',').map((c) => new RegExp(`^${c.trim()}$`, 'i'));
      if (colorArr.length > 0) {
        query['colors.name'] = { $in: colorArr };
      }
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (inStock === 'true' || inStock === '1') {
      query['sizes.stock'] = { $gt: 0 };
    }

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { subcategory: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
      ];
    }

    let sortObj = { featured: -1, rating: -1 };
    switch (sort) {
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'price_asc':
        sortObj = { price: 1 };
        break;
      case 'price_desc':
        sortObj = { price: -1 };
        break;
      case 'rating':
        sortObj = { rating: -1, reviewCount: -1 };
        break;
      case 'featured':
      default:
        sortObj = { featured: -1, rating: -1 };
        break;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 12);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limitNum));

    return res.json({
      data: products,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[Products Error]:', err);
    return res.status(500).json({ message: err.message || 'Error fetching products.' });
  }
});

// GET /products/featured
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 8;
    const products = await Product.find({ featured: true }).limit(limit).lean();
    return res.json({
      data: products,
      meta: { total: products.length, timestamp: new Date().toISOString() },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// GET /products/:slug
router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).lean();
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    return res.json({
      data: product,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// GET /products/:id/related
router.get('/:id/related', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 4;
    const current = await Product.findOne({ id: req.params.id }).lean();
    let query = { id: { $ne: req.params.id } };

    if (current) {
      query.category = current.category;
    }

    let related = await Product.find(query).limit(limit).lean();
    if (related.length < limit) {
      const extra = await Product.find({
        id: { $nin: [req.params.id, ...related.map((p) => p.id)] },
        featured: true,
      })
        .limit(limit - related.length)
        .lean();
      related = [...related, ...extra];
    }

    return res.json({
      data: related,
      meta: { total: related.length, timestamp: new Date().toISOString() },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// GET /products/:id/reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.id }).sort({ createdAt: -1 }).lean();
    return res.json({
      data: reviews,
      meta: { total: reviews.length, timestamp: new Date().toISOString() },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// POST /products/:id/reviews
router.post('/:id/reviews', async (req, res) => {
  try {
    const { author, rating, title, body } = req.body;
    if (!author || !rating || !title || !body) {
      return res.status(400).json({ message: 'Author, rating, title, and body are required.' });
    }

    const review = await Review.create({
      id: `rev-${Date.now()}`,
      productId: req.params.id,
      author: author.trim(),
      rating: Number(rating),
      title: title.trim(),
      body: body.trim(),
      verified: true,
    });

    // Update product rating and review count
    const all = await Review.find({ productId: req.params.id });
    const avg = all.reduce((sum, r) => sum + r.rating, 0) / all.length;
    await Product.findOneAndUpdate(
      { id: req.params.id },
      { rating: Math.round(avg * 10) / 10, reviewCount: all.length }
    );

    return res.status(201).json({
      data: review,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
