import express from 'express';

import { HotelIntegrationServer } from './integration-server';

// eslint-disable-next-line no-duplicate-imports
// eslint-disable-next-line no-duplicate-imports
// eslint-disable-next-line no-duplicate-imports
import type { Router } from 'express';

/**
 * HotelIntegrationServerクラスを拡張してaddRouterメソッドを追加
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extendHotelIntegrationServer() {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  // プロトタイプにaddRouterメソッドを追加
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HotelIntegrationServer.prototype as any).addRouter = function(
    path: string,
    router: Router
  ): void {
    if (!this.app) {
      console.error('Server app is not initialized');
      return;
    }
    
    this.app.use(path, router);
    console.log(`Router added to path: ${path}`);
  };
}
