import crypto from 'crypto';

import axios from 'axios';


import { ERROR_CODES } from '../types/api';

// eslint-disable-next-line no-duplicate-imports
// eslint-disable-next-line no-duplicate-imports
// eslint-disable-next-line no-duplicate-imports
import type { ApiClientConfig, RequestConfig } from '../types/api';
// eslint-disable-next-line no-duplicate-imports
import type { ApiError, ApiResponse } from '../types/common';
// eslint-disable-next-line no-duplicate-imports
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// import { JwtManager } from '../auth/jwt'

export class HotelApiClient {
  private client: AxiosInstance
  private config: ApiClientConfig

  constructor(config: ApiClientConfig) {
    this.config = config
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.defaultHeaders
      }
    })

    this.setupInterceptors()
  }

  /**
   * インターセプター設定
   */
  private setupInterceptors(): void {
    // リクエストインターセプター
    this.client.interceptors.request.use(
      (config) => {
        // リクエストIDを追加
        config.headers['x-request-id'] = crypto.randomUUID()

        // テナントID追加
        if (this.config.tenantId) {
          config.headers['x-tenant-id'] = this.config.tenantId
        }

        // API Key追加
        if (this.config.apiKey) {
          config.headers['x-api-key'] = this.config.apiKey
        }

        return config
      },
      (error) => Promise.reject(error)
    )

    // レスポンスインターセプター
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const apiError: ApiError = {
          code: this.mapHttpStatusToErrorCode(error.response?.status),
          message: error.response?.data?.message || error.message,
          details: error.response?.data
        }

        return Promise.reject(apiError)
      }
    )
  }

  /**
   * HTTPステータスコードをエラーコードにマッピング
   */
  private mapHttpStatusToErrorCode(status?: number): string {
    switch (status) {
      case 401: return ERROR_CODES.E001 // UNAUTHORIZED
      case 403: return ERROR_CODES.E002 // FORBIDDEN
      case 400: return ERROR_CODES.B001 // VALIDATION_ERROR
      case 409: return ERROR_CODES.B003 // RESOURCE_CONFLICT
      case 500: return ERROR_CODES.S001 // INTERNAL_SERVER_ERROR
      case 503: return ERROR_CODES.S002 // SERVICE_UNAVAILABLE
      default: return ERROR_CODES.S001 // INTERNAL_SERVER_ERROR
    }
  }

  /**
   * 認証トークンを設定
   */
  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  /**
   * 認証トークンを削除
   */
  removeAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization']
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  /**
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   * 汎用リクエストメソッド
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    try {
      const axiosConfig: AxiosRequestConfig = {
        url: config.url,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        method: config.method.toLowerCase() as any,
        data: config.data,
        params: config.params,
        headers: config.headers,
        timeout: config.timeout
      }

      // eslint-disable-next-line @typescript-eslint/no-implicit-any-catch, @typescript-eslint/no-explicit-any
      const response: AxiosResponse = await this.client.request(axiosConfig)

      return {
        success: true,
        // eslint-disable-next-line @typescript-eslint/no-implicit-any-catch, @typescript-eslint/no-explicit-any
        data: response.data,
        timestamp: new Date(),
        request_id: response.headers['x-request-id'] || crypto.randomUUID()
      }
      // eslint-disable-next-line @typescript-eslint/no-implicit-any-catch
    } catch (error: unknown) {
      return {
        success: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: error as ApiError,
        timestamp: new Date(),
        request_id: crypto.randomUUID()
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }

  /**
   * GET リクエスト
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async get<T = any>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'GET',
      params
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })
  }

  /**
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   * POST リクエスト
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'POST',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data
    })
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  /**
   * PUT リクエスト
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      method: 'PUT',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data
    })
  }

  /**
   * DELETE リクエスト
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.request<T>({
      url,
      method: 'DELETE'
    })
  }

  /**
   * PATCH リクエスト
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'PATCH',
      data
    })
  }
}

/**
 * システム別APIクライアントファクトリー
 */
export class HotelApiClientFactory {
  /**
   * hotel-saas用クライアント作成
   * 認証はhotel-commonを経由
   */
  static createSaasClient(config?: Partial<ApiClientConfig>): HotelApiClient {
    return new HotelApiClient({
      baseURL: 'http://localhost:3400/api',
      ...config
    })
  }

  /**
   * hotel-member用クライアント作成
   */
  static createMemberClient(config?: Partial<ApiClientConfig>): HotelApiClient {
    return new HotelApiClient({
      baseURL: 'http://localhost:3200/api',
      ...config
    })
  }

  /**
   * hotel-pms用クライアント作成
   */
  static createPmsClient(config?: Partial<ApiClientConfig>): HotelApiClient {
    return new HotelApiClient({
      baseURL: 'http://localhost:3300/api',
      ...config
    })
  }
}
