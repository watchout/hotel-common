/**
 * テストスタッフ作成スクリプト
 * ログインテスト用のスタッフユーザーを作成します
 */

const { PrismaClient } = require('../src/generated/prisma');
const crypto = require('crypto');
const prisma = new PrismaClient();

// 簡易的なパスワードハッシュ関数（実際のシステムではもっと安全な方法を使用）
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function createTestStaff() {
  try {
    console.log('テストスタッフの作成を開始します...');

    // 既存のテナントを取得
    const tenants = await prisma.tenant.findMany({
      take: 2
    });

    if (tenants.length === 0) {
      console.error('テナントが見つかりません。先にテストデータを作成してください。');
      return;
    }

    // テナント1用のスタッフを作成
    const staff1 = await createStaffUser(
      tenants[0].id,
      'STAFF001',
      '山田',
      '太郎',
      'やまだ',
      'たろう',
      'staff1@example.com',
      'password123',
      'ADMIN',
      5
    );
    
    console.log(`テナント「${tenants[0].name}」のスタッフを作成しました:`, {
      id: staff1.id,
      email: staff1.email,
      displayName: staff1.displayName
    });

    // テナント1用の追加スタッフを作成
    const staff2 = await createStaffUser(
      tenants[0].id,
      'STAFF002',
      '佐藤',
      '花子',
      'さとう',
      'はなこ',
      'staff2@example.com',
      'password123',
      'STAFF',
      2
    );
    
    console.log(`テナント「${tenants[0].name}」の追加スタッフを作成しました:`, {
      id: staff2.id,
      email: staff2.email,
      displayName: staff2.displayName
    });

    // テナント2がある場合、テナント2用のスタッフを作成
    if (tenants.length > 1) {
      const staff3 = await createStaffUser(
        tenants[1].id,
        'STAFF001',
        '鈴木',
        '一郎',
        'すずき',
        'いちろう',
        'staff3@example.com',
        'password123',
        'MANAGER',
        3
      );
      
      console.log(`テナント「${tenants[1].name}」のスタッフを作成しました:`, {
        id: staff3.id,
        email: staff3.email,
        displayName: staff3.displayName
      });
    }

    console.log('\nログイン情報:');
    console.log('Email: staff1@example.com, Password: password123 (管理者権限)');
    console.log('Email: staff2@example.com, Password: password123 (一般スタッフ権限)');
    console.log('Email: staff3@example.com, Password: password123 (マネージャー権限)');

  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * スタッフユーザーを作成する
 */
async function createStaffUser(
  tenantId,
  staffCode,
  lastName,
  firstName,
  lastNameKana,
  firstNameKana,
  email,
  password,
  role,
  level
) {
  const now = new Date();
  const staffNumber = `S${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
  
  return await prisma.staff.create({
    data: {
      tenantId,
      staffCode,
      staffNumber,
      lastName,
      firstName,
      lastNameKana,
      firstNameKana,
      displayName: `${lastName} ${firstName}`,
      email,
      passwordHash: hashPassword(password),
      passwordChangedAt: new Date(),
      baseLevel: level,
      departmentCode: 'FRONT',
      positionTitle: role,
      hireDate: new Date(),
      employmentType: 'full_time',
      employmentStatus: 'active',
      phoneNumber: `090-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      photoUrl: null,
      accessRestrictions: {},
      notificationSettings: { email: true, inApp: true },
      uiPreferences: { theme: 'light', language: 'ja' },
      isActive: true,
      isSystemUser: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
}

// スクリプト実行
createTestStaff();