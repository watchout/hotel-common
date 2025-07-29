#!/usr/bin/env node

import { promises as fs } from 'fs'
import { join } from 'path'
import { DeepLTranslationService } from '../src/translation/deepl-service'
import { SupportedLanguage } from '../src/i18n/types'

/** 翻訳ファイル自動生成 */
class TranslationGenerator {
  private deepL: DeepLTranslationService
  private baseDir: string

  constructor() {
    this.deepL = new DeepLTranslationService()
    this.baseDir = join(__dirname, '../i18n/locales')
  }

  /** 全言語翻訳ファイル生成 */
  async generateAllTranslations(): Promise<void> {
    console.log('🌍 Starting translation generation...')

    try {
      // 日本語ベースファイル読み込み
      const japaneseData = await this.loadBaseTranslations()
      
      // 各言語に翻訳
      const targetLanguages: SupportedLanguage[] = ['en', 'zh-CN', 'zh-TW', 'ko']
      
      for (const language of targetLanguages) {
        console.log(`📝 Generating ${language} translations...`)
        await this.generateLanguageFile(japaneseData, language)
        console.log(`✅ ${language} completed`)
      }

      console.log('🎉 All translations generated successfully!')
      
    } catch (error) {
      console.error('❌ Translation generation failed:', error)
      process.exit(1)
    }
  }

  /** 日本語ベースファイル読み込み */
  private async loadBaseTranslations(): Promise<any> {
    const filePath = join(this.baseDir, 'ja.json')
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  }

  /** 特定言語の翻訳ファイル生成 */
  private async generateLanguageFile(
    baseData: any, 
    language: SupportedLanguage
  ): Promise<void> {
    const translatedData = await this.translateObject(baseData, language)
    
    // 品質チェック
    const qualityReport = await this.performQualityCheck(translatedData, language)
    if (qualityReport.issues.length > 0) {
      console.warn(`⚠️  Quality issues for ${language}:`, qualityReport.issues)
    }

    // ファイル保存
    const filePath = join(this.baseDir, `${language}.json`)
    await fs.writeFile(filePath, JSON.stringify(translatedData, null, 2), 'utf-8')
    
    // 品質レポート保存
    const reportPath = join(this.baseDir, `${language}.quality.json`)
    await fs.writeFile(reportPath, JSON.stringify(qualityReport, null, 2), 'utf-8')
  }

  /** オブジェクト再帰翻訳 */
  private async translateObject(obj: any, language: SupportedLanguage): Promise<any> {
    if (typeof obj === 'string') {
      // 文字列の場合：翻訳実行
      const results = await this.deepL.translateBatch([obj], language)
      return results[0]?.translated || obj
    }

    if (Array.isArray(obj)) {
      // 配列の場合：各要素を翻訳
      const translated = []
      for (const item of obj) {
        translated.push(await this.translateObject(item, language))
      }
      return translated
    }

    if (obj && typeof obj === 'object') {
      // オブジェクトの場合：各プロパティを翻訳
      const translated: any = {}
      
      // バッチ処理で効率化
      const entries = Object.entries(obj)
      const keys = entries.map(([key]) => key)
      const values = entries.map(([, value]) => value)
      
      for (let i = 0; i < entries.length; i++) {
        const [key, value] = entries[i]
        translated[key] = await this.translateObject(value, language)
        
        // 進捗表示（大きなオブジェクト用）
        if (entries.length > 50 && i % 10 === 0) {
          console.log(`  Progress: ${i}/${entries.length} keys translated`)
        }
      }
      
      return translated
    }

    return obj
  }

  /** 品質チェック実行 */
  private async performQualityCheck(
    translatedData: any,
    language: SupportedLanguage
  ): Promise<{ score: number; issues: string[] }> {
    const issues: string[] = []
    let totalChecks = 0
    let passedChecks = 0

    await this.checkObjectQuality(translatedData, language, '', issues, totalChecks, passedChecks)

    const score = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0

    return { score, issues }
  }

  /** オブジェクト品質チェック（再帰） */
  private async checkObjectQuality(
    obj: any,
    language: SupportedLanguage,
    path: string,
    issues: string[],
    totalChecks: number,
    passedChecks: number
  ): Promise<void> {
    if (typeof obj === 'string') {
      totalChecks++
      
      // 長さチェック
      if (obj.length > 200) {
        issues.push(`${path}: Translation too long (${obj.length} chars)`)
      } else {
        passedChecks++
      }

      // 言語固有チェック
      if (language === 'ko' && !this.hasKoreanText(obj)) {
        issues.push(`${path}: Missing Korean characters`)
      }

      if (language.startsWith('zh') && !this.hasChineseText(obj)) {
        issues.push(`${path}: Missing Chinese characters`)
      }

      return
    }

    if (obj && typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        const newPath = path ? `${path}.${key}` : key
        await this.checkObjectQuality(value, language, newPath, issues, totalChecks, passedChecks)
      }
    }
  }

  /** 韓国語文字チェック */
  private hasKoreanText(text: string): boolean {
    return /[ㄱ-ㅎ가-힣]/.test(text)
  }

  /** 中国語文字チェック */  
  private hasChineseText(text: string): boolean {
    return /[\u4e00-\u9fff]/.test(text)
  }
}

/** 実行用関数 */
async function main(): Promise<void> {
  const generator = new TranslationGenerator()
  await generator.generateAllTranslations()
}

// コマンドライン実行時
if (require.main === module) {
  main().catch(console.error)
}

export { TranslationGenerator } 