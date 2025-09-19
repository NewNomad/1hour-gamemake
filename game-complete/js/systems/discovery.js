// 法則3: 発見の喜び - ウェーブシステムとランダム生成
class DiscoverySystem {
    constructor() {
        this.currentWave = 1;
        this.enemiesKilledInWave = 0;
        this.enemiesPerWave = CONFIG.LAW_OF_DISCOVERY.WAVE_SYSTEM.ENEMIES_PER_WAVE;
        this.currentPattern = '';
        this.patternProgress = 0;
        this.difficultyMultiplier = 1;
        
        // パワーアップ状態
        this.activePowerUps = [];
        this.powerUpSelectionActive = false;
        this.availablePowerUps = [];
        
        // 敵削除フラグ
        this.clearAllEnemiesRequested = false;
        
        this.generateNewPattern();
    }
    
    // 新しいウェーブパターンを生成
    generateNewPattern() {
        if (!CONFIG.LAW_OF_DISCOVERY.ENABLED) return;
        
        const patterns = CONFIG.LAW_OF_DISCOVERY.WAVE_SYSTEM.SPAWN_PATTERNS;
        this.currentPattern = randomChoice(patterns);
        this.patternProgress = 0;
        
        console.log(`Wave ${this.currentWave}: Pattern "${this.currentPattern}"`);
    }
    
    // 敵撃破時の処理
    onEnemyDestroyed() {
        if (!CONFIG.LAW_OF_DISCOVERY.ENABLED) return false;
        
        this.enemiesKilledInWave++;
        
        // ウェーブクリアチェック
        if (this.enemiesKilledInWave >= this.enemiesPerWave) {
            this.completeWave();
            return true; // ウェーブクリア
        }
        
        return false; // まだ継続中
    }
    
    // ウェーブクリア処理
    completeWave() {
        console.log(`Wave ${this.currentWave} cleared!`);
        
        // パワーアップ選択を開始
        this.startPowerUpSelection();
        
        // 残存する敵を全て削除要求
        this.clearAllEnemiesRequested = true;
    }
    
    // パワーアップ選択を開始
    startPowerUpSelection() {
        this.powerUpSelectionActive = true;
        this.availablePowerUps = this.generateRandomPowerUps();
    }
    
    // ランダムな3つのパワーアップを生成
    generateRandomPowerUps() {
        const allPowerUps = Object.keys(CONFIG.LAW_OF_DISCOVERY.POWER_UPS);
        const selected = [];
        
        while (selected.length < 3 && selected.length < allPowerUps.length) {
            const powerUp = randomChoice(allPowerUps);
            if (!selected.includes(powerUp)) {
                selected.push(powerUp);
            }
        }
        
        return selected;
    }
    
    // パワーアップを選択
    selectPowerUp(powerUpKey, player = null) {
        if (!this.powerUpSelectionActive) return;
        
        const powerUp = CONFIG.LAW_OF_DISCOVERY.POWER_UPS[powerUpKey];
        if (!powerUp) return;
        
        // パワーアップを適用
        this.activePowerUps.push(powerUpKey);
        this.applyPowerUp(powerUp);
        
        // ライフ追加の特別処理
        if (powerUp.effect === 'lives' && player) {
            player.lives += powerUp.value;
        }
        
        // ペナルティも適用
        this.applyPenalty(powerUp);
        
        // 次のウェーブへ
        this.nextWave();
    }
    
    // パワーアップ効果を適用
    applyPowerUp(powerUp) {
        switch (powerUp.effect) {
            case 'shootCooldown':
                CONFIG.SHOOT_COOLDOWN *= powerUp.value;
                CONFIG.LAW_OF_CHOICE.SHOOT_COOLDOWN_CLOSE *= powerUp.value;
                CONFIG.LAW_OF_CHOICE.SHOOT_COOLDOWN_MID *= powerUp.value;
                CONFIG.LAW_OF_CHOICE.SHOOT_COOLDOWN_FAR *= powerUp.value;
                break;
            case 'playerSpeed':
                CONFIG.PLAYER_SPEED *= powerUp.value;
                break;
            case 'lives':
                // ライフ追加はGameStateから呼び出し時に適用される
                break;
            case 'bulletDamage':
                CONFIG.BULLET_DAMAGE = (CONFIG.BULLET_DAMAGE || 1) * powerUp.value;
                break;
            case 'shotgunSpread':
                CONFIG.LAW_OF_CHOICE.SHOTGUN_SPREAD_ANGLE *= powerUp.value;
                break;
        }
    }
    
    // ペナルティを適用
    applyPenalty(powerUp) {
        switch (powerUp.penalty) {
            case 'enemySpeed':
                for (let type in CONFIG.ENEMY_TYPES) {
                    CONFIG.ENEMY_TYPES[type].speed *= powerUp.penaltyValue;
                }
                break;
            case 'enemyCount':
                CONFIG.ENEMY_SPAWN_RATE = Math.max(1, Math.floor(CONFIG.ENEMY_SPAWN_RATE / powerUp.penaltyValue));
                break;
            case 'enemyHP':
                for (let type in CONFIG.ENEMY_TYPES) {
                    CONFIG.ENEMY_TYPES[type].hp = Math.ceil(CONFIG.ENEMY_TYPES[type].hp * powerUp.penaltyValue);
                }
                break;
            case 'enemySize':
                for (let type in CONFIG.ENEMY_TYPES) {
                    CONFIG.ENEMY_TYPES[type].size *= powerUp.penaltyValue;
                }
                break;
            case 'waveEnemies':
                this.enemiesPerWave = Math.ceil(this.enemiesPerWave * powerUp.penaltyValue);
                break;
        }
    }
    
    // 次のウェーブへ進む
    nextWave() {
        this.currentWave++;
        this.enemiesKilledInWave = 0;
        this.powerUpSelectionActive = false;
        this.availablePowerUps = [];
        
        // 難易度を上昇
        this.difficultyMultiplier *= CONFIG.LAW_OF_DISCOVERY.WAVE_SYSTEM.DIFFICULTY_MULTIPLIER;
        
        // 新しいパターンを生成
        this.generateNewPattern();
    }
    
    // パターンベースの敵出現位置を取得
    getSpawnPosition() {
        if (!CONFIG.LAW_OF_DISCOVERY.ENABLED) {
            return Enemy.getRandomSpawnPosition();
        }
        
        const basePosition = this.calculatePatternPosition();
        
        // 難易度に応じてランダム性を調整
        const randomRange = Math.max(20, 80 - (this.currentWave * 5));
        
        return {
            x: basePosition.x + randomFloat(-randomRange, randomRange),
            y: basePosition.y + randomFloat(-randomRange, randomRange)
        };
    }
    
    // パターンベースの位置計算
    calculatePatternPosition() {
        const progress = this.patternProgress / this.enemiesPerWave;
        const spawnX = CONFIG.CANVAS_WIDTH + 50;
        let spawnY = CONFIG.CANVAS_HEIGHT / 2;
        
        switch (this.currentPattern) {
            case 'random':
                spawnY = randomFloat(50, CONFIG.CANVAS_HEIGHT - 50);
                break;
                
            case 'formation_v':
                // V字形成
                const vProgress = Math.abs(progress - 0.5) * 2;
                spawnY = CONFIG.CANVAS_HEIGHT * (0.2 + vProgress * 0.6);
                break;
                
            case 'formation_circle':
                // 円形成
                const angle = progress * Math.PI * 2;
                const radius = 150;
                spawnY = CONFIG.CANVAS_HEIGHT / 2 + Math.sin(angle) * radius;
                break;
                
            case 'formation_line':
                // 直線形成
                spawnY = CONFIG.CANVAS_HEIGHT * (0.2 + progress * 0.6);
                break;
                
            case 'formation_spiral':
                // スパイラル形成
                const spiralAngle = progress * Math.PI * 6;
                const spiralRadius = 100 + progress * 100;
                spawnY = CONFIG.CANVAS_HEIGHT / 2 + Math.sin(spiralAngle) * spiralRadius;
                break;
        }
        
        // 画面境界内に制限
        spawnY = Math.max(50, Math.min(CONFIG.CANVAS_HEIGHT - 50, spawnY));
        
        this.patternProgress++;
        
        return { x: spawnX, y: spawnY };
    }
    
    // パワーアップ選択画面の描画
    renderPowerUpSelection() {
        if (!this.powerUpSelectionActive) return;
        
        push();
        
        // 背景オーバーレイ
        fill(0, 0, 0, 200);
        rect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        // タイトル
        fill(255, 255, 100);
        textAlign(CENTER, CENTER);
        textSize(32);
        text(`WAVE ${this.currentWave} CLEARED!`, CONFIG.CANVAS_WIDTH / 2, 150);
        
        textSize(24);
        text("パワーアップを選択してください", CONFIG.CANVAS_WIDTH / 2, 200);
        
        // パワーアップ選択肢
        const startY = 300;
        const boxHeight = 80;
        const spacing = 120;
        
        for (let i = 0; i < this.availablePowerUps.length; i++) {
            const powerUpKey = this.availablePowerUps[i];
            const powerUp = CONFIG.LAW_OF_DISCOVERY.POWER_UPS[powerUpKey];
            const y = startY + i * spacing;
            
            // 背景ボックス
            fill(50, 50, 100, 150);
            stroke(255, 255, 255);
            strokeWeight(2);
            rect(CONFIG.CANVAS_WIDTH / 2 - 250, y - boxHeight / 2, 500, boxHeight);
            
            // パワーアップ情報
            fill(255);
            textAlign(CENTER, CENTER);
            textSize(20);
            text(powerUp.name, CONFIG.CANVAS_WIDTH / 2, y - 15);
            
            textSize(14);
            text(powerUp.description, CONFIG.CANVAS_WIDTH / 2, y + 10);
            
            // ペナルティ情報
            fill(255, 100, 100);
            textSize(12);
            text(`ペナルティ: ${this.getPenaltyDescription(powerUp)}`, CONFIG.CANVAS_WIDTH / 2, y + 25);
            
            // 選択番号
            fill(255, 255, 100);
            textSize(18);
            text(`${i + 1}`, CONFIG.CANVAS_WIDTH / 2 - 220, y);
        }
        
        // 操作説明
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(16);
        text("1, 2, 3キーで選択", CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT - 80);
        
        pop();
    }
    
    // ペナルティの説明を取得
    getPenaltyDescription(powerUp) {
        switch (powerUp.penalty) {
            case 'enemySpeed': return `敵の速度が${Math.round((powerUp.penaltyValue - 1) * 100)}%上昇`;
            case 'enemyCount': return `敵の出現頻度が${Math.round((powerUp.penaltyValue - 1) * 100)}%増加`;
            case 'enemyHP': return `敵のHPが${Math.round((powerUp.penaltyValue - 1) * 100)}%増加`;
            case 'enemySize': return `敵のサイズが${Math.round((powerUp.penaltyValue - 1) * 100)}%増加`;
            case 'waveEnemies': return `ウェーブの敵数が${Math.round((powerUp.penaltyValue - 1) * 100)}%増加`;
            default: return '不明なペナルティ';
        }
    }
    
    // キー入力処理
    handleKeyPress(key, player = null) {
        if (!this.powerUpSelectionActive) return false;
        
        const keyNum = parseInt(key);
        if (keyNum >= 1 && keyNum <= 3 && keyNum <= this.availablePowerUps.length) {
            this.selectPowerUp(this.availablePowerUps[keyNum - 1], player);
            return true; // イベントを消費
        }
        
        return false;
    }
    
    // デバッグ情報描画
    renderDebugInfo() {
        if (!CONFIG.DEBUG_MODE || !CONFIG.LAW_OF_DISCOVERY.ENABLED) return;
        
        push();
        fill(255, 255, 0);
        textAlign(LEFT, TOP);
        textSize(12);
        
        const debugY = 120;
        text(`Wave: ${this.currentWave}`, CONFIG.CANVAS_WIDTH - 120, debugY);
        text(`Pattern: ${this.currentPattern}`, CONFIG.CANVAS_WIDTH - 120, debugY + 20);
        text(`Killed: ${this.enemiesKilledInWave}/${this.enemiesPerWave}`, CONFIG.CANVAS_WIDTH - 120, debugY + 40);
        text(`Multiplier: ${this.difficultyMultiplier.toFixed(2)}`, CONFIG.CANVAS_WIDTH - 120, debugY + 60);
        text(`PowerUps: ${this.activePowerUps.length}`, CONFIG.CANVAS_WIDTH - 120, debugY + 80);
        
        pop();
    }
    
    // 敵削除要求をチェックして処理
    checkAndClearEnemies() {
        if (this.clearAllEnemiesRequested) {
            this.clearAllEnemiesRequested = false;
            return true; // 敵削除要求あり
        }
        return false;
    }
    
    // リセット
    reset() {
        this.currentWave = 1;
        this.enemiesKilledInWave = 0;
        this.enemiesPerWave = CONFIG.LAW_OF_DISCOVERY.WAVE_SYSTEM.ENEMIES_PER_WAVE;
        this.difficultyMultiplier = 1;
        this.activePowerUps = [];
        this.powerUpSelectionActive = false;
        this.availablePowerUps = [];
        this.clearAllEnemiesRequested = false;
        this.generateNewPattern();
    }
}