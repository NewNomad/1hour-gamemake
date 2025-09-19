// 弾丸クラス
class Bullet extends GameObject {
    constructor(x, y, directionX = 1, directionY = 0) {
        super(x, y, CONFIG.BULLET_SIZE);
        this.vx = CONFIG.BULLET_SPEED * directionX;
        this.vy = CONFIG.BULLET_SPEED * directionY;
    }
    
    update() {
        super.update();
        
        // 画面外に出たら無効化
        if (this.isOffScreen()) {
            this.destroy();
        }
    }
    
    // 弾丸の描画
    render() {
        push();
        fill(CONFIG.BULLET_COLOR[0], CONFIG.BULLET_COLOR[1], CONFIG.BULLET_COLOR[2]);
        noStroke();
        rectMode(CENTER);
        rect(this.x, this.y, this.size, this.size);
        pop();
        
        // デバッグ情報
        this.renderDebug();
    }
    
    // 敵との当たり判定処理
    checkEnemyCollision(enemies) {
        for (let enemy of enemies) {
            if (enemy.isActive && this.collidesWith(enemy)) {
                // 弾丸を無効化
                this.destroy();
                return enemy; // 衝突した敵を返す
            }
        }
        return null;
    }
}