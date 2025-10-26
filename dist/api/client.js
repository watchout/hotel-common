"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelApiClientFactory = exports.HotelApiClient = void 0;
const crypto_1 = __importDefault(require("crypto"));
const axios_1 = __importDefault(require("axios"));
const api_1 = require("../types/api");
// import { JwtManager } from '../auth/jwt'
class HotelApiClient {
    client;
    config;
    constructor(config) {
        this.config = config;
        this.client = axios_1.default.create({
            baseURL: config.baseURL,
            timeout: config.timeout || 30000,
            headers: {
                'Content-Type': 'application/json',
                ...config.defaultHeaders
            }
        });
        this.setupInterceptors();
    }
    /**
     * インターセプター設定
     */
    setupInterceptors() {
        // リクエストインターセプター
        this.client.interceptors.request.use((config) => {
            // リクエストIDを追加
            config.headers['x-request-id'] = crypto_1.default.randomUUID();
            // テナントID追加
            if (this.config.tenantId) {
                config.headers['x-tenant-id'] = this.config.tenantId;
            }
            // API Key追加
            if (this.config.apiKey) {
                config.headers['x-api-key'] = this.config.apiKey;
            }
            return config;
        }, (error) => Promise.reject(error));
        // レスポンスインターセプター
        this.client.interceptors.response.use((response) => response, (error) => {
            const apiError = {
                code: this.mapHttpStatusToErrorCode(error.response?.status),
                message: error.response?.data?.message || error.message,
                details: error.response?.data
            };
            return Promise.reject(apiError);
        });
    }
    /**
     * HTTPステータスコードをエラーコードにマッピング
     */
    mapHttpStatusToErrorCode(status) {
        switch (status) {
            case 401: return api_1.ERROR_CODES.E001; // UNAUTHORIZED
            case 403: return api_1.ERROR_CODES.E002; // FORBIDDEN
            case 400: return api_1.ERROR_CODES.B001; // VALIDATION_ERROR
            case 409: return api_1.ERROR_CODES.B003; // RESOURCE_CONFLICT
            case 500: return api_1.ERROR_CODES.S001; // INTERNAL_SERVER_ERROR
            case 503: return api_1.ERROR_CODES.S002; // SERVICE_UNAVAILABLE
            default: return api_1.ERROR_CODES.S001; // INTERNAL_SERVER_ERROR
        }
    }
    /**
     * 認証トークンを設定
     */
    setAuthToken(token) {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    /**
     * 認証トークンを削除
     */
    removeAuthToken() {
        delete this.client.defaults.headers.common['Authorization'];
    }
    /**
     * 汎用リクエストメソッド
     */
    async request(config) {
        try {
            const axiosConfig = {
                url: config.url,
                method: config.method.toLowerCase(),
                data: config.data,
                params: config.params,
                headers: config.headers,
                timeout: config.timeout
            };
            const response = await this.client.request(axiosConfig);
            return {
                success: true,
                data: response.data,
                timestamp: new Date(),
                request_id: response.headers['x-request-id'] || crypto_1.default.randomUUID()
            };
        }
        catch (error) {
            return {
                success: false,
                error: error,
                timestamp: new Date(),
                request_id: crypto_1.default.randomUUID()
            };
        }
    }
    /**
     * GET リクエスト
     */
    async get(url, params) {
        return this.request({
            url,
            method: 'GET',
            params
        });
    }
    /**
     * POST リクエスト
     */
    async post(url, data) {
        return this.request({
            url,
            method: 'POST',
            data
        });
    }
    /**
     * PUT リクエスト
     */
    async put(url, data) {
        return this.request({
            url,
            method: 'PUT',
            data
        });
    }
    /**
     * DELETE リクエスト
     */
    async delete(url) {
        return this.request({
            url,
            method: 'DELETE'
        });
    }
    /**
     * PATCH リクエスト
     */
    async patch(url, data) {
        return this.request({
            url,
            method: 'PATCH',
            data
        });
    }
}
exports.HotelApiClient = HotelApiClient;
/**
 * システム別APIクライアントファクトリー
 */
class HotelApiClientFactory {
    /**
     * hotel-saas用クライアント作成
     * 認証はhotel-commonを経由
     */
    static createSaasClient(config) {
        return new HotelApiClient({
            baseURL: 'http://localhost:3400/api',
            ...config
        });
    }
    /**
     * hotel-member用クライアント作成
     */
    static createMemberClient(config) {
        return new HotelApiClient({
            baseURL: 'http://localhost:3200/api',
            ...config
        });
    }
    /**
     * hotel-pms用クライアント作成
     */
    static createPmsClient(config) {
        return new HotelApiClient({
            baseURL: 'http://localhost:3300/api',
            ...config
        });
    }
}
exports.HotelApiClientFactory = HotelApiClientFactory;
