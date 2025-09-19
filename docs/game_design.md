# 🎮 ゲーム設計書

## ゲームコンセプト

### コア体験
**「調整と実験」による発見の楽しさ**

- パラメータ調整で劇的に変わるゲーム体験
- 予想外の組み合わせによる驚き
- 自分だけのオリジナルゲームの創造

### ターゲット体験時間
- **最小**: 5分（基本操作習得）
- **推奨**: 15分（3つの法則体験）
- **最大**: 無制限（自由改造）

## 面白いゲームを作る3つの法則

### 🎯 法則1: 意味のある選択

#### コンセプト
プレイヤーに**戦略的判断**を迫る仕組み

#### 実装：リスク＆リターンシステム

##### 距離による攻撃システム
```javascript
// 近距離（100px以内）
- 攻撃力: 3倍
- 被ダメージ: 2倍
- 状況: 高リスク・高リターン

// 中距離（200px以内）
- 攻撃力: 1.5倍
- 被ダメージ: 通常
- 状況: バランス重視

// 遠距離（200px超）
- 攻撃力: 通常
- 被ダメージ: 軽減
- ペナルティ: 敵増殖速度アップ
```

##### 選択の心理学
- **近づく**: 「一撃で倒したい」欲求
- **離れる**: 「安全でいたい」欲求
- **動き回る**: 「最適解を探したい」欲求

##### バランス調整ポイント
```javascript
CONFIG.CLOSE_RANGE = 100;        // 近距離判定
CONFIG.RISK_MULTIPLIER = 3;      // リスク倍率
CONFIG.DISTANCE_SPAWN_RATE = 2;  // 遠距離ペナルティ
```

### ⚡ 法則2: フィードバックループ

#### コンセプト
アクションに対する**即座の明確な反応**

#### 実装：多層フィードバックシステム

##### 視覚的フィードバック
```javascript
// ヒット時
- 敵の色変化（白→赤→元色）
- 画面の軽い揺れ
- パーティクル爆発

// 危険時
- 画面端の赤い枠表示
- プレイヤーの点滅
- 背景色の変化
```

##### システム的フィードバック
```javascript
// 連続撃破
- カウンター表示
- 3連続でボーナス効果
- 5連続で特殊エフェクト

// 状態変化
- ライフ減少の視覚化
- パワーアップ状態の表示
- 時間経過の可視化
```

##### 心理的効果
- **成功感**: 「やった！」という達成感
- **危機感**: 「やばい！」という緊張感
- **期待感**: 「次は？」という継続意欲

##### 調整パラメータ
```javascript
CONFIG.SCREEN_SHAKE = 5;         // 画面揺れ強度
CONFIG.COMBO_THRESHOLD = 3;      // コンボ発動閾値
CONFIG.FEEDBACK_DURATION = 10;   // エフェクト持続時間
CONFIG.FLASH_FREQUENCY = 5;      // 点滅周期
```

### ✨ 法則3: 発見の喜び

#### コンセプト
**予想外の相互作用**による驚きと発見

#### 実装：エマージェントゲームプレイ

##### 隠しコンボシステム
```javascript
// 敵撃破順序による隠し効果
RED → BLUE → RED = 一時無敵
BLUE → BLUE → GREEN = 攻撃力2倍
全色同時撃破 = 画面クリア
```

##### 物理的相互作用
```javascript
// 敵同士の衝突
- 小さい敵 + 大きい敵 = 連鎖爆発
- 同色の敵 = 合体して巨大化
- 異色の敵 = 分裂して増殖

// 環境との相互作用
- 壁での跳弾攻撃
- 画面端での反射連鎖
- 角への敵の挟み込み
```

##### 偶然の設計
```javascript
// ランダム要素の活用
- 敵の出現位置にわずかな揺らぎ
- 移動パターンに微細な変化
- クリティカルヒットの確率要素
```

##### 発見を促す仕組み
- **視覚的ヒント**: 特殊な組み合わせ時の予兆表示
- **音響ヒント**: 隠し要素発動時の特殊音
- **偶然の再現性**: 同じ操作で同じ結果

##### 調整パラメータ
```javascript
CONFIG.HIDDEN_COMBO = ['red', 'blue', 'red'];
CONFIG.CHAIN_REACTION = true;
CONFIG.BOUNCE_WALLS = true;
CONFIG.CRITICAL_CHANCE = 0.1;
CONFIG.CHAOS_FACTOR = 0.05;
```

## ゲームメカニクス詳細

### 基本ゲームループ

```javascript
function gameLoop() {
  // 1. 入力処理
  handleInput();
  
  // 2. 更新処理
  updatePlayer();
  updateEnemies();
  checkCollisions();
  updateEffects();
  
  // 3. 描画処理
  render();
  
  // 4. 状態チェック
  checkGameState();
}
```

### プレイヤーメカニクス

#### 移動システム
```javascript
// 基本移動
const MOVE_SPEED = 5;
const DIAGONAL_SPEED = MOVE_SPEED * 0.707; // √2/2

// 画面制限
player.x = constrain(player.x, 0, width);
player.y = constrain(player.y, 0, height);
```

#### アクションシステム
```javascript
// 距離による攻撃力計算
function calculateDamage(distance) {
  if (distance < CONFIG.CLOSE_RANGE) {
    return CONFIG.BASE_DAMAGE * CONFIG.RISK_MULTIPLIER;
  } else if (distance < CONFIG.MEDIUM_RANGE) {
    return CONFIG.BASE_DAMAGE * 1.5;
  } else {
    return CONFIG.BASE_DAMAGE;
  }
}
```

### 敵メカニクス

#### 基本AI
```javascript
// 移動パターン
const MOVEMENT_PATTERNS = {
  straight: (enemy) => {
    enemy.y += enemy.speed;
  },
  wave: (enemy) => {
    enemy.x += sin(enemy.wavePhase) * 2;
    enemy.y += enemy.speed;
    enemy.wavePhase += 0.1;
  },
  homing: (enemy) => {
    const angle = atan2(player.y - enemy.y, player.x - enemy.x);
    enemy.x += cos(angle) * enemy.speed * 0.5;
    enemy.y += sin(angle) * enemy.speed * 0.5;
  }
};
```

#### 出現システム
```javascript
// 動的な難易度調整
function spawnEnemy() {
  const spawnRate = calculateSpawnRate();
  const enemyType = selectEnemyType();
  const position = getSpawnPosition();
  
  enemies.push(new Enemy(position.x, position.y, enemyType));
}

function calculateSpawnRate() {
  const baseRate = CONFIG.BASE_SPAWN_RATE;
  const distanceMultiplier = getDistanceMultiplier();
  const timeMultiplier = getTimeMultiplier();
  
  return baseRate * distanceMultiplier * timeMultiplier;
}
```

### 衝突システム

#### 効率的な当たり判定
```javascript
function checkCollisions() {
  // プレイヤーと敵
  for (let enemy of enemies) {
    if (circleCollision(player, enemy)) {
      handlePlayerHit(enemy);
    }
  }
  
  // 敵同士の相互作用
  for (let i = 0; i < enemies.length; i++) {
    for (let j = i + 1; j < enemies.length; j++) {
      if (circleCollision(enemies[i], enemies[j])) {
        handleEnemyCollision(enemies[i], enemies[j]);
      }
    }
  }
}
```

## バランス設計哲学

### 「壊れた」バランスの積極活用

#### 意図的な不均衡
- **無双状態**: プレイヤーが圧倒的に強い瞬間
- **絶望状態**: 圧倒的に不利な状況
- **混沌状態**: 予測不可能な展開

#### バランスの発見プロセス
```javascript
// 極端な値から始める
CONFIG.ENEMY_SPEED = 0.1;  // 超低速
CONFIG.ENEMY_SPEED = 50;   // 超高速

// 中間を探る
CONFIG.ENEMY_SPEED = 5;    // 適度？

// 微調整
CONFIG.ENEMY_SPEED = 3.5;  // 最適解
```

### イテレーション重視

#### 高速な実験サイクル
1. **仮説**: 「この値を変えたら面白くなるかも」
2. **実装**: すぐに試せる設計
3. **検証**: 実際にプレイして確認
4. **学習**: 結果から次の仮説を立てる

#### データ駆動設計
```javascript
// 設定の外部化
const CONFIG = {
  PLAYER_SPEED: 5,
  ENEMY_SPEED: 2,
  SPAWN_RATE: 60,
  DANGER_THRESHOLD: 5,
  
  // 実験用パラメータ
  CHAOS_MODE: false,
  DEBUG_MODE: false,
  GOD_MODE: false
};
```

## 拡張設計

### モジュラー設計
各システムは独立して動作し、組み合わせで新しい体験を創造

### 設定ベース設計
新機能はCONFIGの追加だけで有効化

### 学習曲線設計
段階的に複雑さを追加し、常に理解可能な範囲に維持

この設計により、受講者は「ゲーム開発の本質は仮説検証」ということを体感的に学べます。