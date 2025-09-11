"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../../../auth/middleware");
const logger_1 = require("../../../utils/logger");
const response_builder_1 = require("../../../utils/response-builder");
const api_response_standards_1 = require("../../../standards/api-response-standards");
const database_1 = require("../../../database");
const router = express_1.default.Router();
const logger = logger_1.HotelLogger.getInstance();
/**
 * 注文履歴取得
 * GET /api/v1/orders/history
 */
router.get('/api/v1/orders/history', middleware_1.authMiddleware, async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id;
        const { page = 1, limit = 20, roomId, status } = req.query;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response);
        }
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
        const offset = (pageNum - 1) * limitNum;
        // フィルター条件構築
        const whereConditions = {
            tenantId,
            isDeleted: false
        };
        if (roomId) {
            whereConditions.roomId = roomId;
        }
        if (status) {
            whereConditions.status = status;
        }
        // 注文履歴取得（注文アイテムとセッション情報も含む）
        const [orders, totalCount] = await Promise.all([
            database_1.hotelDb.getAdapter().order.findMany({
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
                    },
                    session: {
                        select: {
                            id: true,
                            sessionNumber: true,
                            guestInfo: true,
                            status: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limitNum
            }),
            database_1.hotelDb.getAdapter().order.count({
                where: whereConditions
            })
        ]);
        const formattedOrders = orders.map(order => ({
            id: order.id,
            roomId: order.roomId,
            placeId: order.placeId,
            status: order.status,
            total: order.total,
            items: order.OrderItem,
            session: order.session ? {
                id: order.session.id,
                sessionNumber: order.session.sessionNumber,
                guestName: order.session.guestInfo?.primaryGuest?.firstName + ' ' + order.session.guestInfo?.primaryGuest?.lastName,
                status: order.session.status
            } : null,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            paidAt: order.paidAt
        }));
        const pagination = {
            page: pageNum,
            limit: limitNum,
            total_items: totalCount,
            total_pages: Math.ceil(totalCount / limitNum),
            has_next: offset + limitNum < totalCount,
            has_prev: pageNum > 1
        };
        api_response_standards_1.ResponseHelper.sendSuccess(res, {
            orders: formattedOrders,
            summary: {
                total_orders: totalCount,
                filtered_orders: formattedOrders.length
            }
        }, 200, pagination);
    }
    catch (error) {
        logger.error('注文履歴取得エラー:', error);
        api_response_standards_1.ResponseHelper.sendInternalError(res, '注文履歴取得に失敗しました');
    }
});
/**
 * 注文作成
 * POST /api/v1/orders
 *
 * 仕様に準拠した拡張版注文作成API
 * - オプション対応
 * - 支払い方法対応
 * - デバイスID・ソース情報対応
 */
router.post('/api/v1/orders', middleware_1.authMiddleware, async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id;
        const { roomId, items, specialInstructions, paymentMethod, deviceId, source } = req.body;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response);
        }
        // 入力値検証
        const validationErrors = {};
        if (!roomId) {
            validationErrors.roomId = '部屋IDは必須です';
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            validationErrors.items = '少なくとも1つのアイテムが必要です';
        }
        else {
            // アイテムの検証
            items.forEach((item, index) => {
                if (!item.menuId)
                    validationErrors[`items[${index}].menuId`] = 'メニューIDは必須です';
                if (!item.name)
                    validationErrors[`items[${index}].name`] = 'アイテム名は必須です';
                if (typeof item.price !== 'number' || item.price <= 0) {
                    validationErrors[`items[${index}].price`] = '有効な価格を指定してください';
                }
                if (typeof item.quantity !== 'number' || item.quantity < 1) {
                    validationErrors[`items[${index}].quantity`] = '数量は1以上である必要があります';
                }
                // オプションの検証
                if (item.options && Array.isArray(item.options)) {
                    item.options.forEach((option, optIndex) => {
                        if (!option.id)
                            validationErrors[`items[${index}].options[${optIndex}].id`] = 'オプションIDは必須です';
                        if (!option.name)
                            validationErrors[`items[${index}].options[${optIndex}].name`] = 'オプション名は必須です';
                        if (typeof option.price !== 'number') {
                            validationErrors[`items[${index}].options[${optIndex}].price`] = '有効なオプション価格を指定してください';
                        }
                    });
                }
            });
        }
        // 支払い方法の検証
        const validPaymentMethods = ['room-charge', 'credit-card', 'cash'];
        if (paymentMethod && !validPaymentMethods.includes(paymentMethod)) {
            validationErrors.paymentMethod = '有効な支払い方法を指定してください';
        }
        // 特別指示の長さ検証
        if (specialInstructions && specialInstructions.length > 500) {
            validationErrors.specialInstructions = '特別指示は500文字以内にしてください';
        }
        // バリデーションエラーがあれば400エラーを返す
        if (Object.keys(validationErrors).length > 0) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('VALIDATION_ERROR', 'リクエストが不正です', validationErrors).response);
        }
        // 合計金額計算（アイテム価格 + オプション価格）
        const total = items.reduce((sum, item) => {
            const itemTotal = item.price * item.quantity;
            const optionsTotal = item.options && Array.isArray(item.options)
                ? item.options.reduce((optSum, opt) => optSum + opt.price, 0) * item.quantity
                : 0;
            return sum + itemTotal + optionsTotal;
        }, 0);
        // 注文メタデータ
        const orderMetadata = {
            specialInstructions: specialInstructions || null,
            paymentMethod: paymentMethod || 'room-charge',
            deviceId: deviceId || null,
            source: source || null,
            orderTime: new Date()
        };
        // アクティブなチェックインセッションを取得
        const activeSession = await database_1.hotelDb.getAdapter().checkinSession.findFirst({
            where: {
                roomId,
                tenantId,
                status: 'ACTIVE'
            }
        });
        // トランザクションで注文とアイテムを作成
        const result = await database_1.hotelDb.getAdapter().$transaction(async (tx) => {
            // 注文作成（セッションIDを含む）
            const order = await tx.order.create({
                data: {
                    tenantId,
                    roomId,
                    sessionId: activeSession?.id, // セッションIDを設定
                    status: 'pending',
                    items: {
                        items: items.map((item) => ({
                            menuId: item.menuId,
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity,
                            options: item.options || []
                        })),
                        metadata: orderMetadata
                    },
                    total,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });
            // 注文アイテム作成
            const orderItems = await Promise.all(items.map((item) => tx.orderItem.create({
                data: {
                    tenantId,
                    orderId: order.id,
                    menuItemId: parseInt(item.menuId.replace('menu-', '')) || 0,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    status: 'pending',
                    notes: item.notes || specialInstructions || null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            })));
            return { order, orderItems };
        });
        logger.info('注文作成成功', {
            orderId: result.order.id,
            tenantId,
            roomId,
            sessionId: activeSession?.id,
            sessionNumber: activeSession?.sessionNumber,
            total,
            itemCount: items.length,
            paymentMethod: orderMetadata.paymentMethod,
            source: orderMetadata.source || 'unknown'
        });
        // レスポンス形式を仕様に合わせる
        return response_builder_1.StandardResponseBuilder.success(res, {
            success: true,
            order: {
                id: `order-${result.order.id}`,
                roomId: result.order.roomId,
                status: result.order.status,
                totalAmount: result.order.total,
                createdAt: result.order.createdAt,
                updatedAt: result.order.updatedAt,
                items: result.orderItems.map(item => ({
                    id: `item-${item.id}`,
                    menuId: `menu-${item.menuItemId}`,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    totalPrice: item.price * item.quantity,
                    options: items.find((i) => i.menuId === `menu-${item.menuItemId}`)?.options || []
                })),
                specialInstructions: orderMetadata.specialInstructions,
                paymentMethod: orderMetadata.paymentMethod,
                deviceId: orderMetadata.deviceId,
                source: orderMetadata.source
            }
        });
    }
    catch (error) {
        logger.error('注文作成エラー:', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('ORDER_CREATE_ERROR', error instanceof Error ? error.message : '注文作成に失敗しました').response);
    }
});
/**
 * アクティブ注文取得
 * GET /api/v1/orders/active
 */
router.get('/api/v1/orders/active', middleware_1.authMiddleware, async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id;
        const { roomId } = req.query;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response);
        }
        const whereConditions = {
            tenantId,
            status: { in: ['received', 'preparing'] },
            isDeleted: false
        };
        if (roomId) {
            whereConditions.roomId = roomId;
        }
        const activeOrders = await database_1.hotelDb.getAdapter().order.findMany({
            where: whereConditions,
            include: {
                OrderItem: {
                    where: { status: { not: 'delivered' } },
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        quantity: true,
                        status: true,
                        notes: true,
                        createdAt: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
        const formattedOrders = activeOrders.map(order => ({
            id: order.id,
            roomId: order.roomId,
            placeId: order.placeId,
            status: order.status,
            total: order.total,
            items: order.OrderItem,
            createdAt: order.createdAt,
            estimatedDelivery: new Date(order.createdAt.getTime() + (30 * 60 * 1000)) // 30分後の推定配達時間
        }));
        return response_builder_1.StandardResponseBuilder.success(res, formattedOrders);
    }
    catch (error) {
        logger.error('アクティブ注文取得エラー:', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('ACTIVE_ORDERS_ERROR', error instanceof Error ? error.message : 'アクティブ注文取得に失敗しました').response);
    }
});
/**
 * 注文詳細取得
 * GET /api/v1/orders/:id
 */
router.get('/api/v1/orders/:id', middleware_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response);
        }
        const order = await database_1.hotelDb.getAdapter().order.findFirst({
            where: {
                id: parseInt(id),
                tenantId,
                isDeleted: false
            },
            include: {
                OrderItem: {
                    select: {
                        id: true,
                        menuItemId: true,
                        name: true,
                        price: true,
                        quantity: true,
                        status: true,
                        notes: true,
                        deliveredAt: true,
                        createdAt: true,
                        updatedAt: true
                    }
                }
            }
        });
        if (!order) {
            return res.status(404).json(response_builder_1.StandardResponseBuilder.error('ORDER_NOT_FOUND', '注文が見つかりません').response);
        }
        const formattedOrder = {
            id: order.id,
            roomId: order.roomId,
            placeId: order.placeId,
            status: order.status,
            total: order.total,
            items: order.OrderItem,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            paidAt: order.paidAt
        };
        return response_builder_1.StandardResponseBuilder.success(res, formattedOrder);
    }
    catch (error) {
        logger.error('注文詳細取得エラー:', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('ORDER_DETAIL_ERROR', error instanceof Error ? error.message : '注文詳細取得に失敗しました').response);
    }
});
/**
 * 注文ステータス更新
 * PUT /api/v1/orders/:id/status
 */
router.put('/api/v1/orders/:id/status', middleware_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response);
        }
        // ステータス検証
        const validStatuses = ['received', 'preparing', 'ready', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('INVALID_STATUS', '無効なステータスです').response);
        }
        // 注文存在確認
        const existingOrder = await database_1.hotelDb.getAdapter().order.findFirst({
            where: {
                id: parseInt(id),
                tenantId,
                isDeleted: false
            }
        });
        if (!existingOrder) {
            return res.status(404).json(response_builder_1.StandardResponseBuilder.error('ORDER_NOT_FOUND', '注文が見つかりません').response);
        }
        // ステータス更新
        const updatedOrder = await database_1.hotelDb.getAdapter().order.update({
            where: { id: parseInt(id) },
            data: {
                status,
                updatedAt: new Date(),
                // 配達完了時は支払い日時も設定
                ...(status === 'delivered' && { paidAt: new Date() })
            }
        });
        logger.info('注文ステータス更新', {
            orderId: id,
            tenantId,
            oldStatus: existingOrder.status,
            newStatus: status
        });
        return response_builder_1.StandardResponseBuilder.success(res, {
            id: updatedOrder.id,
            status: updatedOrder.status,
            updatedAt: updatedOrder.updatedAt,
            paidAt: updatedOrder.paidAt
        });
    }
    catch (error) {
        logger.error('注文ステータス更新エラー:', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('ORDER_STATUS_UPDATE_ERROR', error instanceof Error ? error.message : '注文ステータス更新に失敗しました').response);
    }
});
/**
 * メニュー一覧取得
 * GET /api/v1/order/menu
 */
router.get('/api/v1/order/menu', middleware_1.authMiddleware, async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id;
        const { category, available_only = 'true' } = req.query;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response);
        }
        // 簡易メニューデータ（実際の実装では専用テーブルから取得）
        const sampleMenu = [
            {
                id: 1,
                category: 'food',
                name: 'ルームサービス弁当',
                description: '和洋折衷の特製弁当',
                price: 1500,
                image_url: '/images/menu/bento.jpg',
                available: true,
                preparation_time: 20
            },
            {
                id: 2,
                category: 'drink',
                name: 'コーヒーセット',
                description: 'ドリップコーヒーとお菓子のセット',
                price: 800,
                image_url: '/images/menu/coffee.jpg',
                available: true,
                preparation_time: 10
            },
            {
                id: 3,
                category: 'food',
                name: 'サンドイッチプレート',
                description: '新鮮野菜のサンドイッチ',
                price: 1200,
                image_url: '/images/menu/sandwich.jpg',
                available: true,
                preparation_time: 15
            },
            {
                id: 4,
                category: 'drink',
                name: 'フレッシュジュース',
                description: '季節のフルーツジュース',
                price: 600,
                image_url: '/images/menu/juice.jpg',
                available: false,
                preparation_time: 5
            }
        ];
        // フィルタリング
        let filteredMenu = sampleMenu;
        if (category) {
            filteredMenu = filteredMenu.filter(item => item.category === category);
        }
        if (available_only === 'true') {
            filteredMenu = filteredMenu.filter(item => item.available);
        }
        // カテゴリ別にグループ化
        const groupedMenu = filteredMenu.reduce((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
        }, {});
        return response_builder_1.StandardResponseBuilder.success(res, {
            categories: Object.keys(groupedMenu),
            items: groupedMenu,
            total_items: filteredMenu.length
        });
    }
    catch (error) {
        logger.error('メニュー一覧取得エラー:', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('MENU_FETCH_ERROR', error instanceof Error ? error.message : 'メニュー一覧取得に失敗しました').response);
    }
});
/**
 * トップメニュー取得
 * GET /api/v1/menus/top
 */
router.get('/api/v1/menus/top', middleware_1.authMiddleware, async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response);
        }
        // 人気メニュー（注文数上位）を取得
        const popularItems = await database_1.hotelDb.getAdapter().orderItem.groupBy({
            by: ['name', 'price'],
            where: {
                tenantId,
                createdAt: {
                    gte: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)) // 過去30日
                }
            },
            _count: { name: true },
            _sum: { quantity: true },
            orderBy: { _count: { name: 'desc' } },
            take: 6
        });
        const topMenu = popularItems.map((item, index) => ({
            id: `top-${index + 1}`,
            name: item.name,
            price: item.price,
            order_count: item._count.name,
            total_quantity: item._sum.quantity || 0,
            rank: index + 1,
            badge: index < 3 ? 'popular' : null
        }));
        return response_builder_1.StandardResponseBuilder.success(res, {
            top_items: topMenu,
            period: '過去30日間',
            updatedAt: new Date()
        });
    }
    catch (error) {
        logger.error('トップメニュー取得エラー:', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('TOP_MENU_ERROR', error instanceof Error ? error.message : 'トップメニュー取得に失敗しました').response);
    }
});
/**
 * 注文配置
 * POST /api/v1/order/place
 */
router.post('/api/v1/order/place', middleware_1.authMiddleware, async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id;
        const { roomId, items, special_requests, delivery_time } = req.body;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response);
        }
        // 入力値検証
        if (!roomId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('VALIDATION_ERROR', '必須フィールドが不足しています').response);
        }
        // 合計金額計算
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        // アクティブなチェックインセッションを取得
        const activeSession = await database_1.hotelDb.getAdapter().checkinSession.findFirst({
            where: {
                roomId,
                tenantId,
                status: 'ACTIVE'
            }
        });
        // 注文作成（配置）
        const order = await database_1.hotelDb.getAdapter().order.create({
            data: {
                tenantId,
                roomId,
                sessionId: activeSession?.id, // セッションIDを設定
                status: 'received',
                items: {
                    items,
                    special_requests: special_requests || null,
                    delivery_time: delivery_time || null
                },
                total,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });
        // 注文アイテム作成
        const orderItems = await Promise.all(items.map(item => database_1.hotelDb.getAdapter().orderItem.create({
            data: {
                tenantId,
                orderId: order.id,
                menuItemId: item.id || 0,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                status: 'pending',
                notes: item.notes || special_requests || null,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        })));
        logger.info('注文配置成功', {
            orderId: order.id,
            tenantId,
            roomId,
            sessionId: activeSession?.id,
            sessionNumber: activeSession?.sessionNumber,
            total,
            itemCount: items.length
        });
        return response_builder_1.StandardResponseBuilder.success(res, {
            order_id: order.id,
            status: 'placed',
            estimated_delivery: new Date(Date.now() + (30 * 60 * 1000)), // 30分後
            total_amount: total,
            items: orderItems.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            message: '注文を受け付けました'
        });
    }
    catch (error) {
        logger.error('注文配置エラー:', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('ORDER_PLACE_ERROR', error instanceof Error ? error.message : '注文配置に失敗しました').response);
    }
});
exports.default = router;
