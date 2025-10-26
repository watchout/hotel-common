import type { IconSize, IconColor, IconSetType } from '../types';
import type { PropType } from 'vue';
/**
 * アイコンコンポーネント
 */
declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    name: {
        type: StringConstructor;
        required: true;
    };
    set: {
        type: PropType<IconSetType>;
        default: string;
    };
    size: {
        type: PropType<IconSize>;
        default: string;
    };
    color: {
        type: PropType<IconColor>;
        default: string;
    };
    className: {
        type: StringConstructor;
        default: string;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    name: {
        type: StringConstructor;
        required: true;
    };
    set: {
        type: PropType<IconSetType>;
        default: string;
    };
    size: {
        type: PropType<IconSize>;
        default: string;
    };
    color: {
        type: PropType<IconColor>;
        default: string;
    };
    className: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{}>, {
    set: string;
    size: IconSize;
    color: string;
    className: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
