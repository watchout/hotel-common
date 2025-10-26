/** @req: REQ-API-GEN-004 */
/**
 * 汎用CRUD 更新API
 * SSOT: SSOT_GENERIC_RESOURCES_API.md v1.0.0
 * OpenAPI: generic-resources.yaml operationId: genericUpdate
 *
 * PATCH /api/v1/admin/resources/{resource}/{id}
 * 権限: メタデータで定義（例: system:staff:manage）
 *
 * Phase C-1: staff更新のみ実装
 */
import { Request, Response } from 'express';
export default function handler(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
