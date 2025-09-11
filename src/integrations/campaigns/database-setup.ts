import { hotelDb } from '../../database/prisma';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * キャンペーン関連のデータベース初期設定を行う
 */
export async function setupCampaignDatabase(): Promise<void> {
  try {
    logger.info('キャンペーン機能のデータベース初期設定を開始します...');
    
    // キャンペーンカテゴリの初期データを作成
    const categories = [
      { code: 'WELCOME', name: 'ウェルカム', description: '新規顧客向けキャンペーン', isSystem: true },
      { code: 'SEASONAL', name: '季節限定', description: '季節に応じたキャンペーン', isSystem: true },
      { code: 'DISCOUNT', name: '割引', description: '割引キャンペーン', isSystem: true },
      { code: 'EVENT', name: 'イベント', description: 'イベント関連キャンペーン', isSystem: true }
    ];
    
    // カテゴリを作成（存在しない場合のみ）
    for (const category of categories) {
      const existing = await hotelDb.getAdapter().campaignCategory.findUnique({
        where: { code: category.code }
      });
      
      if (!existing) {
        await hotelDb.getAdapter().campaignCategory.create({
          data: {
            id: uuidv4(),
            code: category.code,
            name: category.name,
            description: category.description,
            // @ts-ignore - 型定義が不完全
            isSystem: category.isSystem,
            isActive: true,
            priority: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        logger.info(`カテゴリを作成しました: ${category.name}`);
      }
    }
    
    logger.info('キャンペーン機能のデータベース初期設定が完了しました');
  } catch (error) {
    logger.error('キャンペーン機能のデータベース初期設定中にエラーが発生しました', error);
    throw error;
  }
}

/**
 * キャンペーンデータベースの状態を確認
 */
export async function checkCampaignDatabase(): Promise<{
  categories: number;
  campaigns: number;
  isReady: boolean;
}> {
  try {
    const categoryCount = await hotelDb.getAdapter().campaignCategory.count();
    const campaignCount = await hotelDb.getAdapter().campaign.count();
    
    return {
      categories: categoryCount,
      campaigns: campaignCount,
      isReady: true
    };
  } catch (error) {
    logger.error('キャンペーンデータベース状態確認中にエラーが発生しました', error);
    return {
      categories: 0,
      campaigns: 0,
      isReady: false
    };
  }
}