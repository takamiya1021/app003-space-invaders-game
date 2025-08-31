// ゲーム設定
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// ゲーム状態
let gameRunning = false;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let lives = 3;
let invaderDirection = 1;
let invaderSpeed = 0.5;
let lastShotTime = 0;
let enemyLastShotTime = 0;

// UI要素
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const livesElement = document.getElementById('lives');
const gameOverScreen = document.getElementById('gameOver');
const startScreen = document.getElementById('startScreen');
const finalScoreElement = document.getElementById('final-score');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// プレイヤー
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 80,
    width: 50,
    height: 30,
    speed: 5
};

// インベーダー配列
let invaders = [];
const invaderRows = 5;
const invaderCols = 11;
const invaderWidth = 35;
const invaderHeight = 25;
const invaderPadding = 15;
const invaderOffsetTop = 60;
const invaderOffsetLeft = 70;

// 弾配列
let playerBullets = [];
let enemyBullets = [];

// バリア（防御壁）
let barriers = [];
const barrierWidth = 80;
const barrierHeight = 60;

// キー入力
const keys = {};

// イベントリスナー
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);

// ゲーム初期化
function initGame() {
    // スコアとライフの初期化
    score = 0;
    lives = 3;
    invaderSpeed = 0.5;
    updateUI();
    
    // インベーダーの初期化
    invaders = [];
    for (let row = 0; row < invaderRows; row++) {
        for (let col = 0; col < invaderCols; col++) {
            invaders.push({
                x: invaderOffsetLeft + col * (invaderWidth + invaderPadding),
                y: invaderOffsetTop + row * (invaderHeight + invaderPadding),
                width: invaderWidth,
                height: invaderHeight,
                alive: true,
                type: row < 1 ? 3 : row < 3 ? 2 : 1, // 上段ほど高得点
                animationFrame: 0
            });
        }
    }
    
    // バリアの初期化
    barriers = [];
    const barrierCount = 4;
    const barrierSpacing = canvas.width / (barrierCount + 1);
    for (let i = 0; i < barrierCount; i++) {
        barriers.push({
            x: barrierSpacing * (i + 1) - barrierWidth / 2,
            y: canvas.height - 180,
            width: barrierWidth,
            height: barrierHeight,
            hits: 0, // ダメージカウンター
            maxHits: 5
        });
    }
    
    // 弾の初期化
    playerBullets = [];
    enemyBullets = [];
    
    // プレイヤー位置リセット
    player.x = canvas.width / 2 - 25;
}

// ゲーム開始
function startGame() {
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    initGame();
    gameRunning = true;
    highScoreElement.textContent = highScore;
    gameLoop();
}

// ゲームリスタート
function restartGame() {
    gameOverScreen.style.display = 'none';
    startGame();
}

// メインゲームループ
function gameLoop() {
    if (!gameRunning) return;
    
    update();
    draw();
    
    requestAnimationFrame(gameLoop);
}

// ゲーム更新処理
function update() {
    // プレイヤー移動
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    
    // プレイヤー弾発射
    if (keys[' '] && playerBullets.length < 2) {
        const now = Date.now();
        if (now - lastShotTime > 250) {
            playerBullets.push({
                x: player.x + player.width / 2 - 2,
                y: player.y,
                width: 4,
                height: 15,
                speed: 8
            });
            lastShotTime = now;
        }
    }
    
    // インベーダー移動
    updateInvaders();
    
    // 敵の弾発射
    enemyShoot();
    
    // 弾の更新
    updateBullets();
    
    // 衝突判定
    checkCollisions();
    
    // ゲームクリアチェック
    if (invaders.filter(inv => inv.alive).length === 0) {
        // 次のウェーブ
        invaderSpeed *= 1.2;
        initGame();
    }
}

// インベーダー更新
function updateInvaders() {
    let shouldMoveDown = false;
    
    // 端に到達したかチェック
    for (let invader of invaders) {
        if (!invader.alive) continue;
        
        if ((invader.x <= 0 && invaderDirection === -1) || 
            (invader.x + invader.width >= canvas.width && invaderDirection === 1)) {
            shouldMoveDown = true;
            break;
        }
    }
    
    // 移動処理
    if (shouldMoveDown) {
        invaderDirection *= -1;
        for (let invader of invaders) {
            invader.y += 20;
        }
        invaderSpeed *= 1.05; // 少しずつ速くなる
    }
    
    for (let invader of invaders) {
        if (!invader.alive) continue;
        invader.x += invaderSpeed * invaderDirection;
        invader.animationFrame = (invader.animationFrame + 0.02) % 2;
        
        // プレイヤーの高さに到達したら
        if (invader.y + invader.height >= player.y) {
            gameOver();
        }
    }
}

// 敵の弾発射
function enemyShoot() {
    const now = Date.now();
    if (now - enemyLastShotTime > 1500) {
        const aliveInvaders = invaders.filter(inv => inv.alive);
        if (aliveInvaders.length > 0) {
            const shooter = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];
            enemyBullets.push({
                x: shooter.x + shooter.width / 2 - 2,
                y: shooter.y + shooter.height,
                width: 4,
                height: 10,
                speed: 3
            });
            enemyLastShotTime = now;
        }
    }
}

// 弾の更新
function updateBullets() {
    // プレイヤーの弾
    playerBullets = playerBullets.filter(bullet => {
        bullet.y -= bullet.speed;
        return bullet.y > -bullet.height;
    });
    
    // 敵の弾
    enemyBullets = enemyBullets.filter(bullet => {
        bullet.y += bullet.speed;
        return bullet.y < canvas.height;
    });
}

// 衝突判定
function checkCollisions() {
    // プレイヤーの弾とインベーダー
    playerBullets = playerBullets.filter(bullet => {
        for (let invader of invaders) {
            if (!invader.alive) continue;
            
            if (isColliding(bullet, invader)) {
                invader.alive = false;
                score += invader.type * 10;
                updateUI();
                
                // ハイスコア更新
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('highScore', highScore);
                    highScoreElement.textContent = highScore;
                }
                
                return false; // 弾を削除
            }
        }
        
        // バリアとの衝突
        for (let barrier of barriers) {
            if (barrier.hits < barrier.maxHits && isColliding(bullet, barrier)) {
                barrier.hits++;
                return false;
            }
        }
        
        return true; // 弾を維持
    });
    
    // 敵の弾とプレイヤー
    enemyBullets = enemyBullets.filter(bullet => {
        if (isColliding(bullet, player)) {
            lives--;
            updateUI();
            
            if (lives <= 0) {
                gameOver();
            }
            
            return false;
        }
        
        // バリアとの衝突
        for (let barrier of barriers) {
            if (barrier.hits < barrier.maxHits && isColliding(bullet, barrier)) {
                barrier.hits++;
                return false;
            }
        }
        
        return true;
    });
}

// 衝突判定ヘルパー
function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 描画処理
function draw() {
    // 背景クリア
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // スターフィールド効果（背景装飾）
    drawStars();
    
    // プレイヤー描画
    drawPlayer();
    
    // インベーダー描画
    drawInvaders();
    
    // バリア描画
    drawBarriers();
    
    // 弾描画
    drawBullets();
}

// 星の描画（背景装飾）
function drawStars() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 50; i++) {
        const x = (i * 73) % canvas.width;
        const y = (i * 37) % canvas.height;
        ctx.fillRect(x, y, 1, 1);
    }
}

// プレイヤー描画
function drawPlayer() {
    ctx.fillStyle = '#00ff00';
    // 本体
    ctx.fillRect(player.x + 20, player.y, 10, 15);
    // 翼
    ctx.fillRect(player.x + 5, player.y + 15, 40, 10);
    // 砲台
    ctx.fillRect(player.x + 23, player.y - 5, 4, 5);
}

// インベーダー描画
function drawInvaders() {
    for (let invader of invaders) {
        if (!invader.alive) continue;
        
        // タイプに応じた色
        switch(invader.type) {
            case 3:
                ctx.fillStyle = '#ff0000'; // 赤
                break;
            case 2:
                ctx.fillStyle = '#ffff00'; // 黄
                break;
            default:
                ctx.fillStyle = '#00ffff'; // 水色
        }
        
        // シンプルなインベーダー形状
        const frame = Math.floor(invader.animationFrame);
        
        if (frame === 0) {
            // フレーム1
            ctx.fillRect(invader.x + 5, invader.y, 25, 10);
            ctx.fillRect(invader.x, invader.y + 10, 35, 10);
            ctx.fillRect(invader.x + 5, invader.y + 20, 5, 5);
            ctx.fillRect(invader.x + 25, invader.y + 20, 5, 5);
        } else {
            // フレーム2
            ctx.fillRect(invader.x + 5, invader.y, 25, 10);
            ctx.fillRect(invader.x, invader.y + 10, 35, 10);
            ctx.fillRect(invader.x, invader.y + 20, 5, 5);
            ctx.fillRect(invader.x + 30, invader.y + 20, 5, 5);
        }
    }
}

// バリア描画
function drawBarriers() {
    for (let barrier of barriers) {
        if (barrier.hits >= barrier.maxHits) continue;
        
        // ダメージに応じた色
        const damageRatio = barrier.hits / barrier.maxHits;
        const green = Math.floor(255 * (1 - damageRatio));
        const red = Math.floor(255 * damageRatio);
        ctx.fillStyle = `rgb(${red}, ${green}, 0)`;
        
        // バリアの形状（台形）
        ctx.beginPath();
        ctx.moveTo(barrier.x + 10, barrier.y + barrier.height);
        ctx.lineTo(barrier.x + barrier.width - 10, barrier.y + barrier.height);
        ctx.lineTo(barrier.x + barrier.width - 20, barrier.y);
        ctx.lineTo(barrier.x + 20, barrier.y);
        ctx.closePath();
        ctx.fill();
    }
}

// 弾描画
function drawBullets() {
    // プレイヤーの弾
    ctx.fillStyle = '#ffffff';
    for (let bullet of playerBullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
    
    // 敵の弾
    ctx.fillStyle = '#ff00ff';
    for (let bullet of enemyBullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

// UI更新
function updateUI() {
    scoreElement.textContent = score;
    livesElement.textContent = lives;
}

// ゲームオーバー
function gameOver() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    gameOverScreen.style.display = 'block';
}

// 初期表示
highScoreElement.textContent = highScore;