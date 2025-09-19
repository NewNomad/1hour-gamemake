// パーティクルクラス - 個々のパーティクルエフェクト
class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        
        // デフォルト設定
        this.vx = options.vx || randomFloat(-2, 2);
        this.vy = options.vy || randomFloat(-2, 2);
        this.acceleration = options.acceleration || { x: 0, y: 0 };
        this.friction = options.friction || 0.98;
        this.gravity = options.gravity || 0.05;
        
        // ライフサイクル
        this.lifetime = options.lifetime || 500; // ミリ秒
        this.maxLifetime = this.lifetime;
        this.createdAt = millis();
        this.isActive = true;
        
        // 視覚属性
        this.size = options.size || 4;
        this.startSize = this.size;
        this.endSize = options.endSize || 0;
        this.color = options.color || [255, 255, 255];
        this.alpha = options.alpha || 255;
        this.startAlpha = this.alpha;
        
        // エフェクト設定
        this.type = options.type || 'default';
        this.fadeOut = options.fadeOut !== false; // デフォルトでフェードアウト
        this.shrink = options.shrink !== false;   // デフォルトで縮小
        this.glow = options.glow || false;
        
        // 物理設定
        this.bounce = options.bounce || 0;
        this.bounceDecay = options.bounceDecay || 0.8;
        this.minBounceVelocity = options.minBounceVelocity || 0.5;
    }
    
    update() {
        if (!this.isActive) return;
        
        // 時間経過チェック
        const currentTime = millis();
        const elapsed = currentTime - this.createdAt;
        
        if (elapsed >= this.maxLifetime) {
            this.destroy();
            return;
        }
        
        // ライフタイム進行度（0-1）
        const progress = elapsed / this.maxLifetime;
        
        // 物理更新
        this.updatePhysics();
        
        // 視覚更新
        this.updateVisuals(progress);
        
        // 境界チェック
        this.checkBounds();
    }
    
    updatePhysics() {
        // 加速度適用
        this.vx += this.acceleration.x;
        this.vy += this.acceleration.y;
        
        // 重力適用
        this.vy += this.gravity;
        
        // 摩擦適用
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        // 位置更新
        this.x += this.vx;
        this.y += this.vy;
    }
    
    updateVisuals(progress) {
        // アルファフェード
        if (this.fadeOut) {
            this.alpha = this.startAlpha * (1 - progress);
        }
        
        // サイズ変化
        if (this.shrink) {
            this.size = lerp(this.startSize, this.endSize, progress);
        }
        
        // タイプ別の特殊エフェクト
        this.updateTypeSpecificEffects(progress);
    }
    
    updateTypeSpecificEffects(progress) {
        switch (this.type) {
            case 'explosion':
                // 爆発パーティクル: 初期は大きく、急速に縮小
                this.size = this.startSize * (1 - progress * progress);
                break;
                
            case 'trail':
                // 軌跡パーティクル: 徐々に薄く長く
                this.size = this.startSize * (1 - progress * 0.5);
                break;
                
            case 'spark':
                // 火花パーティクル: ランダムな明滅
                if (Math.random() < 0.1) {
                    this.alpha *= randomFloat(0.5, 1.5);
                }
                break;
                
            case 'smoke':
                // 煙パーティクル: 上昇しながら拡散
                this.vy -= 0.02;
                this.size = this.startSize * (1 + progress * 0.5);
                break;
        }
    }
    
    checkBounds() {
        // 画面境界でのバウンス処理
        if (this.bounce > 0) {
            let bounced = false;
            
            if (this.x <= 0 || this.x >= CONFIG.CANVAS_WIDTH) {
                this.vx *= -this.bounce;
                this.x = clamp(this.x, 0, CONFIG.CANVAS_WIDTH);
                bounced = true;
            }
            
            if (this.y <= 0 || this.y >= CONFIG.CANVAS_HEIGHT) {
                this.vy *= -this.bounce;
                this.y = clamp(this.y, 0, CONFIG.CANVAS_HEIGHT);
                bounced = true;
            }
            
            // バウンス減衰
            if (bounced) {
                this.bounce *= this.bounceDecay;
                if (this.bounce < 0.1) this.bounce = 0;
                
                // 低速度時はバウンス停止
                if (Math.abs(this.vx) < this.minBounceVelocity) this.vx = 0;
                if (Math.abs(this.vy) < this.minBounceVelocity) this.vy = 0;
            }
        } else {
            // バウンスしない場合は画面外で削除
            if (this.x < -50 || this.x > CONFIG.CANVAS_WIDTH + 50 ||
                this.y < -50 || this.y > CONFIG.CANVAS_HEIGHT + 50) {
                this.destroy();
            }
        }
    }
    
    render() {
        if (!this.isActive || this.alpha <= 0 || this.size <= 0) return;
        
        push();
        
        // グローエフェクト
        if (this.glow && CONFIG.LAW_OF_FEEDBACK.GLOW.ENABLED) {
            this.renderGlow();
        }
        
        // メインパーティクル描画
        this.renderParticle();
        
        pop();
    }
    
    renderParticle() {
        // 基本設定
        fill(this.color[0], this.color[1], this.color[2], this.alpha);
        noStroke();
        
        // タイプ別描画
        switch (this.type) {
            case 'circle':
            default:
                ellipse(this.x, this.y, this.size, this.size);
                break;
                
            case 'square':
                rectMode(CENTER);
                rect(this.x, this.y, this.size, this.size);
                break;
                
            case 'line':
                stroke(this.color[0], this.color[1], this.color[2], this.alpha);
                strokeWeight(this.size / 2);
                line(this.x - this.vx * 2, this.y - this.vy * 2, this.x, this.y);
                break;
                
            case 'star':
                this.renderStar();
                break;
        }
    }
    
    renderGlow() {
        // 簡易グローエフェクト（Canvas 2D制限内で）
        const glowRadius = this.size * 2;
        const glowAlpha = this.alpha * 0.3;
        
        for (let i = 3; i > 0; i--) {
            fill(this.color[0], this.color[1], this.color[2], glowAlpha / i);
            ellipse(this.x, this.y, this.size * i, this.size * i);
        }
    }
    
    renderStar() {
        // 星形パーティクル描画
        const spikes = 5;
        const outerRadius = this.size;
        const innerRadius = this.size * 0.4;
        
        beginShape();
        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i * Math.PI) / spikes;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = this.x + Math.cos(angle) * radius;
            const y = this.y + Math.sin(angle) * radius;
            vertex(x, y);
        }
        endShape(CLOSE);
    }
    
    // パーティクルを破棄
    destroy() {
        this.isActive = false;
    }
    
    // 生存時間の進行度を取得（0-1）
    getLifeProgress() {
        const elapsed = millis() - this.createdAt;
        return Math.min(elapsed / this.maxLifetime, 1);
    }
    
    // パーティクルが画面内にあるかチェック
    isOnScreen(margin = 50) {
        return this.x > -margin && this.x < CONFIG.CANVAS_WIDTH + margin &&
               this.y > -margin && this.y < CONFIG.CANVAS_HEIGHT + margin;
    }
    
    // 特定の位置からの距離を計算
    distanceFrom(x, y) {
        return Math.sqrt((this.x - x) ** 2 + (this.y - y) ** 2);
    }
    
    // 速度を設定
    setVelocity(vx, vy) {
        this.vx = vx;
        this.vy = vy;
    }
    
    // 加速度を設定
    setAcceleration(ax, ay) {
        this.acceleration.x = ax;
        this.acceleration.y = ay;
    }
    
    // 色を変更
    setColor(r, g, b, a = this.alpha) {
        this.color = [r, g, b];
        this.alpha = a;
    }
    
    // ライフタイムを延長
    extendLife(additionalTime) {
        this.maxLifetime += additionalTime;
    }
}

// パーティクル生成用のヘルパー関数
const ParticleCreator = {
    // 爆発エフェクト用パーティクル
    createExplosion(x, y, count = 8, color = [255, 100, 100]) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = randomFloat(2, 6);
            const particle = new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                type: 'explosion',
                color: color,
                size: randomFloat(3, 8),
                lifetime: randomFloat(400, 800),
                glow: true
            });
            particles.push(particle);
        }
        return particles;
    },
    
    // 射撃エフェクト用パーティクル
    createMuzzleFlash(x, y, direction = { x: 1, y: 0 }) {
        const particles = [];
        const count = CONFIG.LAW_OF_FEEDBACK.PARTICLES.SHOOTING.COUNT;
        
        for (let i = 0; i < count; i++) {
            const spread = 0.5;
            const particle = new Particle(x, y, {
                vx: direction.x * randomFloat(1, 3) + randomFloat(-spread, spread),
                vy: direction.y * randomFloat(1, 3) + randomFloat(-spread, spread),
                type: 'spark',
                color: [255, 255, 100],
                size: randomFloat(2, 4),
                lifetime: CONFIG.LAW_OF_FEEDBACK.PARTICLES.SHOOTING.LIFETIME,
                glow: true
            });
            particles.push(particle);
        }
        return particles;
    },
    
    // 移動軌跡用パーティクル
    createTrail(x, y, velocity = { x: 0, y: 0 }, color = [100, 150, 255]) {
        return new Particle(x, y, {
            vx: -velocity.x * 0.3 + randomFloat(-0.5, 0.5),
            vy: -velocity.y * 0.3 + randomFloat(-0.5, 0.5),
            type: 'trail',
            color: color,
            size: randomFloat(2, 4),
            lifetime: CONFIG.LAW_OF_FEEDBACK.PARTICLES.MOVEMENT.LIFETIME,
            fadeOut: true,
            shrink: true
        });
    }
};
