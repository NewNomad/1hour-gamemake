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
            SCALE_FACTOR: 0.15,     // スケール変化の強さ
            DURATION: 150           // アニメーション持続時間（ミリ秒）
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
            PULSE_FREQUENCY: 8      // パルス頻度
        }
    },
    
    // デバッグ設定
    DEBUG_MODE: false,
    SHOW_HITBOXES: false,
    
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