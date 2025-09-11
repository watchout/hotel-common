/**
 * システムアイコン定義
 *
 * 各システム（hotel-saas, hotel-pms, hotel-member, hotel-common）で
 * 使用する統一アイコンの定義
 */
import { SystemIconDefinition, SystemId } from '../types';
/**
 * システムアイコン定義
 */
export declare const SYSTEM_ICONS: Record<SystemId, SystemIconDefinition>;
/**
 * 共通機能アイコン定義
 */
export declare const FEATURE_ICONS: {
    reservation: {
        icon: string;
        set: string;
    };
    checkin: {
        icon: string;
        set: string;
    };
    checkout: {
        icon: string;
        set: string;
    };
    customer: {
        icon: string;
        set: string;
    };
    group: {
        icon: string;
        set: string;
    };
    room: {
        icon: string;
        set: string;
    };
    roomType: {
        icon: string;
        set: string;
    };
    settings: {
        icon: string;
        set: string;
    };
    admin: {
        icon: string;
        set: string;
    };
    notification: {
        icon: string;
        set: string;
    };
    search: {
        icon: string;
        set: string;
    };
    help: {
        icon: string;
        set: string;
    };
};
