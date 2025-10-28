"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * システムアイコンコンポーネント
 *
 * 各システム（hotel-saas, hotel-pms, hotel-member, hotel-common）の
 * 専用アイコンを表示するコンポーネント
 */
const vue_1 = require("vue");
const Icon_1 = __importDefault(require("./Icon"));
const systemIcons_1 = require("../constants/systemIcons");
/**
 * システムアイコンコンポーネント
 */
exports.default = (0, vue_1.defineComponent)({
    name: 'SystemIcon',
    props: {
        // システムID
        systemId: {
            type: String,
            required: true,
            validator: (value) => {
                return Object.keys(systemIcons_1.SYSTEM_ICONS).includes(value);
            }
        },
        // サイズ
        size: {
            type: [String, Number],
            default: 'md'
        },
        // カラー
        color: {
            type: String,
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
        const systemIcon = (0, vue_1.computed)(() => systemIcons_1.SYSTEM_ICONS[props.systemId]);
        return () => (0, vue_1.h)(Icon_1.default, {
            name: systemIcon.value.icon,
            set: systemIcon.value.set,
            size: props.size,
            color: props.color,
            className: `system-icon system-icon-${props.systemId} ${props.className}`
        });
    }
});
