// create-missing-tables.ts
import { PrismaClient } from '@prisma/client';

/**
 * 不足しているテーブルをPrismaを通じて作成する
 */
async function createMissingTables() {
  console.log('🔧 不足しているテーブルの作成開始...');
  
  // kanekoユーザーでPrismaクライアントを作成
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://kaneko@localhost:5432/hotel_unified_db"
      }
    }
  });
  
  try {
    // Roomsテーブルの作成
    console.log('🏨 Roomsテーブルを作成中...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "tenantId" TEXT NOT NULL,
        "roomNumber" TEXT NOT NULL,
        "roomType" TEXT NOT NULL,
        floor INTEGER,
        status TEXT DEFAULT 'AVAILABLE',
        capacity INTEGER DEFAULT 2,
        amenities JSONB,
        notes TEXT,
        "lastCleaned" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        "isDeleted" BOOLEAN DEFAULT FALSE,
        "deletedAt" TIMESTAMP,
        "deletedBy" TEXT,
        UNIQUE("tenantId", "roomNumber")
      )
    `;
    
    // Roomsテーブルのインデックス作成
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_rooms_tenantId ON rooms("tenantId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_rooms_roomType ON rooms("roomType")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_rooms_floor ON rooms(floor)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_rooms_isDeleted ON rooms("isDeleted")`;
    
    console.log('✅ Roomsテーブル作成完了');
    
    // Transactionsテーブルの作成
    console.log('💰 Transactionsテーブルを作成中...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "tenantId" TEXT NOT NULL,
        "invoiceId" TEXT,
        "paymentId" TEXT,
        type TEXT NOT NULL,
        amount INTEGER NOT NULL,
        "taxAmount" INTEGER DEFAULT 0,
        "totalAmount" INTEGER NOT NULL,
        status TEXT DEFAULT 'PENDING',
        description TEXT,
        reference TEXT,
        metadata JSONB,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        "createdBy" TEXT,
        "isDeleted" BOOLEAN DEFAULT FALSE,
        "deletedAt" TIMESTAMP,
        "deletedBy" TEXT
      )
    `;
    
    // Transactionsテーブルのインデックス作成
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_transactions_tenantId ON transactions("tenantId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_transactions_createdAt ON transactions("createdAt")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_transactions_isDeleted ON transactions("isDeleted")`;
    
    console.log('✅ Transactionsテーブル作成完了');
    
    // Paymentsテーブルの作成
    console.log('💳 Paymentsテーブルを作成中...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "tenantId" TEXT NOT NULL,
        "transactionId" TEXT,
        "paymentMethod" TEXT NOT NULL,
        amount INTEGER NOT NULL,
        status TEXT DEFAULT 'PENDING',
        reference TEXT,
        metadata JSONB,
        "processedAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        "createdBy" TEXT,
        "isDeleted" BOOLEAN DEFAULT FALSE,
        "deletedAt" TIMESTAMP,
        "deletedBy" TEXT
      )
    `;
    
    // Paymentsテーブルのインデックス作成
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_payments_tenantId ON payments("tenantId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_payments_paymentMethod ON payments("paymentMethod")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_payments_createdAt ON payments("createdAt")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_payments_isDeleted ON payments("isDeleted")`;
    
    console.log('✅ Paymentsテーブル作成完了');
    
    // テーブルの存在確認
    console.log('🔍 作成されたテーブルを確認中...');
    const roomsCount = await prisma.$queryRaw`SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'rooms'`;
    const transactionsCount = await prisma.$queryRaw`SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'transactions'`;
    const paymentsCount = await prisma.$queryRaw`SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'payments'`;
    
    console.log(`📊 テーブル確認結果:`);
    console.log(`   - rooms: ${roomsCount ? '✅ 存在' : '❌ 不存在'}`);
    console.log(`   - transactions: ${transactionsCount ? '✅ 存在' : '❌ 不存在'}`);
    console.log(`   - payments: ${paymentsCount ? '✅ 存在' : '❌ 不存在'}`);
    
    console.log('🎉 不足しているテーブルの作成完了！');
    
  } catch (error) {
    console.error('❌ テーブル作成中にエラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
createMissingTables().catch(e => {
  console.error('❌ スクリプト実行中にエラーが発生しました:', e);
  process.exit(1);
});
