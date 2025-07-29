export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
export interface LogEntry {
    timestamp: Date;
    level: LogLevel;
    message: string;
    module?: string;
    tenantId?: string;
    userId?: string;
    requestId?: string;
    data?: any;
    error?: Error;
}
export interface LoggerConfig {
    level: LogLevel;
    enableConsole: boolean;
    enableFile: boolean;
    enableRedis: boolean;
    filePath?: string;
    module?: string;
}
export declare class HotelLogger {
    private config;
    private static instance;
    constructor(config?: Partial<LoggerConfig>);
    /**
     * シングルトンインスタンス取得
     */
    static getInstance(config?: Partial<LoggerConfig>): HotelLogger;
    /**
     * ログ出力
     */
    private log;
    /**
     * コンソール出力
     */
    private logToConsole;
    /**
     * ファイル出力
     */
    private logToFile;
    /**
     * Redis出力
     */
    private logToRedis;
    /**
     * DEBUG レベルログ
     */
    debug(message: string, options?: Partial<LogEntry>): Promise<void>;
    /**
     * INFO レベルログ
     */
    info(message: string, options?: Partial<LogEntry>): Promise<void>;
    /**
     * WARN レベルログ
     */
    warn(message: string, options?: Partial<LogEntry>): Promise<void>;
    /**
     * ERROR レベルログ
     */
    error(message: string, options?: Partial<LogEntry>): Promise<void>;
    /**
     * 認証ログ
     */
    auth(message: string, userId?: string, tenantId?: string, requestId?: string): Promise<void>;
    /**
     * APIログ
     */
    api(message: string, method?: string, url?: string, statusCode?: number, requestId?: string): Promise<void>;
    /**
     * システムイベントログ
     */
    systemEvent(message: string, eventType: string, source: string, target?: string, tenantId?: string): Promise<void>;
}
export declare const logger: HotelLogger;
