import type { SessionDto, CreateSessionRequestDto } from '../../dtos/response-tree/response-tree.dto';
/**
 * レスポンスセッションサービス
 * ビジネスロジックを担当
 */
export declare class ResponseSessionService {
    private responseSessionRepository;
    private responseNodeRepository;
    private responseTreeRepository;
    constructor();
    /**
     * セッションを開始
     */
    startSession(data: CreateSessionRequestDto): Promise<any>;
    /**
     * セッションを取得
     */
    getSession(sessionId: string): Promise<SessionDto | null>;
    /**
     * セッションを更新
     */
    updateSession(sessionId: string, currentNodeId: string, action: string): Promise<any>;
    /**
     * セッションを終了
     */
    endSession(sessionId: string): Promise<any>;
}
