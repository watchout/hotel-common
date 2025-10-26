
import pageService from '../../services/pages/page.service';
import { StandardResponseBuilder } from '../../standards/api-standards';
import { HotelLogger } from '../../utils/logger';

import type { Request, Response } from 'express';

const logger = HotelLogger.getInstance();

/**
 * 管理者向けページ管理コントローラー
 */
export class AdminPageController {
  /**
   * すべてのページ取得
   */
  async getAllPages(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenant_id;

      if (!tenantId) {
        const { response, statusCode } = StandardResponseBuilder.authError('テナントIDが必要です');
        return res.status(statusCode).json(response);
      }

      const pages = await pageService.getAllPages(tenantId);

      return StandardResponseBuilder.success(res, pages.map((page: any) => ({
        id: page.Id,
        slug: page.Slug,
        title: page.Title,
        isPublished: page.IsPublished,
        publishedAt: page.PublishedAt,
        version: page.Version,
        updatedAt: page.UpdatedAt
      })));
    } catch (error: Error) {
      logger.error('全ページ取得エラー', { error: error as Error });
      const { response, statusCode } = StandardResponseBuilder.serverError('ページ一覧の取得に失敗しました');
      return res.status(statusCode).json(response);
    }
  }
  /**
   * ページ取得
   */
  async getPage(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const tenantId = req.user?.tenant_id;

      if (!tenantId) {
        const { response, statusCode } = StandardResponseBuilder.authError('テナントIDが必要です');
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

      const page = await pageService.getPageBySlug(tenantId, slug);

      if (!page) {
        const { response, statusCode } = StandardResponseBuilder.notFoundError('ページ');
        return res.status(statusCode).json(response);
      }

      // JSONデータをパースして返す
      const content = page.Content ? JSON.parse(page.Content) : { blocks: [] };

      return StandardResponseBuilder.success(res, {
        id: page.Id,
        title: page.Title,
        html: page.Html,
        css: page.Css,
        content,
        template: page.Template,
        isPublished: page.IsPublished,
        publishedAt: page.PublishedAt,
        version: page.Version
      });
    } catch (error: Error) {
      logger.error('ページ取得エラー', { error: error as Error });
      const { response, statusCode } = StandardResponseBuilder.serverError('サーバーエラー');
      return res.status(statusCode).json(response);
    }
  }

  /**
   * ページ保存
   */
  async savePage(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const tenantId = req.user?.tenant_id;
      const { title, html, css, content, template } = req.body;

      if (!tenantId) {
        const { response, statusCode } = StandardResponseBuilder.authError('テナントIDが必要です');
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

      if (!title) {
        const { response, statusCode } = StandardResponseBuilder.error(
          'INVALID_PARAMS',
          'タイトルが必要です',
          undefined,
          400
        );
        return res.status(statusCode).json(response);
      }

      // contentがオブジェクトの場合はJSON文字列に変換
      const contentString = content ? JSON.stringify(content) : undefined;

      const page = await pageService.savePage(tenantId, slug, {
        Title: title,
        Html: html,
        Css: css,
        Content: contentString,
        Template: template
      });

      return StandardResponseBuilder.success(res, {
        id: page.Id,
        version: page.Version
      });
    } catch (error: Error) {
      logger.error('ページ保存エラー', { error: error as Error });
      const { response, statusCode } = StandardResponseBuilder.serverError('保存に失敗しました');
      return res.status(statusCode).json(response);
    }
  }

  /**
   * ページ公開
   */
  async publishPage(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const tenantId = req.user?.tenant_id;
      const { id } = req.body;

      if (!tenantId) {
        const { response, statusCode } = StandardResponseBuilder.authError('テナントIDが必要です');
        return res.status(statusCode).json(response);
      }

      if (!slug || !id) {
        const { response, statusCode } = StandardResponseBuilder.error(
          'INVALID_PARAMS',
          'スラグとIDが必要です',
          undefined,
          400
        );
        return res.status(statusCode).json(response);
      }

      const page = await pageService.publishPage(tenantId, slug, id);

      return StandardResponseBuilder.success(res, {
        id: page.Id,
        isPublished: page.IsPublished,
        publishedAt: page.PublishedAt
      });
    } catch (error: Error) {
      logger.error('ページ公開エラー', { error: error as Error });
      const { response, statusCode } = StandardResponseBuilder.serverError('公開に失敗しました');
      return res.status(statusCode).json(response);
    }
  }

  /**
   * ページ履歴取得
   */
  async getPageHistory(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const tenantId = req.user?.tenant_id;

      if (!tenantId) {
        const { response, statusCode } = StandardResponseBuilder.authError('テナントIDが必要です');
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

      const history = await pageService.getPageHistory(tenantId, slug);

      return StandardResponseBuilder.success(res, history);
    } catch (error: Error) {
      logger.error('ページ履歴取得エラー', { error: error as Error });
      const { response, statusCode } = StandardResponseBuilder.serverError('履歴の取得に失敗しました');
      return res.status(statusCode).json(response);
    }
  }

  /**
   * 特定バージョンの履歴取得（クエリパラメータ方式）
   */
  async getPageHistoryVersion(req: Request, res: Response) {
    try {
      const { slug, version } = req.query;
      const tenantId = req.user?.tenant_id;

      if (!tenantId) {
        const { response, statusCode } = StandardResponseBuilder.authError('テナントIDが必要です');
        return res.status(statusCode).json(response);
      }

      if (!slug || !version) {
        const { response, statusCode } = StandardResponseBuilder.error(
          'INVALID_PARAMS',
          'スラグとバージョンがクエリパラメータで必要です',
          undefined,
          400
        );
        return res.status(statusCode).json(response);
      }

      const versionNumber = parseInt(version as string, 10);
      if (isNaN(versionNumber)) {
        const { response, statusCode } = StandardResponseBuilder.error(
          'INVALID_PARAMS',
          'バージョンは数値である必要があります',
          undefined,
          400
        );
        return res.status(statusCode).json(response);
      }

      const historyVersion = await pageService.getPageHistoryVersion(tenantId, slug as string, versionNumber);

      // JSONデータをパースして返す
      const content = historyVersion.Content ? JSON.parse(historyVersion.Content) : { blocks: [] };

      return StandardResponseBuilder.success(res, {
        id: historyVersion.Id,
        html: historyVersion.Html,
        css: historyVersion.Css,
        content,
        template: historyVersion.Template,
        version: historyVersion.Version,
        createdAt: historyVersion.CreatedAt,
        createdBy: historyVersion.CreatedBy
      });
    } catch (error: Error) {
      logger.error('ページ履歴バージョン取得エラー', { error: error as Error });
      const { response, statusCode } = StandardResponseBuilder.serverError('指定されたバージョンが見つかりません');
      return res.status(statusCode).json(response);
    }
  }

  /**
   * バージョン復元
   */
  async restorePageVersion(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const tenantId = req.user?.tenant_id;
      const { version } = req.body;

      if (!tenantId) {
        const { response, statusCode } = StandardResponseBuilder.authError('テナントIDが必要です');
        return res.status(statusCode).json(response);
      }

      if (!slug || !version) {
        const { response, statusCode } = StandardResponseBuilder.error(
          'INVALID_PARAMS',
          'スラグとバージョンが必要です',
          undefined,
          400
        );
        return res.status(statusCode).json(response);
      }

      const versionNumber = parseInt(version, 10);
      if (isNaN(versionNumber)) {
        const { response, statusCode } = StandardResponseBuilder.error(
          'INVALID_PARAMS',
          'バージョンは数値である必要があります',
          undefined,
          400
        );
        return res.status(statusCode).json(response);
      }

      const restoredPage = await pageService.restorePageVersion(tenantId, slug, versionNumber);

      return StandardResponseBuilder.success(res, {
        id: restoredPage.Id,
        version: restoredPage.Version
      });
    } catch (error: Error) {
      logger.error('ページバージョン復元エラー', { error: error as Error });
      const { response, statusCode } = StandardResponseBuilder.serverError('バージョンの復元に失敗しました');
      return res.status(statusCode).json(response);
    }
  }
}

export default new AdminPageController();
