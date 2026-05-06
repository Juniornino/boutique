require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const Product = require('./src/models/mongo/Product');
const User = require('./src/models/mongo/User');
const logger = require('./src/config/logger');

const prisma = new PrismaClient();

const PRODUCTS = require('../shared/products.json');

const seedDB = async () => {
  try {
    logger.info('Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    logger.info('Nettoyage des bases de données...');
    await Product.deleteMany();
    await User.deleteMany();
    await prisma.licenseKey.deleteMany();
    await prisma.order.deleteMany();
    await prisma.productRef.deleteMany();
    await prisma.userRef.deleteMany();

    logger.info('Insertion de l\'administrateur...');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('Admin1234!', salt);
    
    const admin = new User({
      email: 'admin@softkeypro.com',
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'SoftKeyPro',
      isActive: true
    });
    await admin.save();

    await prisma.userRef.create({
      data: {
        id: admin._id.toString(),
        email: admin.email
      }
    });

    logger.info('Insertion des produits et clés de licence...');
    for (const p of PRODUCTS) {
      const product = new Product({
        _id: p._id,
        name: p.name,
        category: p.category,
        price: p.price,
        image: p.image,
        description: p.description,
        isActive: p.isActive,
        availableKeysCount: 10,
        soldCount: p.soldCount
      });
      await product.save();

      await prisma.productRef.create({
        data: {
          id: product._id.toString(),
          name: product.name,
          price: product.price
        }
      });

      // Insertion de quelques clés de licence pour chaque produit
      const licenseKeysData = [];
      for (let i = 1; i <= 10; i++) {
        licenseKeysData.push({
          code: `${product.name.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${i}`,
          status: 'AVAILABLE',
          productId: product._id.toString()
        });
      }
      await prisma.licenseKey.createMany({ data: licenseKeysData });
    }

    logger.info('Base de données initialisée avec succès !');
    logger.info('Identifiants Admin : admin@softkeypro.com / Admin1234!');
  } catch (error) {
    logger.error('Erreur lors du seed :', error);
  } finally {
    await mongoose.disconnect();
    await prisma.$disconnect();
    process.exit(0);
  }
};

seedDB();