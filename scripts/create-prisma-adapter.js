/**
 * このスクリプトは、Prismaクライアントのアダプターを作成するためのものです。
 * Prismaスキーマで@@mapディレクティブを使用した後、コードの互換性を維持するための
 * アダプターレイヤーを作成します。
 */

const fs = require('fs');
const path = require('path');

// アダプターファイルの出力先
const outputPath = path.join(__dirname, '../src/database/prisma-adapter.ts');

// 変換マッピングの定義
const modelMappings = [
  // PascalCase/camelCaseからスネークケース/複数形への変換マッピング
  { from: 'page', to: 'pages' },
  { from: 'pageHistory', to: 'page_histories' },
  { from: 'responseNode', to: 'response_nodes' },
  { from: 'responseTree', to: 'response_trees' },
  { from: 'responseTreeVersion', to: 'response_tree_versions' },
  { from: 'responseTreeSession', to: 'response_tree_sessions' },
  { from: 'responseTreeMobileLink', to: 'response_tree_mobile_links' },
  { from: 'responseTreeHistory', to: 'response_tree_history' },
  { from: 'responseNodeTranslation', to: 'response_node_translations' },
  { from: 'campaign', to: 'campaigns' },
  { from: 'campaignCategory', to: 'campaign_categories' },
  { from: 'campaignCategoryRelation', to: 'campaign_category_relations' },
  { from: 'campaignItem', to: 'campaign_items' },
  { from: 'campaignTranslation', to: 'campaign_translations' },
  { from: 'campaignUsageLog', to: 'campaign_usage_logs' },
  { from: 'deviceVideoCache', to: 'device_video_caches' },
  { from: 'notificationTemplate', to: 'notification_templates' },
  { from: 'tenantAccessLog', to: 'tenant_access_logs' },
  { from: 'systemEvent', to: 'system_event' },
  { from: 'deviceRoom', to: 'device_rooms' },
  { from: 'order', to: 'order' }, // すでに@@mapで"order"に設定済み
  { from: 'orderItem', to: 'order_item' }, // すでに@@mapで"order_item"に設定済み
];

// アダプターコードを生成
function generateAdapterCode() {
  let code = `/**
 * Prismaアダプター
 * 
 * このファイルは自動生成されています。
 * Prismaスキーマで@@mapディレクティブを使用した後、コードの互換性を維持するための
 * アダプターレイヤーです。
 */

import { PrismaClient } from '@prisma/client';

/**
 * Prismaクライアントのラッパークラス
 * 古い命名規則（キャメルケース・単数形）でのアクセスを、
 * 新しい命名規則（スネークケース・複数形）に変換します
 */
export class PrismaAdapter {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

`;

  // 各モデルのゲッターを生成
  modelMappings.forEach(mapping => {
    code += `  /**
   * ${mapping.from} -> ${mapping.to} のマッピング
   */
  get ${mapping.from}() {
    return this.prisma.${mapping.to};
  }

`;
  });

  // トランザクションメソッドを追加
  code += `  /**
   * トランザクション実行のラッパー
   * トランザクション内でも同じマッピングを適用します
   */
  async $transaction<T>(
    action: (tx: any) => Promise<T>,
    options?: Parameters<PrismaClient['$transaction']>[1]
  ): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      const txAdapter = new TransactionAdapter(tx);
      return action(txAdapter);
    }, options);
  }

  // 他のPrismaClientメソッドを直接転送
  $connect() { return this.prisma.$connect(); }
  $disconnect() { return this.prisma.$disconnect(); }
  $on(eventType: any, callback: any) { return this.prisma.$on(eventType, callback); }
}

/**
 * トランザクション用アダプター
 */
class TransactionAdapter {
  private tx: any;

  constructor(tx: any) {
    this.tx = tx;
  }

`;

  // トランザクション内の各モデルのゲッターを生成
  modelMappings.forEach(mapping => {
    code += `  get ${mapping.from}() {
    return this.tx.${mapping.to};
  }

`;
  });

  code += `}

/**
 * Prismaクライアントをアダプターでラップする関数
 */
export function createPrismaAdapter(prismaClient: PrismaClient): PrismaAdapter {
  return new PrismaAdapter(prismaClient);
}
`;

  return code;
}

// メイン処理
function main() {
  console.log('Prismaアダプターの生成を開始します');
  
  const adapterCode = generateAdapterCode();
  fs.writeFileSync(outputPath, adapterCode, 'utf8');
  
  console.log(`アダプターを生成しました: ${outputPath}`);
}

// スクリプト実行
main();
