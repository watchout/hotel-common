# データベースとスキーマの整合性レポート

**生成日時**: 2025-08-17T00:43:35.068Z

## 結果: 不一致

データベースとPrismaスキーマの間に以下の不一致が見つかりました。

### データベースにあってスキーマにないモデル

- `admin`
- `admin_log`
- `campaign_categories`
- `campaign_category_relations`
- `campaign_items`
- `campaign_translations`
- `campaign_usage_logs`
- `campaigns`
- `device_video_caches`
- `notification_templates`
- `page_histories`
- `pages`
- `response_node_translations`
- `response_nodes`
- `response_tree_history`
- `response_tree_mobile_links`
- `response_tree_sessions`
- `response_tree_versions`
- `response_trees`
- `room_grades`
- `schema_version`
- `staff`
- `system_event`
- `tenant_access_logs`

### スキーマにあってデータベースにないモデル

- `Page`
- `PageHistory`
- `Campaign`
- `CampaignTranslation`
- `CampaignItem`
- `CampaignCategory`
- `CampaignCategoryRelation`
- `CampaignUsageLog`
- `DeviceVideoCache`
- `ResponseTree`
- `ResponseNode`
- `ResponseNodeTranslation`
- `ResponseTreeSession`
- `ResponseTreeHistory`
- `ResponseTreeVersion`
- `ResponseTreeMobileLink`
- `Admin`
- `AdminLog`
- `SchemaVersion`
- `SystemEvent`
- `Staff`
- `RoomGrade`
- `TenantAccessLog`
- `NotificationTemplate`

### フィールドの不一致

#### モデル: `Tenant`

**型の不一致:**

| フィールド | データベースの型 | スキーマの型 |
|------------|-----------------|------------|
| `pages` | `pages[]` | `Page[]` |

## 推奨アクション

1. スキーマ定義を実際のデータベース構造と同期させる
2. 必要に応じてマイグレーションファイルを作成
3. アプリケーションコードが更新されたスキーマと互換性があることを確認
