window.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-button');
    const startScreen = document.getElementById('start-screen');
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');

    let gameRunning = false;

    startButton.addEventListener('click', () => {
        startScreen.style.display = 'none';
        canvas.style.display = 'block';
        startGame();
    });

    function startGame() {
        gameRunning = true;
        // Initialize game variables here
        // Example:
        let player = { x: canvas.width / 2, y: canvas.height - 50, size: 30 };

        function gameLoop() {
            if (!gameRunning) return;
            
            // Clear canvas
            ctx.fillStyle = '#222';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw player (placeholder)
            ctx.fillStyle = '#0f0';
            ctx.fillRect(player.x - player.size / 2, player.y - player.size / 2, player.size, player.size);

            // Example: Move player with arrow keys
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') player.x -= 10;
                if (e.key === 'ArrowRight') player.x += 10;
                if (e.key === 'ArrowUp') player.y -= 10;
                if (e.key === 'ArrowDown') player.y += 10;
            });

            requestAnimationFrame(gameLoop);
        }

        requestAnimationFrame(gameLoop);
    }
});
