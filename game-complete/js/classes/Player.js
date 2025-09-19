// プレイヤークラス
class Player extends GameObject {
    constructor(x, y) {
        super(x, y, CONFIG.PLAYER_SIZE);
        this.lives = CONFIG.INITIAL_LIVES;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.invulnerabilityDuration = 2000; // 2秒間無敵
        
        // 射撃関連
        this.lastShotTime = 0;
        
        // アニメーション関連（法則2: フィードバックループ）
        this.animation = {
            squashStretch: {
                scaleX: 1.0,
                scaleY: 1.0,
                targetScaleX: 1.0,
                targetScaleY: 1.0,
                intensity: CONFIG.LAW_OF_FEEDBACK.SQUASH_STRETCH.SCALE_FACTOR,
                active: false,
                startTime: 0,
                duration: CONFIG.LAW_OF_FEEDBACK.SQUASH_STRETCH.DURATION
            },
            movement: {
                bobOffset: 0,
                bobSpeed: 0.15,
                bobAmplitude: 2
            },
            lastMovementX: 0,
            lastMovementY: 0
        };
    }
    
    update() {
        this.handleInput();
        this.constrainToBounds();
        this.updateInvulnerability();
        this.updateAnimations();
        
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
        
        // 移動時のアニメーションをトリガー
        if ((this.vx !== 0 || this.vy !== 0) && CONFIG.LAW_OF_FEEDBACK.ENABLED) {
            this.triggerMovementSquashStretch();
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
    
    // アニメーション更新（法則2: フィードバックループ）
    updateAnimations() {
        if (!CONFIG.LAW_OF_FEEDBACK.ENABLED) return;
        
        // Squash & Stretch アニメーション更新
        this.updateSquashStretch();
        
        // 移動アニメーション更新
        this.updateMovementAnimation();
        
        // 移動時のパーティクル生成
        this.generateMovementParticles();
        
        // 前フレームの移動量を記録
        this.animation.lastMovementX = this.vx;
        this.animation.lastMovementY = this.vy;
    }
    
    // Squash & Stretch アニメーション
    updateSquashStretch() {
        const ss = this.animation.squashStretch;
        
        if (ss.active) {
            const elapsed = millis() - ss.startTime;
            const progress = Math.min(elapsed / ss.duration, 1);
            
            if (progress >= 1) {
                // アニメーション終了
                ss.active = false;
                ss.scaleX = 1.0;
                ss.scaleY = 1.0;
            } else {
                // イージング適用（バウンス効果）
                const easeProgress = this.easeOutBounce(progress);
                ss.scaleX = lerp(ss.targetScaleX, 1.0, easeProgress);
                ss.scaleY = lerp(ss.targetScaleY, 1.0, easeProgress);
            }
        }
        
        // アニメーションが非アクティブの場合は通常スケール
        if (!ss.active) {
            ss.scaleX = lerp(ss.scaleX, 1.0, 0.1);
            ss.scaleY = lerp(ss.scaleY, 1.0, 0.1);
        }
    }
    
    // 移動アニメーション（微細な揺れ）
    updateMovementAnimation() {
        const movement = this.animation.movement;
        
        // 移動中のみボブアニメーション
        if (this.vx !== 0 || this.vy !== 0) {
            movement.bobOffset += movement.bobSpeed;
        } else {
            movement.bobOffset *= 0.95; // 停止時は徐々に減衰
        }
    }
    
    // 移動時のパーティクル生成（法則2: フィードバックループ）
    generateMovementParticles() {
        if (!CONFIG.LAW_OF_FEEDBACK.PARTICLES.ENABLED || !this.effectManager) return;
        
        const movementSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        
        // 移動中のみパーティクル生成
        if (movementSpeed > 0.1) {
            // 生成頻度を移動速度に応じて調整
            const spawnChance = movementSpeed / CONFIG.PLAYER_SPEED;
            
            if (Math.random() < spawnChance * 0.3) { // 30%の確率で生成
                // プレイヤーの足元からパーティクル生成
                const particleX = this.x + randomFloat(-this.size * 0.3, this.size * 0.3);
                const particleY = this.y + this.size * 0.4; // 足元位置
                
                // 移動方向と逆向きの軌跡
                const trailVelocity = {
                    x: -this.vx * 0.8,
                    y: -this.vy * 0.8
                };
                
                this.effectManager.createMovementTrail(
                    particleX, 
                    particleY, 
                    trailVelocity, 
                    this.getTrailColor()
                );
            }
        }
    }
    
    // 軌跡パーティクルの色を計算
    getTrailColor() {
        // 距離ベースで色を変化（法則1との連携）
        let baseColor = [...CONFIG.PLAYER_COLOR];
        
        if (CONFIG.LAW_OF_CHOICE.ENABLED && this.effectManager) {
            // 現在のプレイヤー色を使用
            const movementSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            const speedRatio = movementSpeed / CONFIG.PLAYER_SPEED;
            
            // 速度に応じて色の明度を調整
            baseColor = [
                baseColor[0] * (0.6 + speedRatio * 0.4),
                baseColor[1] * (0.6 + speedRatio * 0.4),
                baseColor[2] * (0.6 + speedRatio * 0.4)
            ];
        }
        
        return baseColor;
    }
    
    // バウンスイージング関数
    easeOutBounce(t) {
        if (t < 1 / 2.75) {
            return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
            return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
            return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
            return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
    }
    
    // 移動時のSquash & Stretch トリガー
    triggerMovementSquashStretch() {
        if (!CONFIG.LAW_OF_FEEDBACK.SQUASH_STRETCH.ENABLED) return;
        
        const ss = this.animation.squashStretch;
        const movementSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        
        if (movementSpeed > 0.1) {
            const intensity = Math.min(movementSpeed / CONFIG.PLAYER_SPEED, 1.0);
            
            // 移動方向に基づいてスケール調整
            if (Math.abs(this.vx) > Math.abs(this.vy)) {
                // 水平移動: 横に伸びて縦に縮む
                ss.targetScaleX = 1.0 + (ss.intensity * intensity);
                ss.targetScaleY = 1.0 - (ss.intensity * intensity * 0.5);
            } else {
                // 垂直移動: 縦に伸びて横に縮む
                ss.targetScaleX = 1.0 - (ss.intensity * intensity * 0.5);
                ss.targetScaleY = 1.0 + (ss.intensity * intensity);
            }
            
            ss.active = true;
            ss.startTime = millis();
        }
    }
    
    // 射撃時のSquash & Stretch トリガー
    triggerShootingSquashStretch() {
        if (!CONFIG.LAW_OF_FEEDBACK.SQUASH_STRETCH.ENABLED) return;
        
        const ss = this.animation.squashStretch;
        
        // 射撃時: 前方に圧縮、縦に伸張
        ss.targetScaleX = 1.0 - ss.intensity;
        ss.targetScaleY = 1.0 + ss.intensity * 0.5;
        ss.active = true;
        ss.startTime = millis();
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
    
    // 距離ベースの発射レート計算
    getShootCooldown(enemies) {
        if (!CONFIG.LAW_OF_CHOICE.ENABLED) {
            return CONFIG.SHOOT_COOLDOWN;
        }
        
        const closestDistance = this.getClosestEnemyDistance(enemies);
        
        if (closestDistance <= CONFIG.LAW_OF_CHOICE.CLOSE_RANGE) {
            // 近距離: 高速発射
            return CONFIG.LAW_OF_CHOICE.SHOOT_COOLDOWN_CLOSE;
        } else if (closestDistance <= CONFIG.LAW_OF_CHOICE.MID_RANGE) {
            // 中距離: 中速発射
            return CONFIG.LAW_OF_CHOICE.SHOOT_COOLDOWN_MID;
        } else {
            // 遠距離: 低速発射
            return CONFIG.LAW_OF_CHOICE.SHOOT_COOLDOWN_FAR;
        }
    }
    
    // プレイヤーの描画
    render(enemies = []) {
        push();
        
        // アニメーション変換の適用
        this.applyAnimationTransforms();
        
        // 距離ベースの色変化（法則1のフィードバック）
        let playerColor = [...CONFIG.PLAYER_COLOR];
        if (CONFIG.LAW_OF_CHOICE.ENABLED && enemies.length > 0) {
            const closestDistance = this.getClosestEnemyDistance(enemies);
            
            if (closestDistance <= CONFIG.LAW_OF_CHOICE.CLOSE_RANGE) {
                // 近距離: 赤系（高リスク・高リターン）
                playerColor = [255, 100, 100];
            } else if (closestDistance <= CONFIG.LAW_OF_CHOICE.MID_RANGE) {
                // 中距離: 黄系（バランス）
                playerColor = [255, 200, 100];
            } else {
                // 遠距離: 青系（低リスク・低リターン）
                playerColor = [100, 150, 255];
            }
        }
        
        // 無敵時間中は点滅
        let alpha = 255;
        if (this.invulnerable && Math.floor(millis() / 100) % 2 === 0) {
            alpha = 128;
        }
        
        // グローエフェクト（法則2: フィードバックループ）
        if (CONFIG.LAW_OF_FEEDBACK.GLOW.ENABLED && CONFIG.LAW_OF_FEEDBACK.ENABLED) {
            this.renderGlow(playerColor, alpha);
        }
        
        // メインプレイヤー描画
        fill(playerColor[0], playerColor[1], playerColor[2], alpha);
        noStroke();
        rectMode(CENTER);
        rect(this.x, this.y, this.size, this.size);
        
        // 移動方向インジケーター
        if (this.vx !== 0 || this.vy !== 0) {
            stroke(255, 255, 255, alpha);
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
    
    // アニメーション変換の適用
    applyAnimationTransforms() {
        if (!CONFIG.LAW_OF_FEEDBACK.ENABLED) return;
        
        // プレイヤー中心に移動
        translate(this.x, this.y);
        
        // Squash & Stretch スケール適用
        const ss = this.animation.squashStretch;
        scale(ss.scaleX, ss.scaleY);
        
        // 移動時の微細な揺れ
        const movement = this.animation.movement;
        const bobX = Math.sin(movement.bobOffset) * movement.bobAmplitude * 0.5;
        const bobY = Math.cos(movement.bobOffset * 1.3) * movement.bobAmplitude * 0.3;
        translate(bobX, bobY);
        
        // 原点を元に戻す
        translate(-this.x, -this.y);
    }
    
    // グローエフェクト描画
    renderGlow(color, alpha) {
        const glowSize = this.size * 1.5;
        const glowAlpha = alpha * 0.3 * CONFIG.LAW_OF_FEEDBACK.GLOW.INTENSITY;
        
        // 複数層のグロー
        for (let i = 3; i > 0; i--) {
            fill(color[0], color[1], color[2], glowAlpha / i);
            noStroke();
            rectMode(CENTER);
            rect(this.x, this.y, glowSize * i * 0.7, glowSize * i * 0.7);
        }
    }
    
    // ゲームオーバーチェック
    isDead() {
        return this.lives <= 0;
    }
    
    // 射撃処理（ショットガンシステム）
    shoot(enemies) {
        const currentTime = millis();
        
        // 距離ベースの発射レート計算
        const shootCooldown = this.getShootCooldown(enemies);
        
        // クールダウン中かチェック
        if (currentTime - this.lastShotTime < shootCooldown) {
            return null;
        }
        
        const bullets = [];
        
        if (CONFIG.LAW_OF_CHOICE.ENABLED) {
            // ショットガンシステム: 3つの弾を発射
            const bulletX = this.x + this.size / 2 + 5;
            const bulletY = this.y;
            const spreadAngle = CONFIG.LAW_OF_CHOICE.SHOTGUN_SPREAD_ANGLE;
            
            // 中央の弾（まっすぐ）
            bullets.push(new Bullet(bulletX, bulletY, 1, 0));
            
            // 上方向の弾
            const upAngleRad = -spreadAngle * Math.PI / 180;
            const upDirX = Math.cos(upAngleRad);
            const upDirY = Math.sin(upAngleRad);
            bullets.push(new Bullet(bulletX, bulletY, upDirX, upDirY));
            
            // 下方向の弾
            const downAngleRad = spreadAngle * Math.PI / 180;
            const downDirX = Math.cos(downAngleRad);
            const downDirY = Math.sin(downAngleRad);
            bullets.push(new Bullet(bulletX, bulletY, downDirX, downDirY));
        } else {
            // 従来の単発システム
            const bulletX = this.x + this.size / 2 + 5;
            const bulletY = this.y;
            bullets.push(new Bullet(bulletX, bulletY, 1, 0));
        }
        
        this.lastShotTime = currentTime;
        
        // 射撃時のアニメーションをトリガー（法則2: フィードバックループ）
        if (CONFIG.LAW_OF_FEEDBACK.ENABLED) {
            this.triggerShootingSquashStretch();
        }
        
        return bullets;
    }
    
    // 射撃可能かチェック
    canShoot(enemies) {
        const shootCooldown = this.getShootCooldown(enemies);
        return (millis() - this.lastShotTime) >= shootCooldown;
    }
    
    // リセット（新しいゲーム用）
    reset() {
        this.x = CONFIG.CANVAS_WIDTH / 2;
        this.y = CONFIG.CANVAS_HEIGHT / 2;
        this.lives = CONFIG.INITIAL_LIVES;
        this.invulnerable = false;
        this.vx = 0;
        this.vy = 0;
        this.lastShotTime = 0;
        
        // アニメーション状態もリセット
        this.animation.squashStretch.scaleX = 1.0;
        this.animation.squashStretch.scaleY = 1.0;
        this.animation.squashStretch.active = false;
        this.animation.movement.bobOffset = 0;
        this.animation.lastMovementX = 0;
        this.animation.lastMovementY = 0;
    }
}