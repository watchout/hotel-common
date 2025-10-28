/** @req: REQ-API-GEN-000 */
/**
 * 汎用CRUD ルーター
 * SSOT: SSOT_GENERIC_RESOURCES_API.md v1.0.0
 *
 * フィーチャーフラグ: GENERIC_RESOURCES_ENABLED
 */

import { Router } from 'express';

import resourcesDeleteHandler from './resources/[resource]-[id].delete';
import resourcesGetHandler from './resources/[resource]-[id].get';
import resourcesUpdateHandler from './resources/[resource]-[id].patch';
import resourcesListHandler from './resources/[resource].get';
import resourcesCreateHandler from './resources/[resource].post';

const router = Router();

// フィーチャーフラグチェック
const isEnabled = process.env.GENERIC_RESOURCES_ENABLED === 'true';

if (isEnabled) {
  console.log('✅ [hotel-common] Generic Resources API: ENABLED');

  // GET /api/v1/admin/resources/:resource - 一覧取得
  router.get('/resources/:resource', resourcesListHandler);

  // POST /api/v1/admin/resources/:resource - 作成
  router.post('/resources/:resource', resourcesCreateHandler);

  // GET /api/v1/admin/resources/:resource/:id - 単体取得
  router.get('/resources/:resource/:id', resourcesGetHandler);

  // PATCH /api/v1/admin/resources/:resource/:id - 更新
  router.patch('/resources/:resource/:id', resourcesUpdateHandler);

  // DELETE /api/v1/admin/resources/:resource/:id - 削除
  router.delete('/resources/:resource/:id', resourcesDeleteHandler);
} else {
  console.log('⚠️ [hotel-common] Generic Resources API: DISABLED');

  // 無効時は404を返す
  router.all('/resources/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'FEATURE_DISABLED',
        message: 'Generic Resources API is currently disabled'
      }
    });
  });
}

export default router;

