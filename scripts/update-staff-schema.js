/**
 * Staffモデルのスキーマ更新とパスワードハッシュ機能のテスト
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

// パスワードハッシュ化関数
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// テスト用スタッフデータ
const testStaff = {
  email: 'test-staff@example.com',
  name: 'テストスタッフ',
  role: 'STAFF',
  password: 'password123',
  tenant_id: 'test-tenant-001'
};

async function main() {
  try {
    console.log('Staffモデルスキーマ更新テスト開始...');

    // 既存のスタッフを検索
    const existingStaff = await prisma.staff.findFirst({
      where: { email: testStaff.email }
    });

    if (existingStaff) {
      console.log(`既存のスタッフを更新: ${existingStaff.email}`);
      
      // パスワードハッシュを更新
      await prisma.staff.update({
        where: { id: existingStaff.id },
        data: {
          password_hash: hashPassword(testStaff.password),
          failed_login_count: 0,
          last_login_at: new Date(),
        }
      });
      
      console.log('スタッフ情報を更新しました');
    } else {
      console.log('新しいスタッフを作成します');
      
      // 新しいスタッフを作成
      const newStaff = await prisma.staff.create({
        data: {
          tenant_id: testStaff.tenant_id,
          email: testStaff.email,
          name: testStaff.name,
          role: testStaff.role,
          password_hash: hashPassword(testStaff.password),
          is_active: true
        }
      });
      
      console.log(`スタッフを作成しました: ${newStaff.id}`);
    }

    // 更新されたスタッフ情報を取得して確認
    const updatedStaff = await prisma.staff.findFirst({
      where: { email: testStaff.email }
    });

    console.log('更新されたスタッフ情報:');
    console.log({
      id: updatedStaff.id,
      email: updatedStaff.email,
      name: updatedStaff.name,
      role: updatedStaff.role,
      has_password: !!updatedStaff.password_hash,
      failed_login_count: updatedStaff.failed_login_count,
      last_login_at: updatedStaff.last_login_at
    });

    // ログイン処理のシミュレーション
    console.log('\nログインテスト:');
    const loginResult = await simulateLogin(testStaff.email, testStaff.password);
    console.log(`ログイン結果: ${loginResult.success ? '成功' : '失敗'}`);
    if (loginResult.error) {
      console.log(`エラー: ${loginResult.error}`);
    }

  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function simulateLogin(email, password) {
  try {
    // メールアドレスでスタッフを検索
    const staff = await prisma.staff.findFirst({
      where: { email }
    });
    
    if (!staff) {
      return { success: false, error: 'ユーザーが見つかりません' };
    }
    
    // パスワードの検証
    const hashedPassword = hashPassword(password);
    if (hashedPassword !== staff.password_hash) {
      // 失敗ログイン回数をインクリメント
      await prisma.staff.update({
        where: { id: staff.id },
        data: { 
          failed_login_count: { increment: 1 }
        }
      });
      
      return { success: false, error: 'パスワードが一致しません' };
    }
    
    // ログイン成功処理
    await prisma.staff.update({
      where: { id: staff.id },
      data: {
        last_login_at: new Date(),
        failed_login_count: 0
      }
    });
    
    return { 
      success: true,
      staff: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// スクリプト実行
main();
