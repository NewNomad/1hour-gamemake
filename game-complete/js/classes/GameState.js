// ゲーム状態管理クラス
class GameState {
    constructor() {
        this.state = 'MENU'; // MENU, PLAYING, GAME_OVER, PAUSED
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.score = 0;
        this.enemySpawnTimer = 0;
        this.gameStartTime = 0;
        this.gameTime = 0;
        
        // 統計
        this.stats = {
            enemiesDestroyed: 0,
            timeSurvived: 0,
            totalDamage: 0,
            maxCombo: 0,
            currentCombo: 0
        };
        
        // エフェクトシステム（法則2: フィードバックループ）
        this.effectManager = new EffectManager();
        this.visualFeedback = new VisualFeedback();
        
        // パララックス背景システム
        this.background = new Background();
        
        // 発見システム（法則3: 発見の喜び）
        this.discoverySystem = new DiscoverySystem();
        
        this.init();
    }
    
    // 初期化
    init() {
        this.player = new Player(CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2);
        this.player.effectManager = this.effectManager; // エフェクトマネージャーへの参照を渡す
        this.enemies = [];
        this.bullets = [];
        this.score = 0;
        this.enemySpawnTimer = 25; // ゲーム開始から5フレーム後に最初の敵が出現
        this.resetStats();
        
        // エフェクトシステムをリセット
        this.effectManager.clearAllEffects();
        this.visualFeedback.resetAllEffects();
        
        // 背景システムをリセット
        this.background.reset();
        
        // 発見システムをリセット（法則3: 発見の喜び）
        this.discoverySystem.reset();
    }
    
    // ゲーム開始
    startGame() {
        this.state = 'PLAYING';
        this.gameStartTime = millis();
        this.init();
    }
    
    // ゲーム終了
    endGame() {
        this.state = 'GAME_OVER';
        this.stats.timeSurvived = this.gameTime;
    }
    
    // ゲームリセット
    resetGame() {
        this.state = 'MENU';
        this.init();
    }
    
    // ゲーム一時停止切り替え
    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
        }
    }
    
    // メインアップデートループ
    update() {
        if (this.state === 'PLAYING') {
            this.updateGame();
        }
    }
    
    // ゲームプレイ中のアップデート
    updateGame() {
        this.gameTime = (millis() - this.gameStartTime) / 1000;
        
        // エフェクトシステム更新（法則2: フィードバックループ）
        this.effectManager.update();
        this.visualFeedback.update();
        
        // 背景システム更新（ハイブリッドパララックス効果）
        this.background.updatePlayerPosition(this.player.y);
        this.background.update();
        
        // プレイヤー更新
        this.player.update();
        
        // 敵の出現
        this.spawnEnemies();
        
        // 敵の更新
        this.updateEnemies();
        
        // 弾丸の更新
        this.updateBullets();
        
        // 当たり判定
        this.checkCollisions();
        
        // 無効なオブジェクトを削除
        this.cleanupObjects();
        
        // ゲームオーバーチェック
        if (this.player.isDead()) {
            this.endGame();
        }
    }
    
    // 敵の出現処理
    spawnEnemies() {
        // パワーアップ選択中は敵を生成しない（法則3: 発見の喜び）
        if (CONFIG.LAW_OF_DISCOVERY.ENABLED && this.discoverySystem.powerUpSelectionActive) {
            return;
        }
        
        this.enemySpawnTimer++;
        
        if (this.enemySpawnTimer >= CONFIG.ENEMY_SPAWN_RATE) {
            this.enemySpawnTimer = 0;
            
            // 発見システムによる出現位置の決定（法則3: 発見の喜び）
            const spawnPos = CONFIG.LAW_OF_DISCOVERY.ENABLED ? 
                this.discoverySystem.getSpawnPosition() : 
                Enemy.getRandomSpawnPosition();
                
            const enemyType = Enemy.getRandomType();
            const enemy = new Enemy(spawnPos.x, spawnPos.y, enemyType);
            
            this.enemies.push(enemy);
        }
    }
    
    // 敵の更新
    updateEnemies() {
        for (let enemy of this.enemies) {
            if (enemy.isActive) {
                enemy.update();
            }
        }
    }
    
    // 弾丸の更新
    updateBullets() {
        for (let bullet of this.bullets) {
            if (bullet.isActive) {
                bullet.update();
                
                // 弾丸と敵の当たり判定
                const hitEnemy = bullet.checkEnemyCollision(this.enemies);
                if (hitEnemy) {
                    // 敵が破壊された場合のみdestroyEnemyを呼ぶ
                    this.destroyEnemy(hitEnemy);
                }
            }
        }
    }
    
    // 弾丸発射
    shootBullet() {
        const bullets = this.player.shoot(this.enemies);
        if (bullets) {
            // 配列の場合は全ての弾を追加
            if (Array.isArray(bullets)) {
                // エフェクトマネージャーへの参照を設定
                bullets.forEach(bullet => {
                    bullet.effectManager = this.effectManager;
                });
                this.bullets.push(...bullets);
                
                // 射撃エフェクト（法則2: フィードバックループ）
                if (CONFIG.LAW_OF_FEEDBACK.ENABLED && bullets.length > 0) {
                    const shootX = bullets[0].x - 10; // 銃口位置
                    const shootY = bullets[0].y;
                    this.effectManager.createMuzzleFlash(shootX, shootY, { x: 1, y: 0 });
                }
            } else {
                // 単発の場合（後方互換性）
                bullets.effectManager = this.effectManager;
                this.bullets.push(bullets);
                
                // 射撃エフェクト
                if (CONFIG.LAW_OF_FEEDBACK.ENABLED) {
                    const shootX = bullets.x - 10;
                    const shootY = bullets.y;
                    this.effectManager.createMuzzleFlash(shootX, shootY, { x: 1, y: 0 });
                }
            }
        }
    }
    
    // 当たり判定処理
    checkCollisions() {
        for (let enemy of this.enemies) {
            if (enemy.isActive && this.player.collidesWith(enemy)) {
                if (this.player.takeDamage()) {
                    // プレイヤーがダメージを受けた場合
                    enemy.destroy();
                    this.stats.currentCombo = 0;
                }
            }
        }
    }
    
    // 敵を破壊（外部から呼び出し用）
    destroyEnemy(enemy) {
        if (enemy && enemy.isActive) {
            this.score += enemy.scoreValue;
            this.stats.enemiesDestroyed++;
            this.stats.currentCombo++;
            this.stats.maxCombo = Math.max(this.stats.maxCombo, this.stats.currentCombo);
            
            // 発見システムに敵撃破を通知（法則3: 発見の喜び）
            if (CONFIG.LAW_OF_DISCOVERY.ENABLED) {
                const waveCleared = this.discoverySystem.onEnemyDestroyed();
                if (waveCleared) {
                    // ウェーブクリア時のエフェクト
                    this.effectManager.createExplosion(
                        CONFIG.CANVAS_WIDTH / 2, 
                        CONFIG.CANVAS_HEIGHT / 2, 
                        3, 
                        [255, 255, 100]
                    );
                }
            }
            
            // エフェクト生成（法則2: フィードバックループ）
            if (CONFIG.LAW_OF_FEEDBACK.ENABLED) {
                // 爆発エフェクト
                const intensity = Math.min(this.stats.currentCombo / 5, 2);
                this.effectManager.createExplosion(enemy.x, enemy.y, intensity, enemy.color || [255, 100, 100]);
                
                // コンボエフェクト
                if (this.stats.currentCombo > 1) {
                    this.effectManager.createComboEffect(enemy.x, enemy.y, this.stats.currentCombo);
                    this.visualFeedback.triggerHitStop(this.stats.currentCombo);
                }
            }
            
            enemy.destroy();
        }
    }
    
    // 無効なオブジェクトの削除
    cleanupObjects() {
        this.enemies = this.enemies.filter(enemy => enemy.isActive);
        this.bullets = this.bullets.filter(bullet => bullet.isActive);
    }
    
    // 描画処理
    render() {
        background(20, 20, 30);
        
        switch (this.state) {
            case 'MENU':
                this.renderMenu();
                break;
            case 'PLAYING':
                this.renderGame();
                break;
            case 'PAUSED':
                this.renderGame();
                this.renderPauseOverlay();
                break;
            case 'GAME_OVER':
                this.renderGame();
                this.renderGameOver();
                break;
        }
        
        // デバッグ情報
        if (CONFIG.DEBUG_MODE) {
            this.renderDebugInfo();
        }
    }
    
    // メニュー画面描画
    renderMenu() {
        push();
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(48);
        text("GAME BASE", CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 - 100);
        
        textSize(24);
        text("スペースキーでゲーム開始", CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2);
        text("WASD または 矢印キーで移動", CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 + 40);
        text("スペースキーで射撃", CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 + 80);
        text("`キーでデバッグモード切り替え", CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 + 120);
        pop();
    }
    
    // ゲーム画面描画
    renderGame() {
        // 背景描画（最下層）
        this.background.render();
        
        // ビジュアルフィードバック前処理（カメラ変換など）
        this.visualFeedback.applyPreRenderTransforms();
        
        // プレイヤー描画（敵の情報も渡す）
        this.player.render(this.enemies);
        
        // 敵描画
        for (let enemy of this.enemies) {
            if (enemy.isActive) {
                enemy.render();
            }
        }
        
        // 弾丸描画
        for (let bullet of this.bullets) {
            if (bullet.isActive) {
                bullet.render();
            }
        }
        
        // エフェクト描画（法則2: フィードバックループ）
        this.effectManager.render();
        
        // ビジュアルフィードバック後処理（ポストエフェクトなど）
        this.visualFeedback.applyPostRenderEffects();
        
        // UI描画
        this.renderUI();
        
        // 発見システムの描画（法則3: 発見の喜び）
        if (CONFIG.LAW_OF_DISCOVERY.ENABLED) {
            this.discoverySystem.renderPowerUpSelection();
        }
    }
    
    // UI描画
    renderUI() {
        push();
        fill(255);
        textAlign(LEFT, TOP);
        textSize(20);
        
        // スコアと統計
        text(`スコア: ${this.score}`, 20, 20);
        text(`ライフ: ${this.player.lives}`, 20, 50);
        text(`時間: ${this.gameTime.toFixed(1)}s`, 20, 80);
        text(`敵撃破: ${this.stats.enemiesDestroyed}`, 20, 110);
        
        // ウェーブ情報（法則3: 発見の喜び）
        if (CONFIG.LAW_OF_DISCOVERY.ENABLED) {
            text(`ウェーブ: ${this.discoverySystem.currentWave}`, 20, 140);
            text(`残り敵: ${this.discoverySystem.enemiesPerWave - this.discoverySystem.enemiesKilledInWave}`, 20, 170);
        }
        
        // コンボカウンター（法則2: フィードバックループで強化）
        if (this.stats.currentCombo > 0) {
            this.renderComboCounter();
        }
        
        pop();
    }
    
    // コンボカウンター描画（法則2: フィードバックループ）
    renderComboCounter() {
        // ウェーブ情報がある場合はY位置を調整
        const comboY = CONFIG.LAW_OF_DISCOVERY.ENABLED ? 200 : 140;
        
        if (!CONFIG.LAW_OF_FEEDBACK.COMBO_EFFECTS.ENABLED) {
            // 通常のコンボ表示
            text(`コンボ: ${this.stats.currentCombo}`, 20, comboY);
            return;
        }
        
        push();
        
        // コンボ数に応じた視覚効果
        const comboIntensity = Math.min(this.stats.currentCombo / 10, 2);
        const pulsePhase = millis() * 0.01 * CONFIG.LAW_OF_FEEDBACK.COMBO_EFFECTS.PULSE_FREQUENCY;
        const pulseFactor = 1 + Math.sin(pulsePhase) * 0.05 * comboIntensity;
        
        // 位置とサイズ
        const x = 20;
        const y = comboY;
        const baseSize = 20;
        const currentSize = baseSize * pulseFactor * CONFIG.LAW_OF_FEEDBACK.COMBO_EFFECTS.SCALE_BOOST;
        
        // グロー効果
        if (CONFIG.LAW_OF_FEEDBACK.GLOW.ENABLED) {
            const glowIntensity = comboIntensity * 0.5;
            for (let i = 3; i > 0; i--) {
                fill(255, 255 - this.stats.currentCombo * 10, 100, glowIntensity * 50 / i);
                textSize(currentSize * (1 + i * 0.1));
                text(`コンボ: ${this.stats.currentCombo}`, x, y);
            }
        }
        
        // メインテキスト
        fill(
            255,
            Math.max(255 - this.stats.currentCombo * 15, 50),
            Math.max(100 + this.stats.currentCombo * 10, 255),
            255
        );
        textSize(currentSize);
        textAlign(LEFT, TOP);
        text(`コンボ: ${this.stats.currentCombo}`, x, y);
        
        // 高コンボ時の追加エフェクト
        if (this.stats.currentCombo >= 5) {
            fill(255, 255, 255, Math.sin(pulsePhase * 2) * 100 + 100);
            textSize(12);
            text('EXCELLENT!', x + 120, y);
        }
        
        if (this.stats.currentCombo >= 10) {
            fill(255, 200, 0, Math.sin(pulsePhase * 3) * 150 + 100);
            textSize(14);
            text('AMAZING!', x + 120, y + 20);
        }
        
        pop();
    }
    
    // 一時停止オーバーレイ
    renderPauseOverlay() {
        push();
        fill(0, 0, 0, 128);
        rect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(48);
        text("PAUSED", CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2);
        text("Pキーで再開", CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 + 60);
        pop();
    }
    
    // ゲームオーバー画面
    renderGameOver() {
        push();
        fill(0, 0, 0, 200);
        rect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        fill(255, 100, 100);
        textAlign(CENTER, CENTER);
        textSize(48);
        text("GAME OVER", CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 - 100);
        
        fill(255);
        textSize(24);
        text(`最終スコア: ${this.score}`, CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 - 40);
        text(`生存時間: ${this.stats.timeSurvived.toFixed(1)}秒`, CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 - 10);
        text(`敵撃破数: ${this.stats.enemiesDestroyed}`, CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 + 20);
        text(`最大コンボ: ${this.stats.maxCombo}`, CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 + 50);
        
        textSize(20);
        text("Rキーでリスタート", CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 + 100);
        pop();
    }
    
    // デバッグ情報描画
    renderDebugInfo() {
        push();
        fill(255, 255, 0);
        textAlign(LEFT, TOP);
        textSize(12);
        
        text(`FPS: ${frameRate().toFixed(1)}`, CONFIG.CANVAS_WIDTH - 120, 20);
        text(`敵の数: ${this.enemies.length}`, CONFIG.CANVAS_WIDTH - 120, 40);
        text(`弾丸の数: ${this.bullets.length}`, CONFIG.CANVAS_WIDTH - 120, 60);
        text(`プレイヤー位置: (${this.player.x.toFixed(0)}, ${this.player.y.toFixed(0)})`, CONFIG.CANVAS_WIDTH - 120, 80);
        text(`無敵: ${this.player.invulnerable}`, CONFIG.CANVAS_WIDTH - 120, 100);
        
        // エフェクトシステムのデバッグ情報
        this.effectManager.renderDebugInfo();
        this.visualFeedback.renderDebugInfo();
        
        // 背景システムのデバッグ情報
        this.background.renderDebugInfo();
        
        // 発見システムのデバッグ情報（法則3: 発見の喜び）
        if (CONFIG.LAW_OF_DISCOVERY.ENABLED) {
            this.discoverySystem.renderDebugInfo();
        }
        
        pop();
    }
    
    // 統計リセット
    resetStats() {
        this.stats = {
            enemiesDestroyed: 0,
            timeSurvived: 0,
            totalDamage: 0,
            maxCombo: 0,
            currentCombo: 0
        };
    }
    
    // キー入力処理
    handleKeyPress(key) {
        // 発見システムのキー入力を優先処理（法則3: 発見の喜び）
        if (CONFIG.LAW_OF_DISCOVERY.ENABLED && this.discoverySystem.handleKeyPress(key, this.player)) {
            return; // イベントが消費された場合は他の処理をスキップ
        }
        
        switch (this.state) {
            case 'MENU':
                if (key === ' ') {
                    this.startGame();
                }
                break;
            case 'PLAYING':
                if (key === 'p' || key === 'P') {
                    this.togglePause();
                }
                break;
            case 'PAUSED':
                if (key === 'p' || key === 'P') {
                    this.togglePause();
                }
                break;
            case 'GAME_OVER':
                if (key === 'r' || key === 'R') {
                    this.resetGame();
                }
                break;
        }
        
        // 全状態共通
        if (key === '`') {
            toggleDebug();
        }
    }
}