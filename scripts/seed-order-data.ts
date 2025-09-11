import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

async function seedOrderData() {
  console.log('オーダーのシードデータを追加中...');

  // テナントIDを取得
  const tenant = await prisma.tenant.findFirst({
    where: { name: 'デフォルトテナント' }
  });

  if (!tenant) {
    console.error('テナントが見つかりません。先にテナントデータを作成してください。');
    return;
  }

  const tenantId = tenant.id;
  
  // 部屋IDのサンプル
  const roomIds = ['101', '102', '103', '201', '202', '203', '301', '302'];
  
  // メニューアイテムのサンプル
  const menuItems = [
    { id: 1, name: 'ハンバーガー', price: 1500 },
    { id: 2, name: 'フライドポテト', price: 800 },
    { id: 3, name: 'サラダ', price: 1200 },
    { id: 4, name: 'ステーキ', price: 3500 },
    { id: 5, name: 'パスタ', price: 1800 },
    { id: 6, name: 'ピザ', price: 2200 },
    { id: 7, name: 'コーヒー', price: 600 },
    { id: 8, name: 'ケーキ', price: 900 }
  ];

  // 注文ステータスの種類
  const orderStatuses = ['pending', 'confirmed', 'preparing', 'delivered', 'completed', 'cancelled'];
  
  // 注文アイテムステータスの種類
  const itemStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];

  // 過去の日付を生成（最大30日前まで）
  const getRandomPastDate = () => {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);
    
    now.setDate(now.getDate() - daysAgo);
    now.setHours(now.getHours() - hoursAgo);
    now.setMinutes(now.getMinutes() - minutesAgo);
    
    return now;
  };

  // 20件のオーダーを作成
  for (let i = 0; i < 20; i++) {
    // ランダムなデータを生成
    const roomId = roomIds[Math.floor(Math.random() * roomIds.length)];
    const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
    const createdAt = getRandomPastDate();
    const updatedAt = new Date(createdAt);
    updatedAt.setHours(updatedAt.getHours() + Math.floor(Math.random() * 3) + 1);
    
    // 注文アイテムを1〜5個ランダムに選択
    const itemCount = Math.floor(Math.random() * 5) + 1;
    const selectedItems = [];
    let total = 0;
    
    for (let j = 0; j < itemCount; j++) {
      const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const itemStatus = itemStatuses[Math.floor(Math.random() * itemStatuses.length)];
      
      selectedItems.push({
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        status: itemStatus,
        notes: Math.random() > 0.7 ? '特別リクエスト' : null,
      });
      
      total += menuItem.price * quantity;
    }

    // 注文データを作成
    const order = await prisma.order.create({
      data: {
        tenantId,
        roomId,
        status,
        items: JSON.stringify(selectedItems), // itemsフィールドを追加
        total,
        createdAt,
        updatedAt,
        paidAt: status === 'completed' ? updatedAt : null,
        isDeleted: false,
      }
    });

    // 注文アイテムを作成
    for (const item of selectedItems) {
      await prisma.orderItem.create({
        data: {
          tenantId,
          orderId: order.id,
          menuItemId: item.menuItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          status: item.status,
          notes: item.notes,
          createdAt,
          updatedAt,
          is_deleted: false
        }
      });
    }

    console.log(`オーダー #${i+1} 作成完了: ID=${order.id}, ステータス=${status}, 合計=${total}円`);
  }

  console.log('オーダーのシードデータ追加が完了しました。');
}

seedOrderData()
  .catch((e) => {
    console.error('エラーが発生しました:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
