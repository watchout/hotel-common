const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStaff() {
  try {
    const staff = await prisma.staff.findMany();
    console.log('スタッフ情報:', JSON.stringify(staff, null, 2));
  } catch (e) {
    console.error('エラー:', e);
  } finally {
    await prisma.$disconnect();
  }
}

checkStaff();

