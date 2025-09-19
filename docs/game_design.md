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

##### ショットガンシステム
敵との距離に基づくリスク・リワードシステム：

```javascript
// 近距離（150px以内）
- 発射レート: 100ms（高速）
- 武器: ショットガン（3つの弾を同時発射）
- ダメージ倍率: 3倍
- 状況: 高リスク・高リターン

// 中距離（300px以内）
- 発射レート: 200ms（中速）
- 武器: ショットガン（3つの弾を同時発射）
- ダメージ倍率: 2倍
- 状況: バランス重視

// 遠距離（300px超）
- 発射レート: 300ms（低速）
- 武器: ショットガン（3つの弾を同時発射）
- ダメージ倍率: 1倍
- 状況: 低リスク・低リターン
```

##### 選択の心理学
- **近づく**: 「高速連射で一気に倒したい」欲求
- **離れる**: 「安全を保ちたい」欲求
- **距離調整**: 「最適な戦闘距離を探したい」欲求

##### バランス調整ポイント
```javascript
CONFIG.LAW_OF_CHOICE.CLOSE_RANGE = 150;        // 近距離判定
CONFIG.LAW_OF_CHOICE.SHOOT_COOLDOWN_CLOSE = 100;  // 近距離発射レート
CONFIG.LAW_OF_CHOICE.SHOTGUN_SPREAD_ANGLE = 15;   // ショットガン拡散角度
```

### ⚡ 法則2: フィードバックループ

#### コンセプト
プレイヤーのアクションに対する**即座の視覚・音響反応**

#### 実装：視覚フィードバッククラスによるエフェクトシステム

##### Playerアニメーション
```javascript
// Squash & Stretch アニメーション
- 移動時: プレイヤーの形状が動作方向に伸び縮み
- 発射時: 反動でわずかに縮み、すぐに元の形に戻る
- 被弾時: 衝撃で一瞬押しつぶれる形状変化
```

##### パーティクルシステム
```javascript
// 移動時パーティクル
- 移動方向と逆向きに小さな軌跡パーティクル
- 速度に応じてパーティクルの量と明度が変化

// 発射時パーティクル
- 銃口から火花のようなエフェクト
- ショットガンの場合は3方向からパーティクル噴出
```

##### 画面エフェクト
```javascript
// 画面揺れ
- 敵撃破時の軽い振動
- プレイヤー被弾時の強い振動
- 揺れの強度と時間は設定可能

// その他の視覚効果
- コンボカウンターの表示
- ヒット時の敵の点滅
- 距離に応じたプレイヤーの色変化（法則1との連携）
```

##### 調整パラメータ
```javascript
CONFIG.LAW_OF_FEEDBACK.SCREEN_SHAKE = 5;      // 画面揺れ強度
CONFIG.LAW_OF_FEEDBACK.PARTICLE_COUNT = 10;   // パーティクル数
CONFIG.LAW_OF_FEEDBACK.ANIMATION_SPEED = 0.1; // アニメーション速度
CONFIG.LAW_OF_FEEDBACK.COMBO_DISPLAY = true;  // コンボ表示
```

### ✨ 法則3: 発見の喜び

#### コンセプト
**ランダム要素と選択システム**による発見と探索

#### 実装：ランダムマップ生成とパワーアップ選択システム

##### ランダムマップ生成
```javascript
// ローグライク風の敵出現位置ランダム化
- 各ステージで敵の出現位置パターンをランダム選択
- 同じステージでも毎回異なる配置
- プレイヤーの位置に応じた動的な出現調整
```

##### ステージクリア時のパワーアップシステム
```javascript
// 3つのランダムパワーアップから1つを選択
例：
- 選択肢1: 攻撃力+50%（敵の出現速度+20%）
- 選択肢2: 移動速度+30%（敵のHP+1）  
- 選択肢3: 発射レート+40%（敵のサイズ+10%）

// パワーアップと同時にペナルティも発生
- プレイヤー強化 = 敵も同時に強化
- リスク・リターンの選択を迫る
```

##### ランダム要素の活用
```javascript
// 発見を促す仕組み
- パワーアップの組み合わせで予想外の相乗効果
- 特定の敵配置とプレイヤー能力の相性発見
- 稀に出現する特殊な敵タイプ
```

##### 探索の報酬
- **組み合わせ発見**: パワーアップの最適な組み合わせ探し
- **戦略発見**: ランダムマップに対する最適戦略の発見
- **隠し要素**: 特定条件下での特殊効果

##### 調整パラメータ
```javascript
CONFIG.LAW_OF_DISCOVERY.CRITICAL_CHANCE = 0.1;     // 隠しメカニクス
CONFIG.LAW_OF_DISCOVERY.MAP_VARIATIONS = 5;        // マップパターン数
CONFIG.LAW_OF_DISCOVERY.POWERUP_COUNT = 3;         // 選択肢数
CONFIG.LAW_OF_DISCOVERY.PENALTY_MULTIPLIER = 1.2;  // ペナルティ倍率
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