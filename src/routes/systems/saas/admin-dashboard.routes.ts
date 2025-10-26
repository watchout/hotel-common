import express from 'express';

import { verifyAdminAuth } from '../../../auth/middleware';
import { hotelDb } from '../../../database';
import { ResponseHelper } from '../../../standards/api-response-standards';
import { HotelLogger } from '../../../utils/logger';
import { StandardResponseBuilder } from '../../../utils/response-builder';

import type { Request, Response } from 'express';

const router = express.Router();
const logger = HotelLogger.getInstance();

/**
 * 管理画面サマリー統計
 * GET /api/v1/admin/summary
 */
router.get('/api/v1/admin/summary', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(
        StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response
      );
    }

    // 並列でデータ取得（SaaS用統計）
    const [
      totalDevices,
      activeDevices,
      totalOrders,
      todayOrders,
      totalCampaigns,
      activeCampaigns
    ] = await Promise.all([
      // 総デバイス数
      hotelDb.getAdapter().deviceRoom.count({
        where: { tenantId }
      }),
      // アクティブデバイス数
      hotelDb.getAdapter().deviceRoom.count({
        where: {
          tenantId,
          status: 'ACTIVE'
        }
      }),
      // 総注文数
      hotelDb.getAdapter().order.count({
        where: { tenantId, isDeleted: false }
      }),
      // 今日の注文数
      hotelDb.getAdapter().order.count({
        where: {
          tenantId,
          isDeleted: false,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      // 総キャンペーン数
      hotelDb.getAdapter().campaign.count({
        where: { tenantId: tenantId }
      }),
      // アクティブキャンペーン数
      hotelDb.getAdapter().campaign.count({
        where: {
          tenantId: tenantId,
          status: 'ACTIVE'
        }
      })
    ]);

    const summary = {
      devices: {
        total: totalDevices,
        active: activeDevices,
        inactive: totalDevices - activeDevices,
        active_rate: totalDevices > 0 ? Math.round((activeDevices / totalDevices) * 100) : 0
      },
      orders: {
        total: totalOrders,
        today: todayOrders,
        growth_rate: 0 // TODO: 前日比計算
      },
      campaigns: {
        total: totalCampaigns,
        active: activeCampaigns,
        inactive: totalCampaigns - activeCampaigns,
        active_rate: totalCampaigns > 0 ? Math.round((activeCampaigns / totalCampaigns) * 100) : 0
      },
      timestamp: new Date()
    };

    ResponseHelper.sendSuccess(res, { summary });

  } catch (error) {
    logger.error('サマリー統計取得エラー:', error);
    ResponseHelper.sendInternalError(res, 'サマリー統計取得に失敗しました');
  }
});

/**
 * ダッシュボード統計
 * GET /api/v1/admin/dashboard/stats
 */
router.get('/api/v1/admin/dashboard/stats', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.tenant_id;
    const { period = '7d' } = req.query; // 7d, 30d, 90d

    if (!tenantId) {
      return res.status(400).json(
        StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response
      );
    }

    // 期間設定
    const now = new Date();
    const periodDays = period === '30d' ? 30 : period === '90d' ? 90 : 7;
    const startDate = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));

    // 期間内の統計データ取得（SaaS用）
    const [orderStats, revenueStats, campaignStats] = await Promise.all([
      // 注文統計
      hotelDb.getAdapter().order.groupBy({
        by: ['status'],
        where: {
          tenantId,
          createdAt: { gte: startDate },
          isDeleted: false
        },
        _count: true,
        _sum: { total: true }
      }),
      // 売上統計（簡易実装）
      hotelDb.getAdapter().order.aggregate({
        where: {
          tenantId,
          createdAt: { gte: startDate },
          status: { not: 'cancelled' },
          isDeleted: false
        },
        _sum: { total: true },
        _avg: { total: true },
        _count: true
      }),
      // キャンペーン統計
      hotelDb.getAdapter().campaign.groupBy({
        by: ['status'],
        where: {
          tenantId: tenantId,
          createdAt: { gte: startDate }
        },
        _count: true
      })
    ]);

    const stats = {
      period: {
        days: periodDays,
        start_date: startDate,
        end_date: now
      },
      orders: {
        by_status: orderStats.reduce((acc: Record<string, { count: number; total_amount: number }>, stat: any) => {
          acc[stat.status] = {
            count: stat._count,
            total_amount: stat._sum.total || 0
          };
          return acc;
        }, {} as Record<string, { count: number; total_amount: number }>),
        total_count: orderStats.reduce((sum: number, stat: any) => sum + stat._count, 0),
        total_revenue: orderStats.reduce((sum: number, stat: any) => sum + (stat._sum.total || 0), 0)
      },
      revenue: {
        total: revenueStats._sum.total || 0,
        average: revenueStats._avg.total || 0,
        order_count: revenueStats._count
      },
      campaigns: {
        by_status: campaignStats.reduce((acc: Record<string, number>, stat: any) => {
          acc[stat.status] = stat._count || 0;
          return acc;
        }, {} as Record<string, number>),
        total: campaignStats.reduce((sum: number, stat: any) => sum + (stat._count || 0), 0)
      },
      timestamp: new Date()
    };

    return StandardResponseBuilder.success(res, stats);

  } catch (error) {
    logger.error('ダッシュボード統計取得エラー:', error);
    return res.status(500).json(
      StandardResponseBuilder.error('DASHBOARD_STATS_ERROR', 
        error instanceof Error ? error.message : 'ダッシュボード統計取得に失敗しました').response
    );
  }
});

/**
 * デバイス数統計
 * GET /api/v1/admin/devices/count
 */
router.get('/api/v1/admin/devices/count', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(
        StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response
      );
    }

    const deviceStats = await hotelDb.getAdapter().deviceRoom.groupBy({
      by: ['deviceType', 'status'],
      where: { tenantId },
      _count: true
    });

    const counts = {
      total: deviceStats.reduce((sum, stat) => sum + (stat._count || 0), 0),
      by_type: deviceStats.reduce((acc, stat) => {
        const deviceType = stat.deviceType || 'unknown';
        if (!acc[deviceType]) {
          acc[deviceType] = { total: 0, active: 0, inactive: 0 };
        }
        acc[deviceType].total += stat._count || 0;
        if (stat.status === 'ACTIVE') {
          acc[deviceType].active += stat._count || 0;
        } else {
          acc[deviceType].inactive += stat._count || 0;
        }
        return acc;
      }, {} as Record<string, { total: number; active: number; inactive: number }>),
      by_status: deviceStats.reduce((acc, stat) => {
        const status = stat.status || 'unknown';
        acc[status] = (acc[status] || 0) + (stat._count || 0);
        return acc;
      }, {} as Record<string, number>)
    };

    return StandardResponseBuilder.success(res, counts);

  } catch (error) {
    logger.error('デバイス数統計取得エラー:', error);
    return res.status(500).json(
      StandardResponseBuilder.error('DEVICE_COUNT_ERROR', 
        error instanceof Error ? error.message : 'デバイス数統計取得に失敗しました').response
    );
  }
});

/**
 * 月次注文数統計
 * GET /api/v1/admin/orders/monthly-count
 */
router.get('/api/v1/admin/orders/monthly-count', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.tenant_id;
    const { months = 12 } = req.query;

    if (!tenantId) {
      return res.status(400).json(
        StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response
      );
    }

    const monthsCount = Math.min(parseInt(months as string) || 12, 24); // 最大24ヶ月
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsCount);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    // 月次注文統計を取得
    const monthlyOrders = await hotelDb.getClient().$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as order_count,
        SUM("total") as total_revenue,
        AVG("total") as average_order_value
      FROM "Order"
      WHERE "tenantId" = ${tenantId}
        AND "createdAt" >= ${startDate}
        AND "isDeleted" = false
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
    ` as Array<{
      month: Date;
      order_count: bigint;
      total_revenue: bigint;
      average_order_value: number;
    }>;

    const formattedData = monthlyOrders.map(row => ({
      month: row.month.toISOString().substring(0, 7), // YYYY-MM format
      order_count: Number(row.order_count),
      total_revenue: Number(row.total_revenue),
      average_order_value: Math.round(row.average_order_value || 0)
    }));

    return StandardResponseBuilder.success(res, {
      period: `${monthsCount} months`,
      data: formattedData,
      summary: {
        total_orders: formattedData.reduce((sum, item) => sum + item.order_count, 0),
        total_revenue: formattedData.reduce((sum, item) => sum + item.total_revenue, 0),
        average_monthly_orders: Math.round(
          formattedData.reduce((sum, item) => sum + item.order_count, 0) / formattedData.length
        )
      }
    });

  } catch (error) {
    logger.error('月次注文数統計取得エラー:', error);
    return res.status(500).json(
      StandardResponseBuilder.error('MONTHLY_ORDER_COUNT_ERROR', 
        error instanceof Error ? error.message : '月次注文数統計取得に失敗しました').response
    );
  }
});

/**
 * 管理者用オーダー一覧
 * GET /api/v1/admin/orders
 */
router.get('/api/v1/admin/orders', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.tenant_id;
    const { page = 1, limit = 20, roomId, status, startDate, endDate } = req.query;

    if (!tenantId) {
      return res.status(400).json(
        StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response
      );
    }

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    // フィルター条件構築
    const whereConditions: any = {
      tenantId,
      isDeleted: false
    };

    if (roomId) {
      whereConditions.roomId = roomId as string;
    }

    if (status) {
      whereConditions.status = status as string;
    }

    if (startDate) {
      whereConditions.createdAt = {
        ...whereConditions.createdAt,
        gte: new Date(startDate as string)
      };
    }

    if (endDate) {
      whereConditions.createdAt = {
        ...whereConditions.createdAt,
        lte: new Date(endDate as string)
      };
    }

    // 管理者用オーダー一覧取得（詳細情報付き）
    const [orders, totalCount] = await Promise.all([
      hotelDb.getAdapter().order.findMany({
        where: whereConditions,
        include: {
          OrderItem: {
            select: {
              id: true,
              name: true,
              price: true,
              quantity: true,
              status: true,
              notes: true,
              deliveredAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limitNum
      }),
      hotelDb.getAdapter().order.count({
        where: whereConditions
      })
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    const formattedOrders = orders.map((order: any) => ({
      id: order.id,
      tenantId: order.tenantId,
      roomId: order.roomId,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      paidAt: order.paidAt,
      items: order.OrderItem || []
    }));

    const pagination = {
      page: pageNum,
      limit: limitNum,
      total_items: totalCount,
      total_pages: totalPages,
      has_next: pageNum < totalPages,
      has_prev: pageNum > 1
    };

    ResponseHelper.sendSuccess(res, {
      orders: formattedOrders,
      summary: {
        total_orders: totalCount,
        filtered_orders: formattedOrders.length
      }
    }, 200, pagination);

  } catch (error) {
    logger.error('管理者オーダー一覧取得エラー:', error);
    ResponseHelper.sendInternalError(res, '管理者オーダー一覧取得に失敗しました');
  }
});

/**
 * ランキング統計
 * GET /api/v1/admin/rankings
 */
router.get('/api/v1/admin/rankings', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.tenant_id;
    const { period = '30d' } = req.query;

    if (!tenantId) {
      return res.status(400).json(
        StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response
      );
    }

    const periodDays = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const startDate = new Date(Date.now() - (periodDays * 24 * 60 * 60 * 1000));

    // 人気商品ランキング（注文アイテムから集計）
    const popularItems = await hotelDb.getAdapter().orderItem.groupBy({
      by: ['name'],
      where: {
        tenantId,
        createdAt: { gte: startDate }
      },
      _count: true,
      _sum: { quantity: true, price: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    });

    // 部屋別注文ランキング
    const roomRanking = await hotelDb.getAdapter().order.groupBy({
      by: ['roomId'],
      where: {
        tenantId,
        createdAt: { gte: startDate },
        isDeleted: false
      },
      _count: true,
      _sum: { total: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    });

    const rankings = {
      period: `${periodDays} days`,
      popular_items: popularItems.map((item: any, index: number) => ({
        rank: index + 1,
        name: item.name,
        order_count: item._count || 0,
        total_quantity: item._sum?.quantity || 0,
        total_revenue: item._sum?.price || 0
      })),
      top_rooms: roomRanking.map((room: any, index: number) => ({
        rank: index + 1,
        room_id: room.roomId,
        order_count: room._count || 0,
        total_revenue: room._sum?.total || 0
      })),
      timestamp: new Date()
    };

    return StandardResponseBuilder.success(res, rankings);

  } catch (error) {
    logger.error('ランキング統計取得エラー:', error);
    return res.status(500).json(
      StandardResponseBuilder.error('RANKINGS_ERROR', 
        error instanceof Error ? error.message : 'ランキング統計取得に失敗しました').response
    );
  }
});

export default router;
