#!/usr/bin/env node

/**
 * プラン情報確認スクリプト
 */

const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function checkPlans() {
  try {
    console.log('現在のプラン情報を確認します');
    const plans = await prisma.plan_restrictions.findMany();
    console.log(JSON.stringify(plans, null, 2));
  } catch (e) {
    console.error('エラー:', e);
  } finally {
    await prisma.$disconnect();
  }
}

checkPlans();