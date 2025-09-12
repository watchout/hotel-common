#!/usr/bin/env node
/**
 * リリースノート自動生成スクリプト
 * Git履歴から機能追加・バグ修正・破壊的変更を分析してリリースノートを生成
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

interface ReleaseNote {
  version: string;
  date: string;
  features: string[];
  fixes: string[];
  breaking: string[];
  security: string[];
  performance: string[];
  docs: string[];
}

class ReleaseNotesGenerator {
  /**
   * 前回のタグから現在までのコミットを分析してリリースノート生成
   */
  async generateReleaseNotes(fromTag?: string): Promise<ReleaseNote> {
    const latestTag = fromTag || this.getLatestTag();
    const commits = this.getCommitsSince(latestTag);
    
    const releaseNote: ReleaseNote = {
      version: this.getNextVersion(latestTag),
      date: new Date().toISOString().split('T')[0],
      features: [],
      fixes: [],
      breaking: [],
      security: [],
      performance: [],
      docs: []
    };

    // コミットメッセージを分析して分類
    for (const commit of commits) {
      const message = commit.message.toLowerCase();
      const originalMessage = commit.message;

      if (message.includes('breaking') || message.includes('!:')) {
        releaseNote.breaking.push(originalMessage);
      } else if (message.includes('🔐') || message.includes('security') || message.includes('fix:') && message.includes('脆弱性')) {
        releaseNote.security.push(originalMessage);
      } else if (message.includes('feat') || message.includes('✨') || message.includes('add:')) {
        releaseNote.features.push(originalMessage);
      } else if (message.includes('fix') || message.includes('🐛')) {
        releaseNote.fixes.push(originalMessage);
      } else if (message.includes('perf') || message.includes('⚡') || message.includes('performance')) {
        releaseNote.performance.push(originalMessage);
      } else if (message.includes('doc') || message.includes('📝')) {
        releaseNote.docs.push(originalMessage);
      }
    }

    return releaseNote;
  }

  /**
   * マークダウン形式でリリースノートを生成
   */
  generateMarkdown(releaseNote: ReleaseNote): string {
    let markdown = `# Release ${releaseNote.version}\n\n`;
    markdown += `**リリース日**: ${releaseNote.date}\n\n`;

    if (releaseNote.breaking.length > 0) {
      markdown += `## ⚠️ 破壊的変更\n\n`;
      for (const item of releaseNote.breaking) {
        markdown += `- ${item}\n`;
      }
      markdown += `\n`;
    }

    if (releaseNote.security.length > 0) {
      markdown += `## 🔐 セキュリティ修正\n\n`;
      for (const item of releaseNote.security) {
        markdown += `- ${item}\n`;
      }
      markdown += `\n`;
    }

    if (releaseNote.features.length > 0) {
      markdown += `## ✨ 新機能\n\n`;
      for (const item of releaseNote.features) {
        markdown += `- ${item}\n`;
      }
      markdown += `\n`;
    }

    if (releaseNote.fixes.length > 0) {
      markdown += `## 🐛 バグ修正\n\n`;
      for (const item of releaseNote.fixes) {
        markdown += `- ${item}\n`;
      }
      markdown += `\n`;
    }

    if (releaseNote.performance.length > 0) {
      markdown += `## ⚡ パフォーマンス改善\n\n`;
      for (const item of releaseNote.performance) {
        markdown += `- ${item}\n`;
      }
      markdown += `\n`;
    }

    if (releaseNote.docs.length > 0) {
      markdown += `## 📝 ドキュメント\n\n`;
      for (const item of releaseNote.docs) {
        markdown += `- ${item}\n`;
      }
      markdown += `\n`;
    }

    return markdown;
  }

  private getLatestTag(): string {
    try {
      return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
    } catch {
      return ''; // タグが存在しない場合
    }
  }

  private getCommitsSince(tag: string): Array<{hash: string, message: string}> {
    try {
      const range = tag ? `${tag}..HEAD` : 'HEAD';
      const output = execSync(`git log ${range} --pretty=format:"%H|%s"`, { encoding: 'utf8' });
      
      return output.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [hash, ...messageParts] = line.split('|');
          return {
            hash: hash.substring(0, 8),
            message: messageParts.join('|')
          };
        });
    } catch {
      return [];
    }
  }

  private getNextVersion(currentTag: string): string {
    if (!currentTag) return 'v1.0.0';
    
    const match = currentTag.match(/v?(\d+)\.(\d+)\.(\d+)/);
    if (!match) return 'v1.0.0';
    
    const [, major, minor, patch] = match;
    return `v${major}.${minor}.${parseInt(patch) + 1}`;
  }
}

// CLI実行
if (require.main === module) {
  const fromTag = process.argv[2];
  const generator = new ReleaseNotesGenerator();
  
  generator.generateReleaseNotes(fromTag).then(releaseNote => {
    const markdown = generator.generateMarkdown(releaseNote);
    
    // ファイル出力
    const filename = `docs/release/release-${releaseNote.version}.md`;
    if (!fs.existsSync('docs/release')) {
      fs.mkdirSync('docs/release', { recursive: true });
    }
    
    fs.writeFileSync(filename, markdown);
    console.log(`✅ リリースノートを生成: ${filename}`);
    console.log('\n' + markdown);
  }).catch(console.error);
}

export { ReleaseNotesGenerator };
