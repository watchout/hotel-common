#!/usr/bin/env node
/**
 * 🛡️ ガードレールBackground Agent管理ツール
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class GuardrailsManager {
  constructor() {
    this.pidFile = 'logs/guardrails-agent.pid';
    this.logFile = 'logs/guardrails-background.log';
    this.scriptPath = 'scripts/continuous-guardrails-monitor.js';
  }

  /**
   * 🚀 Background Agent開始
   */
  async start() {
    if (await this.isRunning()) {
      console.log('⚠️  ガードレールBackground Agentは既に実行中です');
      await this.status();
      return;
    }

    console.log('🚀 ガードレールBackground Agent開始...');
    
    // ログディレクトリ作成
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }

    // nohupでバックグラウンド実行
    const child = spawn('node', [this.scriptPath], {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    // ログファイルに出力
    const logStream = fs.createWriteStream(this.logFile, { flags: 'a' });
    child.stdout.pipe(logStream);
    child.stderr.pipe(logStream);

    // PIDファイル作成
    fs.writeFileSync(this.pidFile, child.pid.toString());

    // プロセスを親から切り離し
    child.unref();

    console.log(`✅ Background Agent開始完了`);
    console.log(`📋 プロセスID: ${child.pid}`);
    console.log(`📄 ログファイル: ${this.logFile}`);
    console.log(`⚙️  管理コマンド:`);
    console.log(`   - 状態確認: npm run guardrails:status`);
    console.log(`   - ログ確認: npm run guardrails:logs`);
    console.log(`   - 停止: npm run guardrails:stop`);
  }

  /**
   * 🛑 Background Agent停止
   */
  async stop() {
    if (!(await this.isRunning())) {
      console.log('⚠️  ガードレールBackground Agentは実行されていません');
      return;
    }

    const pid = this.getPid();
    if (pid) {
      console.log('🛑 ガードレールBackground Agent停止中...');
      
      try {
        process.kill(pid, 'SIGTERM');
        console.log(`✅ プロセス ${pid} を停止しました`);
        
        // PIDファイル削除
        if (fs.existsSync(this.pidFile)) {
          fs.unlinkSync(this.pidFile);
        }
      } catch (error) {
        console.log(`❌ プロセス停止エラー: ${error.message}`);
      }
    }
  }

  /**
   * 📊 Background Agent状態確認
   */
  async status() {
    const isRunning = await this.isRunning();
    const pid = this.getPid();

    console.log('📊 ガードレールBackground Agent状態');
    console.log('─'.repeat(50));
    
    if (isRunning && pid) {
      console.log(`✅ ステータス: 実行中`);
      console.log(`📋 プロセスID: ${pid}`);
      console.log(`📄 ログファイル: ${this.logFile}`);
      
      // プロセス詳細情報
      exec(`ps -p ${pid} -o pid,ppid,etime,pcpu,pmem,command`, (error, stdout) => {
        if (!error) {
          console.log('📈 プロセス詳細:');
          console.log(stdout);
        }
      });
    } else {
      console.log(`❌ ステータス: 停止中`);
      console.log(`💡 開始方法: npm run guardrails:start`);
    }
  }

  /**
   * 📄 ログ表示
   */
  async logs() {
    if (!fs.existsSync(this.logFile)) {
      console.log('📄 ログファイルが見つかりません');
      return;
    }

    console.log(`📄 ガードレールBackground Agentログ (最新20行)`);
    console.log('─'.repeat(50));
    
    exec(`tail -20 "${this.logFile}"`, (error, stdout) => {
      if (error) {
        console.log(`❌ ログ読み込みエラー: ${error.message}`);
      } else {
        console.log(stdout);
      }
    });
  }

  /**
   * 🔄 再起動
   */
  async restart() {
    console.log('🔄 ガードレールBackground Agent再起動...');
    await this.stop();
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2秒待機
    await this.start();
  }

  /**
   * プロセス実行確認
   */
  async isRunning() {
    const pid = this.getPid();
    if (!pid) return false;

    try {
      process.kill(pid, 0); // シグナル0で存在確認
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * PID取得
   */
  getPid() {
    if (!fs.existsSync(this.pidFile)) return null;
    try {
      return parseInt(fs.readFileSync(this.pidFile, 'utf8').trim());
    } catch (error) {
      return null;
    }
  }
}

// CLI実行
if (require.main === module) {
  const manager = new GuardrailsManager();
  const command = process.argv[2];

  switch (command) {
    case 'start':
      manager.start();
      break;
    case 'stop':
      manager.stop();
      break;
    case 'status':
      manager.status();
      break;
    case 'logs':
      manager.logs();
      break;
    case 'restart':
      manager.restart();
      break;
    default:
      console.log('🛡️ ガードレールBackground Agent管理ツール');
      console.log('使用方法:');
      console.log('  node scripts/guardrails-manager.js <command>');
      console.log('');
      console.log('コマンド:');
      console.log('  start   - Background Agent開始');
      console.log('  stop    - Background Agent停止');
      console.log('  status  - 状態確認');
      console.log('  logs    - ログ表示');
      console.log('  restart - 再起動');
  }
}

module.exports = GuardrailsManager; 