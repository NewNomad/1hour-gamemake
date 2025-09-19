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

#### 距離ベースシステム追加
```javascript
// Player.jsに追加
getDistanceToNearestEnemy() {
  let minDistance = Infinity;
  for (let enemy of gameState.enemies) {
    const distance = getDistanceBetween(this, enemy);
    minDistance = Math.min(minDistance, distance);
  }
  return minDistance === Infinity ? 0 : minDistance;
}

// CONFIG.jsに追加
const CONFIG = {
  // ...existing config...
  
  // 法則1: 意味のある選択
  LAW_OF_CHOICE: {
    CLOSE_RANGE: 100,
    MEDIUM_RANGE: 200,
    CLOSE_DAMAGE_MULTIPLIER: 3,
    CLOSE_RISK_MULTIPLIER: 2,
    DISTANCE_SPAWN_RATE: 1.5
  }
};

// GameState.jsのupdateSpawning()を修正
getSpawnInterval() {
  const baseInterval = CONFIG.SPAWN_INTERVAL;
  const distance = this.player.getDistanceToNearestEnemy();
  
  // 遠距離にいると敵の出現が早くなる
  if (distance > CONFIG.LAW_OF_CHOICE.MEDIUM_RANGE) {
    return baseInterval / CONFIG.LAW_OF_CHOICE.DISTANCE_SPAWN_RATE;
  }
  
  return baseInterval;
}
```

### フェーズ3: 法則2実装（フィードバックループ）

#### エフェクトシステム追加
```javascript
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
    tint(255, alpha * 255);
    
    switch (this.type) {
      case 'explosion':
        fill(255, 100, 100);
        circle(this.x, this.y, (1 - alpha) * 50);
        break;
      case 'hit':
        fill(255, 255, 100);
        circle(this.x, this.y, alpha * 20);
        break;
    }
    
    pop();
  }
}

// GameState.jsに追加
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
```

### フェーズ4: 法則3実装（発見の喜び）

#### 隠し要素システム
```javascript
// CONFIG.jsに追加
LAW_OF_DISCOVERY: {
  HIDDEN_COMBO: ['red', 'blue', 'red'],
  CHAIN_REACTION: true,
  CRITICAL_CHANCE: 0.1,
  SECRET_EFFECTS: true
}

// Enemy.jsに追加
constructor(x, y, type = null) {
  // ...existing...
  this.type = type || this.getRandomType();
  this.color = this.getTypeColor();
}

getRandomType() {
  const types = ['red', 'blue', 'green'];
  return random(types);
}

getTypeColor() {
  const colors = {
    red: '#ff4444',
    blue: '#4444ff',
    green: '#44ff44'
  };
  return colors[this.type] || CONFIG.ENEMY_COLOR;
}

// GameState.jsに隠しコンボ検出
checkHiddenCombos() {
  // 最近撃破した敵のタイプを記録
  // 特定の順序で撃破された場合の特殊効果
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