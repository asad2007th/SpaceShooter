/* =========================================================
   1. CONSTANTS
   Change these values to adjust the game.
   ========================================================= */
const PLAYER_SPEED = 300;          // pixels per second
const BULLET_SPEED = 430;           // pixels per second
const BULLET_INTERVAL = 300;        // milliseconds between bullets
const MIN_ENEMIES = 4;
const MAX_ENEMIES = 6;
const ENEMY_MIN_SPEED = 70;          // pixels per second
const ENEMY_MAX_SPEED = 130;
const PLAYER_WIDTH = 44;
const PLAYER_HEIGHT = 42;
const ENEMY_WIDTH = 38;
const ENEMY_HEIGHT = 38;
const STARTING_LIVES = 3;
const INVULNERABLE_TIME = 1200;     // milliseconds

/* =========================================================
   2. STATE
   Keep all changing game data in this one object.
   ========================================================= */
const state = {
    running: false,
    gameOver: false,
    paused: false,
    playerX: 0,
    playerY: 0,
    bullets: [],
    enemies: [],
    score: 0,
    lives: STARTING_LIVES,
    keys: { left: false, right: false },
    lastFrameTime: 0,
    bulletTimer: 0,
    enemyId: 0,
    nextEnemySpawn: 0,
    invulnerableUntil: 0,
    highScore: 0,
    animationId: null
};

/* =========================================================
   3. PURE LOGIC
   These functions calculate values using state, not DOM reads.
   ========================================================= */
function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

function rectanglesTouch(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function getPlayerBox() {
    return {
        x: state.playerX,
        y: state.playerY,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT
    };
}

function getBulletBox(bullet) {
    return { x: bullet.x, y: bullet.y, width: 6, height: 16 };
}

function getEnemyBox(enemy) {
    return {
        x: enemy.x,
        y: enemy.y,
        width: ENEMY_WIDTH,
        height: ENEMY_HEIGHT
    };
}

function createEnemy() {
    const width = getPlayWidth();
    const difficultyIncrease = Math.floor(state.score / 100) * 10;
    const enemy = {
        id: state.enemyId,
        x: randomNumber(0, Math.max(1, width - ENEMY_WIDTH)),
        y: -ENEMY_HEIGHT,
        speed: randomNumber(
            ENEMY_MIN_SPEED + difficultyIncrease,
            ENEMY_MAX_SPEED + difficultyIncrease
        ),
        element: null
    };
    state.enemyId += 1;
    state.enemies.push(enemy);
}

function keepEnemyCount() {
    while (state.enemies.length < MIN_ENEMIES) {
        createEnemy();
    }

    while (state.enemies.length > MAX_ENEMIES) {
        const extraEnemy = state.enemies.pop();
        if (extraEnemy.element) {
            extraEnemy.element.remove();
        }
    }
}

function getPlayWidth() {
    return playArea.clientWidth;
}

function getPlayHeight() {
    return playArea.clientHeight;
}

/* =========================================================
   4. RENDERING
   Create and update DOM elements from the JavaScript state.
   ========================================================= */
const game = document.querySelector("#game");
const startScreen = document.querySelector("#start-screen");
const gameOverScreen = document.querySelector("#game-over-screen");
const playArea = document.querySelector("#play-area");
const playerElement = document.querySelector("#player");
const hud = document.querySelector("#hud");
const scoreElement = document.querySelector("#score");
const livesElement = document.querySelector("#lives");
const finalScoreElement = document.querySelector("#final-score");
const startHighScoreElement = document.querySelector("#start-high-score");
const hudHighScoreElement = document.querySelector("#hud-high-score");
const overHighScoreElement = document.querySelector("#over-high-score");
const pauseLabel = document.querySelector("#pause-label");
const startButton = document.querySelector("#start-button");
const restartButton = document.querySelector("#restart-button");

function renderPlayer() {
    playerElement.style.left = `${state.playerX}px`;
    playerElement.style.top = `${state.playerY}px`;
    playerElement.style.bottom = "auto";
}

function renderBullets() {
    state.bullets.forEach(function (bullet) {
        if (!bullet.element) {
            bullet.element = document.createElement("div");
            bullet.element.classList.add("sprite", "bullet");
            bullet.element.dataset.id = `bullet-${bullet.id}`;
            bullet.element.setAttribute("aria-label", "Bullet");
            playArea.append(bullet.element);
        }

        bullet.element.style.left = `${bullet.x}px`;
        bullet.element.style.top = `${bullet.y}px`;
    });
}

function renderEnemies() {
    state.enemies.forEach(function (enemy) {
        if (!enemy.element) {
            enemy.element = document.createElement("div");
            enemy.element.classList.add("sprite", "enemy");
            enemy.element.dataset.id = `enemy-${enemy.id}`;
            enemy.element.setAttribute("aria-label", "Enemy ship");
            playArea.append(enemy.element);
        }

        enemy.element.style.left = `${enemy.x}px`;
        enemy.element.style.top = `${enemy.y}px`;
    });
}

function renderHUD() {
    scoreElement.textContent = state.score;
    livesElement.textContent = "♥ ".repeat(state.lives).trim() || "—";
    hudHighScoreElement.textContent = state.highScore;
    startHighScoreElement.textContent = state.highScore;
    overHighScoreElement.textContent = state.highScore;
    pauseLabel.classList.toggle("hidden", !state.paused);
}

function render() {
    renderPlayer();
    renderBullets();
    renderEnemies();
    renderHUD();
}

function removeBullet(index) {
    const bullet = state.bullets[index];
    if (bullet.element) {
        bullet.element.remove();
    }
    state.bullets.splice(index, 1);
}

function removeEnemy(index, showExplosion) {
    const enemy = state.enemies[index];

    if (enemy.element) {
        if (showExplosion) {
            enemy.element.classList.add("explosion");
            const element = enemy.element;
            window.setTimeout(function () {
                element.remove();
            }, 270);
        } else {
            enemy.element.remove();
        }
    }

    state.enemies.splice(index, 1);
}

function showShipExplosion() {
    playerElement.classList.add("explosion");
}

/* =========================================================
   5. EVENTS / START-UP
   Keyboard, buttons, game loop, start and restart.
   ========================================================= */
function updateHighScore() {
    if (state.score > state.highScore) {
        state.highScore = state.score;
        try {
            localStorage.setItem("spaceShooterHighScore", String(state.highScore));
        } catch (error) {
            // The game still works if browser storage is unavailable.
        }
    }
}

function startGame() {
    stopGameLoop();

    state.running = true;
    state.gameOver = false;
    state.paused = false;
    state.score = 0;
    state.lives = STARTING_LIVES;
    state.bullets = [];
    state.enemies = [];
    state.keys.left = false;
    state.keys.right = false;
    state.lastFrameTime = 0;
    state.bulletTimer = 0;
    state.enemyId = 0;
    state.invulnerableUntil = 0;

    try {
        state.highScore = Number(localStorage.getItem("spaceShooterHighScore")) || 0;
    } catch (error) {
        state.highScore = 0;
    }

    // Remove any old sprites left from the previous round.
    playArea.querySelectorAll(".bullet, .enemy").forEach(function (element) {
        element.remove();
    });
    playerElement.classList.remove("explosion", "blink");

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    playArea.classList.remove("hidden");
    hud.classList.remove("hidden");

    state.playerX = (getPlayWidth() - PLAYER_WIDTH) / 2;
    state.playerY = getPlayHeight() - PLAYER_HEIGHT - 18;

    keepEnemyCount();
    render();
    state.animationId = requestAnimationFrame(gameLoop);
}

function stopGameLoop() {
    if (state.animationId !== null) {
        cancelAnimationFrame(state.animationId);
        state.animationId = null;
    }
}

function endGame() {
    if (state.gameOver) {
        return;
    }

    state.running = false;
    state.gameOver = true;
    state.paused = false;
    state.keys.left = false;
    state.keys.right = false;
    stopGameLoop();
    updateHighScore();

    showShipExplosion();
    finalScoreElement.textContent = state.score;
    renderHUD();

    window.setTimeout(function () {
        playArea.classList.add("hidden");
        hud.classList.add("hidden");
        gameOverScreen.classList.remove("hidden");
        playerElement.classList.remove("explosion");
    }, 280);
}

function fireBullet() {
    const bullet = {
        id: state.bullets.length ? state.bullets[state.bullets.length - 1].id + 1 : 0,
        x: state.playerX + PLAYER_WIDTH / 2 - 3,
        y: state.playerY - 16,
        element: null
    };
    state.bullets.push(bullet);
}

function updatePlayer(deltaTime) {
    if (state.keys.left) {
        state.playerX -= PLAYER_SPEED * deltaTime;
    }
    if (state.keys.right) {
        state.playerX += PLAYER_SPEED * deltaTime;
    }

    const maxX = getPlayWidth() - PLAYER_WIDTH;
    state.playerX = Math.max(0, Math.min(state.playerX, maxX));
    state.playerY = getPlayHeight() - PLAYER_HEIGHT - 18;
}

function updateBullets(deltaTime) {
    for (let i = state.bullets.length - 1; i >= 0; i -= 1) {
        state.bullets[i].y -= BULLET_SPEED * deltaTime;

        if (state.bullets[i].y + 16 < 0) {
            removeBullet(i);
        }
    }
}

function updateEnemies(deltaTime) {
    for (let i = state.enemies.length - 1; i >= 0; i -= 1) {
        state.enemies[i].y += state.enemies[i].speed * deltaTime;

        if (state.enemies[i].y > getPlayHeight()) {
            removeEnemy(i, false);
        }
    }
    keepEnemyCount();
}

function checkCollisions() {
    // Check every bullet against every enemy.
    for (let b = state.bullets.length - 1; b >= 0; b -= 1) {
        let bulletHit = false;

        for (let e = state.enemies.length - 1; e >= 0; e -= 1) {
            if (rectanglesTouch(getBulletBox(state.bullets[b]), getEnemyBox(state.enemies[e]))) {
                removeBullet(b);
                removeEnemy(e, true);
                state.score += 10;
                updateHighScore();
                keepEnemyCount();
                bulletHit = true;
                break;
            }
        }

        if (bulletHit) {
            continue;
        }
    }

    // Check enemies against the player, unless the player is blinking.
    if (performance.now() >= state.invulnerableUntil) {
        for (let e = state.enemies.length - 1; e >= 0; e -= 1) {
            if (rectanglesTouch(getPlayerBox(), getEnemyBox(state.enemies[e]))) {
                removeEnemy(e, true);
                state.lives -= 1;

                if (state.lives <= 0) {
                    renderHUD();
                    endGame();
                    return;
                }

                state.invulnerableUntil = performance.now() + INVULNERABLE_TIME;
                playerElement.classList.add("blink");
                window.setTimeout(function () {
                    if (performance.now() >= state.invulnerableUntil) {
                        playerElement.classList.remove("blink");
                    }
                }, INVULNERABLE_TIME + 20);
                keepEnemyCount();
                break;
            }
        }
    }
}

function gameLoop(currentTime) {
    if (!state.running || state.paused) {
        return;
    }

    if (state.lastFrameTime === 0) {
        state.lastFrameTime = currentTime;
    }

    // Delta time makes movement similar on different refresh rates.
    const deltaTime = Math.min((currentTime - state.lastFrameTime) / 1000, 0.04);
    state.lastFrameTime = currentTime;

    updatePlayer(deltaTime);

    state.bulletTimer += deltaTime * 1000;
    if (state.bulletTimer >= BULLET_INTERVAL) {
        fireBullet();
        state.bulletTimer = 0;
    }

    updateBullets(deltaTime);
    updateEnemies(deltaTime);
    checkCollisions();

    if (!state.running) {
        return;
    }

    render();
    state.animationId = requestAnimationFrame(gameLoop);
}

function togglePause() {
    if (!state.running || state.gameOver) {
        return;
    }

    state.paused = !state.paused;

    if (state.paused) {
        stopGameLoop();
        pauseLabel.classList.remove("hidden");
    } else {
        state.lastFrameTime = 0;
        pauseLabel.classList.add("hidden");
        state.animationId = requestAnimationFrame(gameLoop);
    }
}

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
    }

    if (event.key === "ArrowLeft") {
        state.keys.left = true;
    } else if (event.key === "ArrowRight") {
        state.keys.right = true;
    } else if (event.key.toLowerCase() === "p") {
        if (!event.repeat) {
            togglePause();
        }
    }
});

document.addEventListener("keyup", function (event) {
    if (event.key === "ArrowLeft") {
        state.keys.left = false;
    } else if (event.key === "ArrowRight") {
        state.keys.right = false;
    }
});

window.addEventListener("blur", function () {
    state.keys.left = false;
    state.keys.right = false;
});

// Load saved high score for the start screen.
try {
    state.highScore = Number(localStorage.getItem("spaceShooterHighScore")) || 0;
} catch (error) {
    state.highScore = 0;
}
renderHUD();
