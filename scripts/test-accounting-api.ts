import { PrismaClient } from '../src/generated/prisma'

async function main() {
  const db = new PrismaClient()
  const tenantId = 'default'

  // Invoices list (like GET /api/v1/accounting/invoices)
  const invoices = await db.invoice.findMany({
    where: { tenantId, isDeleted: false },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })
  console.log('Invoices:', invoices.map((inv: any) => ({
    id: inv.id,
    invoice_number: inv.invoiceNumber,
    customer_name: inv.customerName,
    total_amount: inv.totalAmount,
    status: inv.status,
  })))

  if (invoices.length > 0) {
    const id = invoices[0].id
    const invoice = await db.invoice.findFirst({
      where: { id, tenantId, isDeleted: false },
      include: { payments: { where: { isDeleted: false } } },
    })
    console.log('Invoice detail:', {
      id: invoice?.id,
      invoice_number: invoice?.invoiceNumber,
      payments: invoice?.payments?.map((p: any) => ({ id: p.id, amount: p.amount, method: p.paymentMethod, status: p.status })) || [],
    })
  }

  // Front-desk accounting list (like /api/v1/admin/front-desk/accounting)
  const transactions = await db.transaction.findMany({
    where: { tenantId, isDeleted: false },
    include: { invoice: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })
  console.log('Transactions:', transactions.map((txn: any) => ({
    id: txn.id,
    type: txn.type,
    invoice_number: txn.invoice?.invoiceNumber || txn.reference || '',
    amount: txn.amount,
    total_amount: txn.totalAmount,
    status: txn.status,
    payment_method: null,
  })))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  // nothing
})
