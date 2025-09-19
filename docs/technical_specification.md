# 🔧 技術仕様書

## アーキテクチャ概要

### 技術スタック
- **メインライブラリ**: p5.js (v1.7.0+)
- **言語**: JavaScript (ES6+)
- **モジュール**: ES6 Modules
- **配信**: 静的ファイル（CDN使用）

### 設計パターン
- **オブジェクト指向**: クラスベース設計
- **コンポーネント**: 機能分割アーキテクチャ
- **設定駆動**: CONFIG オブジェクト中心設計
- **イベント駆動**: p5.js ライフサイクル活用

## クラス設計

### 🏗️ GameObject（基底クラス）

#### 概要
全ゲームオブジェクトの共通基底クラス

#### クラス定義
```javascript
class GameObject {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.active = true;
    this.createdAt = millis();
  }
  
  // 抽象メソッド（サブクラスで実装）
  update() {
    throw new Error('update() must be implemented');
  }
  
  render() {
    throw new Error('render() must be implemented');
  }
  
  // 共通メソッド
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

#### 責務
- 基本的な位置・サイズ管理
- ライフサイクル管理
- 共通ユーティリティ提供

### 🎮 Player クラス

#### 概要
プレイヤーキャラクターの制御

#### クラス定義
```javascript
class Player extends GameObject {
  constructor(x, y) {
    super(x, y, CONFIG.PLAYER_SIZE, CONFIG.PLAYER_SIZE);
    this.speed = CONFIG.PLAYER_SPEED;
    this.lives = CONFIG.PLAYER_LIVES;
    this.invulnerable = false;
    this.invulnerableTime = 0;
    this.lastAttackTime = 0;
  }
  
  update() {
    this.handleInput();
    this.updateInvulnerability();
    this.constrainToScreen();
  }
  
  handleInput() {
    let dx = 0, dy = 0;
    
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
  
  takeDamage() {
    if (this.invulnerable) return false;
    
    this.lives--;
    this.invulnerable = true;
    this.invulnerableTime = CONFIG.INVULNERABLE_DURATION;
    
    return true;
  }
  
  getDistanceToNearestEnemy() {
    let minDistance = Infinity;
    for (let enemy of gameState.enemies) {
      const distance = dist(this.x, this.y, enemy.x, enemy.y);
      minDistance = Math.min(minDistance, distance);
    }
    return minDistance;
  }
  
  render() {
    push();
    
    // 無敵時の点滅効果
    if (this.invulnerable && Math.floor(millis() / 100) % 2) {
      tint(255, 128);
    }
    
    fill(CONFIG.PLAYER_COLOR);
    circle(this.x, this.y, this.width);
    
    pop();
  }
}
```

#### 主要メソッド
- `handleInput()`: キーボード入力処理
- `takeDamage()`: ダメージ処理と無敵時間
- `getDistanceToNearestEnemy()`: 距離計算
- `constrainToScreen()`: 画面内制限

### 👹 Enemy クラス

#### 概要
敵キャラクターの基本クラス

#### クラス定義
```javascript
class Enemy extends GameObject {
  constructor(x, y, type = 'basic') {
    const config = CONFIG.ENEMY_TYPES[type];
    super(x, y, config.size, config.size);
    
    this.type = type;
    this.speed = config.speed;
    this.hp = config.hp;
    this.maxHp = config.hp;
    this.color = config.color;
    this.points = config.points;
    
    // AI関連
    this.movementPattern = config.movementPattern;
    this.wavePhase = random(TWO_PI);
    this.targetAngle = 0;
    
    // エフェクト関連
    this.hitFlash = 0;
    this.deathAnimation = 0;
  }
  
  update() {
    this.updateMovement();
    this.updateEffects();
    this.checkBounds();
  }
  
  updateMovement() {
    switch (this.movementPattern) {
      case 'straight':
        this.y += this.speed;
        break;
        
      case 'wave':
        this.x += sin(this.wavePhase) * 2;
        this.y += this.speed;
        this.wavePhase += 0.1;
        break;
        
      case 'homing':
        const player = gameState.player;
        this.targetAngle = atan2(player.y - this.y, player.x - this.x);
        this.x += cos(this.targetAngle) * this.speed * 0.5;
        this.y += sin(this.targetAngle) * this.speed * 0.5;
        break;
    }
  }
  
  takeDamage(damage) {
    this.hp -= damage;
    this.hitFlash = CONFIG.HIT_FLASH_DURATION;
    
    if (this.hp <= 0) {
      this.destroy();
      this.spawnDeathEffect();
      return true; // 撃破成功
    }
    return false;
  }
  
  render() {
    push();
    
    // ヒット時の色変化
    if (this.hitFlash > 0) {
      fill(255); // 白く点滅
    } else {
      fill(this.color);
    }
    
    circle(this.x, this.y, this.width);
    
    // HPバー（オプション）
    if (this.hp < this.maxHp) {
      this.renderHealthBar();
    }
    
    pop();
  }
}
```

#### 敵タイプ設定
```javascript
CONFIG.ENEMY_TYPES = {
  basic: {
    size: 20,
    speed: 2,
    hp: 1,
    color: '#ff4444',
    points: 10,
    movementPattern: 'straight'
  },
  wave: {
    size: 25,
    speed: 1.5,
    hp: 2,
    color: '#44ff44',
    points: 20,
    movementPattern: 'wave'
  },
  homing: {
    size: 30,
    speed: 1,
    hp: 3,
    color: '#4444ff',
    points: 30,
    movementPattern: 'homing'
  }
};
```

### 🎯 GameState クラス

#### 概要
ゲーム全体の状態管理

#### クラス定義
```javascript
class GameState {
  constructor() {
    this.state = 'menu'; // menu, playing, paused, gameOver
    this.player = null;
    this.enemies = [];
    this.effects = [];
    this.ui = null;
    
    // スコア関連（非推奨だが実装）
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    
    // 時間管理
    this.gameTime = 0;
    this.lastEnemySpawn = 0;
    
    // 統計
    this.stats = {
      enemiesDefeated: 0,
      damageTaken: 0,
      timeAlive: 0
    };
  }
  
  init() {
    this.player = new Player(width / 2, height - 50);
    this.enemies = [];
    this.effects = [];
    this.ui = new UIManager();
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
    if (this.gameTime - this.lastEnemySpawn > this.getSpawnInterval()) {
      this.spawnEnemy();
      this.lastEnemySpawn = this.gameTime;
    }
  }
  
  getSpawnInterval() {
    const baseInterval = CONFIG.BASE_SPAWN_INTERVAL;
    const timeMultiplier = 1 - Math.min(this.gameTime / 3600, 0.7); // 60秒で30%高速化
    const distanceMultiplier = this.getDistanceSpawnMultiplier();
    
    return Math.max(baseInterval * timeMultiplier * distanceMultiplier, 10);
  }
}
```

### 💫 Effect クラス

#### 概要
視覚エフェクトの管理

#### クラス定義
```javascript
class Effect extends GameObject {
  constructor(x, y, type, options = {}) {
    super(x, y, 0, 0);
    this.type = type;
    this.life = options.life || 60;
    this.maxLife = this.life;
    this.options = options;
  }
  
  update() {
    this.life--;
    if (this.life <= 0) {
      this.destroy();
    }
    
    // タイプ別更新
    switch (this.type) {
      case 'explosion':
        this.updateExplosion();
        break;
      case 'particle':
        this.updateParticle();
        break;
    }
  }
  
  render() {
    const alpha = this.life / this.maxLife;
    
    push();
    tint(255, alpha * 255);
    
    switch (this.type) {
      case 'explosion':
        this.renderExplosion();
        break;
      case 'particle':
        this.renderParticle();
        break;
    }
    
    pop();
  }
}
```

## CONFIG システム仕様

### 🔧 設定構造

#### 基本設定
```javascript
const CONFIG = {
  // ゲーム基本設定
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  FRAME_RATE: 60,
  
  // プレイヤー設定
  PLAYER_SIZE: 30,
  PLAYER_SPEED: 5,
  PLAYER_LIVES: 3,
  PLAYER_COLOR: '#00aaff',
  INVULNERABLE_DURATION: 120, // 2秒
  
  // 敵設定
  BASE_SPAWN_INTERVAL: 60, // 1秒
  ENEMY_CLEANUP_DISTANCE: 100,
  
  // 3つの法則設定
  LAW_OF_CHOICE: {
    CLOSE_RANGE: 100,
    MEDIUM_RANGE: 200,
    RISK_MULTIPLIER: 3,
    DISTANCE_SPAWN_RATE: 2
  },
  
  LAW_OF_FEEDBACK: {
    SCREEN_SHAKE: 5,
    COMBO_THRESHOLD: 3,
    FEEDBACK_DURATION: 10,
    FLASH_FREQUENCY: 5,
    HIT_FLASH_DURATION: 10
  },
  
  LAW_OF_DISCOVERY: {
    HIDDEN_COMBO: ['red', 'blue', 'red'],
    CHAIN_REACTION: true,
    BOUNCE_WALLS: true,
    CRITICAL_CHANCE: 0.1,
    CHAOS_FACTOR: 0.05
  },
  
  // デバッグ設定
  DEBUG_MODE: false,
  SHOW_HITBOXES: false,
  GOD_MODE: false,
  INFINITE_LIVES: false,
  
  // 実験用設定
  EXPERIMENTAL: {
    CHAOS_MODE: false,
    BULLET_TIME: false,
    GRAVITY_MODE: false,
    REVERSE_CONTROLS: false
  }
};
```

#### 動的設定変更
```javascript
// 実行時設定変更のサポート
function updateConfig(path, value) {
  const keys = path.split('.');
  let current = CONFIG;
  
  for (let i = 0; i < keys.length - 1; i++) {
    current = current[keys[i]];
  }
  
  current[keys[keys.length - 1]] = value;
  console.log(`CONFIG.${path} = ${value}`);
}

// 使用例
updateConfig('PLAYER_SPEED', 10);
updateConfig('LAW_OF_CHOICE.RISK_MULTIPLIER', 5);
```

## ユーティリティ システム

### 🔍 当たり判定

#### collision.js
```javascript
// 円形当たり判定
function circleCollision(obj1, obj2) {
  const dx = obj1.x - obj2.x;
  const dy = obj1.y - obj2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const minDistance = (obj1.width + obj2.width) / 2;
  
  return distance < minDistance;
}

// 矩形当たり判定
function rectCollision(obj1, obj2) {
  const bounds1 = obj1.getBounds();
  const bounds2 = obj2.getBounds();
  
  return !(bounds1.right < bounds2.left || 
           bounds1.left > bounds2.right || 
           bounds1.bottom < bounds2.top || 
           bounds1.top > bounds2.bottom);
}

// 高度な当たり判定（回転対応）
function rotatedRectCollision(obj1, obj2) {
  // SAT (Separating Axis Theorem) implementation
  // より複雑な形状に対応
}
```

### 🎨 ヘルパー関数

#### helpers.js
```javascript
// 色操作
function lerpColor(color1, color2, amount) {
  const r1 = red(color1), g1 = green(color1), b1 = blue(color1);
  const r2 = red(color2), g2 = green(color2), b2 = blue(color2);
  
  return color(
    lerp(r1, r2, amount),
    lerp(g1, g2, amount),
    lerp(b1, b2, amount)
  );
}

// 画面揺れ
function applyScreenShake(intensity) {
  const shakeX = random(-intensity, intensity);
  const shakeY = random(-intensity, intensity);
  translate(shakeX, shakeY);
}

// 数値補間
function smoothStep(edge0, edge1, x) {
  const t = constrain((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

// ベクトル操作
function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  if (magnitude === 0) return { x: 0, y: 0 };
  return { x: vector.x / magnitude, y: vector.y / magnitude };
}
```

## パフォーマンス仕様

### 🚀 最適化指針

#### オブジェクトプール
```javascript
class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    this.active = [];
    
    // 初期プール作成
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }
  
  get() {
    let obj = this.pool.pop();
    if (!obj) {
      obj = this.createFn();
    }
    this.active.push(obj);
    return obj;
  }
  
  release(obj) {
    const index = this.active.indexOf(obj);
    if (index !== -1) {
      this.active.splice(index, 1);
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }
}
```

#### フレームレート管理
```javascript
let lastTime = 0;
let deltaTime = 0;
const TARGET_FPS = 60;
const TARGET_FRAME_TIME = 1000 / TARGET_FPS;

function optimizedDraw() {
  const currentTime = millis();
  deltaTime = currentTime - lastTime;
  
  // フレーム制限
  if (deltaTime < TARGET_FRAME_TIME) {
    return;
  }
  
  // 実際のゲーム描画
  actualDraw();
  
  lastTime = currentTime;
}
```

### 📊 メモリ管理

#### ガベージコレクション対策
```javascript
// オブジェクト再利用
const tempVector = { x: 0, y: 0 };

function calculateDistance(obj1, obj2) {
  tempVector.x = obj1.x - obj2.x;
  tempVector.y = obj1.y - obj2.y;
  return Math.sqrt(tempVector.x * tempVector.x + tempVector.y * tempVector.y);
}

// 配列操作の最適化
function removeDeadObjects(array) {
  for (let i = array.length - 1; i >= 0; i--) {
    if (!array[i].active) {
      array.splice(i, 1);
    }
  }
}
```

## API仕様

### 🔌 拡張インターフェース

#### プラグインシステム
```javascript
class GamePlugin {
  constructor(name) {
    this.name = name;
    this.enabled = true;
  }
  
  // フックポイント
  onGameStart() {}
  onGameEnd() {}
  onPlayerHit() {}
  onEnemyDestroyed() {}
  onUpdate() {}
  onRender() {}
}

// プラグイン登録
const pluginManager = {
  plugins: [],
  register(plugin) {
    this.plugins.push(plugin);
  },
  trigger(hookName, ...args) {
    for (let plugin of this.plugins) {
      if (plugin.enabled && plugin[hookName]) {
        plugin[hookName](...args);
      }
    }
  }
};
```

この技術仕様に基づいて、拡張しやすく保守しやすいゲームを実装できます。