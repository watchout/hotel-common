import { PrismaClient } from '@prisma/client';

import { HotelDatabaseClient } from './prisma';

// シングルトンインスタンスをエクスポート
export const hotelDb = HotelDatabaseClient.getInstance();
export const prisma = hotelDb.getAdapter();
