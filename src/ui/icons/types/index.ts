/**
 * アイコンモジュールの型定義
 */

/**
 * アイコンセットの種類
 */
export type IconSetType = 
  | 'mdi'       // Material Design Icons
  | 'fa'        // Font Awesome
  | 'heroicons' // Heroicons
  | 'system'    // システム固有アイコン
  | string;     // その他のアイコンセット

/**
 * アイコンサイズ
 */
export type IconSize = 
  | 'xs'    // 12px
  | 'sm'    // 16px
  | 'md'    // 24px
  | 'lg'    // 32px
  | 'xl'    // 48px
  | '2xl'   // 64px
  | number; // カスタムサイズ（px）

/**
 * アイコンのカラー
 */
export type IconColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'default'
  | string; // カスタムカラー（CSS color値）

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