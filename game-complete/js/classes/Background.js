// パララックス背景クラス - 都市のスカイライン風
class Background {
    constructor() {
        this.layers = [];
        this.playerY = CONFIG.CANVAS_HEIGHT / 2; // プレイヤーのY位置を追跡
        this.autoScrollX = 0; // 自動横スクロールの位置
        
        // 各レイヤーを初期化
        this.initializeLayers();
    }
    
    // レイヤーの初期化
    initializeLayers() {
        if (!CONFIG.BACKGROUND.ENABLED) return;
        
        CONFIG.BACKGROUND.LAYERS.forEach((layerConfig) => {
            const layer = {
                config: layerConfig,
                buildings: [],
                offsetX: 0,
                offsetY: 0
            };
            
            // ビルを生成
            this.generateBuildings(layer);
            this.layers.push(layer);
        });
    }
    
    // ビルの生成
    generateBuildings(layer) {
        const config = layer.config;
        const totalWidth = CONFIG.CANVAS_WIDTH * 2; // 画面幅の2倍分を生成
        
        for (let i = 0; i < config.BUILDING_COUNT; i++) {
            const building = {
                x: (i * totalWidth / config.BUILDING_COUNT) + 
                   randomFloat(-20, 20), // 少しランダムな配置
                y: CONFIG.CANVAS_HEIGHT,
                width: randomFloat(config.MIN_WIDTH, config.MAX_WIDTH),
                height: randomFloat(config.MIN_HEIGHT, config.MAX_HEIGHT)
            };
            
            layer.buildings.push(building);
        }
        
        // 幅でソート（描画順序のため）
        layer.buildings.sort((a, b) => a.x - b.x);
    }
    
    // プレイヤーのY位置を更新
    updatePlayerPosition(playerY) {
        this.playerY = playerY;
    }
    
    // 背景の更新
    update() {
        if (!CONFIG.BACKGROUND.ENABLED) return;
        
        // 横方向の自動スクロール
        this.autoScrollX += CONFIG.BACKGROUND.BASE_SCROLL_SPEED;
        
        // 縦方向のパララックス（プレイヤー位置ベース）
        const centerY = CONFIG.CANVAS_HEIGHT / 2;
        const verticalOffset = (this.playerY - centerY) * CONFIG.BACKGROUND.VERTICAL_PARALLAX;
        
        // 各レイヤーのオフセットを更新
        this.layers.forEach(layer => {
            // 横方向: 自動スクロール（各レイヤーで速度差）
            layer.offsetX = -this.autoScrollX * layer.config.SPEED_FACTOR;
            
            // 縦方向: プレイヤー位置ベースのパララックス
            layer.offsetY = -verticalOffset * layer.config.SPEED_FACTOR;
        });
    }
    
    // 背景の描画
    render() {
        if (!CONFIG.BACKGROUND.ENABLED) return;
        
        push();
        
        // レイヤーを奥から手前に描画
        this.layers.forEach(layer => {
            this.renderLayer(layer);
        });
        
        pop();
    }
    
    // 個別レイヤーの描画
    renderLayer(layer) {
        const config = layer.config;
        
        push();
        
        // レイヤーの色設定
        fill(config.COLOR[0], config.COLOR[1], config.COLOR[2]);
        noStroke();
        
        // ビルの描画
        layer.buildings.forEach(building => {
            const screenX = building.x + layer.offsetX;
            const screenY = building.y + layer.offsetY;
            
            // 画面の範囲内（少し余裕を持って）にあるビルのみ描画
            if (screenX + building.width > -100 && screenX < CONFIG.CANVAS_WIDTH + 100) {
                // ビルの延長分（画面外まで伸ばす）
                const buildingExtension = CONFIG.CANVAS_HEIGHT * 0.5; // 画面高さの50%分延長
                const totalHeight = building.height + buildingExtension;
                
                // ビル本体（延長分も含めて描画）
                rect(
                    screenX,
                    screenY - building.height,
                    building.width,
                    totalHeight
                );
                
                // ビルの窓（元の高さ部分のみ）
                this.renderWindows(
                    screenX, 
                    screenY - building.height, 
                    building.width, 
                    building.height,
                    config.COLOR
                );
            }
        });
        
        // 画面外に出たビルを反対側に移動（無限スクロール）
        this.wrapBuildings(layer);
        
        pop();
    }
    
    // ビルの窓を描画
    renderWindows(x, y, width, height, baseColor) {
        // 窓の明度を少し上げる
        const windowColor = [
            Math.min(baseColor[0] + 20, 255),
            Math.min(baseColor[1] + 20, 255),
            Math.min(baseColor[2] + 30, 255)
        ];
        
        fill(windowColor[0], windowColor[1], windowColor[2]);
        
        const windowSize = 8;
        const spacing = 15;
        const rows = Math.floor(height / spacing);
        const cols = Math.floor(width / spacing);
        
        for (let row = 1; row < rows - 1; row++) {
            for (let col = 1; col < cols - 1; col++) {
                // ランダムに窓を表示（80%の確率）
                if (Math.random() < 0.8) {
                    const windowX = x + col * spacing + (spacing - windowSize) / 2;
                    const windowY = y + row * spacing + (spacing - windowSize) / 2;
                    
                    rect(windowX, windowY, windowSize, windowSize);
                }
            }
        }
    }
    
    // ビルの無限スクロール処理
    wrapBuildings(layer) {
        const screenWidth = CONFIG.CANVAS_WIDTH;
        
        layer.buildings.forEach(building => {
            const screenX = building.x + layer.offsetX;
            
            // 左端から出た場合、右端に移動
            if (screenX + building.width < -200) {
                building.x += screenWidth * 2;
            }
            // 右端から出た場合、左端に移動
            else if (screenX > screenWidth + 200) {
                building.x -= screenWidth * 2;
            }
        });
    }
    
    // グラデーション背景（オプション）
    renderGradientSky() {
        // 空のグラデーション効果
        for (let i = 0; i < CONFIG.CANVAS_HEIGHT; i++) {
            const alpha = map(i, 0, CONFIG.CANVAS_HEIGHT, 0.3, 0);
            const skyColor = [20 + alpha * 40, 25 + alpha * 40, 40 + alpha * 60];
            
            stroke(skyColor[0], skyColor[1], skyColor[2]);
            line(0, i, CONFIG.CANVAS_WIDTH, i);
        }
    }
    
    // 背景のリセット
    reset() {
        this.playerY = CONFIG.CANVAS_HEIGHT / 2;
        this.autoScrollX = 0;
        this.layers = [];
        this.initializeLayers();
    }
    
    // デバッグ情報の描画
    renderDebugInfo() {
        if (!CONFIG.DEBUG_MODE) return;
        
        push();
        fill(255, 255, 0);
        textAlign(LEFT, TOP);
        textSize(10);
        
        const y = CONFIG.CANVAS_HEIGHT - 250;
        text(`背景システム:`, 10, y);
        text(`- レイヤー数: ${this.layers.length}`, 10, y + 15);
        text(`- プレイヤーY: ${this.playerY.toFixed(1)}`, 10, y + 30);
        text(`- 自動スクロールX: ${this.autoScrollX.toFixed(1)}`, 10, y + 45);
        
        this.layers.forEach((layer, index) => {
            text(`- レイヤー${index + 1} X: ${layer.offsetX.toFixed(1)}, Y: ${layer.offsetY.toFixed(1)}`, 10, y + 60 + index * 15);
        });
        
        pop();
    }
}