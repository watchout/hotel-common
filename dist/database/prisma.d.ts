import { PrismaClient } from '../generated/prisma';
export declare class HotelDatabaseClient {
    private static instance;
    private prisma;
    private logger;
    private constructor();
    static getInstance(): HotelDatabaseClient;
    getClient(): PrismaClient;
    get schemaVersion(): import("../generated/prisma").Prisma.SchemaVersionDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get systemEvent(): import("../generated/prisma").Prisma.SystemEventDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get admin(): import("../generated/prisma").Prisma.AdminDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get adminLog(): import("../generated/prisma").Prisma.AdminLogDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get tenant(): import("../generated/prisma").Prisma.TenantDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get staff(): import("../generated/prisma").Prisma.StaffDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get customers(): import("../generated/prisma").Prisma.customersDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get reservation(): import("../generated/prisma").Prisma.ReservationDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get room(): import("../generated/prisma").Prisma.RoomDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get roomGrade(): import("../generated/prisma").Prisma.RoomGradeDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get roomGradeMedia(): import("../generated/prisma").Prisma.RoomGradeMediaDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get memberGradeAccess(): import("../generated/prisma").Prisma.MemberGradeAccessDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get attendance(): import("../generated/prisma").Prisma.AttendanceDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get workSchedule(): import("../generated/prisma").Prisma.WorkScheduleDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get handoverNote(): import("../generated/prisma").Prisma.HandoverNoteDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get staffNotification(): import("../generated/prisma").Prisma.StaffNotificationDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get auditLog(): import("../generated/prisma").Prisma.AuditLogDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    transaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    healthCheck(): Promise<boolean>;
    getDatabaseStats(): Promise<{
        name: string;
        size?: string;
        tables: number;
        connected: boolean;
    }>;
}
export declare const hotelDb: HotelDatabaseClient;
