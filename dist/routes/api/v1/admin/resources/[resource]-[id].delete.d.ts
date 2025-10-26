/** @req: REQ-API-GEN-005 */
/**
 * 汎用CRUD 削除API（論理削除）
 * SSOT: SSOT_GENERIC_RESOURCES_API.md v1.0.0
 * OpenAPI: generic-resources.yaml operationId: genericDelete
 *
 * DELETE /api/v1/admin/resources/{resource}/{id}
 * 権限: メタデータで定義（例: system:staff:manage）
 *
 * Phase C-1: staff削除のみ実装（論理削除）
 */
import { Request, Response } from 'express';
export default function handler(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
