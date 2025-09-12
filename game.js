window.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const startScreen = document.getElementById('start-screen');
    const startButton = document.getElementById('start-button');
    const pauseScreen = document.getElementById('pause-screen');
    const resumeButton = document.getElementById('resume-button');
    const restartButton = document.getElementById('restart-button');
    const gameOverScreen = document.getElementById('game-over-screen');
    const restartButton2 = document.getElementById('restart-button2');
    const finalScoreText = document.getElementById('final-score');
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    
    // Audio
    const bgMusic = document.getElementById('bg-music');
    const hitSound = document.getElementById('hit-sound');
    const powerupSound = document.getElementById('powerup-sound');

    // Game Variables
    let gameRunning = false;
    let paused = false;
    let player, enemies, powerUps, score, lives, speed;
    let highScore = localStorage.getItem('highScore') || 0;
    const playerSize = 30;
    const explosions = []; // store explosion effects
    const screenShake = { x: 0, y: 0, intensity: 0 };

    // Initialize game variables
    function initGame() {
        player = { x: canvas.width / 2, y: canvas.height - 50, size: playerSize };
        enemies = [];
        powerUps = [];
        explosions.length = 0;
        score = 0;
        lives = 3;
        speed = 2;
        gameRunning = true;
        paused = false;
        screenShake.intensity = 0;
        bgMusic.currentTime = 0;
        bgMusic.play();
    }

    // Start Game
    function startGame() {
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        pauseScreen.style.display = 'none';
        canvas.style.display = 'block';
        initGame();
        requestAnimationFrame(gameLoop);
    }

    // Pause/Resume
    function togglePause() {
        if (!gameRunning) return;
        paused = !paused;
        pauseScreen.style.display = paused ? 'flex' : 'none';
        if (paused) bgMusic.pause(); else bgMusic.play();
    }

    // Restart Game
    function restartGame() { startGame(); }

    // Controls
    const keys = {};
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        if (e.key === 'Escape') togglePause();
    });
    document.addEventListener('keyup', (e) => keys[e.key] = false);

    // Explosion effect
    function addExplosion(x, y) {
        explosions.push({ x, y, radius: 10, alpha: 1 });
        screenShake.intensity = 5;
    }

    function drawExplosions() {
        for (let i = explosions.length - 1; i >= 0; i--) {
            const exp = explosions[i];
            ctx.beginPath();
            ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI*2);
            ctx.fillStyle = `rgba(255,165,0,${exp.alpha})`;
            ctx.fill();
            exp.radius += 2;
            exp.alpha -= 0.05;
            if (exp.alpha <= 0) explosions.splice(i,1);
        }
    }

    // Spawn PowerUps
    function spawnPowerUp() {
        if (Math.random() < 0.01) {
            powerUps.push({ x: Math.random()*(canvas.width-20)+10, y:-20, size:20, type:'life' });
        }
    }

    function drawPowerUps() {
        for (let i = powerUps.length-1; i>=0; i--) {
            const p = powerUps[i];
            p.y += 2;
            ctx.fillStyle = '#0ff';
            ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);

            // Collision with player
            if (
                player.x < p.x + p.size/2 &&
                player.x > p.x - p.size/2 &&
                player.y < p.y + p.size/2 &&
                player.y > p.y - p.size/2
            ) {
                powerUps.splice(i,1);
                lives++;
                powerupSound.currentTime = 0;
                powerupSound.play();
            }

            if (p.y > canvas.height+20) powerUps.splice(i,1);
        }
    }

    // Screen shake effect
    function applyScreenShake() {
        if (screenShake.intensity > 0) {
            screenShake.x = (Math.random()-0.5)*screenShake.intensity;
            screenShake.y = (Math.random()-0.5)*screenShake.intensity;
            screenShake.intensity *= 0.9;
        } else {
            screenShake.x = 0; screenShake.y = 0;
        }
        ctx.setTransform(1,0,0,1,screenShake.x,screenShake.y);
    }

    // Game Loop
    function gameLoop() {
        if (!gameRunning) return;
        if (paused) { requestAnimationFrame(gameLoop); return; }

        // Clear canvas with screen shake
        ctx.setTransform(1,0,0,1,0,0);
        ctx.fillStyle = '#222';
        ctx.fillRect(0,0,canvas.width,canvas.height);
        applyScreenShake();

        // Move player
        if (keys['ArrowLeft']) player.x -= 5;
        if (keys['ArrowRight']) player.x += 5;
        if (keys['ArrowUp']) player.y -= 5;
        if (keys['ArrowDown']) player.y += 5;

        // Keep player inside canvas
        player.x = Math.max(player.size/2, Math.min(canvas.width - player.size/2, player.x));
        player.y = Math.max(player.size/2, Math.min(canvas.height - player.size/2, player.y));

        // Draw player
        ctx.fillStyle = '#0f0';
        ctx.fillRect(player.x - player.size/2, player.y - player.size/2, player.size, player.size);
        ctx.strokeStyle = '#0a0';
        ctx.strokeRect(player.x - player.size/2, player.y - player.size/2, player.size, player.size);

        // Spawn enemies
        if (Math.random() < 0.02 + score/5000) {
            const type = Math.random() < 0.5 ? 'fast' : 'slow';
            enemies.push({ x: Math.random()*(canvas.width-20)+10, y:-20, size: 20, type });
       
