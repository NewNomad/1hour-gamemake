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