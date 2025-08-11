#!/bin/bash
# ホテル統合システム サーバー初期セットアップスクリプト
# Ubuntu Server 22.04 LTS 用

# スクリプトが root で実行されているか確認
if [ "$(id -u)" -ne 0 ]; then
    echo "このスクリプトは root 権限で実行する必要があります"
    exit 1
fi

# ホスト名の設定
read -p "ホスト名を入力してください: " hostname
hostnamectl set-hostname $hostname
echo "ホスト名を $hostname に設定しました"

# システムアップデート
echo "システムアップデートを実行中..."
apt update && apt upgrade -y

# 基本ツールのインストール
echo "基本ツールをインストール中..."
apt install -y curl wget git vim htop net-tools ufw fail2ban unzip

# タイムゾーンの設定
timedatectl set-timezone Asia/Tokyo
echo "タイムゾーンを Asia/Tokyo に設定しました"

# ファイアウォールの設定
echo "ファイアウォールを設定中..."
ufw allow OpenSSH
ufw --force enable
echo "ファイアウォールを有効化しました"

# Fail2ban の設定
echo "Fail2ban を設定中..."
systemctl enable fail2ban
systemctl start fail2ban

# SSH設定の強化
echo "SSH設定を強化中..."
sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd

# サーバータイプの選択
echo "サーバータイプを選択してください:"
echo "1) アプリケーションサーバー"
echo "2) データベースサーバー"
read -p "選択 (1-2): " server_type

case $server_type in
    1)
        echo "アプリケーションサーバーのセットアップを開始します..."
        
        # Node.js のインストール
        echo "Node.js 18.x をインストール中..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt install -y nodejs
        
        # npm のアップデート
        npm install -g npm@latest
        
        # PM2 のインストール
        echo "PM2 をインストール中..."
        npm install -g pm2
        
        # Docker のインストール
        echo "Docker をインストール中..."
        apt install -y apt-transport-https ca-certificates curl software-properties-common
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
        add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
        apt update
        apt install -y docker-ce
        
        # Docker Compose のインストール
        echo "Docker Compose をインストール中..."
        curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        
        # アプリケーションユーザーの作成
        echo "アプリケーションユーザーを作成中..."
        adduser --disabled-password --gecos "" appuser
        usermod -aG docker appuser
        
        # アプリケーションディレクトリの作成
        mkdir -p /var/www/hotel-app
        chown appuser:appuser /var/www/hotel-app
        
        echo "アプリケーションサーバーのセットアップが完了しました"
        ;;
        
    2)
        echo "データベースサーバーのセットアップを開始します..."
        
        # PostgreSQL 14 のインストール
        echo "PostgreSQL 14 をインストール中..."
        apt install -y postgresql-14 postgresql-contrib-14
        
        # PostgreSQL の設定
        echo "PostgreSQL を設定中..."
        systemctl enable postgresql
        systemctl start postgresql
        
        # データベースバックアップディレクトリの作成
        mkdir -p /var/backups/postgresql
        chown postgres:postgres /var/backups/postgresql
        
        # バックアップスクリプトの作成
        cat > /usr/local/bin/pg_backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
su - postgres -c "pg_dumpall -c > $BACKUP_DIR/pg_backup_$TIMESTAMP.sql"
find $BACKUP_DIR -name "pg_backup_*.sql" -type f -mtime +7 -delete
EOF
        chmod +x /usr/local/bin/pg_backup.sh
        
        # cron ジョブの設定
        (crontab -l 2>/dev/null; echo "0 1 * * * /usr/local/bin/pg_backup.sh") | crontab -
        
        echo "データベースサーバーのセットアップが完了しました"
        
        # PostgreSQL のリモートアクセス設定
        read -p "リモートアクセスを許可しますか？ (y/n): " allow_remote
        if [ "$allow_remote" = "y" ]; then
            read -p "アプリケーションサーバーのIPアドレスを入力してください: " app_ip
            
            # postgresql.conf の設定
            sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/14/main/postgresql.conf
            
            # pg_hba.conf の設定
            echo "host    all             all             $app_ip/32            md5" >> /etc/postgresql/14/main/pg_hba.conf
            
            # PostgreSQL の再起動
            systemctl restart postgresql
            
            echo "PostgreSQL のリモートアクセス設定が完了しました"
            echo "アプリケーションサーバー $app_ip からの接続を許可しました"
            
            # ファイアウォールの設定
            ufw allow from $app_ip to any port 5432
            echo "ファイアウォールで $app_ip からのポート 5432 への接続を許可しました"
        fi
        ;;
        
    *)
        echo "無効な選択です"
        exit 1
        ;;
esac

# スワップ設定
echo "スワップ設定を確認中..."
free -h
read -p "スワップを設定/変更しますか？ (y/n): " setup_swap
if [ "$setup_swap" = "y" ]; then
    read -p "スワップサイズをGB単位で入力してください (例: 4): " swap_size
    
    # 既存のスワップファイルがあれば無効化
    swapoff -a
    
    # スワップファイルの作成
    dd if=/dev/zero of=/swapfile bs=1G count=$swap_size
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    
    # fstabに追加
    echo "/swapfile none swap sw 0 0" >> /etc/fstab
    
    echo "スワップを ${swap_size}GB に設定しました"
    free -h
fi

# システム情報の表示
echo "セットアップが完了しました。システム情報:"
echo "-----------------------------------"
echo "ホスト名: $(hostname)"
echo "OS: $(lsb_release -ds)"
echo "カーネル: $(uname -r)"
echo "CPU: $(grep 'model name' /proc/cpuinfo | head -1 | cut -d':' -f2 | sed 's/^[ \t]*//')"
echo "メモリ: $(free -h | grep Mem | awk '{print $2}')"
echo "ディスク: $(df -h / | tail -1 | awk '{print $2}')"
echo "IP アドレス: $(hostname -I | awk '{print $1}')"
echo "-----------------------------------"

echo "システムを再起動することをお勧めします"
read -p "今すぐ再起動しますか？ (y/n): " reboot_now
if [ "$reboot_now" = "y" ]; then
    reboot
fi