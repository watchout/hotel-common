import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAccountingData() {
  try {
    console.log('💰 会計データのシード開始...');

    // デフォルトテナントIDを取得
    const defaultTenant = await prisma.tenant.findFirst({
      where: { id: 'default' }
    });

    if (!defaultTenant) {
      console.error('❌ デフォルトテナントが見つかりません');
      return;
    }

    const tenantId = defaultTenant.id;

    // 既存の会計データをチェック
    const [existingInvoices, existingPayments, existingTransactions] = await Promise.all([
      prisma.invoice.count({ where: { tenantId, isDeleted: false } }),
      prisma.payment.count({ where: { tenantId, isDeleted: false } }),
      prisma.transaction.count({ where: { tenantId, isDeleted: false } })
    ]);

    if (existingInvoices > 0 || existingPayments > 0 || existingTransactions > 0) {
      console.log(`ℹ️  既に会計データが存在します (請求書:${existingInvoices}, 決済:${existingPayments}, 取引:${existingTransactions})`);
      return;
    }

    // サンプル請求書データ
    const invoicesData = [
      {
        tenantId,
        invoiceNumber: 'INV-2025-001',
        customerId: 'guest-001',
        customerName: '田中太郎',
        customerEmail: 'tanaka@example.com',
        billingAddress: {
          name: '田中太郎',
          address: '東京都渋谷区1-1-1',
          phone: '03-1234-5678'
        },
        items: [
          {
            description: '宿泊料金（スタンダードルーム・2泊）',
            quantity: 2,
            unitPrice: 10000,
            taxRate: 0.1,
            amount: 20000
          },
          {
            description: 'ルームサービス',
            quantity: 1,
            unitPrice: 5000,
            taxRate: 0.1,
            amount: 5000
          }
        ],
        subtotal: 25000,
        taxAmount: 2500,
        totalAmount: 27500,
        status: 'paid',
        dueDate: new Date('2025-08-30'),
        paidAt: new Date('2025-08-27T10:30:00Z'),
        notes: 'チェックアウト時決済完了',
        createdBy: 'staff-001'
      },
      {
        tenantId,
        invoiceNumber: 'INV-2025-002',
        customerId: 'guest-002',
        customerName: '佐藤花子',
        customerEmail: 'sato@example.com',
        billingAddress: {
          name: '佐藤花子',
          address: '大阪府大阪市北区2-2-2',
          phone: '06-5678-9012'
        },
        items: [
          {
            description: '宿泊料金（デラックスルーム・1泊）',
            quantity: 1,
            unitPrice: 15000,
            taxRate: 0.1,
            amount: 15000
          }
        ],
        subtotal: 15000,
        taxAmount: 1500,
        totalAmount: 16500,
        status: 'sent',
        dueDate: new Date('2025-08-31'),
        paidAt: null,
        notes: '請求書送付済み',
        createdBy: 'staff-001'
      },
      {
        tenantId,
        invoiceNumber: 'INV-2025-003',
        customerId: 'guest-003',
        customerName: '山田次郎',
        customerEmail: 'yamada@example.com',
        billingAddress: {
          name: '山田次郎',
          address: '名古屋市中区3-3-3',
          phone: '052-3456-7890'
        },
        items: [
          {
            description: '宿泊料金（スイートルーム・3泊）',
            quantity: 3,
            unitPrice: 25000,
            taxRate: 0.1,
            amount: 75000
          },
          {
            description: 'スパサービス',
            quantity: 2,
            unitPrice: 8000,
            taxRate: 0.1,
            amount: 16000
          }
        ],
        subtotal: 91000,
        taxAmount: 9100,
        totalAmount: 100100,
        status: 'overdue',
        dueDate: new Date('2025-08-25'),
        paidAt: null,
        notes: '支払期限超過',
        createdBy: 'staff-002'
      }
    ];

    // 請求書を作成
    const createdInvoices = [];
    for (const invoiceData of invoicesData) {
      const invoice = await prisma.invoice.create({
        data: invoiceData
      });
      createdInvoices.push(invoice);
    }

    console.log(`✅ ${createdInvoices.length}件の請求書を作成しました`);

    // 決済データ（支払済み請求書用）
    const paymentsData = [
      {
        tenantId,
        invoiceId: createdInvoices[0].id, // INV-2025-001
        paymentMethod: 'credit_card',
        amount: 27500,
        currency: 'JPY',
        status: 'completed',
        paymentReference: 'CC-REF-001',
        processedAt: new Date('2025-08-27T10:30:00Z'),
        metadata: {
          cardType: 'VISA',
          last4: '1234',
          authCode: 'AUTH123'
        },
        createdBy: 'staff-001'
      }
    ];

    // 決済を作成
    const createdPayments = [];
    for (const paymentData of paymentsData) {
      const payment = await prisma.payment.create({
        data: paymentData
      });
      createdPayments.push(payment);
    }

    console.log(`✅ ${createdPayments.length}件の決済を作成しました`);

    // 取引データ
    const transactionsData = [
      {
        tenantId,
        invoiceId: createdInvoices[0].id,
        paymentId: createdPayments[0].id,
        type: 'invoice',
        amount: 25000,
        taxAmount: 2500,
        totalAmount: 27500,
        status: 'completed',
        description: '宿泊料金・ルームサービス',
        reference: 'TXN-001',
        metadata: {
          roomNumber: '101',
          checkIn: '2025-08-25',
          checkOut: '2025-08-27'
        },
        createdBy: 'staff-001'
      },
      {
        tenantId,
        invoiceId: createdInvoices[0].id,
        paymentId: createdPayments[0].id,
        type: 'payment',
        amount: 27500,
        taxAmount: 0,
        totalAmount: 27500,
        status: 'completed',
        description: 'クレジットカード決済',
        reference: 'TXN-002',
        metadata: {
          paymentMethod: 'credit_card',
          cardType: 'VISA'
        },
        createdBy: 'staff-001'
      },
      {
        tenantId,
        invoiceId: createdInvoices[1].id,
        paymentId: null,
        type: 'invoice',
        amount: 15000,
        taxAmount: 1500,
        totalAmount: 16500,
        status: 'pending',
        description: '宿泊料金（未払い）',
        reference: 'TXN-003',
        metadata: {
          roomNumber: '201',
          checkIn: '2025-08-26',
          checkOut: '2025-08-27'
        },
        createdBy: 'staff-001'
      }
    ];

    // 取引を作成
    const createdTransactions = [];
    for (const transactionData of transactionsData) {
      const transaction = await prisma.transaction.create({
        data: transactionData
      });
      createdTransactions.push(transaction);
    }

    console.log(`✅ ${createdTransactions.length}件の取引を作成しました`);

    // 統計を表示
    const stats = await Promise.all([
      prisma.invoice.groupBy({
        by: ['status'],
        where: { tenantId, isDeleted: false },
        _count: { id: true },
        _sum: { totalAmount: true }
      }),
      prisma.payment.groupBy({
        by: ['status'],
        where: { tenantId, isDeleted: false },
        _count: { id: true },
        _sum: { amount: true }
      }),
      prisma.transaction.groupBy({
        by: ['type', 'status'],
        where: { tenantId, isDeleted: false },
        _count: { id: true },
        _sum: { totalAmount: true }
      })
    ]);

    console.log('\n📊 会計データ統計:');
    console.log('請求書:');
    stats[0].forEach(stat => {
      console.log(`  ${stat.status}: ${stat._count.id}件 (合計: ¥${stat._sum.totalAmount?.toLocaleString()})`);
    });
    
    console.log('決済:');
    stats[1].forEach(stat => {
      console.log(`  ${stat.status}: ${stat._count.id}件 (合計: ¥${stat._sum.amount?.toLocaleString()})`);
    });
    
    console.log('取引:');
    stats[2].forEach(stat => {
      console.log(`  ${stat.type} (${stat.status}): ${stat._count.id}件 (合計: ¥${stat._sum.totalAmount?.toLocaleString()})`);
    });

  } catch (error) {
    console.error('❌ 会計データシードエラー:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプトが直接実行された場合
if (require.main === module) {
  seedAccountingData()
    .then(() => {
      console.log('🎉 会計データシード完了');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 会計データシード失敗:', error);
      process.exit(1);
    });
}

export { seedAccountingData };



