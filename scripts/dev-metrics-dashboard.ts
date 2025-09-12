#!/usr/bin/env node
/**
 * 開発メトリクス ダッシュボード
 * コード品質、開発速度、バグ修正率などの指標を可視化
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

interface DevMetrics {
  period: string;
  commits: {
    total: number;
    byType: Record<string, number>;
    byAuthor: Record<string, number>;
  };
  codeChanges: {
    linesAdded: number;
    linesDeleted: number;
    filesChanged: number;
  };
  quality: {
    bugFixRatio: number;
    securityFixCount: number;
    testCoverage?: number;
  };
  velocity: {
    commitsPerDay: number;
    avgFilesPerCommit: number;
    avgLinesPerCommit: number;
  };
}

class DevMetricsDashboard {
  async generateMetrics(days: number = 30): Promise<DevMetrics> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().split('T')[0];

    console.log(`📊 過去${days}日間の開発メトリクスを分析中...`);

    const commits = this.getCommitData(sinceStr);
    
    const metrics: DevMetrics = {
      period: `${sinceStr} to ${new Date().toISOString().split('T')[0]}`,
      commits: this.analyzeCommits(commits),
      codeChanges: this.analyzeCodeChanges(commits),
      quality: this.analyzeQuality(commits),
      velocity: this.analyzeVelocity(commits, days)
    };

    return metrics;
  }

  generateDashboard(metrics: DevMetrics): string {
    let dashboard = `# 🚀 開発メトリクス ダッシュボード\n\n`;
    dashboard += `**分析期間**: ${metrics.period}\n`;
    dashboard += `**生成日時**: ${new Date().toLocaleString('ja-JP')}\n\n`;

    // 概要
    dashboard += `## 📈 概要\n\n`;
    dashboard += `| 指標 | 値 |\n`;
    dashboard += `|------|----|\n`;
    dashboard += `| 総コミット数 | ${metrics.commits.total} |\n`;
    dashboard += `| 変更ファイル数 | ${metrics.codeChanges.filesChanged} |\n`;
    dashboard += `| 追加行数 | +${metrics.codeChanges.linesAdded.toLocaleString()} |\n`;
    dashboard += `| 削除行数 | -${metrics.codeChanges.linesDeleted.toLocaleString()} |\n`;
    dashboard += `| 1日あたりコミット数 | ${metrics.velocity.commitsPerDay.toFixed(1)} |\n`;
    dashboard += `| バグ修正率 | ${(metrics.quality.bugFixRatio * 100).toFixed(1)}% |\n\n`;

    // コミット種別分析
    dashboard += `## 🏷️ コミット種別分析\n\n`;
    dashboard += `| 種別 | 件数 | 割合 |\n`;
    dashboard += `|------|------|------|\n`;
    for (const [type, count] of Object.entries(metrics.commits.byType)) {
      const percentage = ((count / metrics.commits.total) * 100).toFixed(1);
      dashboard += `| ${type} | ${count} | ${percentage}% |\n`;
    }
    dashboard += `\n`;

    // 開発者別分析
    dashboard += `## 👥 開発者別分析\n\n`;
    dashboard += `| 開発者 | コミット数 | 貢献度 |\n`;
    dashboard += `|--------|------------|--------|\n`;
    for (const [author, count] of Object.entries(metrics.commits.byAuthor)) {
      const percentage = ((count / metrics.commits.total) * 100).toFixed(1);
      dashboard += `| ${author} | ${count} | ${percentage}% |\n`;
    }
    dashboard += `\n`;

    // 品質指標
    dashboard += `## 🎯 品質指標\n\n`;
    dashboard += `- **バグ修正率**: ${(metrics.quality.bugFixRatio * 100).toFixed(1)}%\n`;
    dashboard += `- **セキュリティ修正**: ${metrics.quality.securityFixCount}件\n`;
    if (metrics.quality.testCoverage) {
      dashboard += `- **テストカバレッジ**: ${metrics.quality.testCoverage}%\n`;
    }
    dashboard += `\n`;

    // 開発速度
    dashboard += `## ⚡ 開発速度\n\n`;
    dashboard += `- **1日あたりコミット数**: ${metrics.velocity.commitsPerDay.toFixed(1)}\n`;
    dashboard += `- **1コミットあたりファイル数**: ${metrics.velocity.avgFilesPerCommit.toFixed(1)}\n`;
    dashboard += `- **1コミットあたり行数**: ${metrics.velocity.avgLinesPerCommit.toFixed(0)}\n\n`;

    // 推奨事項
    dashboard += `## 💡 推奨事項\n\n`;
    if (metrics.quality.bugFixRatio > 0.3) {
      dashboard += `- ⚠️ バグ修正の割合が高いです。コードレビューやテストの強化を検討してください。\n`;
    }
    if (metrics.velocity.commitsPerDay < 1) {
      dashboard += `- 📈 コミット頻度が低いです。より細かい単位でのコミットを心がけてください。\n`;
    }
    if (metrics.quality.securityFixCount > 0) {
      dashboard += `- 🔐 セキュリティ修正が発生しています。セキュリティチェックの自動化を検討してください。\n`;
    }

    return dashboard;
  }

  private getCommitData(since: string) {
    try {
      const output = execSync(
        `git log --since="${since}" --pretty=format:"%H|%ai|%an|%s" --numstat`,
        { encoding: 'utf8' }
      );

      const commits = [];
      const lines = output.split('\n');
      let currentCommit: any = null;

      for (const line of lines) {
        if (line.includes('|')) {
          if (currentCommit) commits.push(currentCommit);
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
          const parts = line.trim().split('\t');
          if (parts.length === 3) {
            const [insertions, deletions, filename] = parts;
            currentCommit.files.push(filename);
            currentCommit.insertions += parseInt(insertions) || 0;
            currentCommit.deletions += parseInt(deletions) || 0;
          }
        }
      }

      if (currentCommit) commits.push(currentCommit);
      return commits;
    } catch {
      return [];
    }
  }

  private analyzeCommits(commits: any[]) {
    const byType: Record<string, number> = {};
    const byAuthor: Record<string, number> = {};

    for (const commit of commits) {
      // 作者別
      byAuthor[commit.author] = (byAuthor[commit.author] || 0) + 1;

      // 種別分析
      const message = commit.message.toLowerCase();
      if (message.includes('fix') || message.includes('🐛')) {
        byType['バグ修正'] = (byType['バグ修正'] || 0) + 1;
      } else if (message.includes('feat') || message.includes('✨')) {
        byType['新機能'] = (byType['新機能'] || 0) + 1;
      } else if (message.includes('🔐') || message.includes('security')) {
        byType['セキュリティ'] = (byType['セキュリティ'] || 0) + 1;
      } else if (message.includes('doc') || message.includes('📝')) {
        byType['ドキュメント'] = (byType['ドキュメント'] || 0) + 1;
      } else if (message.includes('refactor')) {
        byType['リファクタリング'] = (byType['リファクタリング'] || 0) + 1;
      } else {
        byType['その他'] = (byType['その他'] || 0) + 1;
      }
    }

    return {
      total: commits.length,
      byType,
      byAuthor
    };
  }

  private analyzeCodeChanges(commits: any[]) {
    return {
      linesAdded: commits.reduce((sum, c) => sum + c.insertions, 0),
      linesDeleted: commits.reduce((sum, c) => sum + c.deletions, 0),
      filesChanged: new Set(commits.flatMap(c => c.files)).size
    };
  }

  private analyzeQuality(commits: any[]) {
    const bugFixes = commits.filter(c => 
      c.message.toLowerCase().includes('fix') || c.message.includes('🐛')
    ).length;
    
    const securityFixes = commits.filter(c =>
      c.message.includes('🔐') || c.message.toLowerCase().includes('security')
    ).length;

    return {
      bugFixRatio: commits.length > 0 ? bugFixes / commits.length : 0,
      securityFixCount: securityFixes
    };
  }

  private analyzeVelocity(commits: any[], days: number) {
    const totalFiles = commits.reduce((sum, c) => sum + c.files.length, 0);
    const totalLines = commits.reduce((sum, c) => sum + c.insertions + c.deletions, 0);

    return {
      commitsPerDay: commits.length / days,
      avgFilesPerCommit: commits.length > 0 ? totalFiles / commits.length : 0,
      avgLinesPerCommit: commits.length > 0 ? totalLines / commits.length : 0
    };
  }
}

// CLI実行
if (require.main === module) {
  const days = parseInt(process.argv[2]) || 30;
  const dashboard = new DevMetricsDashboard();
  
  dashboard.generateMetrics(days).then(metrics => {
    const markdown = dashboard.generateDashboard(metrics);
    
    const outputDir = 'docs/metrics';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const filename = `${outputDir}/dev-metrics-${new Date().toISOString().split('T')[0]}.md`;
    fs.writeFileSync(filename, markdown);
    
    console.log(`✅ 開発メトリクスを生成: ${filename}`);
  }).catch(console.error);
}

export { DevMetricsDashboard };
