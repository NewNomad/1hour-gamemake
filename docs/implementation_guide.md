# 🚀 実装ガイド

## 段階的実装フロー

### フェーズ0: 環境セットアップ（5分）

#### 1. プロジェクト構造作成
```bash
mkdir game-base game-complete
mkdir -p game-base/{js/{classes,utils},css}
mkdir -p game-complete/{js/{classes,systems,utils},css}
```

#### 2. 基本HTMLファイル作成
```html
<!-- game-base/index.html -->
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>1時間ゲーム開発 - 土台版</title>
    <script src="https://cdn.jsdelivr.net/npm/p5@1.7.0/lib/p5.min.js"></script>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div id="game-container">
        <h1>🎮 1時間ゲーム開発</h1>
        <div id="instructions">
            <p>WASDまたは矢印キーで移動</p>
            <p>敵に近づくとリスク&リターン！</p>
        </div>
        <div id="game-canvas"></div>
    </div>
    
    <!-- 設定ファイル -->
    <script src="js/config.js"></script>
    
    <!-- クラスファイル -->
    <script src="js/classes/GameObject.js"></script>
    <script src="js/classes/Player.js"></script>
    <script src="js/classes/Enemy.js"></script>
    <script src="js/classes/GameState.js"></script>
    
    <!-- ユーティリティ -->
    <script src="js/utils/collision.js"></script>
    <script src="js/utils/helpers.js"></script>
    
    <!-- メインファイル -->
    <script src="js/main.js"></script>
</body>
</html>
```

### フェーズ1: 土台版実装（game-base/）

#### 1. CONFIG設定ファイル
```javascript
// game-base/js/config.js
const CONFIG = {
  // 基本設定
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  
  // プレイヤー設定
  PLAYER_SIZE: 30,
  PLAYER_SPEED: 5,
  PLAYER_LIVES: 3,
  PLAYER_COLOR: '#00aaff',
  
  // 敵設定
  ENEMY_SIZE: 20,
  ENEMY_SPEED: 2,
  ENEMY_COLOR: '#ff4444',
  SPAWN_INTERVAL: 60, // 1秒
  
  // ゲーム設定
  INVULNERABLE_DURATION: 120, // 2秒
  
  // デバッグ
  DEBUG_MODE: false,
  SHOW_HITBOXES: false
};

// 実行時調整用（コンソールから呼び出し可能）
function adjustConfig(key, value) {
  CONFIG[key] = value;
  console.log(`CONFIG.${key} = ${value}`);
}
```

#### 2. GameObject基底クラス
```javascript
// game-base/js/classes/GameObject.js
class GameObject {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.active = true;
    this.createdAt = millis();
  }
  
  update() {
    // サブクラスで実装
  }
  
  render() {
    // サブクラスで実装
  }
  
  getBounds() {
    return {
      left: this.x - this.width / 2,
      right: this.x + this.width / 2,
      top: this.y - this.height / 2,
      bottom: this.y + this.height / 2
    };
  }
  
  isOffScreen() {
    const bounds = this.getBounds();
    return bounds.right < 0 || bounds.left > width || 
           bounds.bottom < 0 || bounds.top > height;
  }
  
  destroy() {
    this.active = false;
  }
}
```

#### 3. Player基本実装
```javascript
// game-base/js/classes/Player.js
class Player extends GameObject {
  constructor(x, y) {
    super(x, y, CONFIG.PLAYER_SIZE, CONFIG.PLAYER_SIZE);
    this.speed = CONFIG.PLAYER_SPEED;
    this.lives = CONFIG.PLAYER_LIVES;
    this.invulnerable = false;
    this.invulnerableTime = 0;
  }
  
  update() {
    this.handleInput();
    this.updateInvulnerability();
    this.constrainToScreen();
  }
  
  handleInput() {
    let dx = 0, dy = 0;
    
    // WASD + 矢印キー対応
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) dx -= 1;  // A
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) dx += 1; // D
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) dy -= 1;    // W
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) dy += 1;  // S
    
    // 斜め移動の正規化
    if (dx !== 0 && dy !== 0) {
      dx *= 0.707; // √2/2
      dy *= 0.707;
    }
    
    this.x += dx * this.speed;
    this.y += dy * this.speed;
  }
  
  constrainToScreen() {
    this.x = constrain(this.x, this.width/2, width - this.width/2);
    this.y = constrain(this.y, this.height/2, height - this.height/2);
  }
  
  updateInvulnerability() {
    if (this.invulnerable) {
      this.invulnerableTime--;
      if (this.invulnerableTime <= 0) {
        this.invulnerable = false;
      }
    }
  }
  
  takeDamage() {
    if (this.invulnerable) return false;
    
    this.lives--;
    this.invulnerable = true;
    this.invulnerableTime = CONFIG.INVULNERABLE_DURATION;
    
    return true;
  }
  
  render() {
    push();
    
    // 無敵時の点滅
    if (this.invulnerable && Math.floor(millis() / 100) % 2) {
      tint(255, 128);
    }
    
    fill(CONFIG.PLAYER_COLOR);
    noStroke();
    circle(this.x, this.y, this.width);
    
    pop();
  }
}
```

#### 4. Enemy基本実装
```javascript
// game-base/js/classes/Enemy.js
class Enemy extends GameObject {
  constructor(x, y) {
    super(x, y, CONFIG.ENEMY_SIZE, CONFIG.ENEMY_SIZE);
    this.speed = CONFIG.ENEMY_SPEED;
    this.movementPattern = 'straight'; // 土台版は直進のみ
  }
  
  update() {
    this.updateMovement();
    this.checkBounds();
  }
  
  updateMovement() {
    this.y += this.speed; // 下に移動
  }
  
  checkBounds() {
    if (this.isOffScreen()) {
      this.destroy();
    }
  }
  
  render() {
    push();
    fill(CONFIG.ENEMY_COLOR);
    noStroke();
    circle(this.x, this.y, this.width);
    pop();
    
    // デバッグ用当たり判定表示
    if (CONFIG.SHOW_HITBOXES) {
      push();
      noFill();
      stroke(255, 0, 0);
      circle(this.x, this.y, this.width);
      pop();
    }
  }
}
```

#### 5. GameState基本実装
```javascript
// game-base/js/classes/GameState.js
class GameState {
  constructor() {
    this.state = 'menu'; // menu, playing, gameOver
    this.player = null;
    this.enemies = [];
    this.gameTime = 0;
    this.lastEnemySpawn = 0;
  }
  
  init() {
    this.player = new Player(width / 2, height - 50);
    this.enemies = [];
    this.gameTime = 0;
    this.lastEnemySpawn = 0;
    this.state = 'playing';
  }
  
  update() {
    if (this.state !== 'playing') return;
    
    this.gameTime++;
    this.updateSpawning();
    this.updateGameObjects();
    this.checkCollisions();
    this.cleanupObjects();
    this.checkGameEnd();
  }
  
  updateSpawning() {
    if (this.gameTime - this.lastEnemySpawn > CONFIG.SPAWN_INTERVAL) {
      this.spawnEnemy();
      this.lastEnemySpawn = this.gameTime;
    }
  }
  
  spawnEnemy() {
    const x = random(CONFIG.ENEMY_SIZE, width - CONFIG.ENEMY_SIZE);
    const y = -CONFIG.ENEMY_SIZE;
    this.enemies.push(new Enemy(x, y));
  }
  
  updateGameObjects() {
    this.player.update();
    for (let enemy of this.enemies) {
      enemy.update();
    }
  }
  
  checkCollisions() {
    for (let enemy of this.enemies) {
      if (circleCollision(this.player, enemy)) {
        if (this.player.takeDamage()) {
          enemy.destroy();
          console.log(`Lives remaining: ${this.player.lives}`);
        }
      }
    }
  }
  
  cleanupObjects() {
    this.enemies = this.enemies.filter(enemy => enemy.active);
  }
  
  checkGameEnd() {
    if (this.player.lives <= 0) {
      this.state = 'gameOver';
      console.log('Game Over! Press R to restart');
    }
  }
  
  restart() {
    this.init();
  }
  
  render() {
    // 背景
    background(20, 25, 40);
    
    // ゲームオブジェクト描画
    if (this.player) this.player.render();
    for (let enemy of this.enemies) {
      enemy.render();
    }
    
    // UI描画
    this.renderUI();
  }
  
  renderUI() {
    push();
    fill(255);
    textSize(16);
    text(`Lives: ${this.player ? this.player.lives : 0}`, 10, 25);
    text(`Enemies: ${this.enemies.length}`, 10, 45);
    
    if (this.state === 'gameOver') {
      textAlign(CENTER);
      textSize(32);
      text('GAME OVER', width/2, height/2);
      textSize(16);
      text('Press R to restart', width/2, height/2 + 40);
    }
    pop();
  }
}
```

#### 6. ユーティリティ実装
```javascript
// game-base/js/utils/collision.js
function circleCollision(obj1, obj2) {
  const dx = obj1.x - obj2.x;
  const dy = obj1.y - obj2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const minDistance = (obj1.width + obj2.width) / 2;
  
  return distance < minDistance;
}

// game-base/js/utils/helpers.js
function getDistanceBetween(obj1, obj2) {
  const dx = obj1.x - obj2.x;
  const dy = obj1.y - obj2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function getRandomColor() {
  return color(random(255), random(255), random(255));
}
```

#### 7. メインファイル
```javascript
// game-base/js/main.js
let gameState;

function setup() {
  const canvas = createCanvas(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
  canvas.parent('game-canvas');
  
  gameState = new GameState();
  gameState.init();
  
  console.log('Game started! Use WASD or arrow keys to move');
  console.log('Try adjustConfig("PLAYER_SPEED", 10) in console!');
}

function draw() {
  gameState.update();
  gameState.render();
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    if (gameState.state === 'gameOver') {
      gameState.restart();
    }
  }
  
  // デバッグ切り替え
  if (key === 'd' || key === 'D') {
    CONFIG.DEBUG_MODE = !CONFIG.DEBUG_MODE;
    CONFIG.SHOW_HITBOXES = CONFIG.DEBUG_MODE;
  }
}
```

### フェーズ2: 法則1実装（意味のある選択）

#### ショットガンシステム追加
```javascript
// CONFIG.jsに追加
const CONFIG = {
  // ...existing config...
  
  // 法則1: 意味のある選択
  LAW_OF_CHOICE: {
    ENABLED: true,
    SHOTGUN_SPREAD_ANGLE: 15,  // ショットガンの拡散角度（度）
    CLOSE_RANGE: 150,          // 近距離判定（ピクセル）
    MID_RANGE: 300,            // 中距離判定（ピクセル）
    
    // 距離ベースの発射レート（ミリ秒）
    SHOOT_COOLDOWN_CLOSE: 100,   // 近距離: 高速
    SHOOT_COOLDOWN_MID: 200,     // 中距離: 中速  
    SHOOT_COOLDOWN_FAR: 300,     // 遠距離: 低速
    
    // ダメージ倍率
    DAMAGE_MULTIPLIER_CLOSE: 3,  // 近距離時の全弾ヒットダメージ
    DAMAGE_MULTIPLIER_MID: 2,    // 中距離時
    DAMAGE_MULTIPLIER_FAR: 1     // 遠距離時
  }
};

// Player.jsのshoot()メソッドを改修
shoot(enemies) {
  const currentTime = millis();
  const shootCooldown = this.getShootCooldown(enemies);
  
  if (currentTime - this.lastShotTime < shootCooldown) {
    return null;
  }
  
  const bullets = [];
  
  if (CONFIG.LAW_OF_CHOICE.ENABLED) {
    // ショットガンシステム: 3つの弾を発射
    const bulletX = this.x + this.size / 2 + 5;
    const bulletY = this.y;
    const spreadAngle = CONFIG.LAW_OF_CHOICE.SHOTGUN_SPREAD_ANGLE;
    
    // 中央、上、下の3方向に発射
    bullets.push(new Bullet(bulletX, bulletY, 1, 0));
    
    const upAngleRad = -spreadAngle * Math.PI / 180;
    bullets.push(new Bullet(bulletX, bulletY, Math.cos(upAngleRad), Math.sin(upAngleRad)));
    
    const downAngleRad = spreadAngle * Math.PI / 180;
    bullets.push(new Bullet(bulletX, bulletY, Math.cos(downAngleRad), Math.sin(downAngleRad)));
  }
  
  this.lastShotTime = currentTime;
  return bullets;
}

// 距離ベースの発射レート計算
getShootCooldown(enemies) {
  if (!CONFIG.LAW_OF_CHOICE.ENABLED) {
    return CONFIG.SHOOT_COOLDOWN;
  }
  
  const closestDistance = this.getClosestEnemyDistance(enemies);
  
  if (closestDistance <= CONFIG.LAW_OF_CHOICE.CLOSE_RANGE) {
    return CONFIG.LAW_OF_CHOICE.SHOOT_COOLDOWN_CLOSE;
  } else if (closestDistance <= CONFIG.LAW_OF_CHOICE.MID_RANGE) {
    return CONFIG.LAW_OF_CHOICE.SHOOT_COOLDOWN_MID;
  } else {
    return CONFIG.LAW_OF_CHOICE.SHOOT_COOLDOWN_FAR;
  }
}
```

### フェーズ3: 法則2実装（フィードバックループ）

#### 視覚フィードバッククラスによるエフェクトシステム
```javascript
// CONFIG.jsに追加
LAW_OF_FEEDBACK: {
  SCREEN_SHAKE: 5,      // 画面揺れ強度
  PARTICLE_COUNT: 10,   // パーティクル数
  ANIMATION_SPEED: 0.1, // アニメーション速度
  COMBO_DISPLAY: true   // コンボ表示
}

// 新規ファイル: js/classes/Effect.js
class Effect extends GameObject {
  constructor(x, y, type, options = {}) {
    super(x, y, 0, 0);
    this.type = type;
    this.life = options.life || 30;
    this.maxLife = this.life;
    this.options = options;
  }
  
  update() {
    this.life--;
    if (this.life <= 0) {
      this.destroy();
    }
  }
  
  render() {
    const alpha = this.life / this.maxLife;
    
    push();
    
    switch (this.type) {
      case 'particle':
        // 移動時・発射時のパーティクル
        fill(255, 255, 100, alpha * 255);
        circle(this.x, this.y, alpha * 5);
        break;
      case 'muzzle_flash':
        // 発射時の火花エフェクト
        fill(255, 200, 100, alpha * 255);
        circle(this.x, this.y, (1 - alpha) * 15);
        break;
      case 'screen_shake':
        // 画面揺れ効果（描画はGameStateで処理）
        break;
    }
    
    pop();
  }
}

// Player.jsにSquash & Stretchアニメーション追加
render(enemies = []) {
  push();
  
  // Squash & Stretch効果
  let scaleX = 1;
  let scaleY = 1;
  
  if (this.vx !== 0 || this.vy !== 0) {
    // 移動時: 移動方向に伸び
    scaleX = 1 + abs(this.vx) * CONFIG.LAW_OF_FEEDBACK.ANIMATION_SPEED;
    scaleY = 1 + abs(this.vy) * CONFIG.LAW_OF_FEEDBACK.ANIMATION_SPEED;
  }
  
  if (this.justShot) {
    // 発射時: 反動で縮み
    scaleX *= 0.9;
    scaleY *= 1.1;
    this.justShot = false;
  }
  
  scale(scaleX, scaleY);
  
  // プレイヤー描画（距離ベースの色変化含む）
  // ... existing render code ...
  
  pop();
}

// GameState.jsにフィードバックシステム追加
constructor() {
  // ...existing...
  this.effects = [];
  this.screenShake = 0;
  this.combo = 0;
}

addEffect(x, y, type, options) {
  this.effects.push(new Effect(x, y, type, options));
}

applyScreenShake(intensity) {
  this.screenShake = intensity;
}

// 画面揺れ処理
updateScreenShake() {
  if (this.screenShake > 0) {
    const shakeX = random(-this.screenShake, this.screenShake);
    const shakeY = random(-this.screenShake, this.screenShake);
    translate(shakeX, shakeY);
    this.screenShake *= 0.9; // 減衰
  }
}
```

### フェーズ4: 法則3実装（発見の喜び）

#### ランダムマップ生成とパワーアップ選択システム
```javascript
// CONFIG.jsに追加
LAW_OF_DISCOVERY: {
  CRITICAL_CHANCE: 0.1,     // 隠しメカニクス
  MAP_VARIATIONS: 5,        // マップパターン数
  POWERUP_COUNT: 3,         // 選択肢数
  PENALTY_MULTIPLIER: 1.2   // ペナルティ倍率
}

// 新規ファイル: js/systems/discovery.js
class DiscoverySystem {
  static generateRandomEnemyPattern(stageNumber) {
    const patterns = [
      // パターン1: 上からの直線攻撃
      { formation: 'line', direction: 'down', count: 3 },
      // パターン2: 左右からの挟み撃ち
      { formation: 'pincer', direction: 'sides', count: 4 },
      // パターン3: ランダム配置
      { formation: 'random', direction: 'any', count: 5 },
      // パターン4: 円形配置
      { formation: 'circle', direction: 'center', count: 6 },
      // パターン5: 波状攻撃
      { formation: 'wave', direction: 'down', count: 8 }
    ];
    
    const patternIndex = (stageNumber + Math.floor(Math.random() * patterns.length)) % patterns.length;
    return patterns[patternIndex];
  }
  
  static generatePowerUpChoices() {
    const powerUps = [
      {
        name: "高速発射",
        effect: { fireRate: 1.5 },
        penalty: { enemySpeed: 1.2 },
        description: "発射レート+50%（敵速度+20%）"
      },
      {
        name: "攻撃力強化", 
        effect: { damage: 2.0 },
        penalty: { enemyHP: 2 },
        description: "攻撃力2倍（敵HP2倍）"
      },
      {
        name: "機動力向上",
        effect: { speed: 1.3 },
        penalty: { enemyCount: 1.3 },
        description: "移動速度+30%（敵出現数+30%）"
      },
      {
        name: "ショットガン拡散",
        effect: { spreadAngle: 25 },
        penalty: { enemySize: 1.1 },
        description: "拡散角度拡大（敵サイズ+10%）"
      }
    ];
    
    // ランダムに3つ選択
    const shuffled = powerUps.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, CONFIG.LAW_OF_DISCOVERY.POWERUP_COUNT);
  }
  
  static applyPowerUp(choice, gameState) {
    // プレイヤー強化
    if (choice.effect.fireRate) {
      CONFIG.LAW_OF_CHOICE.SHOOT_COOLDOWN_CLOSE /= choice.effect.fireRate;
      CONFIG.LAW_OF_CHOICE.SHOOT_COOLDOWN_MID /= choice.effect.fireRate;
      CONFIG.LAW_OF_CHOICE.SHOOT_COOLDOWN_FAR /= choice.effect.fireRate;
    }
    
    if (choice.effect.damage) {
      CONFIG.LAW_OF_CHOICE.DAMAGE_MULTIPLIER_CLOSE *= choice.effect.damage;
      CONFIG.LAW_OF_CHOICE.DAMAGE_MULTIPLIER_MID *= choice.effect.damage;
      CONFIG.LAW_OF_CHOICE.DAMAGE_MULTIPLIER_FAR *= choice.effect.damage;
    }
    
    if (choice.effect.speed) {
      CONFIG.PLAYER_SPEED *= choice.effect.speed;
    }
    
    if (choice.effect.spreadAngle) {
      CONFIG.LAW_OF_CHOICE.SHOTGUN_SPREAD_ANGLE = choice.effect.spreadAngle;
    }
    
    // ペナルティ適用
    if (choice.penalty.enemySpeed) {
      CONFIG.ENEMY_SPEED *= choice.penalty.enemySpeed;
    }
    
    if (choice.penalty.enemyHP) {
      Object.keys(CONFIG.ENEMY_TYPES).forEach(type => {
        CONFIG.ENEMY_TYPES[type].hp *= choice.penalty.enemyHP;
      });
    }
    
    if (choice.penalty.enemyCount) {
      CONFIG.ENEMY_SPAWN_RATE /= choice.penalty.enemyCount;
    }
    
    if (choice.penalty.enemySize) {
      Object.keys(CONFIG.ENEMY_TYPES).forEach(type => {
        CONFIG.ENEMY_TYPES[type].size *= choice.penalty.enemySize;
      });
    }
  }
}

// GameState.jsにステージクリア処理
onStageComplete() {
  this.state = 'POWERUP_SELECTION';
  this.powerUpChoices = DiscoverySystem.generatePowerUpChoices();
}

handlePowerUpSelection(choiceIndex) {
  const selectedChoice = this.powerUpChoices[choiceIndex];
  DiscoverySystem.applyPowerUp(selectedChoice, this);
  this.nextStage();
}
```

## 完成版（game-complete/）への移行

### 高度な機能実装

#### システムファイル追加
```javascript
// game-complete/js/systems/feedback.js
class FeedbackSystem {
  static applyHitFeedback(target, attacker) {
    // 画面揺れ
    gameState.applyScreenShake(CONFIG.LAW_OF_FEEDBACK.SCREEN_SHAKE);
    
    // エフェクト生成
    gameState.addEffect(target.x, target.y, 'explosion');
    
    // コンボ更新
    gameState.incrementCombo();
  }
}

// game-complete/js/systems/choice.js
class ChoiceSystem {
  static calculateRiskReward(player, enemies) {
    const nearestDistance = player.getDistanceToNearestEnemy();
    
    return {
      damageMultiplier: this.getDamageMultiplier(nearestDistance),
      riskMultiplier: this.getRiskMultiplier(nearestDistance),
      spawnRateMultiplier: this.getSpawnRateMultiplier(nearestDistance)
    };
  }
}

// game-complete/js/systems/discovery.js
class DiscoverySystem {
  static checkForSecrets(gameState) {
    // 隠しコンボ検出
    // 特殊相互作用の処理
    // ランダムイベントの管理
  }
}
```

## デバッグとテスト

### デバッグ機能
```javascript
// コンソール経由でのリアルタイム調整
function quickTest() {
  CONFIG.PLAYER_SPEED = 20;
  CONFIG.SPAWN_INTERVAL = 10;
  CONFIG.DEBUG_MODE = true;
  console.log('Quick test mode activated!');
}

function chaosMode() {
  CONFIG.LAW_OF_CHOICE.RISK_MULTIPLIER = 10;
  CONFIG.LAW_OF_FEEDBACK.SCREEN_SHAKE = 20;
  CONFIG.SPAWN_INTERVAL = 5;
  console.log('CHAOS MODE ACTIVATED!');
}

function godMode() {
  gameState.player.lives = 999;
  gameState.player.invulnerable = true;
  console.log('God mode: ON');
}
```

### 拡張ポイント

#### プラグインシステム
```javascript
// 受講者が追加できる拡張例
class WeaponPlugin {
  constructor() {
    this.enabled = true;
  }
  
  onPlayerUpdate(player) {
    if (keyIsDown(32)) { // スペースキー
      this.fireBullet(player);
    }
  }
  
  fireBullet(player) {
    // 弾丸システム実装
  }
}

// プラグイン登録
gameState.addPlugin(new WeaponPlugin());
```

## 学習曲線設計

### 段階的複雑化
1. **基本移動**（1分で習得）
2. **敵との衝突**（2分で理解）
3. **距離の概念**（5分で戦略理解）
4. **エフェクトの楽しさ**（3分で体感）
5. **隠し要素の発見**（10分で偶然発見）

### 拡張のヒント
```javascript
// 受講者へのヒント集
const EXPANSION_IDEAS = [
  "try CONFIG.PLAYER_SPEED = 20",
  "try CONFIG.SPAWN_INTERVAL = 10",
  "add new enemy types",
  "implement power-ups",
  "create particle trails",
  "add sound effects",
  "implement scoring system",
  "create multiple levels"
];
```

この実装ガイドに従うことで、段階的に完成度の高いゲームを作成できます。各段階で必ず動作確認を行い、受講者が「動くものを作れた」という達成感を得られるように設計しています。