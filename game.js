const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const naveImg = new Image();
naveImg.src = "assets/nave.png";

const player = { x: 300, y: 350, width: 40, height: 40, speed: 5 };
const bullets = [];
const enemies = [];
let enemyDirection = 1;
let score = 0;
let gameRunning = true;
let rankingSaved = false;

const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreText = document.getElementById('finalScore');
const rankingList = document.getElementById('rankingList');
const playerNameInput = document.getElementById('playerName');
const saveNameBtn = document.getElementById('saveNameBtn');
const restartBtn = document.getElementById('restartBtn');

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

playerNameInput.addEventListener('input', () => {
    saveNameBtn.disabled = playerNameInput.value.trim().length === 0;
});

saveNameBtn.addEventListener('click', () => {
    if (rankingSaved) return;
    const name = playerNameInput.value.trim();
    if (name.length === 0) return;

    let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
    ranking.push({ name, score });
    ranking.sort((a, b) => b.score - a.score);
    ranking = ranking.slice(0, 5);
    localStorage.setItem("ranking", JSON.stringify(ranking));
    rankingSaved = true;

    displayRanking(ranking);
    playerNameInput.disabled = true;
    saveNameBtn.style.display = "none";
    restartBtn.style.display = "inline-block";
});

let keys = {};

function keyDown(e) {
    keys[e.key] = true;
    if (e.key === " " && gameRunning) shoot();
}

function keyUp(e) {
    keys[e.key] = false;
}

function shoot() {
    bullets.push({ x: player.x, y: player.y, width: 5, height: 10 });
}

function createEnemies() {
    enemies.length = 0;
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 8; col++) {
            enemies.push({ x: 60 * col + 30, y: 40 * row + 30, size: 20, alive: true });
        }
    }
}

  function drawPlayer() {
            ctx.drawImage(naveImg, player.x - 50, player.y - 50, 100, 100);
        }


function drawBullets() {
    ctx.fillStyle = "yellow";
    bullets.forEach(b => ctx.fillRect(b.x - b.width / 2, b.y, b.width, b.height));
}

function drawEnemies() {
    ctx.fillStyle = "brown";
    enemies.forEach(e => {
        if (e.alive) {
            ctx.beginPath();
            ctx.ellipse(e.x, e.y, e.size, e.size, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function updateBullets() {
    bullets.forEach(b => b.y -= 7);
    bullets.forEach(b => {
        enemies.forEach(e => {
            if (e.alive &&
                b.x > e.x - e.size &&
                b.x < e.x + e.size &&
                b.y > e.y - e.size &&
                b.y < e.y + e.size) {
                e.alive = false;
                b.y = -10;
                score += 10;
                scoreDisplay.innerText = "Pontuação: " + score;
            }
        });
    });
    for (let i = bullets.length - 1; i >= 0; i--) {
        if (bullets[i].y < 0) bullets.splice(i, 1);
    }
}

function updateEnemies() {
    let shiftDown = false;
    enemies.forEach(e => {
        if (e.alive) {
            e.x += enemyDirection;
            if (e.x - e.size < 0 || e.x + e.size > canvas.width) {
                shiftDown = true;
            }
        }
    });
    if (shiftDown) {
        enemyDirection *= -1;
        enemies.forEach(e => {
            e.y += 10;
        });
    }
}

function updatePlayer() {
    if (keys["ArrowLeft"] && player.x - player.width / 2 > 0) player.x -= player.speed;
    if (keys["ArrowRight"] && player.x + player.width / 2 < canvas.width) player.x += player.speed;
}

function checkWin() {
    const allDead = enemies.every(e => !e.alive);
    if (allDead && gameRunning) {
        gameRunning = false;
        showGameOverScreen();
    }
}

function showGameOverScreen() {
    finalScoreText.innerText = "Sua Pontuação Final: " + score;

    gameOverScreen.style.display = "block";
    canvas.style.display = "none";
    scoreDisplay.style.display = "none";

    playerNameInput.disabled = false;
    playerNameInput.value = "";
    saveNameBtn.style.display = "inline-block";
    saveNameBtn.disabled = true;
    restartBtn.style.display = "none";

    let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
    displayRanking(ranking);
    rankingSaved = false;
}

function displayRanking(ranking) {
    rankingList.innerHTML = "";
    ranking.forEach((entry, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}º lugar - ${entry.name}: ${entry.score} pontos`;
        rankingList.appendChild(li);
    });
}

function restartGame() {
    score = 0;
    scoreDisplay.innerText = "Pontuação: 0";
    bullets.length = 0;
    createEnemies();
    player.x = 300;
    gameRunning = true;

    gameOverScreen.style.display = "none";
    canvas.style.display = "block";
    scoreDisplay.style.display = "block";

    gameLoop();
}

function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updatePlayer();
    updateBullets();
    updateEnemies();

    drawPlayer();
    drawBullets();
    drawEnemies();

    checkWin();

    requestAnimationFrame(gameLoop);
}

createEnemies();
gameLoop();
