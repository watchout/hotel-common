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
exports.logger = exports.HotelLogger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class HotelLogger {
    config;
    static instance = null;
    constructor(config = {}) {
        this.config = {
            level: LogLevel.INFO,
            enableConsole: true,
            enableFile: false,
            enableRedis: false,
            ...config
        };
        // nameパラメータをmoduleにマッピング（後方互換性のため）
        if (config.name && !config.module) {
            this.config.module = config.name;
        }
    }
    /**
     * シングルトンインスタンス取得
     */
    static getInstance(config) {
        if (!HotelLogger.instance) {
            HotelLogger.instance = new HotelLogger(config);
        }
        return HotelLogger.instance;
    }
    /**
     * ログ出力
     */
    async log(level, message, options = {}) {
        if (level < this.config.level)
            return;
        const logEntry = {
            timestamp: new Date(),
            level,
            message,
            module: this.config.module,
            ...options
        };
        // コンソール出力
        if (this.config.enableConsole) {
            this.logToConsole(logEntry);
        }
        // ファイル出力
        if (this.config.enableFile && this.config.filePath) {
            await this.logToFile(logEntry);
        }
        // Redis出力
        if (this.config.enableRedis) {
            await this.logToRedis(logEntry);
        }
    }
    /**
     * コンソール出力
     */
    logToConsole(entry) {
        const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
        const levelColors = ['\x1b[36m', '\x1b[32m', '\x1b[33m', '\x1b[31m']; // cyan, green, yellow, red
        const resetColor = '\x1b[0m';
        const timestamp = entry.timestamp.toISOString();
        const level = levelNames[entry.level];
        const color = levelColors[entry.level];
        let logMessage = `${color}[${timestamp}] ${level}${resetColor}`;
        if (entry.module) {
            logMessage += ` [${entry.module}]`;
        }
        if (entry.tenantId) {
            logMessage += ` [tenant:${entry.tenantId}]`;
        }
        if (entry.requestId) {
            logMessage += ` [req:${entry.requestId}]`;
        }
        logMessage += `: ${entry.message}`;
        if (entry.data) {
            logMessage += `\n  Data: ${JSON.stringify(entry.data, null, 2)}`;
        }
        if (entry.error) {
            logMessage += `\n  Error: ${entry.error.message}`;
            if (entry.error.stack) {
                logMessage += `\n  Stack: ${entry.error.stack}`;
            }
        }
        switch (entry.level) {
            case LogLevel.ERROR:
                console.error(logMessage);
                break;
            case LogLevel.WARN:
                console.warn(logMessage);
                break;
            case LogLevel.INFO:
                console.info(logMessage);
                break;
            case LogLevel.DEBUG:
                console.debug(logMessage);
                break;
        }
    }
    /**
     * ファイル出力
     */
    async logToFile(entry) {
        try {
            const fs = require('fs').promises;
            const logLine = JSON.stringify(entry) + '\n';
            await fs.appendFile(this.config.filePath, logLine);
        }
        catch (error) {
            console.error('Failed to write log to file:', error);
        }
    }
    /**
     * Redis出力
     */
    async logToRedis(entry) {
        try {
            const { getRedisClient } = await Promise.resolve().then(() => __importStar(require('./redis')));
            const redis = getRedisClient();
            await redis.logEvent(entry);
        }
        catch (error) {
            console.error('Failed to write log to Redis:', error);
        }
    }
    /**
     * DEBUG レベルログ
     */
    debug(message, options) {
        return this.log(LogLevel.DEBUG, message, options);
    }
    /**
     * INFO レベルログ
     */
    info(message, options) {
        return this.log(LogLevel.INFO, message, options);
    }
    /**
     * WARN レベルログ
     */
    warn(message, options) {
        let normalizedOptions = {};
        // オプションの正規化
        if (options) {
            if (options instanceof Error) {
                // Error オブジェクトが直接渡された場合
                normalizedOptions = { error: options };
            }
            else if (typeof options === 'object') {
                // オブジェクトが渡された場合
                normalizedOptions = options;
            }
            else {
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
    error(message, options) {
        let normalizedOptions = {};
        // エラーオブジェクトの正規化
        if (options) {
            if (options instanceof Error) {
                // Error オブジェクトが直接渡された場合
                normalizedOptions = { error: options };
            }
            else if (typeof options === 'object') {
                // オブジェクトが渡された場合
                normalizedOptions = options;
                // error フィールドの正規化
                if (normalizedOptions.error && !(normalizedOptions.error instanceof Error)) {
                    normalizedOptions = {
                        ...normalizedOptions,
                        error: new Error(String(normalizedOptions.error))
                    };
                }
            }
            else {
                // その他の型の場合はエラーメッセージとして扱う
                normalizedOptions = { error: new Error(String(options)) };
            }
        }
        return this.log(LogLevel.ERROR, message, normalizedOptions);
    }
    /**
     * 認証ログ
     */
    auth(message, userId, tenantId, requestId) {
        return this.info(message, {
            module: 'AUTH',
            userId,
            tenantId,
            requestId
        });
    }
    /**
     * APIログ
     */
    api(message, method, url, statusCode, requestId) {
        return this.info(message, {
            module: 'API',
            requestId,
            data: { method, url, statusCode }
        });
    }
    /**
     * システムイベントログ
     */
    systemEvent(message, eventType, source, target, tenantId) {
        return this.info(message, {
            module: 'SYSTEM_EVENT',
            tenantId,
            data: { eventType, source, target }
        });
    }
}
exports.HotelLogger = HotelLogger;
// デフォルトロガーインスタンス
exports.logger = HotelLogger.getInstance({
    module: 'hotel-common'
});
