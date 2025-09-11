"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEATURE_ICONS = exports.SYSTEM_ICONS = void 0;
/**
 * システムアイコン定義
 */
exports.SYSTEM_ICONS = {
    'hotel-saas': {
        name: 'hotel-saas',
        icon: 'sun',
        set: 'heroicons'
    },
    'hotel-pms': {
        name: 'hotel-pms',
        icon: 'moon',
        set: 'heroicons'
    },
    'hotel-member': {
        name: 'hotel-member',
        icon: 'user-group',
        set: 'heroicons'
    },
    'hotel-common': {
        name: 'hotel-common',
        icon: 'cog',
        set: 'heroicons'
    }
};
/**
 * 共通機能アイコン定義
 */
exports.FEATURE_ICONS = {
    // 予約関連
    reservation: {
        icon: 'calendar',
        set: 'mdi'
    },
    checkin: {
        icon: 'login',
        set: 'mdi'
    },
    checkout: {
        icon: 'logout',
        set: 'mdi'
    },
    // 顧客関連
    customer: {
        icon: 'account',
        set: 'mdi'
    },
    group: {
        icon: 'account-group',
        set: 'mdi'
    },
    // 部屋関連
    room: {
        icon: 'bed',
        set: 'mdi'
    },
    roomType: {
        icon: 'home-variant',
        set: 'mdi'
    },
    // 設定関連
    settings: {
        icon: 'cog',
        set: 'mdi'
    },
    admin: {
        icon: 'shield-account',
        set: 'mdi'
    },
    // その他
    notification: {
        icon: 'bell',
        set: 'mdi'
    },
    search: {
        icon: 'magnify',
        set: 'mdi'
    },
    help: {
        icon: 'help-circle',
        set: 'mdi'
    }
};
