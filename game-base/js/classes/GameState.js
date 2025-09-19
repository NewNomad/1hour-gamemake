// ゲーム状態管理クラス
class GameState {
    constructor() {
        this.state = 'MENU'; // MENU, PLAYING, GAME_OVER, PAUSED
        this.player = null;
        this.enemies = [];
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
        
        this.init();
    }
    
    // 初期化
    init() {
        this.player = new Player(CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2);
        this.enemies = [];
        this.score = 0;
        this.enemySpawnTimer = 0;
        this.resetStats();
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
        
        // プレイヤー更新
        this.player.update();
        
        // 敵の出現
        this.spawnEnemies();
        
        // 敵の更新
        this.updateEnemies();
        
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
        this.enemySpawnTimer++;
        
        if (this.enemySpawnTimer >= CONFIG.ENEMY_SPAWN_RATE) {
            this.enemySpawnTimer = 0;
            
            const spawnPos = Enemy.getRandomSpawnPosition();
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
        if (enemy.isActive) {
            this.score += enemy.scoreValue;
            this.stats.enemiesDestroyed++;
            this.stats.currentCombo++;
            this.stats.maxCombo = Math.max(this.stats.maxCombo, this.stats.currentCombo);
            enemy.destroy();
        }
    }
    
    // 無効なオブジェクトの削除
    cleanupObjects() {
        this.enemies = this.enemies.filter(enemy => enemy.isActive);
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
        text("Dキーでデバッグモード切り替え", CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 + 80);
        pop();
    }
    
    // ゲーム画面描画
    renderGame() {
        // プレイヤー描画
        this.player.render();
        
        // 敵描画
        for (let enemy of this.enemies) {
            if (enemy.isActive) {
                enemy.render();
            }
        }
        
        // UI描画
        this.renderUI();
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
        
        if (this.stats.currentCombo > 0) {
            text(`コンボ: ${this.stats.currentCombo}`, 20, 140);
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
        text(`プレイヤー位置: (${this.player.x.toFixed(0)}, ${this.player.y.toFixed(0)})`, CONFIG.CANVAS_WIDTH - 120, 60);
        text(`無敵: ${this.player.invulnerable}`, CONFIG.CANVAS_WIDTH - 120, 80);
        
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
        if (key === 'd' || key === 'D') {
            toggleDebug();
        }
    }
}