import request from 'supertest'
import express from 'express'
import roomMemosRouter from '../room-memos.routes'

// 簡易認証モックミドルウェア
const mockAuth = (tenantId = 'default', userId = 'staff-test') => (req: any, _res: any, next: any) => {
  req.user = { tenant_id: tenantId, user_id: userId }
  next()
}

describe('Room Memos API', () => {
  const app = express()
  app.use(express.json())
  app.use(mockAuth())
  app.use('/api/v1/admin', roomMemosRouter)

  it('should validate create payload', async () => {
    const res = await request(app)
      .post('/api/v1/admin/room-memos')
      .send({})
    expect(res.status).toBe(422)
  })
})


