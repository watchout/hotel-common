import { v4 as uuidv4 } from 'uuid';

import { hotelDb } from '../../database/prisma';
import { HotelLogger } from '../../utils/logger';

const logger = HotelLogger.getInstance();

/**
 * ページ管理サービス
 */
export class PageService {
  /**
   * テナントIDに紐づくすべてのページを取得
   */
  async getAllPages(tenantId: string) {
    try {
      const pages = await hotelDb.getAdapter().page.findMany({
        where: {
          TenantId: tenantId
        },
        orderBy: {
          UpdatedAt: 'desc'
        }
      });
      return pages;
    } catch (error) {
      logger.error('全ページ取得エラー', { error: error as Error, data: { tenantId } });
      throw error;
    }
  }
  /**
   * テナントIDとスラグでページを取得
   */
  async getPageBySlug(tenantId: string, slug: string) {
    try {
      const page = await hotelDb.getAdapter().page.findUnique({
        where: {
          TenantId_Slug: {
            TenantId: tenantId,
            Slug: slug
          }
        }
      });
      return page;
    } catch (error) {
      logger.error('ページ取得エラー', { error: error as Error, data: { tenantId, slug } });
      throw error;
    }
  }

  /**
   * 公開済みページをスラグで取得
   */
  async getPublishedPageBySlug(tenantId: string, slug: string) {
    try {
      // アダプターを使用する
      const page = await hotelDb.getAdapter().page.findFirst({
        where: {
          TenantId: tenantId,
          Slug: slug,
          IsPublished: true
        }
      });
      return page;
    } catch (error) {
      logger.error('公開ページ取得エラー', { error: error as Error, data: { tenantId, slug } });
      throw error;
    }
  }

  /**
   * ページを保存（新規作成または更新）
   */
  async savePage(tenantId: string, slug: string, pageData: {
    Title: string;
    Html?: string;
    Css?: string;
    Content?: string;
    Template?: string;
  }) {
    try {
      // 既存ページを検索
      const existingPage = await hotelDb.getAdapter().page.findUnique({
        where: {
          TenantId_Slug: {
            TenantId: tenantId,
            Slug: slug
          }
        }
      });

      if (existingPage) {
        // 更新の場合
        const updatedPage = await hotelDb.transaction(async (tx) => {
          // 履歴を作成
          await tx.pageHistory.create({
            data: {
              id: uuidv4(),
              PageId: existingPage.Id,
              Html: existingPage.Html,
              Css: existingPage.Css,
              Content: existingPage.Content,
              Template: existingPage.Template,
              Version: existingPage.Version,
              CreatedBy: 'system', // 実際には認証されたユーザーIDを使用
              createdAt: new Date()
            }
          });

          // ページを更新
          return tx.page.update({
            where: {
              Id: existingPage.Id
            },
            data: {
              Title: pageData.Title,
              Html: pageData.Html,
              Css: pageData.Css,
              Content: pageData.Content,
              Template: pageData.Template,
              Version: { increment: 1 },
              UpdatedAt: new Date()
            }
          });
        });

        return updatedPage;
      } else {
        // 新規作成の場合
        const newPage = await hotelDb.getAdapter().page.create({
          data: {
            Id: uuidv4(),
            TenantId: tenantId,
            Slug: slug,
            Title: pageData.Title,
            Html: pageData.Html,
            Css: pageData.Css,
            Content: pageData.Content,
            Template: pageData.Template,
            Version: 1,
            IsPublished: false,
            UpdatedAt: new Date(),
            CreatedAt: new Date()
          }
        });

        return newPage;
      }
    } catch (error) {
      logger.error('ページ保存エラー', { error: error as Error, data: { tenantId, slug } });
      throw error;
    }
  }

  /**
   * ページを公開する
   */
  async publishPage(tenantId: string, slug: string, pageId: string) {
    try {
      const page = await hotelDb.getAdapter().page.findFirst({
        where: {
          Id: pageId,
          TenantId: tenantId,
          Slug: slug
        }
      });

      if (!page) {
        throw new Error('ページが見つかりません');
      }

      const publishedPage = await hotelDb.getAdapter().page.update({
        where: {
          Id: pageId
        },
        data: {
          IsPublished: true,
          PublishedAt: new Date(),
          UpdatedAt: new Date()
        }
      });

      return publishedPage;
    } catch (error) {
      logger.error('ページ公開エラー', { error: error as Error, data: { tenantId, slug, pageId } });
      throw error;
    }
  }

  /**
   * ページの履歴一覧を取得
   */
  async getPageHistory(tenantId: string, slug: string) {
    try {
      const page = await hotelDb.getAdapter().page.findUnique({
        where: {
          TenantId_Slug: {
            TenantId: tenantId,
            Slug: slug
          }
        },
        select: {
          Id: true,
          Version: true,
          UpdatedAt: true
        }
      });

      if (!page) {
        throw new Error('ページが見つかりません');
      }

      const history = await hotelDb.getAdapter().pageHistory.findMany({
        where: {
          PageId: page.Id
        },
        orderBy: {
          Version: 'desc'
        },
        select: {
          Id: true,
          Version: true,
          CreatedAt: true,
          CreatedBy: true
        }
      });

      return {
        current: page,
        history
      };
    } catch (error) {
      logger.error('ページ履歴取得エラー', { error: error as Error, data: { tenantId, slug } });
      throw error;
    }
  }

  /**
   * 特定バージョンの履歴を取得
   */
  async getPageHistoryVersion(tenantId: string, slug: string, version: number) {
    try {
      const page = await hotelDb.getAdapter().page.findUnique({
        where: {
          TenantId_Slug: {
            TenantId: tenantId,
            Slug: slug
          }
        }
      });

      if (!page) {
        throw new Error('ページが見つかりません');
      }

      const historyVersion = await hotelDb.getAdapter().pageHistory.findFirst({
        where: {
          PageId: page.Id,
          Version: version
        }
      });

      if (!historyVersion) {
        throw new Error('指定されたバージョンが見つかりません');
      }

      return historyVersion;
    } catch (error) {
      logger.error('ページ履歴バージョン取得エラー', { error: error as Error, data: { tenantId, slug, version } });
      throw error;
    }
  }

  /**
   * 過去のバージョンを復元
   */
  async restorePageVersion(tenantId: string, slug: string, version: number) {
    try {
      return await hotelDb.transaction(async (tx) => {
        // 現在のページを取得
        const page = await tx.pages.findUnique({
          where: {
            TenantId_Slug: {
              TenantId: tenantId,
              Slug: slug
            }
          }
        });

        if (!page) {
          throw new Error('ページが見つかりません');
        }

        // 復元するバージョンを取得
        const historyVersion = await tx.page_histories.findFirst({
          where: {
            PageId: page.Id,
            Version: version
          }
        });

        if (!historyVersion) {
          throw new Error('指定されたバージョンが見つかりません');
        }

        // 現在のバージョンを履歴に保存
        await tx.page_histories.create({
          data: {
            id: uuidv4(),
            PageId: page.Id,
            Html: page.Html,
            Css: page.Css,
            Content: page.Content,
            Template: page.Template,
            Version: page.Version,
            CreatedBy: 'system', // 実際には認証されたユーザーIDを使用
            createdAt: new Date()
          }
        });

        // 過去のバージョンを現在のページに復元
        const restoredPage = await tx.pages.update({
          where: {
            Id: page.Id
          },
          data: {
            Html: historyVersion.Html,
            Css: historyVersion.Css,
            Content: historyVersion.Content,
            Template: historyVersion.Template,
            Version: { increment: 1 },
            UpdatedAt: new Date()
          }
        });

        return restoredPage;
      });
    } catch (error) {
      logger.error('ページバージョン復元エラー', { error: error as Error, data: { tenantId, slug, version } });
      throw error;
    }
  }
}

export default new PageService();