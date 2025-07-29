export * from '../types/common';
export interface WebSocketEventData {
    type: 'reservation' | 'customer' | 'room' | 'system' | 'auth' | 'notification';
    action: 'create' | 'update' | 'delete' | 'status_change';
    entity_id: string;
    entity_data: any;
    tenant_id: string;
    user_id?: string;
}
export interface WebSocketChannelConfig {
    name: string;
    tenant_id: string;
    permissions: string[];
    auto_join?: boolean;
}
