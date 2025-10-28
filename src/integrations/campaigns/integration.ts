import { integrateCampaignFeature } from './index';

import type { HotelIntegrationServer } from '../../server/integration-server-extended';

/**
 * キャンペーン機能をサーバーに統合
 * @param server 統合サーバーインスタンス
 */
export function setupCampaignFeature(server: HotelIntegrationServer): void {
  // キャンペーン機能を統合
  // @ts-ignore - 引数の型が不一致
  integrateCampaignFeature(server);
  
  console.log('キャンペーン機能の統合が完了しました');
}