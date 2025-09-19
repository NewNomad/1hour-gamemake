# 📁 ディレクトリ構成

## プロジェクト全体の構成

```
1hour-gamemake/
├── docs/                          # ドキュメント
│   ├── hands_on_instructor_guide.md
│   ├── hands_on_participant_material.md
│   ├── directory_structure.md      # 本ファイル
│   ├── requirements.md
│   ├── game_design.md
│   ├── technical_specification.md
│   └── implementation_guide.md
├── game-base/                      # 土台版ゲーム
│   ├── index.html
│   ├── js/
│   │   ├── main.js
│   │   ├── config.js
│   │   ├── classes/
│   │   │   ├── GameObject.js
│   │   │   ├── Player.js
│   │   │   ├── Enemy.js
│   │   │   └── GameState.js
│   │   └── utils/
│   │       ├── collision.js
│   │       └── helpers.js
│   └── css/
│       └── style.css
└── game-complete/                  # 完成版ゲーム
    ├── index.html
    ├── js/
    │   ├── main.js
    │   ├── config.js
    │   ├── classes/
    │   │   ├── GameObject.js
    │   │   ├── Player.js
    │   │   ├── Enemy.js
    │   │   ├── GameState.js
    │   │   ├── Effect.js
    │   │   └── UIManager.js
    │   ├── systems/
    │   │   ├── feedback.js
    │   │   ├── discovery.js
    │   │   └── choice.js
    │   └── utils/
    │       ├── collision.js
    │       ├── helpers.js
    │       └── particles.js
    └── css/
        └── style.css
```

## 各ディレクトリ・ファイルの役割

### 🎮 game-base/（土台版）

#### index.html
- p5.js CDNを含むHTML構造
- canvas要素とゲーム説明
- シンプルなレイアウト

#### js/config.js
- ゲーム設定を集約
- 受講者が調整しやすいパラメータ
- 拡張しやすい構造

#### js/classes/
- **GameObject.js**: 全オブジェクトの基底クラス
- **Player.js**: プレイヤーキャラクター（移動、描画）
- **Enemy.js**: 敵キャラクター（基本的な動き）
- **GameState.js**: ゲーム状態管理（進行度、ライフ等）

#### js/utils/
- **collision.js**: 当たり判定ユーティリティ
- **helpers.js**: 共通ヘルパー関数

#### js/main.js
- p5.jsのsetup(), draw()メイン処理
- ゲームループ制御

### 🌟 game-complete/（完成版）

#### 追加要素

#### js/classes/
- **Effect.js**: 視覚エフェクト管理
- **UIManager.js**: UI表示管理

#### js/systems/
- **feedback.js**: フィードバックループシステム
- **discovery.js**: 発見の喜びシステム
- **choice.js**: 意味のある選択システム

#### js/utils/
- **particles.js**: パーティクルエフェクト

## 設計思想

### 📦 モジュール化
- 機能ごとにファイル分割
- 依存関係を明確化
- テストしやすい構造

### 🔧 設定重視
- CONFIG オブジェクトで一元管理
- 実行中の値変更に対応
- バランス調整が容易

### 🚀 拡張性
- クラス継承を活用
- システム追加が容易
- 既存機能を壊さない設計

### 🎯 学習効率
- 土台版は最小限の機能
- 段階的に機能追加
- 各段階で動作確認可能

## ファイルサイズ目安

### game-base/
- 各JSファイル: 50-100行程度
- 理解しやすいボリューム
- 1つの責務に集中

### game-complete/
- 各JSファイル: 100-200行程度
- 機能充実だが読みやすさ維持
- コメントで学習支援

## 開発の流れ

1. **game-base/** で基礎を理解
2. 3つの法則を順次実装
3. **game-complete/** と比較
4. 自由に拡張・改造

この構成により、受講者は段階的にゲーム開発の楽しさを体験できます。