/**
 * 🔗 MCP統合管理システム (文献4準拠)
 * Apidog MCP Server統合・OpenAPI仕様キャッシュ
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface MCPServerConfig {
  name: string;
  command: string;
  args: string[];
  openApiSpec: string;
  cacheEnabled: boolean;
}

export interface MCPConfiguration {
  servers: MCPServerConfig[];
  cacheStrategy: 'none' | 'normal' | 'aggressive';
  tokenOptimization: boolean;
}

export interface MCPStatus {
  server: string;
  status: 'running' | 'stopped' | 'error';
  pid?: number;
  uptime?: number;
  cacheHits?: number;
  tokensSaved?: number;
}

/**
 * OpenAPI仕様キャッシュ管理
 */
export class OpenAPICache {
  private cacheDir: string;
  private cacheTTL: number; // キャッシュ有効期限（秒）

  constructor(cacheDir = './cache/openapi', ttl = 3600) {
    this.cacheDir = cacheDir;
    this.cacheTTL = ttl;
    this.ensureCacheDirectory();
  }

  private ensureCacheDirectory(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * OpenAPI仕様をキャッシュ
   */
  cacheSpec(specPath: string, content: string): void {
    const cacheKey = this.getCacheKey(specPath);
    const cacheFile = path.join(this.cacheDir, `${cacheKey}.json`);
    
    const cacheData = {
      specPath,
      content,
      timestamp: Date.now(),
      ttl: this.cacheTTL
    };

    fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
  }

  /**
   * キャッシュされた仕様を取得
   */
  getCachedSpec(specPath: string): string | null {
    const cacheKey = this.getCacheKey(specPath);
    const cacheFile = path.join(this.cacheDir, `${cacheKey}.json`);

    if (!fs.existsSync(cacheFile)) {
      return null;
    }

    try {
      const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
      const age = Date.now() - cacheData.timestamp;
      
      // TTL チェック
      if (age > cacheData.ttl * 1000) {
        fs.unlinkSync(cacheFile); // 期限切れキャッシュを削除
        return null;
      }

      return cacheData.content;
    } catch (error: Error) {
      console.warn(`Failed to read cache for ${specPath}:`, error);
      return null;
    }
  }

  /**
   * キャッシュが有効かチェック
   */
  isCacheValid(specPath: string): boolean {
    return this.getCachedSpec(specPath) !== null;
  }

  private getCacheKey(specPath: string): string {
    return Buffer.from(specPath).toString('base64').replace(/[/+=]/g, '_');
  }

  /**
   * キャッシュ統計
   */
  getCacheStats(): { files: number; totalSize: number; oldestCache: number } {
    const files = fs.readdirSync(this.cacheDir).filter(f => f.endsWith('.json'));
    let totalSize = 0;
    let oldestCache = Date.now();

    files.forEach(file => {
      const filePath = path.join(this.cacheDir, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
      oldestCache = Math.min(oldestCache, stats.mtime.getTime());
    });

    return {
      files: files.length,
      totalSize,
      oldestCache: Date.now() - oldestCache
    };
  }
}

/**
 * MCP統合管理システム
 */
export class MCPManager {
  private config: MCPConfiguration;
  private cache: OpenAPICache;
  private runningServers: Map<string, number> = new Map(); // server name -> PID

  constructor(config: MCPConfiguration) {
    this.config = config;
    this.cache = new OpenAPICache();
  }

  /**
   * 指定されたMCPサーバーを起動
   */
  async startServer(serverName: string): Promise<boolean> {
    const serverConfig = this.config.servers.find(s => s.name === serverName);
    if (!serverConfig) {
      console.error(`Server config not found: ${serverName}`);
      return false;
    }

    try {
      // OpenAPI仕様の存在確認
      if (!fs.existsSync(serverConfig.openApiSpec)) {
        console.error(`OpenAPI spec not found: ${serverConfig.openApiSpec}`);
        return false;
      }

      // キャッシュ戦略に応じた最適化
      if (this.config.cacheStrategy !== 'none') {
        await this.optimizeOpenAPISpec(serverConfig);
      }

      // MCP サーバー起動コマンド実行
      const command = `${serverConfig.command} ${serverConfig.args.join(' ')}`;
      console.log(`Starting MCP server: ${serverName}`);
      console.log(`Command: ${command}`);

      // バックグラウンドで実行
      const child = execSync(`nohup ${command} > logs/mcp-${serverName}.log 2>&1 & echo $!`, {
        encoding: 'utf-8',
        stdio: 'pipe'
      });

      const pid = parseInt(child.trim());
      this.runningServers.set(serverName, pid);

      console.log(`✅ MCP server ${serverName} started with PID: ${pid}`);
      return true;

    } catch (error: Error) {
      console.error(`Failed to start MCP server ${serverName}:`, error);
      return false;
    }
  }

  /**
   * 指定されたMCPサーバーを停止
   */
  async stopServer(serverName: string): Promise<boolean> {
    const pid = this.runningServers.get(serverName);
    if (!pid) {
      console.warn(`Server ${serverName} is not running`);
      return false;
    }

    try {
      execSync(`kill ${pid}`);
      this.runningServers.delete(serverName);
      console.log(`✅ MCP server ${serverName} stopped`);
      return true;
    } catch (error: Error) {
      console.error(`Failed to stop MCP server ${serverName}:`, error);
      return false;
    }
  }

  /**
   * 全MCPサーバーの起動
   */
  async startAllServers(): Promise<{ started: string[]; failed: string[] }> {
    const started: string[] = [];
    const failed: string[] = [];

    for (const server of this.config.servers) {
      const success = await this.startServer(server.name);
      if (success) {
        started.push(server.name);
      } else {
        failed.push(server.name);
      }
    }

    return { started, failed };
  }

  /**
   * 全MCPサーバーの停止
   */
  async stopAllServers(): Promise<{ stopped: string[]; failed: string[] }> {
    const stopped: string[] = [];
    const failed: string[] = [];

    for (const serverName of this.runningServers.keys()) {
      const success = await this.stopServer(serverName);
      if (success) {
        stopped.push(serverName);
      } else {
        failed.push(serverName);
      }
    }

    return { stopped, failed };
  }

  /**
   * MCPサーバーのステータス取得
   */
  getServerStatus(serverName: string): MCPStatus {
    const pid = this.runningServers.get(serverName);
    
    if (!pid) {
      return {
        server: serverName,
        status: 'stopped'
      };
    }

    try {
      // プロセスが実際に動いているかチェック
      execSync(`kill -0 ${pid}`, { stdio: 'ignore' });
      
      return {
        server: serverName,
        status: 'running',
        pid,
        uptime: this.getUptime(pid),
        cacheHits: this.getCacheHits(serverName),
        tokensSaved: this.getTokensSaved(serverName)
      };
    } catch (error: Error) {
      // プロセスが存在しない
      this.runningServers.delete(serverName);
      return {
        server: serverName,
        status: 'error'
      };
    }
  }

  /**
   * 全サーバーのステータス取得
   */
  getAllStatus(): MCPStatus[] {
    return this.config.servers.map(server => this.getServerStatus(server.name));
  }

  private async optimizeOpenAPISpec(serverConfig: MCPServerConfig): Promise<void> {
    const specPath = serverConfig.openApiSpec;
    
    // キャッシュチェック
    if (this.cache.isCacheValid(specPath)) {
      console.log(`📦 Using cached OpenAPI spec: ${specPath}`);
      return;
    }

    try {
      // OpenAPI仕様を読み込み
      const specContent = fs.readFileSync(specPath, 'utf-8');
      
      // aggressive キャッシュ戦略の場合、仕様を最適化
      if (this.config.cacheStrategy === 'aggressive') {
        const optimizedSpec = this.optimizeSpecContent(specContent);
        this.cache.cacheSpec(specPath, optimizedSpec);
        console.log(`🚀 Optimized and cached OpenAPI spec: ${specPath}`);
      } else {
        this.cache.cacheSpec(specPath, specContent);
        console.log(`📦 Cached OpenAPI spec: ${specPath}`);
      }
    } catch (error: Error) {
      console.warn(`Failed to optimize spec ${specPath}:`, error);
    }
  }

  private optimizeSpecContent(specContent: string): string {
    try {
      const spec = JSON.parse(specContent);
      
      // 不要なフィールドを削除してトークン削減
      if (spec.info && spec.info.description) {
        spec.info.description = spec.info.description.substring(0, 100) + '...';
      }
      
      // 例を簡素化
      this.simplifyExamples(spec);
      
      return JSON.stringify(spec, null, 2);
    } catch (error: Error) {
      // JSON パースエラーの場合、YAML の可能性があるのでそのまま返す
      console.warn('Failed to parse spec as JSON, using as-is');
      return specContent;
    }
  }

  private simplifyExamples(obj: any): void {
    if (typeof obj !== 'object' || obj === null) return;
    
    for (const key in obj) {
      if (key === 'example' && typeof obj[key] === 'string' && obj[key].length > 50) {
        obj[key] = obj[key].substring(0, 50) + '...';
      } else if (typeof obj[key] === 'object') {
        this.simplifyExamples(obj[key]);
      }
    }
  }

  private getUptime(pid: number): number {
    try {
      const result = execSync(`ps -o etime= -p ${pid}`, { encoding: 'utf-8' });
      // etimeを秒に変換する簡易実装
      return parseInt(result.trim().replace(/[:-]/g, '')) || 0;
    } catch (error: Error) {
      return 0;
    }
  }

  private getCacheHits(serverName: string): number {
    // 実装例：ログファイルから解析
    try {
      const logFile = `logs/mcp-${serverName}.log`;
      if (fs.existsSync(logFile)) {
        const logs = fs.readFileSync(logFile, 'utf-8');
        const matches = logs.match(/cache hit/gi);
        return matches ? matches.length : 0;
      }
    } catch (error: Error) {
      // ログ読み込みエラーは無視
    }
    return 0;
  }

  private getTokensSaved(serverName: string): number {
    // 実装例：キャッシュ利用による推定削減トークン数
    const cacheHits = this.getCacheHits(serverName);
    return cacheHits * 500; // 1キャッシュヒットあたり500トークン削減と仮定
  }

  /**
   * MCP統合レポート表示
   */
  displayMCPReport(): void {
    console.log('\n🔗 Hotel Common MCP統合レポート');
    console.log('=======================================');
    
    const allStatus = this.getAllStatus();
    const runningCount = allStatus.filter(s => s.status === 'running').length;
    const totalServers = allStatus.length;
    
    console.log(`📊 稼働状況: ${runningCount}/${totalServers} サーバー稼働中`);
    
    allStatus.forEach(status => {
      const statusIcon = status.status === 'running' ? '🟢' : 
                        status.status === 'stopped' ? '🔴' : '🟡';
      console.log(`${statusIcon} ${status.server}: ${status.status}`);
      
      if (status.status === 'running') {
        console.log(`   PID: ${status.pid}, Uptime: ${status.uptime}s`);
        console.log(`   Cache Hits: ${status.cacheHits}, Tokens Saved: ${status.tokensSaved}`);
      }
    });

    // キャッシュ統計
    const cacheStats = this.cache.getCacheStats();
    console.log(`\n📦 キャッシュ統計:`);
    console.log(`   ファイル数: ${cacheStats.files}`);
    console.log(`   合計サイズ: ${Math.round(cacheStats.totalSize / 1024)}KB`);
    console.log(`   最古のキャッシュ: ${Math.round(cacheStats.oldestCache / 60000)}分前`);
    
    console.log('=======================================\n');
  }
}

// テスト実行部分
async function testMCPManager() {
  console.log('🔗 MCP統合管理システムテスト開始');

  // 設定読み込み
  const mcpConfigPath = path.join(process.cwd(), 'mcp-config.json');
  if (!fs.existsSync(mcpConfigPath)) {
    console.error(`MCP config file not found: ${mcpConfigPath}`);
    return;
  }

  const mcpConfigData = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf-8'));
  
  const config: MCPConfiguration = {
    servers: Object.entries(mcpConfigData.mcpServers).map(([name, server]: [string, any]) => ({
      name,
      command: server.command,
      args: server.args,
      openApiSpec: server.args.find((arg: string) => arg.startsWith('--oas='))?.replace('--oas=', '') || '',
      cacheEnabled: true
    })),
    cacheStrategy: 'aggressive',
    tokenOptimization: true
  };

  const manager = new MCPManager(config);

  // 初期ステータス表示
  console.log('\n📊 初期ステータス:');
  manager.displayMCPReport();

  // hotel-common-unified-apiサーバーのテスト起動
  console.log('\n🚀 hotel-common-unified-api サーバー起動テスト:');
  const success = await manager.startServer('hotel-common-unified-api');
  
  if (success) {
    console.log('✅ サーバー起動成功');
    
    // ステータス確認
    setTimeout(() => {
      console.log('\n📊 起動後ステータス:');
      manager.displayMCPReport();
      
      // 停止
      manager.stopServer('hotel-common-unified-api').then(() => {
        console.log('✅ サーバー停止完了');
        console.log('\n🏆 MCP統合管理システムテスト完了');
      });
    }, 2000);
  } else {
    console.log('❌ サーバー起動失敗');
    console.log('🏆 MCP統合管理システムテスト完了');
  }
}

// 実行
if (require.main === module) {
  testMCPManager().catch(console.error);
}