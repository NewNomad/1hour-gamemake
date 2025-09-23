// 超リッチなタイトル画面クラス
class TitleScreen {
    constructor() {
        // タイトルアニメーション
        this.titleAnimation = {
            rotation: 0,
            scale: 1,
            glitchOffset: 0,
            chromaticOffset: 0,
            pulsePhase: 0,
            floatY: 0
        };
        
        // パーティクルシステム
        this.particles = [];
        this.binaryParticles = [];
        this.energyOrbs = [];
        this.sparks = [];
        this.stars = [];
        
        // 背景演出用の敵シルエット
        this.backgroundEnemies = [];
        
        // デモプレイヤー
        this.demoPlayer = {
            x: CONFIG.CANVAS_WIDTH / 2,
            y: CONFIG.CANVAS_HEIGHT * 0.7,
            targetX: CONFIG.CANVAS_WIDTH / 2,
            targetY: CONFIG.CANVAS_HEIGHT * 0.7,
            rotation: 0,
            scale: 1,
            trail: []
        };
        
        // ネオンサイン
        this.neonSigns = [];
        
        // UI要素
        this.menuItems = [
            { text: "Press SPACE to Start", y: CONFIG.CANVAS_HEIGHT * 0.6, glow: 0, hover: false },
            { text: "WASD or Arrows to Move", y: CONFIG.CANVAS_HEIGHT * 0.68, glow: 0, hover: false },
            { text: "SPACE to Shoot", y: CONFIG.CANVAS_HEIGHT * 0.74, glow: 0, hover: false }
        ];
        
        // エフェクト制御
        this.effects = {
            scanlineOffset: 0,
            crtWarp: 0,
            flashIntensity: 0,
            waveOffset: 0,
            gridScroll: 0
        };
        
        // グラデーション色
        this.gradientColors = [
            [255, 0, 128],   // ピンク
            [128, 0, 255],   // パープル
            [0, 128, 255],   // シアン
            [0, 255, 128],   // グリーン
            [255, 128, 0],   // オレンジ
        ];
        
        this.frameCount = 0;
        this.initializeElements();
    }
    
    initializeElements() {
        // 星を生成
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: random(CONFIG.CANVAS_WIDTH),
                y: random(CONFIG.CANVAS_HEIGHT),
                size: random(0.5, 2),
                twinkle: random(TWO_PI),
                speed: random(0.01, 0.03)
            });
        }
        
        // バイナリパーティクルを生成
        for (let i = 0; i < 30; i++) {
            this.binaryParticles.push({
                x: random(CONFIG.CANVAS_WIDTH),
                y: random(CONFIG.CANVAS_HEIGHT),
                text: random() > 0.5 ? "0" : "1",
                speed: random(0.5, 1.5),
                opacity: random(50, 150),
                size: random(8, 16)
            });
        }
        
        // エネルギーオーブを生成
        for (let i = 0; i < 5; i++) {
            this.energyOrbs.push({
                x: random(CONFIG.CANVAS_WIDTH),
                y: random(CONFIG.CANVAS_HEIGHT),
                vx: random(-2, 2),
                vy: random(-1, 1),
                size: random(20, 40),
                hue: random(360),
                pulsePhase: random(TWO_PI)
            });
        }
        
        // 背景の敵シルエット
        for (let i = 0; i < 8; i++) {
            this.backgroundEnemies.push({
                x: random(CONFIG.CANVAS_WIDTH),
                y: random(CONFIG.CANVAS_HEIGHT),
                vx: random(-1, 1),
                vy: random(-0.5, 0.5),
                size: random(15, 30),
                rotation: random(TWO_PI),
                type: floor(random(3))
            });
        }
        
        // ネオンサイン
        this.neonSigns = [
            { x: 100, y: 150, text: "ULTRA", color: [255, 0, 200], flicker: 0 },
            { x: CONFIG.CANVAS_WIDTH - 150, y: 180, text: "ARCADE", color: [0, 255, 200], flicker: 0.5 },
            { x: 200, y: CONFIG.CANVAS_HEIGHT - 100, text: "2025", color: [200, 200, 0], flicker: 1 }
        ];
    }
    
    update() {
        this.frameCount++;
        
        // タイトルアニメーション更新
        this.titleAnimation.rotation += 0.002;
        this.titleAnimation.pulsePhase += 0.03;
        this.titleAnimation.scale = 1 + sin(this.titleAnimation.pulsePhase) * 0.05;
        this.titleAnimation.floatY = sin(this.frameCount * 0.02) * 10;
        this.titleAnimation.glitchOffset = random(-2, 2) * (sin(this.frameCount * 0.1) > 0.95 ? 1 : 0);
        this.titleAnimation.chromaticOffset = sin(this.frameCount * 0.05) * 3;
        
        // エフェクト更新
        this.effects.scanlineOffset = (this.effects.scanlineOffset + 1) % 10;
        this.effects.crtWarp = sin(this.frameCount * 0.01) * 0.02;
        this.effects.flashIntensity = max(0, this.effects.flashIntensity - 0.02);
        this.effects.waveOffset += 0.05;
        this.effects.gridScroll += 0.5;
        
        // 星の更新
        this.stars.forEach(star => {
            star.twinkle += star.speed;
        });
        
        // バイナリパーティクル更新
        this.binaryParticles.forEach(particle => {
            particle.y -= particle.speed;
            if (particle.y < -20) {
                particle.y = CONFIG.CANVAS_HEIGHT + 20;
                particle.x = random(CONFIG.CANVAS_WIDTH);
                particle.text = random() > 0.5 ? "0" : "1";
            }
        });
        
        // エネルギーオーブ更新
        this.energyOrbs.forEach(orb => {
            orb.x += orb.vx;
            orb.y += orb.vy;
            orb.pulsePhase += 0.05;
            orb.hue = (orb.hue + 1) % 360;
            
            // 画面端で反射
            if (orb.x < 0 || orb.x > CONFIG.CANVAS_WIDTH) orb.vx *= -1;
            if (orb.y < 0 || orb.y > CONFIG.CANVAS_HEIGHT) orb.vy *= -1;
        });
        
        // 背景の敵更新
        this.backgroundEnemies.forEach(enemy => {
            enemy.x += enemy.vx;
            enemy.y += enemy.vy;
            enemy.rotation += 0.02;
            
            // 画面外に出たら反対側から
            if (enemy.x < -50) enemy.x = CONFIG.CANVAS_WIDTH + 50;
            if (enemy.x > CONFIG.CANVAS_WIDTH + 50) enemy.x = -50;
            if (enemy.y < -50) enemy.y = CONFIG.CANVAS_HEIGHT + 50;
            if (enemy.y > CONFIG.CANVAS_HEIGHT + 50) enemy.y = -50;
        });
        
        // デモプレイヤー更新
        this.updateDemoPlayer();
        
        // メニューアイテムのグロー更新
        this.menuItems.forEach((item, index) => {
            item.glow = sin(this.frameCount * 0.05 + index * 0.5) * 0.5 + 0.5;
        });
        
        // ネオンサインのフリッカー更新
        this.neonSigns.forEach(sign => {
            sign.flicker = noise(sign.x * 0.01, sign.y * 0.01, this.frameCount * 0.05);
        });
        
        // スパーク生成（ランダム）
        if (random() < 0.1) {
            this.sparks.push({
                x: random(CONFIG.CANVAS_WIDTH),
                y: random(CONFIG.CANVAS_HEIGHT),
                vx: random(-5, 5),
                vy: random(-5, 5),
                life: 30,
                maxLife: 30
            });
        }
        
        // スパーク更新
        this.sparks = this.sparks.filter(spark => {
            spark.x += spark.vx;
            spark.y += spark.vy;
            spark.vx *= 0.95;
            spark.vy *= 0.95;
            spark.life--;
            return spark.life > 0;
        });
    }
    
    updateDemoPlayer() {
        // 自動的に動き回る
        if (frameCount % 120 === 0) {
            this.demoPlayer.targetX = random(100, CONFIG.CANVAS_WIDTH - 100);
            this.demoPlayer.targetY = random(CONFIG.CANVAS_HEIGHT * 0.6, CONFIG.CANVAS_HEIGHT * 0.8);
        }
        
        // スムーズ移動
        this.demoPlayer.x = lerp(this.demoPlayer.x, this.demoPlayer.targetX, 0.05);
        this.demoPlayer.y = lerp(this.demoPlayer.y, this.demoPlayer.targetY, 0.05);
        this.demoPlayer.rotation += 0.02;
        this.demoPlayer.scale = 1 + sin(this.frameCount * 0.05) * 0.1;
        
        // トレイル追加
        this.demoPlayer.trail.push({
            x: this.demoPlayer.x,
            y: this.demoPlayer.y,
            opacity: 100
        });
        
        // トレイル更新
        this.demoPlayer.trail = this.demoPlayer.trail.filter(point => {
            point.opacity -= 2;
            return point.opacity > 0;
        });
    }
    
    render() {
        // 背景グラデーション
        this.renderGradientBackground();
        
        // グリッドエフェクト
        this.renderGrid();
        
        // 星空
        this.renderStars();
        
        // 背景の敵シルエット
        this.renderBackgroundEnemies();
        
        // エネルギーオーブ
        this.renderEnergyOrbs();
        
        // バイナリパーティクル
        this.renderBinaryParticles();
        
        // ネオンサイン
        this.renderNeonSigns();
        
        // デモプレイヤー
        this.renderDemoPlayer();
        
        // メインタイトル
        this.renderTitle();
        
        // メニューアイテム
        this.renderMenuItems();
        
        // スパーク
        this.renderSparks();
        
        // 音波ビジュアライザー
        this.renderWaveform();
        
        // ポストエフェクト
        this.renderPostEffects();
    }
    
    renderGradientBackground() {
        // 動的グラデーション背景
        for (let i = 0; i <= CONFIG.CANVAS_HEIGHT; i += 2) {
            const inter = map(i, 0, CONFIG.CANVAS_HEIGHT, 0, 1);
            const colorIndex = (this.frameCount * 0.001) % this.gradientColors.length;
            const nextColorIndex = (floor(colorIndex) + 1) % this.gradientColors.length;
            
            const c1 = this.gradientColors[floor(colorIndex)];
            const c2 = this.gradientColors[nextColorIndex];
            const blend = colorIndex - floor(colorIndex);
            
            const r = lerp(c1[0], c2[0], blend) * 0.2;
            const g = lerp(c1[1], c2[1], blend) * 0.2;
            const b = lerp(c1[2], c2[2], blend) * 0.3;
            
            stroke(r * inter, g * inter, b * inter + 30);
            line(0, i, CONFIG.CANVAS_WIDTH, i);
        }
    }
    
    renderGrid() {
        push();
        stroke(0, 255, 255, 20);
        strokeWeight(1);
        
        // パースペクティブグリッド
        const gridSize = 40;
        const perspective = 0.8;
        const scrollY = this.effects.gridScroll % gridSize;
        
        for (let y = -gridSize; y < CONFIG.CANVAS_HEIGHT + gridSize; y += gridSize) {
            const yPos = y + scrollY;
            const scale = map(yPos, 0, CONFIG.CANVAS_HEIGHT, 0.5, 1.5);
            
            // 横線
            line(0, yPos, CONFIG.CANVAS_WIDTH, yPos);
            
            // 縦線（パース効果）
            for (let x = 0; x < CONFIG.CANVAS_WIDTH; x += gridSize) {
                const xOffset = (x - CONFIG.CANVAS_WIDTH / 2) * (1 - scale) * perspective;
                line(x + xOffset, yPos, x + xOffset, yPos + gridSize);
            }
        }
        pop();
    }
    
    renderStars() {
        push();
        noStroke();
        this.stars.forEach(star => {
            const brightness = (sin(star.twinkle) * 0.5 + 0.5) * 255;
            fill(brightness);
            circle(star.x, star.y, star.size);
        });
        pop();
    }
    
    renderBackgroundEnemies() {
        push();
        this.backgroundEnemies.forEach(enemy => {
            push();
            translate(enemy.x, enemy.y);
            rotate(enemy.rotation);
            
            // シルエット描画
            fill(0, 50, 100, 50);
            noStroke();
            
            // 敵の形状
            if (enemy.type === 0) {
                // 三角形
                triangle(0, -enemy.size, -enemy.size * 0.8, enemy.size * 0.6, enemy.size * 0.8, enemy.size * 0.6);
            } else if (enemy.type === 1) {
                // ダイヤモンド
                quad(0, -enemy.size, enemy.size * 0.7, 0, 0, enemy.size, -enemy.size * 0.7, 0);
            } else {
                // 円
                circle(0, 0, enemy.size);
            }
            pop();
        });
        pop();
    }
    
    renderEnergyOrbs() {
        push();
        this.energyOrbs.forEach(orb => {
            const pulse = (sin(orb.pulsePhase) * 0.3 + 1) * orb.size;
            
            // グロー効果
            for (let i = 3; i > 0; i--) {
                push();
                colorMode(HSB, 360, 100, 100, 255);
                fill(orb.hue, 80, 100, 30 / i);
                noStroke();
                circle(orb.x, orb.y, pulse * (1 + i * 0.3));
                pop();
            }
            
            // コア
            push();
            colorMode(HSB, 360, 100, 100);
            fill(orb.hue, 50, 100);
            noStroke();
            circle(orb.x, orb.y, pulse * 0.5);
            pop();
        });
        pop();
    }
    
    renderBinaryParticles() {
        push();
        textAlign(CENTER, CENTER);
        this.binaryParticles.forEach(particle => {
            fill(0, 255, 0, particle.opacity);
            textSize(particle.size);
            text(particle.text, particle.x, particle.y);
        });
        pop();
    }
    
    renderNeonSigns() {
        push();
        textAlign(CENTER, CENTER);
        this.neonSigns.forEach(sign => {
            const flicker = sign.flicker > 0.3 ? 1 : 0.3;
            
            // ネオングロー
            for (let i = 3; i > 0; i--) {
                fill(sign.color[0], sign.color[1], sign.color[2], flicker * 30 / i);
                textSize(20 + i * 2);
                text(sign.text, sign.x, sign.y);
            }
            
            // メインテキスト
            fill(255, 255, 255, flicker * 255);
            textSize(20);
            text(sign.text, sign.x, sign.y);
        });
        pop();
    }
    
    renderDemoPlayer() {
        push();
        
        // トレイル
        this.demoPlayer.trail.forEach(point => {
            fill(100, 150, 255, point.opacity);
            noStroke();
            circle(point.x, point.y, 10);
        });
        
        // プレイヤー本体
        translate(this.demoPlayer.x, this.demoPlayer.y);
        rotate(this.demoPlayer.rotation);
        scale(this.demoPlayer.scale);
        
        // グロー
        for (let i = 3; i > 0; i--) {
            fill(100, 150, 255, 50 / i);
            noStroke();
            circle(0, 0, CONFIG.PLAYER_SIZE * (1 + i * 0.3));
        }
        
        // 本体
        fill(100, 150, 255);
        noStroke();
        triangle(0, -15, -12, 12, 12, 12);
        
        pop();
    }
    
    renderTitle() {
        push();
        textAlign(CENTER, CENTER);
        
        const titleX = CONFIG.CANVAS_WIDTH / 2;
        const titleY = CONFIG.CANVAS_HEIGHT / 3 + this.titleAnimation.floatY;
        
        // グリッチエフェクト
        if (this.titleAnimation.glitchOffset !== 0) {
            // 赤チャンネル
            fill(255, 0, 0, 100);
            textSize(72 * this.titleAnimation.scale);
            text("ULTRA SHOOTER", titleX - this.titleAnimation.glitchOffset, titleY);
            
            // 青チャンネル
            fill(0, 0, 255, 100);
            text("ULTRA SHOOTER", titleX + this.titleAnimation.glitchOffset, titleY);
        }
        
        // クロマティックアベレーション
        // 赤
        fill(255, 0, 100, 150);
        textSize(72 * this.titleAnimation.scale);
        text("ULTRA SHOOTER", titleX - this.titleAnimation.chromaticOffset, titleY);
        
        // 緑
        fill(0, 255, 100, 150);
        text("ULTRA SHOOTER", titleX, titleY);
        
        // 青
        fill(100, 100, 255, 150);
        text("ULTRA SHOOTER", titleX + this.titleAnimation.chromaticOffset, titleY);
        
        // ネオングロー
        for (let i = 5; i > 0; i--) {
            const alpha = 60 / i;
            const hue = (this.frameCount * 2 + i * 20) % 360;
            push();
            colorMode(HSB, 360, 100, 100, 255);
            fill(hue, 80, 100, alpha);
            textSize(72 * this.titleAnimation.scale + i * 4);
            text("ULTRA SHOOTER", titleX, titleY);
            pop();
        }
        
        // メインタイトル
        fill(255);
        textSize(72 * this.titleAnimation.scale);
        text("ULTRA SHOOTER", titleX, titleY);
        
        // サブタイトル
        fill(200, 200, 255, 200);
        textSize(16);
        text("THE ULTIMATE ARCADE EXPERIENCE", titleX, titleY + 50);
        
        pop();
    }
    
    renderMenuItems() {
        push();
        textAlign(CENTER, CENTER);
        
        this.menuItems.forEach((item, index) => {
            const glowIntensity = item.glow;
            
            // グロー効果
            if (index === 0) {
                // "Press SPACE to Start"は特別に強調
                for (let i = 3; i > 0; i--) {
                    fill(255, 255, 0, glowIntensity * 50 / i);
                    textSize(24 + i * 2);
                    text(item.text, CONFIG.CANVAS_WIDTH / 2, item.y);
                }
            }
            
            // メインテキスト
            if (index === 0) {
                // 点滅効果
                const blink = sin(this.frameCount * 0.05) * 0.5 + 0.5;
                fill(255, 255, 200, 200 + blink * 55);
                textSize(24);
            } else {
                fill(150, 200, 255, 200);
                textSize(18);
            }
            
            text(item.text, CONFIG.CANVAS_WIDTH / 2, item.y);
        });
        
        pop();
    }
    
    renderSparks() {
        push();
        this.sparks.forEach(spark => {
            const alpha = (spark.life / spark.maxLife) * 255;
            stroke(255, 200, 100, alpha);
            strokeWeight(2);
            line(spark.x, spark.y, spark.x - spark.vx * 2, spark.y - spark.vy * 2);
        });
        pop();
    }
    
    renderWaveform() {
        push();
        stroke(0, 255, 255, 50);
        strokeWeight(2);
        noFill();
        
        beginShape();
        for (let x = 0; x < CONFIG.CANVAS_WIDTH; x += 5) {
            const y = CONFIG.CANVAS_HEIGHT - 50 + 
                     sin(x * 0.02 + this.effects.waveOffset) * 20 * 
                     sin(this.frameCount * 0.01);
            vertex(x, y);
        }
        endShape();
        
        // ビートインジケーター
        const beatPhase = (this.frameCount * 0.05) % TWO_PI;
        if (sin(beatPhase) > 0.9) {
            this.effects.flashIntensity = 0.3;
        }
        
        pop();
    }
    
    renderPostEffects() {
        // スキャンライン
        push();
        stroke(0, 100);
        strokeWeight(1);
        for (let y = this.effects.scanlineOffset; y < CONFIG.CANVAS_HEIGHT; y += 3) {
            line(0, y, CONFIG.CANVAS_WIDTH, y);
        }
        pop();
        
        // CRT歪み効果（ビネット）
        push();
        noFill();
        for (let i = 0; i < 5; i++) {
            stroke(0, 0, 0, 30 - i * 5);
            strokeWeight((5 - i) * 20);
            rect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        }
        pop();
        
        // フラッシュ効果
        if (this.effects.flashIntensity > 0) {
            push();
            fill(255, 255, 255, this.effects.flashIntensity * 255);
            rect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            pop();
        }
        
        // ノイズ効果
        push();
        loadPixels();
        for (let i = 0; i < pixels.length; i += 4) {
            if (random() < 0.001) {
                const noise = random(50);
                pixels[i] += noise;
                pixels[i + 1] += noise;
                pixels[i + 2] += noise;
            }
        }
        updatePixels();
        pop();
    }
}