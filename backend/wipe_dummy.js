require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const mongoose = require('mongoose');

async function wipeDummyData() {
  const prisma = new PrismaClient();
  
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // 2. Delete all products in MongoDB
    const result = await mongoose.connection.db.collection('products').deleteMany({});
    console.log(`Deleted ${result.deletedCount} products from MongoDB`);
    
    // 3. Delete all keys in PostgreSQL
    const keysResult = await prisma.licenseKey.deleteMany({});
    console.log(`Deleted ${keysResult.count} license keys from PostgreSQL`);
    
    // 4. Delete productRef in PostgreSQL
    const refsResult = await prisma.productRef.deleteMany({});
    console.log(`Deleted ${refsResult.count} productRefs from PostgreSQL`);
    
  } catch (error) {
    console.error('Error wiping data:', error);
  } finally {
    await prisma.$disconnect();
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

wipeDummyData();
