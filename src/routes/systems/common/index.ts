/**
 * 共通システム用APIルーター
 * - 認証API
 * - ページ管理API
 * - 操作ログAPI
 * - 会計API
 * - フロントデスク客室管理API
 * - フロントデスク会計API
 * - フロントデスクチェックインAPI
 * - 管理者操作ログAPI
 * - 客室ランク管理API
 * - スタッフ管理API（管理者用）
 */

export { default as authRouter } from './auth.routes'
export { default as pageRouter } from './page.routes'
export { default as roomGradesRouter } from './room-grades.routes'
export { default as operationLogsRouter } from './operation-logs.routes'
export { default as roomMemosRouter } from './room-memos.routes'
export { default as accountingRouter } from './accounting.routes'
export { default as frontDeskRoomsRouter } from './front-desk-rooms.routes'
export { default as frontDeskAccountingRouter } from './front-desk-accounting.routes'
export { default as frontDeskCheckinRouter } from './front-desk-checkin.routes'
export { default as adminOperationLogsRouter } from './admin-operation-logs.routes'
export { default as adminStaffRouter } from './admin-staff.routes'
