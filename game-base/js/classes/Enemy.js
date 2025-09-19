// 敵クラス
class Enemy extends GameObject {
    constructor(x, y, type = 'BASIC') {
        const typeConfig = CONFIG.ENEMY_TYPES[type];
        super(x, y, typeConfig.size);
        
        this.type = type;
        this.speed = typeConfig.speed;
        this.color = typeConfig.color;
        this.hp = typeConfig.hp;
        this.maxHp = typeConfig.hp;
        this.scoreValue = typeConfig.score;
        
        this.movementPattern = this.getRandomMovementPattern();
        this.startY = y;
        this.waveOffset = random(TWO_PI);
        
        // 基本的に左に移動
        this.vx = -this.speed;
    }
    
    // ランダムな移動パターンを選択
    getRandomMovementPattern() {
        const patterns = ['straight', 'wave', 'sine'];
        return random(patterns);
    }
    
    update() {
        this.updateMovement();
        super.update();
        
        // 画面外に出たら無効化
        if (this.isOffScreen()) {
            this.destroy();
        }
    }
    
    // 移動パターンの更新
    updateMovement() {
        switch (this.movementPattern) {
            case 'straight':
                this.updateStraightMovement();
                break;
            case 'wave':
                this.updateWaveMovement();
                break;
            case 'sine':
                this.updateSineMovement();
                break;
        }
    }
    
    // 直進移動
    updateStraightMovement() {
        this.vx = -this.speed;
        this.vy = 0;
    }
    
    // 波状移動
    updateWaveMovement() {
        this.vx = -this.speed;
        this.vy = sin(this.getAge() * 0.01 + this.waveOffset) * 2;
    }
    
    // サイン波移動
    updateSineMovement() {
        this.vx = -this.speed * 0.8;
        this.vy = sin(this.x * 0.02 + this.waveOffset) * 1.5;
    }
    
    // ダメージを受ける
    takeDamage(damage = 1) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.destroy();
            return true; // 破壊された
        }
        return false; // まだ生きている
    }
    
    // 敵の描画
    render() {
        push();
        
        // HPに応じて色の透明度を変更
        const alpha = map(this.hp, 0, this.maxHp, 100, 255);
        fill(this.color[0], this.color[1], this.color[2], alpha);
        
        // 敵のタイプに応じて形状を変更
        noStroke();
        rectMode(CENTER);
        
        if (this.type === 'BASIC') {
            rect(this.x, this.y, this.size, this.size);
        } else if (this.type === 'FAST') {
            // 三角形
            triangle(
                this.x - this.size/2, this.y + this.size/2,
                this.x + this.size/2, this.y + this.size/2,
                this.x, this.y - this.size/2
            );
        } else if (this.type === 'TANK') {
            // 大きな円
            ellipse(this.x, this.y, this.size, this.size);
        }
        
        // HPが複数ある場合、HPバーを表示
        if (this.maxHp > 1) {
            this.renderHealthBar();
        }
        
        pop();
        
        // デバッグ情報
        this.renderDebug();
    }
    
    // HPバーの描画
    renderHealthBar() {
        const barWidth = this.size;
        const barHeight = 4;
        const barY = this.y - this.size/2 - 8;
        
        // 背景
        fill(100);
        rect(this.x, barY, barWidth, barHeight);
        
        // HP
        fill(255, 100, 100);
        const hpWidth = map(this.hp, 0, this.maxHp, 0, barWidth);
        rect(this.x - barWidth/2 + hpWidth/2, barY, hpWidth, barHeight);
    }
    
    // 敵の生成位置をランダムに決定
    static getRandomSpawnPosition() {
        return {
            x: CONFIG.CANVAS_WIDTH + 50, // 画面右端から少し外側
            y: random(50, CONFIG.CANVAS_HEIGHT - 50)
        };
    }
    
    // ランダムな敵タイプを選択
    static getRandomType() {
        const types = Object.keys(CONFIG.ENEMY_TYPES);
        const weights = [0.6, 0.3, 0.1]; // BASIC, FAST, TANKの出現確率
        
        const rand = random();
        let weightSum = 0;
        
        for (let i = 0; i < types.length; i++) {
            weightSum += weights[i];
            if (rand < weightSum) {
                return types[i];
            }
        }
        
        return 'BASIC';
    }
    
    // プレイヤーとの距離を取得
    getDistanceToPlayer(player) {
        return this.distanceTo(player);
    }
}