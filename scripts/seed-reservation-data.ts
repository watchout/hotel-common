import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedReservationData() {
  console.log('🏨 予約データのシード開始...')

  try {
    // 既存の客室データを取得
    const rooms = await prisma.room.findMany({
      where: { isDeleted: false },
      take: 5
    })

    if (rooms.length === 0) {
      console.log('⚠️  客室データが見つかりません。先に客室データをシードしてください。')
      return
    }

    // 予約データを作成
    const reservationData = [
      {
        id: 'res-001',
        tenantId: 'default',
        roomId: rooms[0].id,
        guestName: '田中太郎',
        guestEmail: 'tanaka@example.com',
        guestPhone: '090-1234-5678',
        checkinDate: new Date('2025-08-30'),
        checkoutDate: new Date('2025-09-02'),
        adults: 2,
        children: 0,
        status: 'confirmed',
        confirmationNumber: 'HTL-20250830-ABC123',
        totalAmount: 45000,
        paidAmount: 0,
        notes: '禁煙室希望',
        specialRequests: 'ベビーベッド1台',
        createdBy: 'staff-001'
      },
      {
        id: 'res-002',
        tenantId: 'default',
        roomId: rooms[1].id,
        guestName: '佐藤花子',
        guestEmail: 'sato@example.com',
        guestPhone: '080-9876-5432',
        checkinDate: new Date('2025-08-28'),
        checkoutDate: new Date('2025-08-30'),
        adults: 1,
        children: 1,
        status: 'checked_in',
        confirmationNumber: 'HTL-20250828-DEF456',
        totalAmount: 32000,
        paidAmount: 32000,
        notes: 'アーリーチェックイン希望',
        specialRequests: null,
        createdBy: 'staff-002'
      },
      {
        id: 'res-003',
        tenantId: 'default',
        roomId: rooms[2].id,
        guestName: '山田次郎',
        guestEmail: 'yamada@example.com',
        guestPhone: '070-5555-1234',
        checkinDate: new Date('2025-08-25'),
        checkoutDate: new Date('2025-08-27'),
        adults: 2,
        children: 2,
        status: 'completed',
        confirmationNumber: 'HTL-20250825-GHI789',
        totalAmount: 68000,
        paidAmount: 68000,
        notes: 'ファミリー向けアメニティ',
        specialRequests: '子供用アメニティセット',
        createdBy: 'staff-001'
      },
      {
        id: 'res-004',
        tenantId: 'default',
        roomId: rooms[3].id,
        guestName: '鈴木一郎',
        guestEmail: 'suzuki@example.com',
        guestPhone: '090-7777-8888',
        checkinDate: new Date('2025-09-05'),
        checkoutDate: new Date('2025-09-08'),
        adults: 1,
        children: 0,
        status: 'pending',
        confirmationNumber: 'HTL-20250905-JKL012',
        totalAmount: 42000,
        paidAmount: 0,
        notes: 'ビジネス利用',
        specialRequests: 'Wi-Fi環境重視',
        createdBy: 'staff-003'
      },
      {
        id: 'res-005',
        tenantId: 'default',
        roomId: rooms[4].id,
        guestName: '高橋美咲',
        guestEmail: 'takahashi@example.com',
        guestPhone: '080-3333-4444',
        checkinDate: new Date('2025-08-20'),
        checkoutDate: new Date('2025-08-22'),
        adults: 2,
        children: 0,
        status: 'cancelled',
        confirmationNumber: 'HTL-20250820-MNO345',
        totalAmount: 28000,
        paidAmount: 0,
        notes: 'キャンセル理由: 急用',
        specialRequests: null,
        createdBy: 'staff-002'
      }
    ]

    // 予約データをupsert
    for (const reservation of reservationData) {
      await prisma.reservation.upsert({
        where: { id: reservation.id },
        update: reservation,
        create: reservation
      })
      console.log(`✅ 予約データ作成: ${reservation.guestName} (${reservation.confirmationNumber})`)
    }

    console.log('🎉 予約データのシード完了!')
    console.log(`📊 作成された予約: ${reservationData.length}件`)
    console.log('📋 ステータス別:')
    console.log(`  - 予約確定: ${reservationData.filter(r => r.status === 'confirmed').length}件`)
    console.log(`  - チェックイン済み: ${reservationData.filter(r => r.status === 'checked_in').length}件`)
    console.log(`  - 完了: ${reservationData.filter(r => r.status === 'completed').length}件`)
    console.log(`  - 保留中: ${reservationData.filter(r => r.status === 'pending').length}件`)
    console.log(`  - キャンセル: ${reservationData.filter(r => r.status === 'cancelled').length}件`)

  } catch (error) {
    console.error('❌ 予約データシードエラー:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// スクリプト実行
if (require.main === module) {
  seedReservationData()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { seedReservationData }



