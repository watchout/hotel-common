/**
 * システム別APIルーター統合エクスポート
 *
 * ディレクトリ構成:
 * - systems/saas/     - SaaSシステム用API（管理画面、注文、デバイス）
 * - systems/pms/      - PMSシステム用API（予約、部屋管理）
 * - systems/member/   - Memberシステム用API（レスポンスツリー）
 * - systems/common/   - 共通API（認証、ページ管理）
 */

// 共通システムAPI
export * from './common'

// SaaSシステムAPI
export { default as adminDashboardRouter } from './saas/admin-dashboard.routes'
export { default as deviceStatusRouter } from './saas/device-status.routes'
export { default as deviceRouter } from './saas/device.routes'
export { default as ordersRouter } from './saas/orders.routes'

// Memberシステムapi
export * from './member'

// PMSシステムAPI（実装時まで無効化）
// export * from './pms'
