/** @req: REQ-API-GEN-000 */
/**
 * 汎用CRUD ルーター
 * SSOT: SSOT_GENERIC_RESOURCES_API.md v1.0.0
 *
 * フィーチャーフラグ: GENERIC_RESOURCES_ENABLED
 */

import { Router } from 'express';

// 動的パスのインポートはビルドで解決されないため、明示的にエイリアス化
// ハンドラーは機能有効時のみ動的読み込み（ビルド時の解決失敗を防止）
let resourcesDeleteHandler: any;
let resourcesGetHandler: any;
let resourcesUpdateHandler: any;
let resourcesListHandler: any;
let resourcesCreateHandler: any;

const router = Router();

// フィーチャーフラグチェック
const isEnabled = process.env.GENERIC_RESOURCES_ENABLED === 'true';

if (isEnabled) {
  console.log('✅ [hotel-common] Generic Resources API: ENABLED');

  void (async () => {
    const base = './resources/';
    const del = await import(base + '[resource]-[id].delete');
    const get = await import(base + '[resource]-[id].get');
    const patch = await import(base + '[resource]-[id].patch');
    const list = await import(base + '[resource].get');
    const create = await import(base + '[resource].post');

    resourcesDeleteHandler = del.default;
    resourcesGetHandler = get.default;
    resourcesUpdateHandler = patch.default;
    resourcesListHandler = list.default;
    resourcesCreateHandler = create.default;

    // ルート登録
    router.get('/resources/:resource', resourcesListHandler);
    router.post('/resources/:resource', resourcesCreateHandler);
    router.get('/resources/:resource/:id', resourcesGetHandler);
    router.patch('/resources/:resource/:id', resourcesUpdateHandler);
    router.delete('/resources/:resource/:id', resourcesDeleteHandler);
  })();
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

