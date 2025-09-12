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

    // Game Variables
    let gameRunning = false;
    let paused = false;
    let player, enemies, score, lives, speed;

    const playerSize = 30;

    // Initialize game variables
    function initGame() {
        player = { x: canvas.width / 2, y: canvas.height - 50, size: playerSize };
        enemies = [];
        score = 0;
        lives = 3;
        speed = 2;
        gameRunning = true;
        paused = false;
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
    }

    // Restart Game
    function restartGame() {
        startGame();
    }

    // Controls
    const keys = {};
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        if (e.key === 'Escape') togglePause();
    });
    document.addEventListener('keyup', (e) => keys[e.key] = false);

    // Game Loop
    function gameLoop() {
        if (!gameRunning) return;
        if (paused) {
            requestAnimationFrame(gameLoop);
            return;
        }

        // Clear canvas
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Move player
        if (keys['ArrowLeft']) player.x -= 5;
        if (keys['ArrowRight']) player.x += 5;
        if (keys['ArrowUp']) player.y -= 5;
        if (keys['ArrowDown']) player.y += 5;

        // Keep player inside canvas
        player.x = Math.max(player.size/2, Math.min(canvas.width - player.size/2, player.x));
        player.y = Math.max(player.size/2, Math.min(canvas.height - player.size/2, player.y));

        // Draw player with simple 3D effect
        ctx.fillStyle = '#0f0';
        ctx.fillRect(player.x - player.size/2, player.y - player.size/2, player.size, player.size);
        ctx.strokeStyle = '#0a0';
        ctx.strokeRect(player.x - player.size/2, player.y - player.size/2, player.size, player.size);

        // Spawn enemies over time
        if (Math.random() < 0.02 + score/5000) {
            enemies.push({ x: Math.random() * (canvas.width - 20) + 10, y: -20, size: 20 });
        }

        // Move enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            enemies[i].y += speed;
            ctx.fillStyle = '#f00';
            ctx.fillRect(enemies[i].x - enemies[i].size/2, enemies[i].y - enemies[i].size/2, enemies[i].size, enemies[i].size);

            // Check collision with player
            if (
                player.x < enemies[i].x + enemies[i].size/2 &&
                player.x > enemies[i].x - enemies[i].size/2 &&
                player.y < enemies[i].y + enemies[i].size/2 &&
                player.y > enemies[i].y - enemies[i].size/2
            ) {
                enemies.splice(i, 1);
                lives--;
                if (lives <= 0) {
                    gameOver();
                    return;
                }
            }

            // Remove enemies that leave screen
            if (enemies[i] && enemies[i].y > canvas.height + 20) enemies.splice(i,1);
        }

        // Increase score
        score++;
        if (score % 500 === 0) speed += 0.5; // Progressive difficulty

        // Display score and lives
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, 10, 25);
        ctx.fillText(`Lives: ${lives}`, 10, 50);

        requestAnimationFrame(gameLoop);
    }

    function gameOver() {
        gameRunning = false;
        canvas.style.display = 'none';
        finalScoreText.textContent = `Final Score: ${score}`;
        gameOverScreen.style.display = 'flex';
    }

    // Event Listeners
    startButton.addEventListener('click', startGame);
    resumeButton.addEventListener('click', togglePause);
    restartButton.addEventListener('click', restartGame);
    restartButton2.addEventListener('click', restartGame);
});
