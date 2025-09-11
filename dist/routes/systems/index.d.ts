/**
 * システム別APIルーター統合エクスポート
 *
 * ディレクトリ構成:
 * - systems/saas/     - SaaSシステム用API（管理画面、注文、デバイス）
 * - systems/pms/      - PMSシステム用API（予約、部屋管理）
 * - systems/member/   - Memberシステム用API（レスポンスツリー）
 * - systems/common/   - 共通API（認証、ページ管理）
 */
export * from './common';
export * from './saas';
export * from './member';
