// メインゲームループ - p5.js

let gameState;

// p5.js初期化
function setup() {
    // キャンバス作成
    createCanvas(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    
    // ゲーム状態初期化
    gameState = new GameState();
    
    // フレームレート設定
    frameRate(60);
    
    // カラーモード設定
    colorMode(RGB, 255);
    
    console.log("Game Base - 1時間ゲーム開発ワークショップ");
    console.log("操作方法:");
    console.log("- WASD または 矢印キーで移動");
    console.log("- スペースキーでゲーム開始");
    console.log("- Pキーで一時停止");
    console.log("- Dキーでデバッグモード切り替え");
    console.log("- Rキーでリスタート（ゲームオーバー時）");
    console.log("");
    console.log("コンソールコマンド:");
    console.log("- quickTest() - 高速テストモード");
    console.log("- chaosMode() - カオスモード");
    console.log("- godMode() - 神モード切り替え");
    console.log("- adjustConfig(key, value) - 設定変更");
}

// メインループ
function draw() {
    // パフォーマンス測定開始
    perfMonitor.start('frame');
    
    // ゲーム状態更新
    perfMonitor.start('update');
    gameState.update();
    perfMonitor.end('update');
    
    // 描画
    perfMonitor.start('render');
    gameState.render();
    perfMonitor.end('render');
    
    // パフォーマンス測定終了
    perfMonitor.end('frame');
    
    // デバッグ情報表示（必要に応じて）
    if (CONFIG.DEBUG_MODE && frameCount % 60 === 0) {
        const perf = perfMonitor.getAll();
        debugLog(`Frame: ${perf.frame?.toFixed(2)}ms, Update: ${perf.update?.toFixed(2)}ms, Render: ${perf.render?.toFixed(2)}ms`);
    }
}

// キー入力処理
function keyPressed() {
    // ゲーム状態にキー入力を渡す
    gameState.handleKeyPress(key);
    
    // 特殊なキー処理
    switch (key) {
        case 'F':
        case 'f':
            // フルスクリーン切り替え（ブラウザ依存）
            toggleFullscreen();
            break;
    }
}

// マウス入力処理（将来の拡張用）
function mousePressed() {
    // マウスクリックでゲーム開始（メニュー画面でのみ）
    if (gameState.state === 'MENU') {
        gameState.startGame();
    }
}

// ウィンドウリサイズ処理
function windowResized() {
    // キャンバスサイズは固定だが、将来の拡張用
    debugLog(`Window resized to: ${windowWidth}x${windowHeight}`);
}

// エラーハンドリング
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Game Error:', {
        message,
        source,
        line: lineno,
        column: colno,
        error
    });
    
    // ゲームが完全にクラッシュしないように
    try {
        if (gameState) {
            gameState.state = 'MENU';
        }
    } catch (e) {
        console.error('Error in error handler:', e);
    }
};

// ゲーム終了時のクリーンアップ
window.addEventListener('beforeunload', function() {
    debugLog('Game closing...');
});

// フルスクリーン切り替え
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen().catch(err => {
            console.log(`Error attempting to exit fullscreen: ${err.message}`);
        });
    }
}

// ページ読み込み完了時の初期化
document.addEventListener('DOMContentLoaded', function() {
    debugLog('Page loaded, game initializing...');
});

// フォーカス管理（ゲームの一時停止に使用）
window.addEventListener('focus', function() {
    debugLog('Game focused');
});

window.addEventListener('blur', function() {
    debugLog('Game unfocused');
    // ゲームプレイ中なら自動的に一時停止
    if (gameState && gameState.state === 'PLAYING') {
        gameState.togglePause();
    }
});

// デバッグ用のグローバル関数
function getGameState() {
    return gameState;
}

function getPlayer() {
    return gameState ? gameState.player : null;
}

function getEnemies() {
    return gameState ? gameState.enemies : [];
}

function getPerformanceInfo() {
    return perfMonitor.getAll();
}

// ゲーム統計をエクスポート
function exportGameStats() {
    if (!gameState) return null;
    
    return {
        currentState: gameState.state,
        score: gameState.score,
        gameTime: gameState.gameTime,
        stats: { ...gameState.stats },
        player: {
            lives: gameState.player.lives,
            position: { x: gameState.player.x, y: gameState.player.y },
            invulnerable: gameState.player.invulnerable
        },
        enemyCount: gameState.enemies.length,
        performance: perfMonitor.getAll()
    };
}

// 設定をエクスポート
function exportConfig() {
    return JSON.parse(JSON.stringify(CONFIG));
}

// ゲームイベントの購読例（将来の拡張用）
gameEvents.on('enemy_destroyed', (enemy) => {
    debugLog(`Enemy destroyed: ${enemy.type} at (${enemy.x}, ${enemy.y})`);
});

gameEvents.on('player_damaged', (player) => {
    debugLog(`Player damaged! Lives remaining: ${player.lives}`);
});

gameEvents.on('game_over', (stats) => {
    debugLog(`Game over! Final score: ${stats.score}, Time: ${stats.timeSurvived}s`);
});