import express from 'express';

import { HotelIntegrationServer } from './integration-server';

import type { Router } from 'express';

/**
 * HotelIntegrationServerクラスを拡張してaddRouterメソッドを追加
 */
export function extendHotelIntegrationServer() {
  // プロトタイプにaddRouterメソッドを追加
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
