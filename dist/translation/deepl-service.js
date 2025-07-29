/** DeepL API統合サービス */
export class DeepLTranslationService {
    apiKey;
    baseUrl = 'https://api.deepl.com/v2';
    constructor(apiKey) {
        this.apiKey = apiKey || process.env.DEEPL_API_KEY || '';
        if (!this.apiKey) {
            console.warn('DeepL API key not provided. Translation will be mocked.');
        }
    }
    /** 言語コード変換（DeepL形式） */
    mapToDeepLLanguage(language) {
        const languageMap = {
            'ja': 'JA',
            'en': 'EN-US',
            'zh-CN': 'ZH',
            'zh-TW': 'ZH', // DeepLは中国語統一、後で台湾化処理
            'ko': 'KO'
        };
        return languageMap[language];
    }
    /** バッチ翻訳実行 */
    async translateBatch(texts, targetLanguage, sourceLanguage = 'ja') {
        if (!this.apiKey) {
            return this.mockTranslation(texts, targetLanguage);
        }
        try {
            const deepLTarget = this.mapToDeepLLanguage(targetLanguage);
            const deepLSource = this.mapToDeepLLanguage(sourceLanguage);
            const response = await fetch(`${this.baseUrl}/translate`, {
                method: 'POST',
                headers: {
                    'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    text: texts.join('\n'),
                    source_lang: deepLSource,
                    target_lang: deepLTarget,
                    preserve_formatting: '1',
                    split_sentences: 'nonewlines'
                })
            });
            if (!response.ok) {
                throw new Error(`DeepL API error: ${response.status}`);
            }
            const data = await response.json();
            return texts.map((original, index) => ({
                original,
                translated: data.translations[index]?.text || original,
                language: targetLanguage,
                confidence: 0.95, // DeepL高品質
                cached: false
            }));
        }
        catch (error) {
            console.error('DeepL translation failed:', error);
            return this.mockTranslation(texts, targetLanguage);
        }
    }
    /** 繁体字特化処理 */
    async applyTraditionalChineseConversion(text) {
        // 簡体字→繁体字変換ロジック
        // 実装では OpenCC や他のライブラリを使用
        return text; // 暫定的にそのまま返す
    }
    /** モック翻訳（開発・テスト用） */
    mockTranslation(texts, targetLanguage) {
        const mockTranslations = {
            'en': {
                'チェックイン': 'Check In',
                'チェックアウト': 'Check Out',
                '予約する': 'Make Reservation',
                'ログイン': 'Login',
                'ダッシュボード': 'Dashboard'
            },
            'zh-CN': {
                'チェックイン': '入住登记',
                'チェックアウト': '退房',
                '予約する': '预订',
                'ログイン': '登录',
                'ダッシュボード': '仪表板'
            },
            'zh-TW': {
                'チェックイン': '入住登記',
                'チェックアウト': '退房',
                '予約する': '預訂',
                'ログイン': '登入',
                'ダッシュボード': '儀表板'
            },
            'ko': {
                'チェックイン': '체크인',
                'チェックアウト': '체크아웃',
                '予約する': '예약하기',
                'ログイン': '로그인',
                'ダッシュボード': '대시보드'
            },
            'ja': {} // ベース言語
        };
        return texts.map(text => ({
            original: text,
            translated: mockTranslations[targetLanguage]?.[text] || `[${targetLanguage}] ${text}`,
            language: targetLanguage,
            confidence: 0.8, // モック品質
            cached: false
        }));
    }
    /** 翻訳品質チェック */
    async validateTranslation(original, translated, language) {
        const issues = [];
        // 長さチェック（UI制約）
        if (translated.length > original.length * 2) {
            issues.push('Translation too long for UI constraints');
        }
        // 特殊文字チェック
        if (/[{}[\]()]/.test(translated)) {
            issues.push('Contains potentially problematic characters');
        }
        // 言語固有チェック
        if (language === 'ko' && !this.hasKoreanHonorific(translated)) {
            issues.push('Missing appropriate Korean honorific level');
        }
        return {
            valid: issues.length === 0,
            issues
        };
    }
    /** 韓国語敬語チェック */
    hasKoreanHonorific(text) {
        // 簡易敬語パターンチェック
        return /습니다|입니다|세요|시겠습니다/.test(text);
    }
}
/** 翻訳サービス統合インスタンス */
export const translationService = new DeepLTranslationService();
