/**
 * 🔗 MCP統合管理システム (文献4準拠)
 * Apidog MCP Server統合・OpenAPI仕様キャッシュ
 */
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
export declare class OpenAPICache {
    private cacheDir;
    private cacheTTL;
    constructor(cacheDir?: string, ttl?: number);
    private ensureCacheDirectory;
    /**
     * OpenAPI仕様をキャッシュ
     */
    cacheSpec(specPath: string, content: string): void;
    /**
     * キャッシュされた仕様を取得
     */
    getCachedSpec(specPath: string): string | null;
    /**
     * キャッシュが有効かチェック
     */
    isCacheValid(specPath: string): boolean;
    private getCacheKey;
    /**
     * キャッシュ統計
     */
    getCacheStats(): {
        files: number;
        totalSize: number;
        oldestCache: number;
    };
}
/**
 * MCP統合管理システム
 */
export declare class MCPManager {
    private config;
    private cache;
    private runningServers;
    constructor(config: MCPConfiguration);
    /**
     * 指定されたMCPサーバーを起動
     */
    startServer(serverName: string): Promise<boolean>;
    /**
     * 指定されたMCPサーバーを停止
     */
    stopServer(serverName: string): Promise<boolean>;
    /**
     * 全MCPサーバーの起動
     */
    startAllServers(): Promise<{
        started: string[];
        failed: string[];
    }>;
    /**
     * 全MCPサーバーの停止
     */
    stopAllServers(): Promise<{
        stopped: string[];
        failed: string[];
    }>;
    /**
     * MCPサーバーのステータス取得
     */
    getServerStatus(serverName: string): MCPStatus;
    /**
     * 全サーバーのステータス取得
     */
    getAllStatus(): MCPStatus[];
    private optimizeOpenAPISpec;
    private optimizeSpecContent;
    private simplifyExamples;
    private getUptime;
    private getCacheHits;
    private getTokensSaved;
    /**
     * MCP統合レポート表示
     */
    displayMCPReport(): void;
}
