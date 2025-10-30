// seed-test-data.ts
import * as readline from 'readline';

import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '../generated/prisma';



/**
 * データベース操作の安全確認を行う関数
 * @param message 確認メッセージ
 * @returns 確認が取れた場合はtrue、それ以外はfalse
 */
async function confirmDatabaseOperation(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`⚠️ ${message} [y/N]: `, (answer) => {
      rl.close();
      const confirmed = answer.toLowerCase() === 'y';
      if (!confirmed) {
        console.log('❌ 操作はキャンセルされました。');
      }
      resolve(confirmed);
    });
  });
}

/**
 * テスト用データをシードする
 */
async function seedTestData() {
  console.log('🌱 テストデータのシード開始...');

  // データベース操作の確認
  const confirmed = await confirmDatabaseOperation(
    'このスクリプトはPrismaを使用してデータベースにテストデータを挿入します。\n' +
    'これはスキーマ定義に基づいた操作ですが、既存データに影響する可能性があります。\n' +
    '続行しますか？'
  );

  if (!confirmed) {
    return;
  }

  // Prismaクライアントを直接使用（一部のSQL操作用）
  const prisma = new PrismaClient();

  try {
    // 1. テナントの作成
    console.log('🏢 テナントを確認・作成中...');

    // 既存テナントの確認
    const existingTenants = await prisma.tenant.findMany();
    let defaultTenant;
    let testTenant;

    if (existingTenants.length > 0) {
      // 既存テナントを使用
      defaultTenant = existingTenants.find(t => t.name === 'デフォルトホテル') || existingTenants[0];
      testTenant = existingTenants.find(t => t.name === 'テスト用ホテル') ||
        (existingTenants.length > 1 ? existingTenants[1] : existingTenants[0]);

      console.log(`ℹ️ 既存テナントを使用: ${existingTenants.length}件`);
    } else {
      // 新規テナント作成
      defaultTenant = await prisma.tenant.create({
        data: {
          id: 'default-tenant',
          name: 'デフォルトホテル',
          domain: 'default.hotel.example.com',
          status: 'active',
          // contactName: '管理者', // フィールドが存在しないためコメントアウト
          contactEmail: 'admin@default.hotel.example.com',
          // contactPhone: '03-1234-5678', // フィールドが存在しないためコメントアウト
          // updatedAt: new Date(), // 自動生成されるためコメントアウト
          // createdAt: new Date() // 自動生成されるためコメントアウト
        }
      });

      testTenant = await prisma.tenant.create({
        data: {
          id: 'test-tenant',
          name: 'テスト用ホテル',
          domain: 'test.hotel.example.com',
          status: 'active',
          // contactName: 'テスト管理者', // フィールドが存在しないためコメントアウト
          contactEmail: 'admin@test.hotel.example.com',
          // contactPhone: '03-9876-5432', // フィールドが存在しないためコメントアウト
          // updatedAt: new Date(), // 自動生成されるためコメントアウト
          // createdAt: new Date() // 自動生成されるためコメントアウト
        }
      });

      console.log('✅ テナント作成完了');
    }

    console.log(`📋 使用テナント: デフォルト=${defaultTenant.name}(${defaultTenant.id}), テスト=${testTenant.name}(${testTenant.id})`);

    // 2. プレイスの作成 - スキップ（適切なモデルが見つからないため）
    console.log('🏨 プレイスを確認・作成中...');
    console.log(`ℹ️ プレイス作成はスキップします（適切なモデルが見つからないため）`);

    // 3. デバイスの作成
    console.log('📱 デバイスを確認・作成中...');

    // 既存デバイスの確認
    const existingDefaultDevices = await prisma.device_rooms.count({
      where: { tenantId: defaultTenant.id }
    });

    const existingTestDevices = await prisma.device_rooms.count({
      where: { tenantId: testTenant.id }
    });

    let defaultDevicesCreated = 0;
    let testDevicesCreated = 0;

    // デフォルトテナント用デバイス
    if (existingDefaultDevices === 0) {
      // デバイスルームを作成
      const defaultDevicesResult = await Promise.all([
        prisma.device_rooms.create({
          data: {
            id: Math.floor(Math.random() * 1000000), // IDを数値型で自動生成
            tenantId: defaultTenant.id,
            roomId: 'room101',
            roomName: 'デラックスルーム101',
            deviceId: 'device001',
            deviceType: 'tablet',
            placeId: 'lobby',
            ipAddress: '192.168.1.101',
            macAddress: '00:11:22:33:44:55',
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
            lastUsedAt: new Date()
          }
        }),
        prisma.device_rooms.create({
          data: {
            id: Math.floor(Math.random() * 1000000), // IDを数値型で自動生成
            tenantId: defaultTenant.id,
            roomId: 'room102',
            roomName: 'スイートルーム102',
            deviceId: 'device002',
            deviceType: 'tablet',
            placeId: 'lobby',
            ipAddress: '192.168.1.102',
            macAddress: '00:11:22:33:44:56',
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
            lastUsedAt: new Date()
          }
        }),
        prisma.device_rooms.create({
          data: {
            id: Math.floor(Math.random() * 1000000), // IDを数値型で自動生成
            tenantId: defaultTenant.id,
            roomId: 'room103',
            roomName: 'スタンダードルーム103',
            deviceId: 'device003',
            deviceType: 'kiosk',
            placeId: 'entrance',
            ipAddress: '192.168.1.103',
            macAddress: '00:11:22:33:44:57',
            status: 'maintenance',
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
            lastUsedAt: new Date()
          }
        })
      ]);
      defaultDevicesCreated = defaultDevicesResult.length;
      console.log(`✅ デフォルトテナント用デバイス作成完了: ${defaultDevicesCreated}件`);
    } else {
      console.log(`ℹ️ デフォルトテナント用の既存デバイスを使用: ${existingDefaultDevices}件`);
    }

    // テスト用テナント用デバイス
    if (existingTestDevices === 0) {
      const testDevices = await Promise.all([
        prisma.device_rooms.create({
          data: {
            id: Math.floor(Math.random() * 1000000), // IDを数値型で自動生成
            tenantId: testTenant.id,
            roomId: 'test101',
            roomName: 'テストルーム101',
            deviceId: 'test001',
            deviceType: 'tablet',
            placeId: 'reception',
            ipAddress: '192.168.2.101',
            macAddress: '00:11:22:33:55:55',
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
            lastUsedAt: new Date()
          }
        }),
        prisma.device_rooms.create({
          data: {
            id: Math.floor(Math.random() * 1000000), // IDを数値型で自動生成
            tenantId: testTenant.id,
            roomId: 'test102',
            roomName: 'テストルーム102',
            deviceId: 'test002',
            deviceType: 'kiosk',
            placeId: 'restaurant',
            ipAddress: '192.168.2.102',
            macAddress: '00:11:22:33:55:56',
            status: 'inactive',
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
            lastUsedAt: new Date()
          }
        })
      ]);
      testDevicesCreated = testDevices.length;
      console.log(`✅ テストテナント用デバイス作成完了: ${testDevicesCreated}件`);
    } else {
      console.log(`ℹ️ テストテナント用の既存デバイスを使用: ${existingTestDevices}件`);
    }

    console.log(`✅ デバイス確認・作成完了: 新規作成 ${defaultDevicesCreated + testDevicesCreated}件, 既存 ${existingDefaultDevices + existingTestDevices}件`);

    // 4. スタッフの作成（既存のスタッフテーブルがある場合）
    try {
      console.log('👤 スタッフを確認・作成中...');

      // 既存スタッフの確認
      const staffCount = await prisma.$executeRaw`SELECT COUNT(*) FROM staff`;

      if (staffCount === 0) {
        // 直接SQLを実行する前に確認
        const sqlConfirmed = await confirmDatabaseOperation(
          'スタッフテーブルへの直接SQLによるデータ挿入を行います。\n' +
          'これはPrismaモデルが正しく定義されていない場合に使用する例外的な操作です。\n' +
          '続行しますか？'
        );

        if (!sqlConfirmed) {
          console.log('ℹ️ スタッフデータの作成をスキップします。');
        } else {
          await prisma.$executeRaw`
            INSERT INTO staff (id, tenant_id, email, password_hash, role, name, created_at, updated_at)
            VALUES
              (${uuidv4()}, ${defaultTenant.id}, 'admin@example.com', ${await bcrypt.hash('admin123', 10)}, 'admin', '管理者', ${new Date()}, ${new Date()}),
              (${uuidv4()}, ${defaultTenant.id}, 'staff@example.com', ${await bcrypt.hash('staff123', 10)}, 'staff', 'スタッフ', ${new Date()}, ${new Date()}),
              (${uuidv4()}, ${testTenant.id}, 'test@example.com', ${await bcrypt.hash('test123', 10)}, 'admin', 'テスト管理者', ${new Date()}, ${new Date()})
          `;
          console.log('✅ スタッフ作成完了: 3件');
        }
      } else {
        console.log(`ℹ️ 既存のスタッフを使用: ${staffCount}件`);
      }
    } catch (error: unknown) {
      console.log('⚠️ スタッフテーブルがないか、アクセスできません。スキップします。');
    }

    // 5. システムプランの作成 - スキップ（スキーマの不一致のため）
    console.log('📋 システムプランを確認・作成中...');
    console.log('ℹ️ システムプラン作成はスキップします（スキーマの不一致のため）');

    console.log('🌱 テストデータのシード完了');
  } catch (error: unknown) {
    console.error('❌ テストデータのシード中にエラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
seedTestData().catch(e => {
  console.error('❌ シードスクリプトの実行中にエラーが発生しました:', e);
  process.exit(1);
});
