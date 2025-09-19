// ビジュアルフィードバッククラス - 高度な視覚エフェクト管理
class VisualFeedback {
    constructor() {
        // カメラエフェクト
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1,
            targetZoom: 1,
            shakeX: 0,
            shakeY: 0,
            rotation: 0
        };
        
        // グローエフェクト用のオフスクリーンバッファ
        this.glowLayers = [];
        this.glowEnabled = CONFIG.LAW_OF_FEEDBACK.GLOW.ENABLED;
        
        // ポストプロセッシングエフェクト
        this.postEffects = {
            chromaticAberration: { enabled: false, intensity: 0 },
            vignette: { enabled: false, intensity: 0 },
            scanlines: { enabled: false, intensity: 0 },
            pixelation: { enabled: false, scale: 1 }
        };
        
        // フラッシュエフェクト
        this.flash = {
            active: false,
            color: [255, 255, 255],
            intensity: 0,
            duration: 0,
            startTime: 0
        };
        
        // 時間効果
        this.timeEffects = {
            slowMotion: { active: false, factor: 1.0, targetFactor: 1.0 },
            freeze: { active: false, duration: 0, startTime: 0 }
        };
        
        // 色補正
        this.colorCorrection = {
            saturation: 1.0,
            brightness: 1.0,
            contrast: 1.0,
            hue: 0
        };
        
        // アニメーション用のイージング状態
        this.animations = new Map();
    }
    
    // メイン更新処理
    update() {
        this.updateCamera();
        this.updateFlash();
        this.updateTimeEffects();
        this.updateAnimations();
        this.updatePostEffects();
    }
    
    // カメラ更新
    updateCamera() {
        // ズームアニメーション
        this.camera.zoom = lerp(this.camera.zoom, this.camera.targetZoom, 0.1);
        
        // カメラ回転の減衰
        this.camera.rotation *= 0.95;
    }
    
    // フラッシュエフェクト更新
    updateFlash() {
        if (!this.flash.active) return;
        
        const elapsed = millis() - this.flash.startTime;
        const progress = elapsed / this.flash.duration;
        
        if (progress >= 1) {
            this.flash.active = false;
            this.flash.intensity = 0;
        } else {
            // 急激に明るくなって徐々に暗くなる
            this.flash.intensity = Math.pow(1 - progress, 2);
        }
    }
    
    // 時間エフェクト更新
    updateTimeEffects() {
        // スローモーション
        if (this.timeEffects.slowMotion.active) {
            this.timeEffects.slowMotion.factor = lerp(
                this.timeEffects.slowMotion.factor,
                this.timeEffects.slowMotion.targetFactor,
                0.05
            );
        }
        
        // フリーズ
        if (this.timeEffects.freeze.active) {
            const elapsed = millis() - this.timeEffects.freeze.startTime;
            if (elapsed >= this.timeEffects.freeze.duration) {
                this.timeEffects.freeze.active = false;
            }
        }
    }
    
    // アニメーション更新
    updateAnimations() {
        for (let [key, animation] of this.animations) {
            const elapsed = millis() - animation.startTime;
            const progress = Math.min(elapsed / animation.duration, 1);
            
            const easedProgress = this.applyEasing(progress, animation.easing);
            animation.currentValue = lerp(animation.from, animation.to, easedProgress);
            
            if (progress >= 1) {
                animation.onComplete && animation.onComplete();
                this.animations.delete(key);
            }
        }
    }
    
    // ポストエフェクト更新
    updatePostEffects() {
        // 各エフェクトの強度を徐々に減衰
        for (let effect in this.postEffects) {
            if (this.postEffects[effect].intensity > 0) {
                this.postEffects[effect].intensity *= 0.95;
                if (this.postEffects[effect].intensity < 0.01) {
                    this.postEffects[effect].intensity = 0;
                    this.postEffects[effect].enabled = false;
                }
            }
        }
    }
    
    // 描画前の変換適用
    applyPreRenderTransforms() {
        push();
        
        // カメラ変換
        translate(
            CONFIG.CANVAS_WIDTH / 2 + this.camera.x + this.camera.shakeX,
            CONFIG.CANVAS_HEIGHT / 2 + this.camera.y + this.camera.shakeY
        );
        
        scale(this.camera.zoom);
        rotate(this.camera.rotation);
        translate(-CONFIG.CANVAS_WIDTH / 2, -CONFIG.CANVAS_HEIGHT / 2);
    }
    
    // 描画後のエフェクト適用
    applyPostRenderEffects() {
        pop();
        
        // ポストプロセッシングエフェクト
        this.renderPostEffects();
        
        // フラッシュエフェクト
        this.renderFlash();
    }
    
    // ポストエフェクト描画
    renderPostEffects() {
        // ビネット効果
        if (this.postEffects.vignette.enabled) {
            this.renderVignette();
        }
        
        // スキャンライン効果
        if (this.postEffects.scanlines.enabled) {
            this.renderScanlines();
        }
        
        // 色収差効果
        if (this.postEffects.chromaticAberration.enabled) {
            this.renderChromaticAberration();
        }
    }
    
    // フラッシュ描画
    renderFlash() {
        if (!this.flash.active || this.flash.intensity <= 0) return;
        
        push();
        blendMode(ADD);
        fill(
            this.flash.color[0],
            this.flash.color[1], 
            this.flash.color[2],
            this.flash.intensity * 120
        );
        noStroke();
        rect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        blendMode(BLEND);
        pop();
    }
    
    // ビネット効果
    renderVignette() {
        push();
        const centerX = CONFIG.CANVAS_WIDTH / 2;
        const centerY = CONFIG.CANVAS_HEIGHT / 2;
        const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
        
        for (let i = 0; i < CONFIG.CANVAS_WIDTH; i += 4) {
            for (let j = 0; j < CONFIG.CANVAS_HEIGHT; j += 4) {
                const dist = Math.sqrt((i - centerX) ** 2 + (j - centerY) ** 2);
                const vignette = (dist / maxDist) * this.postEffects.vignette.intensity;
                
                fill(0, 0, 0, vignette * 100);
                noStroke();
                rect(i, j, 4, 4);
            }
        }
        pop();
    }
    
    // スキャンライン効果
    renderScanlines() {
        push();
        stroke(0, 0, 0, this.postEffects.scanlines.intensity * 50);
        strokeWeight(1);
        
        for (let y = 0; y < CONFIG.CANVAS_HEIGHT; y += 2) {
            line(0, y, CONFIG.CANVAS_WIDTH, y);
        }
        pop();
    }
    
    // 簡易色収差効果
    renderChromaticAberration() {
        // Canvas 2Dでは制限的だが、軽微な色ずらしで代用
        const intensity = this.postEffects.chromaticAberration.intensity;
        
        push();
        blendMode(MULTIPLY);
        tint(255, 200 - intensity * 50, 200 - intensity * 50, 50);
        // 実際の実装では元画像を少しずらして描画
        pop();
    }
    
    // カメラ揺れをトリガー
    triggerCameraShake(intensity = 5, duration = 200) {
        const shakeAnimation = {
            intensity: intensity,
            duration: duration,
            startTime: millis(),
            update: () => {
                const elapsed = millis() - shakeAnimation.startTime;
                const progress = elapsed / duration;
                
                if (progress >= 1) {
                    this.camera.shakeX = 0;
                    this.camera.shakeY = 0;
                    return false; // アニメーション終了
                }
                
                const currentIntensity = intensity * (1 - progress);
                this.camera.shakeX = randomFloat(-currentIntensity, currentIntensity);
                this.camera.shakeY = randomFloat(-currentIntensity, currentIntensity);
                
                return true; // アニメーション継続
            }
        };
        
        this.animations.set('cameraShake', shakeAnimation);
    }
    
    // フラッシュエフェクトをトリガー
    triggerFlash(color = [255, 255, 255], duration = 100, intensity = 1.0) {
        this.flash.active = true;
        this.flash.color = color;
        this.flash.duration = duration;
        this.flash.intensity = intensity;
        this.flash.startTime = millis();
    }
    
    // ズームエフェクト
    triggerZoom(targetZoom, duration = 500, easing = 'easeOutQuad') {
        this.animateValue('cameraZoom', this.camera.zoom, targetZoom, duration, easing, 
            (value) => { this.camera.zoom = value; });
    }
    
    // カメラ回転
    triggerRotation(rotation, duration = 300) {
        this.camera.rotation = rotation;
        this.animateValue('cameraRotation', rotation, 0, duration, 'easeOutCubic',
            (value) => { this.camera.rotation = value; });
    }
    
    // スローモーション効果
    triggerSlowMotion(factor = 0.3, duration = 1000) {
        this.timeEffects.slowMotion.active = true;
        this.timeEffects.slowMotion.targetFactor = factor;
        
        setTimeout(() => {
            this.timeEffects.slowMotion.targetFactor = 1.0;
            setTimeout(() => {
                this.timeEffects.slowMotion.active = false;
            }, duration / 2);
        }, duration / 2);
    }
    
    // 時間停止効果
    triggerTimeFreeze(duration = 100) {
        this.timeEffects.freeze.active = true;
        this.timeEffects.freeze.duration = duration;
        this.timeEffects.freeze.startTime = millis();
    }
    
    // ヒットストップ効果（コンボ用）
    triggerHitStop(comboCount) {
        const duration = Math.min(50 + comboCount * 10, 200);
        this.triggerTimeFreeze(duration);
        
        // カメラ揺れも同時に
        this.triggerCameraShake(2 + comboCount, duration);
        
        // フラッシュエフェクト（強度を弱める）
        const flashColor = [255, 255 - comboCount * 20, 100];
        this.triggerFlash(flashColor, duration / 2, 0.2);
    }
    
    // ポストエフェクトをトリガー
    triggerPostEffect(effectName, intensity = 1.0, duration = 500) {
        if (!this.postEffects[effectName]) return;
        
        this.postEffects[effectName].enabled = true;
        this.postEffects[effectName].intensity = intensity;
        
        // 指定時間後に効果を減衰開始
        setTimeout(() => {
            this.animateValue(effectName + 'Fade', intensity, 0, duration / 2, 'easeOutQuad',
                (value) => { this.postEffects[effectName].intensity = value; });
        }, duration / 2);
    }
    
    // 汎用アニメーション関数
    animateValue(key, from, to, duration, easing = 'linear', onUpdate = null, onComplete = null) {
        this.animations.set(key, {
            from: from,
            to: to,
            duration: duration,
            easing: easing,
            startTime: millis(),
            currentValue: from,
            onUpdate: onUpdate,
            onComplete: onComplete
        });
    }
    
    // イージング関数適用
    applyEasing(t, easingName) {
        if (typeof Easing !== 'undefined' && Easing[easingName]) {
            return Easing[easingName](t);
        }
        return t; // リニア
    }
    
    // アニメーション値取得
    getAnimationValue(key) {
        const animation = this.animations.get(key);
        return animation ? animation.currentValue : null;
    }
    
    // 色補正適用
    applyColorCorrection() {
        // p5.jsの制限内での色補正
        const cc = this.colorCorrection;
        
        if (cc.brightness !== 1.0 || cc.contrast !== 1.0 || cc.saturation !== 1.0) {
            push();
            // 簡易的な色補正をtint()で実現
            const brightness = cc.brightness * 255;
            tint(brightness, brightness, brightness);
            pop();
        }
    }
    
    // エフェクト強度の動的調整
    setEffectIntensity(effectType, intensity) {
        switch (effectType) {
            case 'glow':
                CONFIG.LAW_OF_FEEDBACK.GLOW.INTENSITY = intensity;
                break;
            case 'screenShake':
                CONFIG.LAW_OF_FEEDBACK.SCREEN_SHAKE.INTENSITY = intensity;
                break;
            case 'particles':
                // パーティクル密度調整
                for (let type in CONFIG.LAW_OF_FEEDBACK.PARTICLES) {
                    if (CONFIG.LAW_OF_FEEDBACK.PARTICLES[type].COUNT) {
                        CONFIG.LAW_OF_FEEDBACK.PARTICLES[type].COUNT *= intensity;
                    }
                }
                break;
        }
    }
    
    // 高度なGlowエフェクト描画
    renderAdvancedGlow(x, y, size, color, intensity = 1.0) {
        if (!CONFIG.LAW_OF_FEEDBACK.GLOW.ENABLED) return;
        
        push();
        
        // ブレンドモードをADDに設定（光の効果）
        blendMode(ADD);
        
        const glowRadius = size * 2;
        const glowAlpha = intensity * CONFIG.LAW_OF_FEEDBACK.GLOW.INTENSITY * 50;
        
        // 複数レイヤーでGlowを描画（より自然なGlow）
        for (let i = 0; i < 8; i++) {
            const currentRadius = glowRadius * (1 + i * 0.3);
            const currentAlpha = glowAlpha / (i + 1);
            
            fill(color[0], color[1], color[2], currentAlpha);
            noStroke();
            ellipse(x, y, currentRadius, currentRadius);
        }
        
        // 中央の明るいコア
        fill(255, 255, 255, glowAlpha * 0.8);
        ellipse(x, y, size * 0.5, size * 0.5);
        
        blendMode(BLEND);
        pop();
    }
    
    // シンプルなBlurエフェクト（複数オフセット描画）
    renderSimpleBlur(x, y, size, color, blurRadius = 3, alpha = 100) {
        push();
        
        const offsets = [
            [-1, -1], [0, -1], [1, -1],
            [-1,  0],          [1,  0],
            [-1,  1], [0,  1], [1,  1]
        ];
        
        // 周囲にオフセットして描画
        for (let offset of offsets) {
            for (let r = 1; r <= blurRadius; r++) {
                fill(color[0], color[1], color[2], alpha / (r * 2));
                noStroke();
                ellipse(
                    x + offset[0] * r,
                    y + offset[1] * r,
                    size,
                    size
                );
            }
        }
        
        pop();
    }
    
    // 動的グローエフェクト（パルス付き）
    renderPulsingGlow(x, y, size, color, pulseSpeed = 0.05) {
        const time = millis() * pulseSpeed;
        const pulseFactor = 0.7 + Math.sin(time) * 0.3;
        const glowIntensity = pulseFactor * CONFIG.LAW_OF_FEEDBACK.GLOW.INTENSITY;
        
        this.renderAdvancedGlow(x, y, size, color, glowIntensity);
    }
    
    // 全エフェクトリセット
    resetAllEffects() {
        // カメラリセット
        this.camera.x = 0;
        this.camera.y = 0;
        this.camera.zoom = 1;
        this.camera.targetZoom = 1;
        this.camera.shakeX = 0;
        this.camera.shakeY = 0;
        this.camera.rotation = 0;
        
        // フラッシュ停止
        this.flash.active = false;
        
        // 時間エフェクト停止
        this.timeEffects.slowMotion.active = false;
        this.timeEffects.freeze.active = false;
        
        // ポストエフェクト停止
        for (let effect in this.postEffects) {
            this.postEffects[effect].enabled = false;
            this.postEffects[effect].intensity = 0;
        }
        
        // アニメーション停止
        this.animations.clear();
    }
    
    // デバッグ情報描画
    renderDebugInfo() {
        if (!CONFIG.DEBUG_MODE) return;
        
        push();
        fill(255, 255, 0);
        textAlign(LEFT, TOP);
        textSize(10);
        
        const y = CONFIG.CANVAS_HEIGHT - 200;
        text(`ビジュアルフィードバック:`, 200, y);
        text(`- カメラ揺れ: (${this.camera.shakeX.toFixed(1)}, ${this.camera.shakeY.toFixed(1)})`, 200, y + 15);
        text(`- ズーム: ${this.camera.zoom.toFixed(2)}`, 200, y + 30);
        text(`- フラッシュ: ${this.flash.active ? 'ON' : 'OFF'}`, 200, y + 45);
        text(`- アニメーション数: ${this.animations.size}`, 200, y + 60);
        
        pop();
    }
}