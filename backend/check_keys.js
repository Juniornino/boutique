const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.licenseKey.findMany({ where: { productId: '64a1b2c3d4e5f60001000002' }}).then(keys => {
  console.log(keys.map(k => ({ code: k.code, createdAt: k.createdAt })));
}).catch(console.error).finally(() => prisma.$disconnect());
