/**
 * レスポンスツリー関連のDTO定義
 */
export interface ResponseTreeDto {
    id: string;
    name: string;
    description?: string;
    version: number;
    publishedAt?: Date;
}
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
export interface ResponseNodeSearchResultDto {
    id: string;
    treeId: string;
    type: 'category' | 'question';
    title: string;
    description?: string;
    icon?: string;
    relevance: number;
}
export interface CreateSessionRequestDto {
    deviceId?: number;
    roomId?: string;
    language?: string;
    interfaceType?: 'tv' | 'mobile';
}
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
export interface UpdateSessionRequestDto {
    currentNodeId: string;
    action: 'select_node' | 'back' | 'home';
}
export interface CreateMobileLinkRequestDto {
    sessionId: string;
    deviceId?: number;
    roomId?: string;
}
export interface MobileLinkDto {
    linkId: string;
    linkCode: string;
    qrCodeUrl: string;
    expiresAt: Date;
}
export interface ConnectMobileLinkRequestDto {
    userId?: string;
    deviceInfo?: {
        type: string;
        os: string;
        osVersion: string;
        model: string;
    };
}
export interface CreateTreeRequestDto {
    name: string;
    description?: string;
    tenantId?: string;
    isActive?: boolean;
}
export interface UpdateTreeRequestDto {
    name?: string;
    description?: string;
    isActive?: boolean;
}
export interface PublishTreeRequestDto {
    comment?: string;
}
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
