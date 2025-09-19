// エフェクトマネージャークラス - 全エフェクトを統一管理
class EffectManager {
    constructor() {
        this.particles = [];
        this.screenShake = {
            active: false,
            intensity: 0,
            duration: 0,
            startTime: 0,
            offsetX: 0,
            offsetY: 0
        };
        
        // パフォーマンス管理
        this.maxParticles = 500;
        this.particlePool = [];
        
        // エフェクト統計
        this.stats = {
            particlesCreated: 0,
            particlesDestroyed: 0,
            effectsTriggered: 0
        };
    }
    
    // 更新処理
    update() {
        this.updateParticles();
        this.updateScreenShake();
        this.cleanupDeadParticles();
    }
    
    // パーティクル更新
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            if (particle.isActive) {
                particle.update();
            } else {
                // 非アクティブなパーティクルをプールに戻す
                this.returnParticleToPool(particle);
                this.particles.splice(i, 1);
                this.stats.particlesDestroyed++;
            }
        }
    }
    
    // 画面揺れ更新
    updateScreenShake() {
        if (!this.screenShake.active) {
            this.screenShake.offsetX = 0;
            this.screenShake.offsetY = 0;
            return;
        }
        
        const elapsed = millis() - this.screenShake.startTime;
        const progress = elapsed / this.screenShake.duration;
        
        if (progress >= 1) {
            // 画面揺れ終了
            this.screenShake.active = false;
            this.screenShake.offsetX = 0;
            this.screenShake.offsetY = 0;
        } else {
            // 減衰する揺れを計算
            const decay = 1 - progress;
            const currentIntensity = this.screenShake.intensity * decay;
            
            // ランダムなオフセット
            this.screenShake.offsetX = randomFloat(-currentIntensity, currentIntensity);
            this.screenShake.offsetY = randomFloat(-currentIntensity, currentIntensity);
        }
    }
    
    // 死んだパーティクルのクリーンアップ
    cleanupDeadParticles() {
        // パーティクル数が上限を超えた場合、古いものから削除
        if (this.particles.length > this.maxParticles) {
            const excessCount = this.particles.length - this.maxParticles;
            for (let i = 0; i < excessCount; i++) {
                const particle = this.particles.shift();
                this.returnParticleToPool(particle);
                this.stats.particlesDestroyed++;
            }
        }
    }
    
    // 描画処理
    render() {
        push();
        
        // 画面揺れオフセット適用
        if (this.screenShake.active) {
            translate(this.screenShake.offsetX, this.screenShake.offsetY);
        }
        
        // パーティクル描画
        this.renderParticles();
        
        pop();
    }
    
    // パーティクル描画
    renderParticles() {
        // 深度ソート（Z順）
        const sortedParticles = this.particles.slice().sort((a, b) => {
            const depthA = a.depth || 0;
            const depthB = b.depth || 0;
            return depthA - depthB;
        });
        
        for (let particle of sortedParticles) {
            if (particle.isActive) {
                particle.render();
            }
        }
    }
    
    // パーティクル追加
    addParticle(x, y, options = {}) {
        if (!CONFIG.LAW_OF_FEEDBACK.PARTICLES.ENABLED) return null;
        
        const particle = this.getParticleFromPool(x, y, options);
        this.particles.push(particle);
        this.stats.particlesCreated++;
        
        return particle;
    }
    
    // 複数のパーティクルを追加
    addParticles(particles) {
        if (!CONFIG.LAW_OF_FEEDBACK.PARTICLES.ENABLED) return;
        
        for (let particle of particles) {
            this.particles.push(particle);
            this.stats.particlesCreated++;
        }
    }
    
    // プールからパーティクルを取得（オブジェクトプーリング）
    getParticleFromPool(x, y, options) {
        let particle;
        
        if (this.particlePool.length > 0) {
            // プールから再利用
            particle = this.particlePool.pop();
            particle.reset(x, y, options);
        } else {
            // 新規作成
            particle = new Particle(x, y, options);
        }
        
        return particle;
    }
    
    // パーティクルをプールに戻す
    returnParticleToPool(particle) {
        if (this.particlePool.length < 100) { // プールサイズ制限
            this.particlePool.push(particle);
        }
    }
    
    // 画面揺れトリガー
    triggerScreenShake(intensity = 5, duration = 200) {
        if (!CONFIG.LAW_OF_FEEDBACK.SCREEN_SHAKE.ENABLED) return;
        
        this.screenShake.active = true;
        this.screenShake.intensity = intensity;
        this.screenShake.duration = duration;
        this.screenShake.startTime = millis();
        this.stats.effectsTriggered++;
    }
    
    // 爆発エフェクト
    createExplosion(x, y, intensity = 1, color = [255, 100, 100]) {
        const config = CONFIG.LAW_OF_FEEDBACK.PARTICLES.EXPLOSION;
        const count = Math.floor(config.COUNT * intensity);
        
        const particles = ParticleCreator.createExplosion(x, y, count, color);
        this.addParticles(particles);
        
        // 画面揺れも同時にトリガー
        this.triggerScreenShake(
            CONFIG.LAW_OF_FEEDBACK.SCREEN_SHAKE.INTENSITY * intensity,
            CONFIG.LAW_OF_FEEDBACK.SCREEN_SHAKE.DURATION
        );
        
        return particles;
    }
    
    // 射撃エフェクト
    createMuzzleFlash(x, y, direction = { x: 1, y: 0 }) {
        const particles = ParticleCreator.createMuzzleFlash(x, y, direction);
        this.addParticles(particles);
        
        // 軽い画面揺れ
        this.triggerScreenShake(2, 100);
        
        return particles;
    }
    
    // 移動軌跡エフェクト
    createMovementTrail(x, y, velocity, color = [100, 150, 255]) {
        if (frameCount % 3 !== 0) return; // 3フレームに1回生成
        
        const particle = ParticleCreator.createTrail(x, y, velocity, color);
        this.addParticle(particle.x, particle.y, particle);
        
        return particle;
    }
    
    // ヒットエフェクト
    createHitEffect(x, y, color = [255, 255, 100]) {
        const particles = [];
        const count = 4;
        
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = randomFloat(1, 3);
            
            const particle = this.addParticle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                type: 'spark',
                color: color,
                size: randomFloat(2, 5),
                lifetime: 200,
                glow: true
            });
            
            particles.push(particle);
        }
        
        return particles;
    }
    
    // コンボエフェクト
    createComboEffect(x, y, comboCount) {
        if (!CONFIG.LAW_OF_FEEDBACK.COMBO_EFFECTS.ENABLED) return;
        
        const intensity = Math.min(comboCount / 10, 2); // 最大2倍
        const color = [
            255,
            255 - (comboCount * 10),
            100 + (comboCount * 5)
        ];
        
        // パーティクル生成
        const particles = [];
        const count = Math.floor(5 + comboCount);
        
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = randomFloat(2, 5) * intensity;
            
            const particle = this.addParticle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                type: 'star',
                color: color,
                size: randomFloat(3, 8) * intensity,
                lifetime: 400 + (comboCount * 20),
                glow: true
            });
            
            particles.push(particle);
        }
        
        // 画面揺れ
        this.triggerScreenShake(3 * intensity, 150);
        
        return particles;
    }
    
    // 全エフェクトをクリア
    clearAllEffects() {
        // 全パーティクルを削除
        for (let particle of this.particles) {
            this.returnParticleToPool(particle);
        }
        this.particles = [];
        
        // 画面揺れを停止
        this.screenShake.active = false;
        this.screenShake.offsetX = 0;
        this.screenShake.offsetY = 0;
    }
    
    // パーティクル数を取得
    getParticleCount() {
        return this.particles.length;
    }
    
    // アクティブなパーティクル数を取得
    getActiveParticleCount() {
        return this.particles.filter(p => p.isActive).length;
    }
    
    // 画面揺れの状態を取得
    getScreenShakeStatus() {
        return {
            active: this.screenShake.active,
            intensity: this.screenShake.intensity,
            offsetX: this.screenShake.offsetX,
            offsetY: this.screenShake.offsetY
        };
    }
    
    // 統計情報を取得
    getStats() {
        return {
            ...this.stats,
            activeParticles: this.getActiveParticleCount(),
            totalParticles: this.particles.length,
            poolSize: this.particlePool.length
        };
    }
    
    // 統計リセット
    resetStats() {
        this.stats = {
            particlesCreated: 0,
            particlesDestroyed: 0,
            effectsTriggered: 0
        };
    }
    
    // デバッグ情報描画
    renderDebugInfo() {
        if (!CONFIG.DEBUG_MODE) return;
        
        push();
        fill(255, 255, 0);
        textAlign(LEFT, TOP);
        textSize(12);
        
        const stats = this.getStats();
        const shakeStatus = this.getScreenShakeStatus();
        
        text(`エフェクト統計:`, 10, CONFIG.CANVAS_HEIGHT - 120);
        text(`- アクティブパーティクル: ${stats.activeParticles}`, 10, CONFIG.CANVAS_HEIGHT - 100);
        text(`- 総パーティクル: ${stats.totalParticles}`, 10, CONFIG.CANVAS_HEIGHT - 80);
        text(`- プールサイズ: ${stats.poolSize}`, 10, CONFIG.CANVAS_HEIGHT - 60);
        text(`- 画面揺れ: ${shakeStatus.active ? 'ON' : 'OFF'}`, 10, CONFIG.CANVAS_HEIGHT - 40);
        
        if (shakeStatus.active) {
            text(`- 揺れ強度: ${shakeStatus.intensity.toFixed(1)}`, 10, CONFIG.CANVAS_HEIGHT - 20);
        }
        
        pop();
    }
    
    // エフェクト設定の動的変更
    updateEffectSettings(settings) {
        if (settings.maxParticles !== undefined) {
            this.maxParticles = settings.maxParticles;
        }
        
        if (settings.enableScreenShake !== undefined) {
            CONFIG.LAW_OF_FEEDBACK.SCREEN_SHAKE.ENABLED = settings.enableScreenShake;
        }
        
        if (settings.enableParticles !== undefined) {
            CONFIG.LAW_OF_FEEDBACK.PARTICLES.ENABLED = settings.enableParticles;
        }
    }
}

// パーティクルクラスにリセット機能を追加（オブジェクトプーリング用）
if (typeof Particle !== 'undefined') {
    Particle.prototype.reset = function(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        
        // デフォルト設定で再初期化
        this.vx = options.vx || randomFloat(-2, 2);
        this.vy = options.vy || randomFloat(-2, 2);
        this.acceleration = options.acceleration || { x: 0, y: 0 };
        this.friction = options.friction || 0.98;
        this.gravity = options.gravity || 0.05;
        
        this.lifetime = options.lifetime || 500;
        this.maxLifetime = this.lifetime;
        this.createdAt = millis();
        this.isActive = true;
        
        this.size = options.size || 4;
        this.startSize = this.size;
        this.endSize = options.endSize || 0;
        this.color = options.color || [255, 255, 255];
        this.alpha = options.alpha || 255;
        this.startAlpha = this.alpha;
        
        this.type = options.type || 'default';
        this.fadeOut = options.fadeOut !== false;
        this.shrink = options.shrink !== false;
        this.glow = options.glow || false;
        
        this.bounce = options.bounce || 0;
        this.bounceDecay = options.bounceDecay || 0.8;
        this.minBounceVelocity = options.minBounceVelocity || 0.5;
    };
}