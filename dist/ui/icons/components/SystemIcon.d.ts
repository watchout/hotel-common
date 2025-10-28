import type { SystemId, IconSize, IconColor } from '../types';
import type { PropType } from 'vue';
/**
 * システムアイコンコンポーネント
 */
declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    systemId: {
        type: PropType<SystemId>;
        required: true;
        validator: (value: string) => boolean;
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
    systemId: {
        type: PropType<SystemId>;
        required: true;
        validator: (value: string) => boolean;
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
    size: IconSize;
    color: string;
    className: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
