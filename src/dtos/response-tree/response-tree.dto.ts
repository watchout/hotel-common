/**
 * レスポンスツリー関連のDTO定義
 */

// レスポンスツリー基本情報DTO
export interface ResponseTreeDto {
  id: string;
  name: string;
  description?: string;
  version: number;
  publishedAt?: Date;
}

// レスポンスノード基本情報DTO
export interface ResponseNodeDto {
  id: string;
  treeId: string;
  type: 'category' | 'question';
  title: string;
  description?: string;
  icon?: string;
  order: number;
  parentId?: string;
  isRoot: boolean;
}

// レスポンスノード詳細情報DTO
export interface ResponseNodeDetailDto extends ResponseNodeDto {
  answer?: {
    text: string;
    media?: Array<{
      type: 'image' | 'video' | 'audio';
      url: string;
      caption?: string;
    }>;
    relatedQuestions?: Array<{
      nodeId: string;
      title: string;
    }>;
  };
  children?: ResponseNodeDto[];
}

// ノード検索結果DTO
export interface ResponseNodeSearchResultDto {
  id: string;
  treeId: string;
  type: 'category' | 'question';
  title: string;
  description?: string;
  icon?: string;
  relevance: number;
}

// セッション作成リクエストDTO
export interface CreateSessionRequestDto {
  deviceId?: number;
  roomId?: string;
  language?: string;
  interfaceType?: 'tv' | 'mobile';
}

// セッション情報DTO
export interface SessionDto {
  sessionId: string;
  startedAt: Date;
  lastActivityAt: Date;
  endedAt?: Date;
  language: string;
  interfaceType: 'tv' | 'mobile';
  currentNodeId?: string;
  history?: Array<{
    nodeId: string;
    title: string;
    timestamp: Date;
  }>;
}

// セッション更新リクエストDTO
export interface UpdateSessionRequestDto {
  currentNodeId: string;
  action: 'select_node' | 'back' | 'home';
}

// モバイル連携リクエストDTO
export interface CreateMobileLinkRequestDto {
  sessionId: string;
  deviceId?: number;
  roomId?: string;
}

// モバイル連携情報DTO
export interface MobileLinkDto {
  linkId: string;
  linkCode: string;
  qrCodeUrl: string;
  expiresAt: Date;
}

// モバイル連携実行リクエストDTO
export interface ConnectMobileLinkRequestDto {
  userId?: string;
  deviceInfo?: {
    type: string;
    os: string;
    osVersion: string;
    model: string;
  };
}

// レスポンスツリー作成リクエストDTO
export interface CreateTreeRequestDto {
  name: string;
  description?: string;
  tenantId?: string;
  isActive?: boolean;
}

// レスポンスツリー更新リクエストDTO
export interface UpdateTreeRequestDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

// レスポンスツリー公開リクエストDTO
export interface PublishTreeRequestDto {
  comment?: string;
}

// ノード作成リクエストDTO
export interface CreateNodeRequestDto {
  type: 'category' | 'question';
  title: string;
  description?: string;
  icon?: string;
  parentId?: string;
  order?: number;
  isRoot?: boolean;
  answer?: {
    text: string;
    media?: Array<{
      type: 'image' | 'video' | 'audio';
      url: string;
      caption?: string;
    }>;
  };
  translations?: Array<{
    language: string;
    title: string;
    answer?: {
      text: string;
    };
  }>;
}