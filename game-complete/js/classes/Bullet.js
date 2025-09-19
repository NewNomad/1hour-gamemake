// 弾丸クラス
class Bullet extends GameObject {
    constructor(x, y, directionX = 1, directionY = 0) {
        super(x, y, CONFIG.BULLET_SIZE);
        this.vx = CONFIG.BULLET_SPEED * directionX;
        this.vy = CONFIG.BULLET_SPEED * directionY;
        
        // エフェクト用の参照
        this.effectManager = null; // GameStateから設定される
        this.lastTrailTime = 0;
    }
    
    update() {
        super.update();
        
        // 弾丸トレイルエフェクト（法則2: フィードバックループ）
        this.generateTrailEffect();
        
        // 画面外に出たら無効化
        if (this.isOffScreen()) {
            this.destroy();
        }
    }
    
    // 弾丸トレイルエフェクト生成（法則2: フィードバックループ）
    generateTrailEffect() {
        if (!CONFIG.LAW_OF_FEEDBACK.PARTICLES.ENABLED || !this.effectManager) return;
        
        const currentTime = millis();
        
        // 一定間隔でトレイルパーティクルを生成
        if (currentTime - this.lastTrailTime > 50) { // 50ms間隔
            const trailParticle = new Particle(this.x, this.y, {
                vx: randomFloat(-0.5, 0.5),
                vy: randomFloat(-0.5, 0.5),
                type: 'line',
                color: [...CONFIG.BULLET_COLOR],
                size: this.size * 0.8,
                lifetime: 150,
                fadeOut: true,
                shrink: true
            });
            
            this.effectManager.addParticle(trailParticle.x, trailParticle.y, trailParticle);
            this.lastTrailTime = currentTime;
        }
    }
    
    // 弾丸の描画
    render() {
        push();
        
        // グローエフェクト（法則2: フィードバックループ）
        if (CONFIG.LAW_OF_FEEDBACK.GLOW.ENABLED && CONFIG.LAW_OF_FEEDBACK.ENABLED) {
            this.renderGlow();
        }
        
        fill(CONFIG.BULLET_COLOR[0], CONFIG.BULLET_COLOR[1], CONFIG.BULLET_COLOR[2]);
        noStroke();
        rectMode(CENTER);
        rect(this.x, this.y, this.size, this.size);
        pop();
        
        // デバッグ情報
        this.renderDebug();
    }
    
    // 弾丸のグローエフェクト
    renderGlow() {
        const glowSize = this.size * 2;
        const glowAlpha = 100 * CONFIG.LAW_OF_FEEDBACK.GLOW.INTENSITY;
        
        for (let i = 3; i > 0; i--) {
            fill(CONFIG.BULLET_COLOR[0], CONFIG.BULLET_COLOR[1], CONFIG.BULLET_COLOR[2], glowAlpha / i);
            noStroke();
            rectMode(CENTER);
            rect(this.x, this.y, glowSize * i * 0.4, glowSize * i * 0.4);
        }
    }
    
    // 敵との当たり判定処理
    checkEnemyCollision(enemies) {
        for (let enemy of enemies) {
            if (enemy.isActive && this.collidesWith(enemy)) {
                // 命中エフェクト生成（法則2: フィードバックループ）
                this.generateHitEffect(enemy);
                
                // 弾丸を無効化
                this.destroy();
                return enemy; // 衝突した敵を返す
            }
        }
        return null;
    }
    
    // 命中時のエフェクト生成
    generateHitEffect(enemy) {
        if (!CONFIG.LAW_OF_FEEDBACK.PARTICLES.ENABLED || !this.effectManager) return;
        
        // ヒットエフェクト
        this.effectManager.createHitEffect(this.x, this.y, enemy.color || [255, 255, 100]);
        
        // より詳細なスパークエフェクト
        const sparkCount = 6;
        for (let i = 0; i < sparkCount; i++) {
            const angle = (i / sparkCount) * Math.PI * 2;
            const speed = randomFloat(2, 4);
            
            const sparkParticle = new Particle(this.x, this.y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                type: 'spark',
                color: [255, 255, 200],
                size: randomFloat(1, 3),
                lifetime: randomFloat(200, 400),
                glow: true,
                fadeOut: true
            });
            
            this.effectManager.addParticle(sparkParticle.x, sparkParticle.y, sparkParticle);
        }
    }
}