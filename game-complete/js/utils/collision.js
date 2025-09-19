// 当たり判定ユーティリティ関数

// 矩形同士の当たり判定
function rectCollision(rect1, rect2) {
    return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
    );
}

// 円同士の当たり判定
function circleCollision(x1, y1, r1, x2, y2, r2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (r1 + r2);
}

// 点と矩形の当たり判定
function pointInRect(px, py, rect) {
    return (
        px >= rect.left &&
        px <= rect.right &&
        py >= rect.top &&
        py <= rect.bottom
    );
}

// 点と円の当たり判定
function pointInCircle(px, py, cx, cy, radius) {
    const dx = px - cx;
    const dy = py - cy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= radius;
}

// 矩形と円の当たり判定
function rectCircleCollision(rect, cx, cy, radius) {
    // 矩形の中心に最も近い点を見つける
    const closestX = Math.max(rect.left, Math.min(cx, rect.right));
    const closestY = Math.max(rect.top, Math.min(cy, rect.bottom));
    
    // その点と円の中心の距離を計算
    const dx = cx - closestX;
    const dy = cy - closestY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance <= radius;
}

// 線分同士の交差判定
function lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    
    if (denom === 0) {
        return null; // 平行線
    }
    
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
    
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return {
            x: x1 + t * (x2 - x1),
            y: y1 + t * (y2 - y1)
        };
    }
    
    return null;
}

// 2つのオブジェクト間の距離を計算
function getDistance(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// 2つのオブジェクト間の角度を計算（ラジアン）
function getAngleBetween(obj1, obj2) {
    return Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x);
}

// 角度から方向ベクトルを取得
function getDirectionVector(angle, magnitude = 1) {
    return {
        x: Math.cos(angle) * magnitude,
        y: Math.sin(angle) * magnitude
    };
}

// オブジェクトが画面内にあるかチェック
function isOnScreen(obj, margin = 0) {
    return (
        obj.x >= -margin &&
        obj.x <= CONFIG.CANVAS_WIDTH + margin &&
        obj.y >= -margin &&
        obj.y <= CONFIG.CANVAS_HEIGHT + margin
    );
}

// 画面境界との当たり判定
function checkScreenBounds(obj) {
    const result = {
        left: obj.x - obj.size / 2 <= 0,
        right: obj.x + obj.size / 2 >= CONFIG.CANVAS_WIDTH,
        top: obj.y - obj.size / 2 <= 0,
        bottom: obj.y + obj.size / 2 >= CONFIG.CANVAS_HEIGHT
    };
    
    result.any = result.left || result.right || result.top || result.bottom;
    return result;
}

// 最も近いオブジェクトを見つける
function findClosest(sourceObj, targetObjects) {
    if (targetObjects.length === 0) return null;
    
    let closest = null;
    let minDistance = Infinity;
    
    for (let target of targetObjects) {
        if (target.isActive) {
            const distance = getDistance(sourceObj, target);
            if (distance < minDistance) {
                minDistance = distance;
                closest = target;
            }
        }
    }
    
    return closest;
}

// 範囲内のオブジェクトを取得
function getObjectsInRange(sourceObj, targetObjects, range) {
    const objectsInRange = [];
    
    for (let target of targetObjects) {
        if (target.isActive && getDistance(sourceObj, target) <= range) {
            objectsInRange.push(target);
        }
    }
    
    return objectsInRange;
}

// 簡単な空間分割（クアッドツリーの簡易版）
class SpatialGrid {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        this.cells = [];
        
        this.clear();
    }
    
    clear() {
        this.cells = [];
        for (let i = 0; i < this.cols * this.rows; i++) {
            this.cells[i] = [];
        }
    }
    
    getIndex(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
            return -1;
        }
        
        return row * this.cols + col;
    }
    
    insert(obj) {
        const index = this.getIndex(obj.x, obj.y);
        if (index >= 0) {
            this.cells[index].push(obj);
        }
    }
    
    getNearby(obj, range = 1) {
        const nearby = [];
        const col = Math.floor(obj.x / this.cellSize);
        const row = Math.floor(obj.y / this.cellSize);
        
        for (let r = row - range; r <= row + range; r++) {
            for (let c = col - range; c <= col + range; c++) {
                const index = r * this.cols + c;
                if (index >= 0 && index < this.cells.length) {
                    nearby.push(...this.cells[index]);
                }
            }
        }
        
        return nearby;
    }
}