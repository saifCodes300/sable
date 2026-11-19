import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from './models/Product.js';
import { Category } from './models/Category.js';
import { PromoCode } from './models/PromoCode.js';
import { User } from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const DATA_DIR = path.join(__dirname, '../../src/data');

export async function seedDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sable_db';
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    }

    console.log('[Seed] Checking MongoDB collections...');

    const forceRefresh = process.argv.includes('--force');
    const productsCount = await Product.countDocuments();
    if (productsCount === 0 || forceRefresh) {
      if (forceRefresh) await Product.deleteMany({});
      const rawProducts = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf8'));
      await Product.insertMany(rawProducts);
      console.log(`[Seed] ${forceRefresh ? 'Refreshed' : 'Inserted'} ${rawProducts.length} products into MongoDB with 6 photographic views.`);
    } else {
      console.log(`[Seed] Products already seeded (${productsCount} items).`);
    }

    const categoriesCount = await Category.countDocuments();
    if (categoriesCount === 0) {
      const rawCategories = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'categories.json'), 'utf8'));
      await Category.insertMany(rawCategories);
      console.log(`[Seed] Inserted ${rawCategories.length} categories into MongoDB.`);
    }

    const promoCount = await PromoCode.countDocuments();
    if (promoCount === 0) {
      const rawPromo = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'promoCodes.json'), 'utf8'));
      await PromoCode.insertMany(rawPromo);
      console.log(`[Seed] Inserted ${rawPromo.length} promo codes into MongoDB.`);
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create({
        firstName: 'Alexander',
        lastName: 'Vance',
        email: 'atelier@sable.co',
        password: 'sable2026',
        phone: '+1 (212) 555-0194',
        savedAddress: {
          firstName: 'Alexander',
          lastName: 'Vance',
          address: '42 Mercer Street, Apt 5B',
          city: 'New York',
          state: 'NY',
          zip: '10013',
          country: 'United States',
          phone: '+1 (212) 555-0194',
        },
      });
      console.log('[Seed] Created default demo member: atelier@sable.co / sable2026');
    }

    console.log('[Seed] Database initialization complete.');
  } catch (err) {
    console.warn('[Seed] Warning:', err.message);
  }
}

// Run directly if invoked from CLI
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(() => mongoose.disconnect());
}
