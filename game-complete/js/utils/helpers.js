// 共通ヘルパー関数

// 数値を指定範囲内にクランプ
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// 線形補間
function lerp(start, end, amount) {
    return start + (end - start) * amount;
}

// 値を別の範囲にマッピング
function mapValue(value, inputMin, inputMax, outputMin, outputMax) {
    return outputMin + (outputMax - outputMin) * ((value - inputMin) / (inputMax - inputMin));
}

// ランダムな整数を生成
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ランダムな浮動小数点数を生成
function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

// 配列からランダムな要素を選択
function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// 角度を度からラジアンに変換
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// 角度をラジアンから度に変換
function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}

// 角度を正規化（0-2π）
function normalizeAngle(angle) {
    while (angle < 0) angle += Math.PI * 2;
    while (angle >= Math.PI * 2) angle -= Math.PI * 2;
    return angle;
}

// 2つの角度間の最短差を計算
function angleDifference(angle1, angle2) {
    const diff = normalizeAngle(angle2 - angle1);
    return diff > Math.PI ? diff - Math.PI * 2 : diff;
}

// ベクトルの長さを計算
function vectorLength(x, y) {
    return Math.sqrt(x * x + y * y);
}

// ベクトルを正規化
function normalizeVector(x, y) {
    const length = vectorLength(x, y);
    if (length === 0) return { x: 0, y: 0 };
    return { x: x / length, y: y / length };
}

// ベクトルの内積
function dotProduct(x1, y1, x2, y2) {
    return x1 * x2 + y1 * y2;
}

// イージング関数
const Easing = {
    linear: (t) => t,
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => (--t) * t * t + 1,
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeInSine: (t) => 1 - Math.cos(t * Math.PI / 2),
    easeOutSine: (t) => Math.sin(t * Math.PI / 2),
    easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2
};

// 色関連のヘルパー
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function colorLerp(color1, color2, amount) {
    return [
        lerp(color1[0], color2[0], amount),
        lerp(color1[1], color2[1], amount),
        lerp(color1[2], color2[2], amount)
    ];
}

// タイマークラス
class Timer {
    constructor(duration) {
        this.duration = duration;
        this.startTime = millis();
        this.paused = false;
        this.pausedTime = 0;
    }
    
    restart() {
        this.startTime = millis();
        this.paused = false;
        this.pausedTime = 0;
    }
    
    pause() {
        if (!this.paused) {
            this.paused = true;
            this.pausedTime = millis();
        }
    }
    
    resume() {
        if (this.paused) {
            this.startTime += millis() - this.pausedTime;
            this.paused = false;
        }
    }
    
    isFinished() {
        if (this.paused) return false;
        return this.getElapsed() >= this.duration;
    }
    
    getElapsed() {
        if (this.paused) {
            return this.pausedTime - this.startTime;
        }
        return millis() - this.startTime;
    }
    
    getRemaining() {
        return Math.max(0, this.duration - this.getElapsed());
    }
    
    getProgress() {
        return clamp(this.getElapsed() / this.duration, 0, 1);
    }
}

// パフォーマンス測定
class PerformanceMonitor {
    constructor() {
        this.measurements = {};
    }
    
    start(name) {
        this.measurements[name] = { start: performance.now() };
    }
    
    end(name) {
        if (this.measurements[name]) {
            this.measurements[name].duration = performance.now() - this.measurements[name].start;
        }
    }
    
    get(name) {
        return this.measurements[name] ? this.measurements[name].duration : 0;
    }
    
    getAll() {
        const results = {};
        for (let name in this.measurements) {
            results[name] = this.measurements[name].duration || 0;
        }
        return results;
    }
    
    clear() {
        this.measurements = {};
    }
}

// デバッグ用ログ
function debugLog(message, category = 'DEBUG') {
    if (CONFIG.DEBUG_MODE) {
        console.log(`[${category}] ${message}`);
    }
}

// エラーハンドリング
function safeCall(func, fallback = null) {
    try {
        return func();
    } catch (error) {
        console.error('Error in safeCall:', error);
        return fallback;
    }
}

// 配列ユーティリティ
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function removeFromArray(array, item) {
    const index = array.indexOf(item);
    if (index > -1) {
        array.splice(index, 1);
        return true;
    }
    return false;
}

function groupBy(array, keyFn) {
    return array.reduce((groups, item) => {
        const key = keyFn(item);
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
        return groups;
    }, {});
}

// 簡単なイベントシステム
class EventEmitter {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
    
    emit(event, ...args) {
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`Error in event callback for ${event}:`, error);
                }
            });
        }
    }
    
    once(event, callback) {
        const onceWrapper = (...args) => {
            callback(...args);
            this.off(event, onceWrapper);
        };
        this.on(event, onceWrapper);
    }
}

// グローバルパフォーマンスモニター
const perfMonitor = new PerformanceMonitor();

// グローバルイベントエミッター
const gameEvents = new EventEmitter();