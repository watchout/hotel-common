import { PrismaClient } from '../generated/prisma';
import { HotelDatabaseClient } from './prisma';

// シングルトンインスタンスをエクスポート
export const hotelDb = HotelDatabaseClient.getInstance();
export const prisma = hotelDb.getAdapter();
