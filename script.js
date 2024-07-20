const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreboard = document.getElementById('scoreboard');
const scoreElement = document.getElementById('score');
const highscoreElement = document.getElementById('highscore');
const gameOverElement = document.getElementById('gameOver');
const restartButton = document.getElementById('restart');
const jumpButton = document.getElementById('jumpButton');

function resizeCanvas() {
    canvas.width = window.innerWidth > 480 ? 480 : window.innerWidth;
    canvas.height = window.innerHeight > 640 ? 640 : window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let bird = {
    x: 50,
    y: canvas.height / 2,
    radius: 15,
    gravity: 1.0,
    lift: -15,
    velocity: 0
};

let pipes = [];
const pipeWidth = 50;
const pipeGap = 180;
const pipeFrequency = 100;
let pipeSpeed = 3;
let frame = 0;
let score = 0;
let highscore = localStorage.getItem('highscore') || 0;
let isGameOver = false;

let clouds = [
    { x: 100, y: 100, width: 100, height: 60, opacity: 0.5 },
    { x: 300, y: 50, width: 120, height: 70, opacity: 0.4 },
    { x: 500, y: 150, width: 90, height: 50, opacity: 0.6 }
];

function drawClouds() {
    clouds.forEach(cloud => {
        ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;
        ctx.beginPath();
        ctx.ellipse(cloud.x, cloud.y, cloud.width, cloud.height, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    });
}

function drawBird() {
    ctx.fillStyle = '#FFD701'; // Cor do pássaro
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    // Desenhar o olho do pássaro
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(bird.x + 5, bird.y - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

function drawPipes() {
    pipes.forEach(pipe => {
        // Parte superior do cano
        ctx.fillStyle = '#228B22'; // Cor do cano
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        // Bordas superiores
        ctx.fillStyle = '#006400';
        ctx.fillRect(pipe.x, pipe.topHeight - 10, pipeWidth, 10);
        
        // Parte inferior do cano
        ctx.fillStyle = '#228B22'; // Cor do cano
        ctx.fillRect(pipe.x, pipe.topHeight + pipeGap, pipeWidth, canvas.height - pipe.topHeight - pipeGap);
        // Bordas inferiores
        ctx.fillStyle = '#006400';
        ctx.fillRect(pipe.x, pipe.topHeight + pipeGap, pipeWidth, 10);
    });
}

function drawScore() {
    scoreElement.textContent = `Score: ${score}`;
    highscoreElement.textContent = `High Score: ${highscore}`;
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    if (bird.y < 0) bird.y = 0;
    if (bird.y + bird.radius > canvas.height) bird.y = canvas.height - bird.radius;
}

function updatePipes() {
    if (frame % pipeFrequency === 0) {
        const topHeight = Math.random() * (canvas.height - pipeGap - 100) + 50;
        pipes.push({
            x: canvas.width,
            topHeight: topHeight
        });
    }
    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;
        if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
            pipe.passed = true;
            score++;
        }
    });
    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
}

function checkCollision() {
    for (const pipe of pipes) {
        if (bird.x + bird.radius > pipe.x &&
            bird.x - bird.radius < pipe.x + pipeWidth &&
            (bird.y - bird.radius < pipe.topHeight || bird.y + bird.radius > pipe.topHeight + pipeGap)) {
            return true;
        }
    }
    return false;
}

function gameOver() {
    isGameOver = true;
    if (score > highscore) {
        highscore = score;
        localStorage.setItem('highscore', highscore);
    }
    gameOverElement.style.display = 'block';
}

function restartGame() {
    bird = {
        x: 50,
        y: canvas.height / 2,
        radius: 15,
        gravity: 1.0,
        lift: -15,
        velocity: 0
    };
    pipes = [];
    frame = 0;
    score = 0;
    isGameOver = false;
    gameOverElement.style.display = 'none';
    drawScore();
    gameLoop();
}

function drawInstructions() {
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Tap to Jump', canvas.width / 2, canvas.height - 20);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawClouds();
    drawPipes();
    drawBird();
    drawScore();
    if (!isGameOver) {
        drawInstructions(); // Desenhar instruções de controle
    }
}

function update() {
    updateBird();
    updatePipes();
    if (checkCollision()) {
        gameOver();
    }
}

function gameLoop() {
    if (isGameOver) return;
    frame++;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function handleJump() {
    if (!isGameOver) {
        bird.velocity = bird.lift;
    }
}

document.addEventListener('keydown', handleJump);
jumpButton.addEventListener('touchstart', handleJump);

restartButton.addEventListener('click', restartGame);

gameLoop();
