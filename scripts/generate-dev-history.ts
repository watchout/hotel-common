#!/usr/bin/env node
/**
 * 開発履歴自動生成スクリプト
 * Git履歴とファイル変更を分析して開発過程をドキュメント化
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface CommitInfo {
  hash: string;
  date: string;
  author: string;
  message: string;
  files: string[];
  insertions: number;
  deletions: number;
}

interface DevHistoryEntry {
  date: string;
  commits: CommitInfo[];
  summary: string;
  impactedAreas: string[];
}

class DevHistoryGenerator {
  private outputDir = 'docs/development-history';

  constructor() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Git履歴から開発履歴を生成
   */
  async generateHistory(days: number = 30): Promise<void> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().split('T')[0];

    console.log(`📊 ${days}日間の開発履歴を生成中...`);

    // Git履歴取得
    const commits = this.getCommitHistory(sinceStr);
    
    // 日付別にグループ化
    const dailyHistory = this.groupCommitsByDate(commits);
    
    // マークダウン生成
    const markdown = this.generateMarkdown(dailyHistory, days);
    
    // ファイル出力
    const filename = `${this.outputDir}/dev-history-${sinceStr}-to-${new Date().toISOString().split('T')[0]}.md`;
    fs.writeFileSync(filename, markdown);
    
    console.log(`✅ 開発履歴を生成: ${filename}`);
    
    // 最新履歴へのシンボリックリンク更新
    const latestLink = `${this.outputDir}/latest.md`;
    if (fs.existsSync(latestLink)) {
      fs.unlinkSync(latestLink);
    }
    fs.symlinkSync(path.basename(filename), latestLink);
  }

  private getCommitHistory(since: string): CommitInfo[] {
    try {
      // Git log with detailed format
      const gitLog = execSync(
        `git log --since="${since}" --pretty=format:"%H|%ai|%an|%s" --numstat`,
        { encoding: 'utf8' }
      );

      const commits: CommitInfo[] = [];
      const lines = gitLog.split('\n');
      let currentCommit: Partial<CommitInfo> | null = null;

      for (const line of lines) {
        if (line.includes('|')) {
          // Commit header line
          if (currentCommit) {
            commits.push(currentCommit as CommitInfo);
          }
          
          const [hash, date, author, message] = line.split('|');
          currentCommit = {
            hash: hash.substring(0, 8),
            date: date.split(' ')[0],
            author,
            message,
            files: [],
            insertions: 0,
            deletions: 0
          };
        } else if (line.trim() && currentCommit) {
          // File change line (insertions deletions filename)
          const parts = line.trim().split('\t');
          if (parts.length === 3) {
            const [insertions, deletions, filename] = parts;
            currentCommit.files!.push(filename);
            currentCommit.insertions! += parseInt(insertions) || 0;
            currentCommit.deletions! += parseInt(deletions) || 0;
          }
        }
      }

      if (currentCommit) {
        commits.push(currentCommit as CommitInfo);
      }

      return commits;
    } catch (error) {
      console.error('Git履歴取得エラー:', error);
      return [];
    }
  }

  private groupCommitsByDate(commits: CommitInfo[]): Map<string, DevHistoryEntry> {
    const dailyMap = new Map<string, DevHistoryEntry>();

    for (const commit of commits) {
      if (!dailyMap.has(commit.date)) {
        dailyMap.set(commit.date, {
          date: commit.date,
          commits: [],
          summary: '',
          impactedAreas: []
        });
      }

      const entry = dailyMap.get(commit.date)!;
      entry.commits.push(commit);
    }

    // 各日のサマリーと影響範囲を生成
    for (const [date, entry] of dailyMap) {
      entry.summary = this.generateDaySummary(entry.commits);
      entry.impactedAreas = this.extractImpactedAreas(entry.commits);
    }

    return dailyMap;
  }

  private generateDaySummary(commits: CommitInfo[]): string {
    const totalFiles = new Set(commits.flatMap(c => c.files)).size;
    const totalInsertions = commits.reduce((sum, c) => sum + c.insertions, 0);
    const totalDeletions = commits.reduce((sum, c) => sum + c.deletions, 0);

    const categories = {
      fix: commits.filter(c => c.message.toLowerCase().includes('fix')).length,
      feat: commits.filter(c => c.message.toLowerCase().includes('feat') || c.message.includes('✨')).length,
      docs: commits.filter(c => c.message.toLowerCase().includes('doc')).length,
      refactor: commits.filter(c => c.message.toLowerCase().includes('refactor')).length,
      security: commits.filter(c => c.message.includes('🔐') || c.message.toLowerCase().includes('security')).length
    };

    const mainCategory = Object.entries(categories).reduce((a, b) => categories[a[0]] > categories[b[0]] ? a : b)[0];

    return `${commits.length}件のコミット、${totalFiles}ファイル変更 (+${totalInsertions}/-${totalDeletions}行)。主な作業: ${mainCategory}`;
  }

  private extractImpactedAreas(commits: CommitInfo[]): string[] {
    const areas = new Set<string>();
    
    for (const commit of commits) {
      for (const file of commit.files) {
        if (file.startsWith('src/routes/')) areas.add('API Routes');
        if (file.startsWith('src/services/')) areas.add('Business Logic');
        if (file.startsWith('src/database/')) areas.add('Database');
        if (file.startsWith('src/auth/')) areas.add('Authentication');
        if (file.startsWith('docs/')) areas.add('Documentation');
        if (file.startsWith('prisma/')) areas.add('Database Schema');
        if (file.includes('test')) areas.add('Testing');
        if (file.startsWith('src/integrations/')) areas.add('Integrations');
      }
    }

    return Array.from(areas);
  }

  private generateMarkdown(dailyHistory: Map<string, DevHistoryEntry>, days: number): string {
    const sortedDates = Array.from(dailyHistory.keys()).sort().reverse();
    
    let markdown = `# 開発履歴レポート (過去${days}日間)\n\n`;
    markdown += `生成日時: ${new Date().toLocaleString('ja-JP')}\n\n`;
    
    // サマリー
    const totalCommits = Array.from(dailyHistory.values()).reduce((sum, entry) => sum + entry.commits.length, 0);
    const allAreas = new Set(Array.from(dailyHistory.values()).flatMap(entry => entry.impactedAreas));
    
    markdown += `## 📊 サマリー\n\n`;
    markdown += `- **総コミット数**: ${totalCommits}件\n`;
    markdown += `- **開発期間**: ${sortedDates[sortedDates.length - 1]} ～ ${sortedDates[0]}\n`;
    markdown += `- **影響範囲**: ${Array.from(allAreas).join(', ')}\n\n`;

    // 日別履歴
    markdown += `## 📅 日別開発履歴\n\n`;
    
    for (const date of sortedDates) {
      const entry = dailyHistory.get(date)!;
      markdown += `### ${date}\n\n`;
      markdown += `**${entry.summary}**\n\n`;
      
      if (entry.impactedAreas.length > 0) {
        markdown += `**影響範囲**: ${entry.impactedAreas.join(', ')}\n\n`;
      }

      markdown += `#### コミット詳細\n\n`;
      for (const commit of entry.commits) {
        markdown += `- \`${commit.hash}\` ${commit.message}\n`;
        markdown += `  - 作業者: ${commit.author}\n`;
        markdown += `  - 変更: ${commit.files.length}ファイル (+${commit.insertions}/-${commit.deletions}行)\n`;
        
        if (commit.files.length <= 5) {
          markdown += `  - ファイル: ${commit.files.join(', ')}\n`;
        } else {
          markdown += `  - ファイル: ${commit.files.slice(0, 3).join(', ')} 他${commit.files.length - 3}件\n`;
        }
        markdown += `\n`;
      }
      markdown += `---\n\n`;
    }

    // 技術的な変更の分析
    markdown += `## 🔧 技術的変更の分析\n\n`;
    
    const allCommits = Array.from(dailyHistory.values()).flatMap(entry => entry.commits);
    const fileChanges = new Map<string, number>();
    
    for (const commit of allCommits) {
      for (const file of commit.files) {
        fileChanges.set(file, (fileChanges.get(file) || 0) + 1);
      }
    }

    const topChangedFiles = Array.from(fileChanges.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    markdown += `### 最も変更されたファイル\n\n`;
    for (const [file, count] of topChangedFiles) {
      markdown += `- \`${file}\`: ${count}回変更\n`;
    }

    return markdown;
  }
}

// CLI実行
if (require.main === module) {
  const days = parseInt(process.argv[2]) || 30;
  const generator = new DevHistoryGenerator();
  generator.generateHistory(days).catch(console.error);
}

export { DevHistoryGenerator };
