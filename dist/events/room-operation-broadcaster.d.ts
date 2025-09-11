type RoomOperationPayload = {
    tenant_id: string;
    room_id: string;
    room_number?: string;
    action: string;
    details?: any;
    correlation_id?: string;
};
export declare function broadcastRoomOperation(event: RoomOperationPayload): Promise<void>;
export {};
