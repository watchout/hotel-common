/**
 * Redisモジュールのプライベートフィールドエラーを抑制するための型定義
 */
declare module '@redis/client/dist/lib/client/*' {
  // プライベートフィールドのエラーを抑制
}

declare module '@redis/client/dist/lib/cluster/*' {
  // プライベートフィールドのエラーを抑制
}

declare module '@redis/graph/dist/*' {
  // プライベートフィールドのエラーを抑制
}
