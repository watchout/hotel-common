"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 基本アイコンコンポーネント
 *
 * Iconifyを使用した統一アイコンコンポーネント
 */
const vue_1 = require("@iconify/vue");
const vue_2 = require("vue");
const iconSets_1 = require("../constants/iconSets");
const iconLoader_1 = require("../utils/iconLoader");
/**
 * アイコンサイズをピクセル値に変換
 *
 * @param size アイコンサイズ
 * @returns ピクセル値
 */
function getSizeInPixels(size) {
    if (typeof size === 'number') {
        return size;
    }
    return iconSets_1.ICON_SIZES[size] || iconSets_1.ICON_SIZES.md;
}
/**
 * アイコンカラーをCSS値に変換
 *
 * @param color アイコンカラー
 * @returns CSS値
 */
function getColorValue(color) {
    return iconSets_1.ICON_COLORS[color] || color;
}
/**
 * アイコンコンポーネント
 */
exports.default = (0, vue_2.defineComponent)({
    name: 'HotelIcon',
    props: {
        // アイコン名
        name: {
            type: String,
            required: true
        },
        // アイコンセット
        set: {
            type: String,
            default: iconSets_1.DEFAULT_ICON_SET
        },
        // サイズ
        size: {
            type: [String, Number],
            default: 'md'
        },
        // カラー
        color: {
            type: String,
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
        const iconName = (0, vue_2.computed)(() => (0, iconLoader_1.getFullIconName)(props.name, props.set));
        // サイズ（px）
        const sizeInPixels = (0, vue_2.computed)(() => getSizeInPixels(props.size));
        // カラー値
        const colorValue = (0, vue_2.computed)(() => getColorValue(props.color));
        // スタイル
        const iconStyle = (0, vue_2.computed)(() => ({
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
        return () => (0, vue_2.h)(vue_1.Icon, {
            icon: iconName.value,
            style: iconStyle.value,
            class: props.className,
            onClick: handleClick,
            ...attrs
        });
    }
});
