/**
 * Google Playアプリ選択機能のAPIエンドポイントテスト
 */

import request from 'supertest';
import express from 'express';
import { hotelDb } from '../database/prisma';
import appLauncherApiRouter from '../api-endpoints';

// モック
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    googlePlayApp: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn()
    },
    hotelApp: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    layoutAppBlock: {
      findUnique: jest.fn(),
      upsert: jest.fn()
    },
    $queryRaw: jest.fn(),
    $connect: jest.fn(),
    $disconnect: jest.fn()
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

// 認証ミドルウェアのモック
jest.mock('../../../auth/middleware', () => ({
  verifyAdminAuth: (req, res, next) => {
    req.user = { id: 'admin-user', role: 'ADMIN' };
    next();
  },
  verifyTenantAuth: (req, res, next) => {
    req.user = { id: 'tenant-user', tenantId: 'test-tenant', role: 'USER' };
    next();
  }
}));

describe('App Launcher API Endpoints', () => {
  let app: express.Application;
  let prisma: any;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', appLauncherApiRouter);
    prisma = /* 注意: PrismaClientの直接インスタンス化は避けてください。代わりにhotelDb.getAdapter()を使用してください */
  // hotelDb.getAdapter();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/apps/google-play', () => {
    it('should return a list of Google Play apps', async () => {
      const mockApps = [
        { id: 'app1', packageName: 'com.example.app1', displayName: 'App 1' },
        { id: 'app2', packageName: 'com.example.app2', displayName: 'App 2' }
      ];
      
      prisma.googlePlayApp.findMany.mockResolvedValue(mockApps);
      prisma.googlePlayApp.count.mockResolvedValue(2);

      const response = await request(app).get('/api/apps/google-play');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(prisma.googlePlayApp.findMany).toHaveBeenCalled();
    });
  });

  describe('GET /api/apps/google-play/:id', () => {
    it('should return a specific Google Play app', async () => {
      const mockApp = { id: 'app1', packageName: 'com.example.app1', displayName: 'App 1' };
      
      prisma.googlePlayApp.findUnique.mockResolvedValue(mockApp);

      const response = await request(app).get('/api/apps/google-play/app1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockApp);
    });

    it('should return 404 if app not found', async () => {
      prisma.googlePlayApp.findUnique.mockResolvedValue(null);

      const response = await request(app).get('/api/apps/google-play/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/apps/google-play', () => {
    it('should create a new Google Play app', async () => {
      const newApp = {
        packageName: 'com.example.newapp',
        displayName: 'New App',
        category: 'ENTERTAINMENT'
      };
      
      const createdApp = { id: 'new-app', ...newApp };
      
      prisma.googlePlayApp.findUnique.mockResolvedValue(null);
      prisma.googlePlayApp.create.mockResolvedValue(createdApp);

      const response = await request(app)
        .post('/api/apps/google-play')
        .send(newApp);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(createdApp);
    });
  });

  describe('GET /api/places/:placeId/apps', () => {
    it('should return apps for a specific place', async () => {
      const mockApps = [
        {
          id: 'place1-app1',
          placeId: 1,
          appId: 'app1',
          GooglePlayApp: { id: 'app1', displayName: 'App 1' }
        }
      ];
      
      prisma.hotelApp.findMany.mockResolvedValue(mockApps);

      const response = await request(app).get('/api/places/1/apps');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockApps);
    });
  });

  describe('GET /api/client/places/:placeId/apps', () => {
    it('should return enabled and approved apps for client', async () => {
      const mockApps = [
        {
          id: 'place1-app1',
          placeId: 1,
          appId: 'app1',
          isEnabled: true,
          GooglePlayApp: { id: 'app1', displayName: 'App 1', isApproved: true }
        }
      ];
      
      prisma.hotelApp.findMany.mockResolvedValue(mockApps);

      const response = await request(app).get('/api/client/places/1/apps');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });
});