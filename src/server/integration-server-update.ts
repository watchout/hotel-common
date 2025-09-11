import { HotelIntegrationServer } from './integration-server'
import deviceRouter from '../routes/systems/saas/device.routes'

/**
 * 統合サーバーの更新スクリプト
 * デバイス管理APIを追加
 */

// 統合サーバーのインスタンスを作成
const server = new HotelIntegrationServer()

// デバイス管理APIルーターを追加
server.addRouter('', deviceRouter)

console.log(`
✅ 統合サーバーにデバイス管理APIを追加しました

📊 デバイス管理API:
- GET    /api/v1/devices                  - テナントのデバイス一覧取得
- GET    /api/v1/devices/room/:roomId     - 部屋IDに紐づくデバイス取得
- GET    /api/v1/devices/device/:deviceId - デバイスID指定で取得
- POST   /api/v1/devices                  - 新規デバイス登録
- PUT    /api/v1/devices/:id              - デバイス情報更新
- PATCH  /api/v1/devices/:id/last-used    - デバイス最終使用日時更新
- DELETE /api/v1/devices/:id/deactivate   - デバイス非アクティブ化（論理削除）
- DELETE /api/v1/devices/:id              - デバイス物理削除
- GET    /api/v1/devices/place/:placeId   - プレイスIDに紐づくデバイス取得
- GET    /api/v1/devices/type/:deviceType - デバイスタイプでフィルタリング
- GET    /api/v1/devices/status/:status   - ステータスでフィルタリング
- POST   /api/v1/devices/bulk             - デバイス一括登録

🔒 認証要件:
- すべてのエンドポイントにJWT認証が必要
- テナントIDに基づくアクセス制御を実装済み
`)

// サーバーを起動
server.start().catch((error) => {
  console.error('サーバー起動エラー:', error)
  process.exit(1)
})
