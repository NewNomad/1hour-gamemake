// すべてのゲームオブジェクトの基底クラス
class GameObject {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.vx = 0; // x方向の速度
        this.vy = 0; // y方向の速度
        this.isActive = true; // オブジェクトが有効かどうか
        this.created = millis(); // 作成時刻
    }
    
    // 位置を更新（継承先でオーバーライド）
    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
    
    // 描画（継承先でオーバーライド）
    render() {
        // 基本的な矩形描画
        push();
        fill(255);
        noStroke();
        rectMode(CENTER);
        rect(this.x, this.y, this.size, this.size);
        pop();
    }
    
    // 当たり判定用の矩形を取得
    getBounds() {
        return {
            left: this.x - this.size / 2,
            right: this.x + this.size / 2,
            top: this.y - this.size / 2,
            bottom: this.y + this.size / 2
        };
    }
    
    // 画面外にいるかチェック
    isOffScreen() {
        const margin = this.size;
        return (
            this.x < -margin ||
            this.x > CONFIG.CANVAS_WIDTH + margin ||
            this.y < -margin ||
            this.y > CONFIG.CANVAS_HEIGHT + margin
        );
    }
    
    // オブジェクトを無効化
    destroy() {
        this.isActive = false;
    }
    
    // 別のオブジェクトとの当たり判定
    collidesWith(other) {
        const bounds1 = this.getBounds();
        const bounds2 = other.getBounds();
        
        return !(
            bounds1.right < bounds2.left ||
            bounds1.left > bounds2.right ||
            bounds1.bottom < bounds2.top ||
            bounds1.top > bounds2.bottom
        );
    }
    
    // オブジェクトの中心からの距離を計算
    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // デバッグ情報の描画
    renderDebug() {
        if (CONFIG.SHOW_HITBOXES) {
            push();
            stroke(255, 255, 0);
            strokeWeight(1);
            noFill();
            rectMode(CENTER);
            rect(this.x, this.y, this.size, this.size);
            pop();
        }
    }
    
    // 存在時間を取得（ミリ秒）
    getAge() {
        return millis() - this.created;
    }
}