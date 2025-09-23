// ゲーム設定 - すべてのパラメーターをここで管理
const CONFIG = {
    // キャンバス設定
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    
    // プレイヤー設定
    PLAYER_SPEED: 5,
    PLAYER_SIZE: 30,
    PLAYER_COLOR: [100, 150, 255],
    
    // 弾丸設定
    BULLET_SPEED: 10,
    BULLET_SIZE: 8,
    BULLET_COLOR: [255, 255, 100],
    SHOOT_COOLDOWN: 200, // ミリ秒
    
    // 敵設定
    ENEMY_SPEED: 3,
    ENEMY_SIZE: 25,
    ENEMY_SPAWN_RATE: 30, // フレーム数（60fps想定）
    ENEMY_COLOR: [255, 100, 100],
    
    // ゲームバランス
    INITIAL_LIVES: 3,
    SCORE_PER_ENEMY: 10,
    
    // 法則1: 意味のある選択の設定
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
    },
    
    // 法則2: フィードバックループの設定
    LAW_OF_FEEDBACK: {
        ENABLED: true,
        
        // 画面揺れ
        SCREEN_SHAKE: {
            ENABLED: true,
            INTENSITY: 5,           // 揺れの強さ
            DURATION: 200,          // 揺れの持続時間（ミリ秒）
            FREQUENCY: 20           // 揺れの頻度
        },
        
        // Squash & Stretch アニメーション
        SQUASH_STRETCH: {
            ENABLED: true,
            SCALE_FACTOR: 0.35,     // スケール変化の強さ
            DURATION: 300           // アニメーション持続時間（ミリ秒）
        },
        
        // パーティクルエフェクト
        PARTICLES: {
            ENABLED: true,
            
            // 移動時のパーティクル
            MOVEMENT: {
                COUNT: 2,           // 1フレームあたりの生成数
                LIFETIME: 300,      // パーティクル寿命（ミリ秒）
                SIZE: 3,            // パーティクルサイズ
                SPEED: 1.5          // パーティクル速度
            },
            
            // 射撃時のパーティクル
            SHOOTING: {
                COUNT: 5,           // 発射時の生成数
                LIFETIME: 400,      // パーティクル寿命（ミリ秒）
                SIZE: 2,            // パーティクルサイズ
                SPEED: 3            // パーティクル速度
            },
            
            // 爆発エフェクト（敵破壊時）
            EXPLOSION: {
                COUNT: 8,           // 爆発時の生成数
                LIFETIME: 600,      // パーティクル寿命（ミリ秒）
                SIZE: 4,            // パーティクルサイズ
                SPEED: 4            // パーティクル速度
            }
        },
        
        // Glow/Bloomエフェクト
        GLOW: {
            ENABLED: true,
            INTENSITY: 0.8,         // グロー強度
            BLUR_RADIUS: 10,        // ぼかし半径
            THRESHOLD: 200          // グローを適用する明度閾値
        },
        
        // コンボエフェクト
        COMBO_EFFECTS: {
            ENABLED: true,
            SCALE_BOOST: 1.5,       // コンボ時のスケール倍率
            COLOR_INTENSITY: 2.0,   // 色強度倍率
            PULSE_FREQUENCY: 2      // パルス頻度
        }
    },
    
    // パララックス背景設定
    BACKGROUND: {
        ENABLED: true,
        BASE_SCROLL_SPEED: 1.5,      // 横方向の基本スクロール速度
        VERTICAL_PARALLAX: 0.2,      // 縦方向のパララックス強度
        LAYERS: [
            {
                // 遠景レイヤー
                SPEED_FACTOR: 0.2,
                COLOR: [40, 45, 55],
                BUILDING_COUNT: 15,
                MIN_HEIGHT: 100,
                MAX_HEIGHT: 200,
                MIN_WIDTH: 80,
                MAX_WIDTH: 120
            },
            {
                // 中景レイヤー
                SPEED_FACTOR: 0.5,
                COLOR: [60, 65, 75],
                BUILDING_COUNT: 12,
                MIN_HEIGHT: 150,
                MAX_HEIGHT: 300,
                MIN_WIDTH: 60,
                MAX_WIDTH: 100
            },
            {
                // 近景レイヤー
                SPEED_FACTOR: 0.8,
                COLOR: [80, 85, 95],
                BUILDING_COUNT: 8,
                MIN_HEIGHT: 200,
                MAX_HEIGHT: 400,
                MIN_WIDTH: 40,
                MAX_WIDTH: 80
            }
        ]
    },
    
    // デバッグ設定
    DEBUG_MODE: false,
    SHOW_HITBOXES: false,
    
    // 法則3: 発見の喜びの設定
    LAW_OF_DISCOVERY: {
        ENABLED: true,
        
        // ウェーブシステム
        WAVE_SYSTEM: {
            ENEMIES_PER_WAVE: 15,        // ウェーブごとの敵数
            SPAWN_PATTERNS: [             // ランダム出現パターン
                'random',
                'formation_v',
                'formation_circle',
                'formation_line',
                'formation_spiral'
            ],
            DIFFICULTY_MULTIPLIER: 1.2    // ウェーブごとの難易度倍率
        },
        
        // パワーアップシステム
        POWER_UPS: {
            FIRE_RATE: {
                name: '高速発射',
                description: '発射レートが50%向上',
                effect: 'shootCooldown',
                value: 0.5,
                penalty: 'enemySpeed',
                penaltyValue: 1.3
            },
            SPEED_BOOST: {
                name: '高速移動',
                description: '移動速度が40%向上',
                effect: 'playerSpeed',
                value: 1.4,
                penalty: 'enemyCount',
                penaltyValue: 1.5
            },
            EXTRA_LIFE: {
                name: '追加ライフ',
                description: 'ライフが1つ追加',
                effect: 'lives',
                value: 1,
                penalty: 'enemyHP',
                penaltyValue: 1.5
            },
            BULLET_POWER: {
                name: '弾威力向上',
                description: '弾のダメージが倍増',
                effect: 'bulletDamage',
                value: 2,
                penalty: 'enemySize',
                penaltyValue: 1.2
            },
            SPREAD_BOOST: {
                name: '拡散強化',
                description: 'ショットガンの角度が広がる',
                effect: 'shotgunSpread',
                value: 1.5,
                penalty: 'waveEnemies',
                penaltyValue: 1.3
            }
        },
        
        // ランダム要素
        RANDOMIZATION: {
            CRITICAL_CHANCE: 0.1,         // クリティカル確率
            RARE_ENEMY_CHANCE: 0.05,      // レア敵出現確率
            BONUS_SCORE_CHANCE: 0.15      // ボーナススコア確率
        }
    },
    
    // 敵のタイプ定義
    ENEMY_TYPES: {
        BASIC: {
            speed: 3,
            size: 25,
            color: [255, 100, 100],
            hp: 1,
            score: 10
        },
        FAST: {
            speed: 5,
            size: 20,
            color: [255, 200, 100],
            hp: 1,
            score: 15
        },
        TANK: {
            speed: 1.5,
            size: 40,
            color: [200, 100, 255],
            hp: 3,
            score: 25
        }
    },
    
    // タイトル画面設定
    TITLE_SCREEN: {
        ENABLED: true,
        
        // アニメーション設定
        ANIMATIONS: {
            TITLE_PULSE_SPEED: 0.03,
            TITLE_FLOAT_SPEED: 0.02,
            TITLE_FLOAT_AMPLITUDE: 10,
            GLITCH_PROBABILITY: 0.95,
            CHROMATIC_SPEED: 0.05,
            CHROMATIC_AMPLITUDE: 3
        },
        
        // パーティクル設定
        PARTICLES: {
            STAR_COUNT: 100,
            BINARY_COUNT: 30,
            ENERGY_ORB_COUNT: 5,
            BACKGROUND_ENEMY_COUNT: 8,
            SPARK_PROBABILITY: 0.1
        },
        
        // エフェクト設定
        EFFECTS: {
            SCANLINE_ENABLED: true,
            CRT_WARP_ENABLED: true,
            NOISE_ENABLED: true,
            GRID_ENABLED: true,
            NEON_GLOW_ENABLED: true
        },
        
        // デモプレイヤー設定
        DEMO_PLAYER: {
            ENABLED: true,
            MOVE_INTERVAL: 120, // フレーム数
            TRAIL_LENGTH: 50,
            ROTATION_SPEED: 0.02
        }
    }
};

// リアルタイム設定調整関数
function adjustConfig(key, value) {
    const keys = key.split('.');
    let target = CONFIG;
    
    for (let i = 0; i < keys.length - 1; i++) {
        if (!target[keys[i]]) target[keys[i]] = {};
        target = target[keys[i]];
    }
    
    target[keys[keys.length - 1]] = value;
    console.log(`設定変更: ${key} = ${value}`);
}

// 高速テストモード
function quickTest() {
    CONFIG.ENEMY_SPAWN_RATE = 30;
    CONFIG.PLAYER_SPEED = 8;
    CONFIG.DEBUG_MODE = true;
    console.log("高速テストモード有効");
}

// カオスモード（極端なパラメーターテスト）
function chaosMode() {
    CONFIG.ENEMY_SPAWN_RATE = 5;
    CONFIG.ENEMY_SPEED = 8;
    CONFIG.PLAYER_SPEED = 10;
    console.log("カオスモード有効");
}

// 神モード（実験用無敵）
function godMode() {
    CONFIG.GOD_MODE = !CONFIG.GOD_MODE;
    console.log(`神モード: ${CONFIG.GOD_MODE ? '有効' : '無効'}`);
}

// デバッグモード切り替え
function toggleDebug() {
    CONFIG.DEBUG_MODE = !CONFIG.DEBUG_MODE;
    CONFIG.SHOW_HITBOXES = CONFIG.DEBUG_MODE;
    console.log(`デバッグモード: ${CONFIG.DEBUG_MODE ? '有効' : '無効'}`);
}