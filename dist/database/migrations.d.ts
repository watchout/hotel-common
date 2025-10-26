export interface MigrationInfo {
    version: string;
    description: string;
    rollback_sql?: string;
}
export declare class HotelMigrationManager {
    private logger;
    private db;
    constructor();
    getCurrentVersion(): Promise<string | null>;
    applyMigration(migration: MigrationInfo): Promise<boolean>;
    rollback(version: string): Promise<boolean>;
    getMigrationHistory(): Promise<any>;
    validateIntegrity(): Promise<boolean>;
}
export declare const migrationManager: HotelMigrationManager;
