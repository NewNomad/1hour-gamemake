// プレイヤークラス
class Player extends GameObject {
    constructor(x, y) {
        super(x, y, CONFIG.PLAYER_SIZE);
        this.lives = CONFIG.INITIAL_LIVES;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.invulnerabilityDuration = 2000; // 2秒間無敵
    }
    
    update() {
        this.handleInput();
        this.constrainToBounds();
        this.updateInvulnerability();
        
        super.update();
    }
    
    // 入力処理（WASD + 矢印キー）
    handleInput() {
        this.vx = 0;
        this.vy = 0;
        
        // 水平移動
        if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // A
            this.vx = -CONFIG.PLAYER_SPEED;
        }
        if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // D
            this.vx = CONFIG.PLAYER_SPEED;
        }
        
        // 垂直移動
        if (keyIsDown(UP_ARROW) || keyIsDown(87)) { // W
            this.vy = -CONFIG.PLAYER_SPEED;
        }
        if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) { // S
            this.vy = CONFIG.PLAYER_SPEED;
        }
        
        // 斜め移動の補正（同じ速度を保つ）
        if (this.vx !== 0 && this.vy !== 0) {
            this.vx *= 0.707; // 1/√2
            this.vy *= 0.707;
        }
    }
    
    // 画面境界制約
    constrainToBounds() {
        const halfSize = this.size / 2;
        
        if (this.x - halfSize < 0) {
            this.x = halfSize;
            this.vx = 0;
        }
        if (this.x + halfSize > CONFIG.CANVAS_WIDTH) {
            this.x = CONFIG.CANVAS_WIDTH - halfSize;
            this.vx = 0;
        }
        if (this.y - halfSize < 0) {
            this.y = halfSize;
            this.vy = 0;
        }
        if (this.y + halfSize > CONFIG.CANVAS_HEIGHT) {
            this.y = CONFIG.CANVAS_HEIGHT - halfSize;
            this.vy = 0;
        }
    }
    
    // 無敵時間の管理
    updateInvulnerability() {
        if (this.invulnerable) {
            if (millis() - this.invulnerabilityTime > this.invulnerabilityDuration) {
                this.invulnerable = false;
            }
        }
    }
    
    // ダメージを受ける
    takeDamage() {
        if (this.invulnerable || CONFIG.GOD_MODE) return false;
        
        this.lives--;
        this.invulnerable = true;
        this.invulnerabilityTime = millis();
        
        return true;
    }
    
    // 敵との最短距離を計算
    getClosestEnemyDistance(enemies) {
        if (enemies.length === 0) return Infinity;
        
        let minDistance = Infinity;
        for (let enemy of enemies) {
            if (enemy.isActive) {
                const distance = this.distanceTo(enemy);
                minDistance = Math.min(minDistance, distance);
            }
        }
        return minDistance;
    }
    
    // プレイヤーの描画
    render() {
        push();
        
        // 無敵時間中は点滅
        if (this.invulnerable && Math.floor(millis() / 100) % 2 === 0) {
            fill(CONFIG.PLAYER_COLOR[0], CONFIG.PLAYER_COLOR[1], CONFIG.PLAYER_COLOR[2], 128);
        } else {
            fill(CONFIG.PLAYER_COLOR[0], CONFIG.PLAYER_COLOR[1], CONFIG.PLAYER_COLOR[2]);
        }
        
        noStroke();
        rectMode(CENTER);
        rect(this.x, this.y, this.size, this.size);
        
        // 移動方向インジケーター
        if (this.vx !== 0 || this.vy !== 0) {
            stroke(255);
            strokeWeight(2);
            const arrowLength = this.size * 0.8;
            const endX = this.x + (this.vx / CONFIG.PLAYER_SPEED) * arrowLength;
            const endY = this.y + (this.vy / CONFIG.PLAYER_SPEED) * arrowLength;
            line(this.x, this.y, endX, endY);
        }
        
        pop();
        
        // デバッグ情報
        this.renderDebug();
    }
    
    // ゲームオーバーチェック
    isDead() {
        return this.lives <= 0;
    }
    
    // リセット（新しいゲーム用）
    reset() {
        this.x = CONFIG.CANVAS_WIDTH / 2;
        this.y = CONFIG.CANVAS_HEIGHT / 2;
        this.lives = CONFIG.INITIAL_LIVES;
        this.invulnerable = false;
        this.vx = 0;
        this.vy = 0;
    }
}