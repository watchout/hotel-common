/**
 * アイコンセット定義
 * 
 * Iconifyで利用可能な主要アイコンセットの定義
 * 詳細: https://icon-sets.iconify.design/
 */

import { IconSetType } from '../types';

/**
 * アイコンセット設定
 */
export const ICON_SETS: Record<IconSetType, { prefix: string; name: string; url: string }> = {
  // Material Design Icons
  mdi: {
    prefix: 'mdi',
    name: 'Material Design Icons',
    url: 'https://pictogrammers.com/library/mdi/'
  },
  
  // Font Awesome
  fa: {
    prefix: 'fa',
    name: 'Font Awesome',
    url: 'https://fontawesome.com/icons'
  },
  
  // Heroicons
  heroicons: {
    prefix: 'heroicons',
    name: 'Heroicons',
    url: 'https://heroicons.com/'
  },
  
  // システム固有アイコン
  system: {
    prefix: 'system',
    name: 'Hotel System Icons',
    url: ''
  }
};

/**
 * デフォルトアイコンセット
 */
export const DEFAULT_ICON_SET: IconSetType = 'mdi';

/**
 * アイコンサイズ（px）
 */
export const ICON_SIZES: Record<string, number> = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  '2xl': 64
};

/**
 * アイコンカラー（CSS変数）
 */
export const ICON_COLORS: Record<string, string> = {
  primary: 'var(--color-primary, #667eea)',
  secondary: 'var(--color-secondary, #764ba2)',
  success: 'var(--color-success, #48bb78)',
  warning: 'var(--color-warning, #ed8936)',
  error: 'var(--color-error, #e53e3e)',
  info: 'var(--color-info, #4299e1)',
  default: 'currentColor'
};