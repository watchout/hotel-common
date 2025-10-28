/** @req: REQ-API-GEN-002 */
/**
 * 汎用CRUD 作成API
 * SSOT: SSOT_GENERIC_RESOURCES_API.md v1.0.0
 * OpenAPI: generic-resources.yaml operationId: genericCreate
 *
 * POST /api/v1/admin/resources/{resource}
 * 権限: メタデータで定義（例: system:staff:manage）
 *
 * Phase C-1: staff作成のみ実装
 */
import type { Request, Response } from 'express';
export default function handler(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
