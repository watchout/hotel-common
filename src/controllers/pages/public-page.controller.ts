import { Request, Response } from 'express';
import { StandardResponseBuilder } from '../../standards/api-standards';
import pageService from '../../services/pages/page.service';
import { HotelLogger } from '../../utils/logger';

const logger = HotelLogger.getInstance();

/**
 * 公開向けページコントローラー
 */
export class PublicPageController {
  /**
   * 公開ページ取得
   */
  async getPublicPage(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      
      // テナントIDはヘッダーから取得
      const tenantId = req.headers['x-tenant-id'] as string;

      if (!tenantId) {
        const { response, statusCode } = StandardResponseBuilder.error(
          'INVALID_TENANT',
          'テナントIDが必要です',
          undefined,
          400
        );
        return res.status(statusCode).json(response);
      }

      if (!slug) {
        const { response, statusCode } = StandardResponseBuilder.error(
          'INVALID_PARAMS',
          'スラグが必要です',
          undefined,
          400
        );
        return res.status(statusCode).json(response);
      }

      // ページデータの取得を試みる
      let page;
      try {
        page = await pageService.getPublishedPageBySlug(tenantId, slug);
      } catch (fetchError) {
        logger.error('公開ページ取得中にエラーが発生しました', { error: fetchError as Error, tenantId, slug });
        const { response, statusCode } = StandardResponseBuilder.serverError('ページデータの取得に失敗しました');
        return res.status(statusCode).json(response);
      }

      if (!page) {
        const { response, statusCode } = StandardResponseBuilder.notFoundError('ページ');
        return res.status(statusCode).json(response);
      }

      // JSONデータをパースして返す
      const content = page.Content ? JSON.parse(page.Content) : { blocks: [] };

      return StandardResponseBuilder.success(res, {
        html: page.Html,
        css: page.Css,
        content,
        template: page.Template
      });
    } catch (error) {
      logger.error('公開ページ取得エラー', { error: error as Error });
      const { response, statusCode } = StandardResponseBuilder.serverError('サーバーエラー');
      return res.status(statusCode).json(response);
    }
  }
}

export default new PublicPageController();
