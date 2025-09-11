/**
 * SaaSシステム用APIルーター
 * - 管理画面統計API
 * - 注文・メニューAPI
 * - デバイス管理API
 */
export { default as adminDashboardRouter } from './admin-dashboard.routes';
export { default as ordersRouter } from './orders.routes';
export { default as deviceStatusRouter } from './device-status.routes';
export { default as deviceRouter } from './device.routes';
