/**
 * データベーステーブル確認スクリプト
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabaseTables() {
  try {
    console.log('データベーステーブルを確認中...');
    
    // 全テーブルの一覧を取得
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public'
    `;
    console.log('テーブル一覧:');
    tables.forEach(table => console.log(`- ${table.table_name}`));
    
    // staffテーブルの構造を確認
    console.log('\nstaffテーブルの構造を確認中...');
    try {
      const staffColumns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema='public' AND table_name='staff'
        ORDER BY ordinal_position
      `;
      console.log('staffテーブルのカラム:');
      staffColumns.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL可' : 'NOT NULL'})`);
      });
    } catch (e) {
      console.error('staffテーブル確認エラー:', e.message);
    }
    
    // usersテーブルの存在を確認
    console.log('\nusersテーブルの存在を確認中...');
    const usersTable = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public' AND table_name='users'
    `;
    
    if (usersTable.length > 0) {
      console.log('usersテーブルが存在します');
      
      // usersテーブルの構造を確認
      const usersColumns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema='public' AND table_name='users'
        ORDER BY ordinal_position
      `;
      console.log('usersテーブルのカラム:');
      usersColumns.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL可' : 'NOT NULL'})`);
      });
      
      // usersテーブルのデータ数を確認
      const usersCount = await prisma.$queryRaw`SELECT COUNT(*) FROM users`;
      console.log(`usersテーブルのデータ数: ${usersCount[0].count}`);
    } else {
      console.log('usersテーブルは存在しません');
    }
    
    // staffテーブルのデータ数を確認
    console.log('\nstaffテーブルのデータ数を確認中...');
    try {
      const staffCount = await prisma.$queryRaw`SELECT COUNT(*) FROM staff`;
      console.log(`staffテーブルのデータ数: ${staffCount[0].count}`);
      
      if (staffCount[0].count > 0) {
        // サンプルデータを表示
        const staffSamples = await prisma.$queryRaw`SELECT * FROM staff LIMIT 3`;
        console.log('staffテーブルのサンプルデータ:');
        console.log(staffSamples);
      }
    } catch (e) {
      console.error('staffテーブルデータ確認エラー:', e.message);
    }
    
    // schema.prismaの内容を確認
    console.log('\nスキーマ定義とデータベースの比較:');
    console.log('1. schema.prismaではStaffモデルは`staff`テーブルにマッピングされています');
    console.log('2. schema.prismaにはUserモデルは存在しません');
    
    // 結論
    console.log('\n結論:');
    console.log('- schema.prismaとデータベースの間に不一致があります');
    console.log('- 実際のデータベースには`staff`テーブルが存在し、`users`テーブルは存在しない可能性があります');
    console.log('- hotel-saasからの指摘は、異なるデータベースまたは環境に基づいている可能性があります');
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseTables();
