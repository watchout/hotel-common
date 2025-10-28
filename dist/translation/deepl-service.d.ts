import type { SupportedLanguage, TranslationResult } from '../i18n/types';
/** DeepL API統合サービス */
export declare class DeepLTranslationService {
    private apiKey;
    private baseUrl;
    constructor(apiKey?: string);
    /** 言語コード変換（DeepL形式） */
    private mapToDeepLLanguage;
    /** バッチ翻訳実行 */
    translateBatch(texts: string[], targetLanguage: SupportedLanguage, sourceLanguage?: SupportedLanguage): Promise<TranslationResult[]>;
    /** 繁体字特化処理 */
    private applyTraditionalChineseConversion;
    /** モック翻訳（開発・テスト用） */
    private mockTranslation;
    /** 翻訳品質チェック */
    validateTranslation(original: string, translated: string, language: SupportedLanguage): Promise<{
        valid: boolean;
        issues: string[];
    }>;
    /** 韓国語敬語チェック */
    private hasKoreanHonorific;
}
/** 翻訳サービス統合インスタンス */
export declare const translationService: DeepLTranslationService;
