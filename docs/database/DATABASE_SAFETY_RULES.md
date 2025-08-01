# データベース安全性ルール

## 🚫 絶対禁止事項

1. **データベースリセット操作の禁止**
   - `npx prisma migrate reset` の安易な実行禁止
   - `npx prisma db push --force-reset` の使用禁止
   - データベースファイルの直接削除禁止
   - ユーザーの明示的な許可なしにデータを削除しない

2. **複数データベースファイルの作成禁止**
   - 一つのアプリケーションには一つのデータベースファイルのみ
   - データベースファイルの移動・コピー禁止（バックアップ除く）

3. **データベースパスの変更禁止**
   - 常に統一されたデータベース接続文字列を使用
   - 全てのPrismaクライアントが同じデータベースを参照することを確認

## 📋 安全なデータベース操作コマンド

以下の安全なコマンドを使用してください：

```bash
# Prismaクライアント生成（安全）
npm run db:safe-generate

# スキーマ変更を安全に適用
npm run db:safe-push

# データベースの状態確認
npm run db:status

# データベースのバックアップ作成
npm run db:backup

# データベース安全性チェック
npm run db:check

# Prisma Studioの安全な起動
npm run db:studio
```

## ⚠️ 危険なコマンド（使用禁止）

以下のコマンドは使用しないでください：

```bash
# 🚫 これらのコマンドは使用禁止
npx prisma migrate reset
npx prisma db push --force-reset
npx prisma db push --force
rm ./prisma/dev.db
```

## 🔄 データベース操作の流れ

1. **スキーマ変更前**
   - 現在のデータベース状態を確認: `npm run db:status`
   - バックアップを作成: `npm run db:backup`

2. **スキーマ変更**
   - schema.prismaファイルを編集
   - 安全な適用: `npm run db:safe-push`

3. **変更後の確認**
   - データベース状態を再確認: `npm run db:status`
   - 問題があればバックアップから復元

## 🛠 トラブルシューティング

### データベース接続エラー

```
❌ データベース接続に失敗しました
```

**対処法**:
1. DATABASE_URL環境変数が正しく設定されているか確認
2. PostgreSQLサービスが実行中か確認
3. ネットワーク接続を確認

### スキーマ適用エラー

```
❌ スキーマの適用に失敗しました
```

**対処法**:
1. エラーメッセージを確認し、スキーマの問題を修正
2. データ互換性の問題がないか確認
3. 必要に応じてマイグレーションスクリプトを作成

## 📝 バックアップと復元

### バックアップ作成

```bash
npm run db:backup
```

バックアップは `prisma/backups/` ディレクトリに保存されます。

### バックアップ一覧表示

```bash
npm run db:restore
```

### 復元方法

```bash
# PostgreSQLの場合
psql -U username -d database_name -f ./prisma/backups/バックアップファイル名.sql
```

## 🔒 セキュリティ対策

1. **Gitフックの設定**

   ```bash
   npm run db:setup-hooks
   ```

   これにより、危険なデータベース操作を含むコードのコミットを防止します。

2. **定期的なバックアップ**

   本番環境では、自動バックアップを設定することをお勧めします。

3. **アクセス制限**

   データベースへの直接アクセスは、必要な開発者のみに制限してください。

## 📚 参考資料

- [Prisma公式ドキュメント](https://www.prisma.io/docs/)
- [PostgreSQL公式ドキュメント](https://www.postgresql.org/docs/)