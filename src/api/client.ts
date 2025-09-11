import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiClientConfig, RequestConfig, HttpMethod, ERROR_CODES } from '../types/api'
import { ApiResponse, ApiError } from '../types/common'
// import { JwtManager } from '../auth/jwt'
import crypto from 'crypto'

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

  /**
   * 汎用リクエストメソッド
   */
  async request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const axiosConfig: AxiosRequestConfig = {
        url: config.url,
        method: config.method.toLowerCase() as any,
        data: config.data,
        params: config.params,
        headers: config.headers,
        timeout: config.timeout
      }

      const response: AxiosResponse = await this.client.request(axiosConfig)
      
      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
        request_id: response.headers['x-request-id'] || crypto.randomUUID()
      }
    } catch (error: any) {
      return {
        success: false,
        error: error as ApiError,
        timestamp: new Date(),
        request_id: crypto.randomUUID()
      }
    }
  }

  /**
   * GET リクエスト
   */
  async get<T = any>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'GET',
      params
    })
  }

  /**
   * POST リクエスト
   */
  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'POST',
      data
    })
  }

  /**
   * PUT リクエスト
   */
  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'PUT',
      data
    })
  }

  /**
   * DELETE リクエスト
   */
  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'DELETE'
    })
  }

  /**
   * PATCH リクエスト
   */
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
   */
  static createSaasClient(config?: Partial<ApiClientConfig>): HotelApiClient {
    return new HotelApiClient({
      baseURL: 'http://localhost:3100/api',
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