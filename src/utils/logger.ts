export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

/**
 * ログエントリーインターフェース
 * 
 * すべてのログデータは以下の標準フィールドを使用します。
 * カスタムデータは必ず `data` オブジェクト内に配置してください。
 * エラーオブジェクトは必ず `error` フィールドに配置してください。
 */
export interface LogEntry {
  // 基本フィールド（必須）
  timestamp: Date
  level: LogLevel
  message: string
  
  // 標準フィールド（オプション）
  module?: string
  tenantId?: string
  userId?: string
  requestId?: string
  
  // 拡張フィールド（オプション）
  data?: any      // すべてのカスタムデータはここに格納
  error?: Error   // エラーオブジェクトはここに格納
  
  // 追加のプロパティを許可（型安全性のため）
  [key: string]: any
}

export interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableFile: boolean
  enableRedis: boolean
  filePath?: string
  module?: string
  name?: string // 後方互換性のため
}

export class HotelLogger {
  private config: LoggerConfig
  private static instance: HotelLogger | null = null

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableFile: false,
      enableRedis: false,
      ...config
    }
    
    // nameパラメータをmoduleにマッピング（後方互換性のため）
    if (config.name && !config.module) {
      this.config.module = config.name;
    }
  }

  /**
   * シングルトンインスタンス取得
   */
  static getInstance(config?: Partial<LoggerConfig>): HotelLogger {
    if (!HotelLogger.instance) {
      HotelLogger.instance = new HotelLogger(config)
    }
    return HotelLogger.instance
  }

  /**
   * ログ出力
   */
  private async log(level: LogLevel, message: string, options: Partial<LogEntry> = {}): Promise<void> {
    if (level < this.config.level) return

    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      module: this.config.module,
      ...options
    }

    // コンソール出力
    if (this.config.enableConsole) {
      this.logToConsole(logEntry)
    }

    // ファイル出力
    if (this.config.enableFile && this.config.filePath) {
      await this.logToFile(logEntry)
    }

    // Redis出力
    if (this.config.enableRedis) {
      await this.logToRedis(logEntry)
    }
  }

  /**
   * コンソール出力
   */
  private logToConsole(entry: LogEntry): void {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR']
    const levelColors = ['\x1b[36m', '\x1b[32m', '\x1b[33m', '\x1b[31m'] // cyan, green, yellow, red
    const resetColor = '\x1b[0m'

    const timestamp = entry.timestamp.toISOString()
    const level = levelNames[entry.level]
    const color = levelColors[entry.level]
    
    let logMessage = `${color}[${timestamp}] ${level}${resetColor}`
    
    if (entry.module) {
      logMessage += ` [${entry.module}]`
    }
    
    if (entry.tenantId) {
      logMessage += ` [tenant:${entry.tenantId}]`
    }
    
    if (entry.requestId) {
      logMessage += ` [req:${entry.requestId}]`
    }
    
    logMessage += `: ${entry.message}`

    if (entry.data) {
      logMessage += `\n  Data: ${JSON.stringify(entry.data, null, 2)}`
    }

    if (entry.error) {
      logMessage += `\n  Error: ${entry.error.message}`
      if (entry.error.stack) {
        logMessage += `\n  Stack: ${entry.error.stack}`
      }
    }

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(logMessage)
        break
      case LogLevel.WARN:
        console.warn(logMessage)
        break
      case LogLevel.INFO:
        console.info(logMessage)
        break
      case LogLevel.DEBUG:
        console.debug(logMessage)
        break
    }
  }

  /**
   * ファイル出力
   */
  private async logToFile(entry: LogEntry): Promise<void> {
    try {
      const fs = require('fs').promises
      const logLine = JSON.stringify(entry) + '\n'
      await fs.appendFile(this.config.filePath, logLine)
    } catch (error) {
      console.error('Failed to write log to file:', error)
    }
  }

  /**
   * Redis出力
   */
  private async logToRedis(entry: LogEntry): Promise<void> {
    try {
      const { getRedisClient } = await import('./redis')
      const redis = getRedisClient()
      await redis.logEvent(entry)
    } catch (error) {
      console.error('Failed to write log to Redis:', error)
    }
  }

  /**
   * DEBUG レベルログ
   */
  debug(message: string, options?: Partial<LogEntry>): Promise<void> {
    return this.log(LogLevel.DEBUG, message, options)
  }

  /**
   * INFO レベルログ
   */
  info(message: string, options?: Partial<LogEntry>): Promise<void> {
    return this.log(LogLevel.INFO, message, options)
  }

  /**
   * WARN レベルログ
   */
  warn(message: string, options?: Partial<LogEntry> | unknown): Promise<void> {
    let normalizedOptions: Partial<LogEntry> = {};
    
    // オプションの正規化
    if (options) {
      if (options instanceof Error) {
        // Error オブジェクトが直接渡された場合
        normalizedOptions = { error: options };
      } else if (typeof options === 'object') {
        // オブジェクトが渡された場合
        normalizedOptions = options as Partial<LogEntry>;
      } else {
        // その他の型の場合はエラーメッセージとして扱う
        normalizedOptions = { data: { message: String(options) } };
      }
    }
    
    return this.log(LogLevel.WARN, message, normalizedOptions);
  }

  /**
   * ERROR レベルログ
   * @param message エラーメッセージ
   * @param options ログオプション。errorフィールドにはErrorオブジェクトを渡してください
   */
  error(message: string, options?: Partial<LogEntry> | unknown): Promise<void> {
    let normalizedOptions: Partial<LogEntry> = {};
    
    // エラーオブジェクトの正規化
    if (options) {
      if (options instanceof Error) {
        // Error オブジェクトが直接渡された場合
        normalizedOptions = { error: options };
      } else if (typeof options === 'object') {
        // オブジェクトが渡された場合
        normalizedOptions = options as Partial<LogEntry>;
        
        // error フィールドの正規化
        if (normalizedOptions.error && !(normalizedOptions.error instanceof Error)) {
          normalizedOptions = {
            ...normalizedOptions,
            error: new Error(String(normalizedOptions.error))
          };
        }
      } else {
        // その他の型の場合はエラーメッセージとして扱う
        normalizedOptions = { error: new Error(String(options)) };
      }
    }
    
    return this.log(LogLevel.ERROR, message, normalizedOptions);
  }

  /**
   * 認証ログ
   */
  auth(message: string, userId?: string, tenantId?: string, requestId?: string): Promise<void> {
    return this.info(message, {
      module: 'AUTH',
      userId,
      tenantId,
      requestId
    })
  }

  /**
   * APIログ
   */
  api(message: string, method?: string, url?: string, statusCode?: number, requestId?: string): Promise<void> {
    return this.info(message, {
      module: 'API',
      requestId,
      data: { method, url, statusCode }
    })
  }

  /**
   * システムイベントログ
   */
  systemEvent(message: string, eventType: string, source: string, target?: string, tenantId?: string): Promise<void> {
    return this.info(message, {
      module: 'SYSTEM_EVENT',
      tenantId,
      data: { eventType, source, target }
    })
  }
}

// デフォルトロガーインスタンス
export const logger = HotelLogger.getInstance({
  module: 'hotel-common'
}) 