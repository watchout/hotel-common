/** @req: REQ-API-GEN-003 */
/**
 * 汎用CRUD 単体取得API
 * SSOT: SSOT_GENERIC_RESOURCES_API.md v1.0.0
 * OpenAPI: generic-resources.yaml operationId: genericGet
 *
 * GET /api/v1/admin/resources/{resource}/{id}
 * 権限: メタデータで定義（例: system:staff:view）
 *
 * Phase C-1: staff取得のみ実装
 */
import { Request, Response } from 'express';
export default function handler(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
