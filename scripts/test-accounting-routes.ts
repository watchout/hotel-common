import 'dotenv/config'
import express from 'express'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import accountingRouter from '../src/routes/systems/common/accounting.routes'
import frontDeskAccountingRouter from '../src/routes/systems/common/front-desk-accounting.routes'

async function main() {
  const app = express()
  app.use(express.json())
  app.use('/api/v1/accounting', accountingRouter)
  app.use('/api/v1/admin/front-desk', frontDeskAccountingRouter)

  const secret = process.env.JWT_SECRET || 'hotel-common-secret-change-in-production'
  const token = jwt.sign({
    user_id: 'dev-staff-001',
    tenant_id: 'default',
    role: 'STAFF',
    permissions: ['tenant:read']
  }, secret, { expiresIn: '1h' })

  // GET /api/v1/accounting/invoices
  const resList = await request(app)
    .get('/api/v1/accounting/invoices')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
  console.log('GET /accounting/invoices ->', JSON.stringify(resList.body, null, 2))

  // Invoice detail (id from list)
  const invoiceId = resList.body?.data?.invoices?.[0]?.id
  if (invoiceId) {
    const resDetail = await request(app)
      .get(`/api/v1/accounting/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    console.log('GET /accounting/invoices/:id ->', JSON.stringify(resDetail.body, null, 2))
  }

  // Reports
  const resReport = await request(app)
    .get('/api/v1/accounting/reports')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
  console.log('GET /accounting/reports ->', JSON.stringify(resReport.body, null, 2))

  // Front-desk transactions list (should include payment)
  const resFront = await request(app)
    .get('/api/v1/admin/front-desk/accounting')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
  console.log('GET /admin/front-desk/accounting ->', JSON.stringify(resFront.body, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
