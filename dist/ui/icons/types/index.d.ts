/**
 * アイコンモジュールの型定義
 */
/**
 * アイコンセットの種類
 */
export type IconSetType = 'mdi' | 'fa' | 'heroicons' | 'system' | string;
/**
 * アイコンサイズ
 */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
/**
 * アイコンのカラー
 */
export type IconColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'default' | string;
/**
 * アイコンプロパティ
 */
export interface IconProps {
    name: string;
    set?: IconSetType;
    size?: IconSize;
    color?: IconColor;
    className?: string;
    onClick?: () => void;
}
/**
 * システムアイコン定義
 */
export interface SystemIconDefinition {
    name: string;
    icon: string;
    set: IconSetType;
}
/**
 * システム識別子
 */
export type SystemId = 'hotel-saas' | 'hotel-pms' | 'hotel-member' | 'hotel-common';
