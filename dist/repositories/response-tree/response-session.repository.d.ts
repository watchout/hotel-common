/**
 * レスポンスセッションリポジトリ
 * データベースとのやり取りを担当
 */
export declare class ResponseSessionRepository {
    /**
     * セッションを作成
     */
    createSession(data: {
        deviceId?: number;
        roomId?: string;
        language: string;
        interfaceType: string;
    }): Promise<any>;
    /**
     * セッションを取得
     */
    findSessionById(sessionId: string): Promise<any>;
    /**
     * セッションを更新
     */
    updateSession(sessionId: string, data: {
        currentNodeId?: string;
        lastActivityAt?: Date;
        endedAt?: Date;
    }): Promise<any>;
    /**
     * セッション履歴を追加
     */
    addSessionHistory(data: {
        sessionId: string;
        nodeId: string;
        action: string;
    }): Promise<any>;
    /**
     * セッション履歴を取得
     */
    getSessionHistory(sessionId: string, limit?: number): Promise<any[]>;
    /**
     * セッションを終了
     */
    endSession(sessionId: string): Promise<any>;
}
