/**
 * システムアイコンコンポーネント
 * 
 * 各システム（hotel-saas, hotel-pms, hotel-member, hotel-common）の
 * 専用アイコンを表示するコンポーネント
 */
import { defineComponent, h, PropType, computed } from 'vue';
import { SystemId, IconSize, IconColor } from '../types';
import { SYSTEM_ICONS } from '../constants/systemIcons';
import HotelIcon from './Icon';

/**
 * システムアイコンコンポーネント
 */
export default defineComponent({
  name: 'SystemIcon',
  
  props: {
    // システムID
    systemId: {
      type: String as PropType<SystemId>,
      required: true,
      validator: (value: string) => {
        return Object.keys(SYSTEM_ICONS).includes(value);
      }
    },
    
    // サイズ
    size: {
      type: [String, Number] as PropType<IconSize>,
      default: 'md'
    },
    
    // カラー
    color: {
      type: String as PropType<IconColor>,
      default: 'primary'
    },
    
    // CSSクラス
    className: {
      type: String,
      default: ''
    }
  },
  
  setup(props) {
    // システムアイコン定義
    const systemIcon = computed(() => SYSTEM_ICONS[props.systemId]);
    
    return () => h(HotelIcon, {
      name: systemIcon.value.icon,
      set: systemIcon.value.set,
      size: props.size,
      color: props.color,
      className: `system-icon system-icon-${props.systemId} ${props.className}`
    });
  }
});