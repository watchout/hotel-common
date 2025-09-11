/**
 * 基本アイコンコンポーネント
 * 
 * Iconifyを使用した統一アイコンコンポーネント
 */
import { defineComponent, h, PropType, computed } from 'vue';
import { Icon as IconifyIcon } from '@iconify/vue';
import { IconProps, IconSize, IconColor, IconSetType } from '../types';
import { getFullIconName } from '../utils/iconLoader';
import { ICON_SIZES, ICON_COLORS, DEFAULT_ICON_SET } from '../constants/iconSets';

/**
 * アイコンサイズをピクセル値に変換
 * 
 * @param size アイコンサイズ
 * @returns ピクセル値
 */
function getSizeInPixels(size: IconSize): number {
  if (typeof size === 'number') {
    return size;
  }
  
  return ICON_SIZES[size] || ICON_SIZES.md;
}

/**
 * アイコンカラーをCSS値に変換
 * 
 * @param color アイコンカラー
 * @returns CSS値
 */
function getColorValue(color: IconColor): string {
  return ICON_COLORS[color] || color;
}

/**
 * アイコンコンポーネント
 */
export default defineComponent({
  name: 'HotelIcon',
  
  props: {
    // アイコン名
    name: {
      type: String,
      required: true
    },
    
    // アイコンセット
    set: {
      type: String as PropType<IconSetType>,
      default: DEFAULT_ICON_SET
    },
    
    // サイズ
    size: {
      type: [String, Number] as PropType<IconSize>,
      default: 'md'
    },
    
    // カラー
    color: {
      type: String as PropType<IconColor>,
      default: 'default'
    },
    
    // CSSクラス
    className: {
      type: String,
      default: ''
    }
  },
  
  setup(props, { attrs, emit }) {
    // 完全修飾アイコン名
    const iconName = computed(() => getFullIconName(props.name, props.set));
    
    // サイズ（px）
    const sizeInPixels = computed(() => getSizeInPixels(props.size));
    
    // カラー値
    const colorValue = computed(() => getColorValue(props.color));
    
    // スタイル
    const iconStyle = computed(() => ({
      color: colorValue.value,
      width: `${sizeInPixels.value}px`,
      height: `${sizeInPixels.value}px`,
      display: 'inline-block',
      verticalAlign: 'middle'
    }));
    
    // クリックハンドラ
    const handleClick = () => {
      emit('click');
    };
    
    return () => h(IconifyIcon, {
      icon: iconName.value,
      style: iconStyle.value,
      class: props.className,
      onClick: handleClick,
      ...attrs
    });
  }
});