/** @req: REQ-API-GEN-001 */
/**
 * 汎用CRUD 一覧取得API
 * SSOT: SSOT_GENERIC_RESOURCES_API.md v1.0.0
 * OpenAPI: generic-resources.yaml operationId: genericList
 *
 * GET /api/v1/admin/resources/{resource}
 * 権限: メタデータで定義（例: system:staff:view）
 *
 * Phase C-1: staff一覧のみ実装
 */
import { Request, Response } from 'express';
export default function handler(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
