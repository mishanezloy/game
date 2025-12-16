document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const restartBtn = document.getElementById('restartBtn');
    const gameStatus = document.getElementById('gameStatus');
    
    let game;
    
    function updateUI(score, lives, hasDoubleJump) {
        document.getElementById('score').textContent = score;
        document.getElementById('lives').textContent = lives;
        document.getElementById('double-jump').textContent = hasDoubleJump ? '✓' : '✗';
    }
    
    function showMessage(text, color = '#667eea') {
        gameStatus.textContent = text;
        gameStatus.style.backgroundColor = color;
        gameStatus.style.opacity = '1';
        
        setTimeout(() => {
            gameStatus.style.opacity = '0';
        }, 2000);
    }
    
    function startGame() {
        if (game) {
            game.stop();
        }
        
        game = new Game(canvas, ctx, {
            onUpdate: updateUI,
            onGameOver: (score) => {
                showMessage(`Игра окончена! Ваш счет: ${score}`, '#f44336');
            },
            onWin: (score) => {
                showMessage(`Победа! Вы набрали ${score} очков!`, '#4CAF50');
            }
        });
        
        game.start();
        startBtn.disabled = true;
        setTimeout(() => startBtn.disabled = false, 1000);
        showMessage('Игра началась! Удачи!', '#4CAF50');
    }
    
    function pauseGame() {
        if (game) {
            game.togglePause();
            pauseBtn.innerHTML = game.paused ? 
                '<i class="fas fa-play"></i> Продолжить' : 
                '<i class="fas fa-pause"></i> Пауза';
            showMessage(game.paused ? 'Игра на паузе' : 'Игра продолжается', '#FF9800');
        }
    }
    
    function restartGame() {
        if (game) {
            game.stop();
        }
        startGame();
        showMessage('Игра перезапущена!', '#2196F3');
    }
    
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', pauseGame);
    restartBtn.addEventListener('click', restartGame);
    
    // Автоматический старт игры
    setTimeout(startGame, 1000);
});