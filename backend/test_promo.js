require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/mongo/Product');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const p = new Product({
    name: 'Test Promo Product',
    description: 'Test',
    price: 15000,
    promotionalPrice: 12000,
    category: 'OS',
    image: 'test.jpg'
  });
  await p.save();
  console.log('Saved product:', p);
  await Product.findByIdAndDelete(p._id);
}).catch(console.error).finally(() => mongoose.disconnect());
