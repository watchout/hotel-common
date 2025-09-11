"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("readline"));
/**
 * 危険なデータベース操作コマンドのパターン
 */
const DANGEROUS_DB_PATTERNS = [
    /psql\s+(?!-c\s+["']SELECT)/i, // SELECTクエリ以外のpsqlコマンド
    /CREATE\s+TABLE/i,
    /ALTER\s+TABLE/i,
    /DROP\s+TABLE/i,
    /INSERT\s+INTO/i,
    /UPDATE\s+(?!.*WHERE)/i, // WHERE句のないUPDATE
    /DELETE\s+FROM\s+(?!.*WHERE)/i, // WHERE句のないDELETE
    /TRUNCATE/i,
    /pg_dump/i,
    /pg_restore/i
];
/**
 * 安全なコマンドのパターン（例外リスト）
 */
const SAFE_PATTERNS = [
    /psql\s+-c\s+["']SELECT\s+/i, // 読み取り専用のSELECTクエリ
    /\\d/i, // テーブル構造の表示
    /\\l/i, // データベース一覧の表示
];
/**
 * データベース操作の安全確認を行う関数
 */
async function confirmDatabaseOperation(command) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    console.log('⚠️ 危険なデータベース操作が検出されました:');
    console.log(`\n${command}\n`);
    console.log('このコマンドはデータベースの整合性を損なう可能性があります。');
    console.log('Prismaを使用した安全な操作方法を検討してください。');
    return new Promise((resolve) => {
        rl.question('それでも実行しますか？ [y/N]: ', (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'y');
        });
    });
}
/**
 * コマンドが危険なデータベース操作かどうかをチェック
 */
function isDangerousDbOperation(command) {
    // 安全なパターンに一致する場合はスキップ
    if (SAFE_PATTERNS.some(pattern => pattern.test(command))) {
        return false;
    }
    // 危険なパターンに一致するかチェック
    return DANGEROUS_DB_PATTERNS.some(pattern => pattern.test(command));
}
/**
 * メイン処理
 */
async function main() {
    // コマンドライン引数からコマンドを取得
    const args = process.argv.slice(2);
    const command = args.join(' ');
    if (!command) {
        console.log('使用法: node db-safety-check.js "実行するコマンド"');
        process.exit(1);
    }
    // 危険なデータベース操作かチェック
    if (isDangerousDbOperation(command)) {
        const shouldProceed = await confirmDatabaseOperation(command);
        if (!shouldProceed) {
            console.log('❌ 操作はキャンセルされました。');
            process.exit(1);
        }
        console.log('⚠️ 危険な操作を実行します...');
    }
    // 確認が取れたか、安全なコマンドの場合は成功
    console.log('✅ 安全性チェック完了');
    process.exit(0);
}
// スクリプト実行
main().catch(error => {
    console.error('エラーが発生しました:', error);
    process.exit(1);
});
