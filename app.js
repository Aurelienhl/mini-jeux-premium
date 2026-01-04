// ============================================
// APPLICATION PRINCIPALE
// ============================================

// Fonction utilitaire de décompte "3, 2, 1, GO!"
window.gameCountdown = function(containerElement, callback) {
    // Créer l'overlay de décompte s'il n'existe pas
    let countdownOverlay = containerElement.querySelector('.countdown-overlay');
    if (!countdownOverlay) {
        countdownOverlay = document.createElement('div');
        countdownOverlay.className = 'countdown-overlay';
        countdownOverlay.innerHTML = '<div class="countdown-content"><div class="countdown-number"></div></div>';
        containerElement.appendChild(countdownOverlay);
    }
    
    const countdownNumber = countdownOverlay.querySelector('.countdown-number');
    countdownOverlay.classList.remove('hidden');
    countdownOverlay.style.display = 'flex';
    
    let count = 3;
    countdownNumber.textContent = count;
    countdownNumber.style.transform = 'scale(0.5)';
    countdownNumber.style.opacity = '0';
    
    const animate = () => {
        countdownNumber.style.transition = 'all 0.3s ease';
        countdownNumber.style.transform = 'scale(1)';
        countdownNumber.style.opacity = '1';
        
        setTimeout(() => {
            countdownNumber.style.transform = 'scale(0.5)';
            countdownNumber.style.opacity = '0';
        }, 700);
    };
    
    animate();
    
    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownNumber.textContent = count;
            animate();
        } else if (count === 0) {
            countdownNumber.textContent = 'GO!';
            countdownNumber.style.fontSize = '6rem';
            countdownNumber.style.color = '#f59e0b';
            countdownNumber.style.textShadow = '0 0 40px rgba(245, 158, 11, 0.8)';
            animate();
            setTimeout(() => {
                countdownOverlay.classList.add('hidden');
                countdownOverlay.style.display = 'none';
                // Réinitialiser les styles pour le prochain décompte
                countdownNumber.style.fontSize = '';
                countdownNumber.style.color = '';
                countdownNumber.style.textShadow = '';
                if (callback) callback();
            }, 800);
            clearInterval(countdownInterval);
        }
    }, 1000);
};

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les managers
    window.statsManager = new StatsManager();
    window.playerManager = new PlayerManager();
    window.gameManager = new GameManager();
    
    // Initialiser tous les jeux
    const snakeGame = new SnakeGame();
    const tictactoeGame = new TicTacToeGame();
    const memoryGame = new MemoryGame();
    const reactionGame = new ReactionGame();
    const puzzle2048Game = new Puzzle2048Game();
    const calculatorGame = new CalculatorGame();
    const pongGame = new PongGame();
    const wordleGame = new WordleGame();
    
    // Enregistrer les jeux
    window.gameManager.registerGame('snake', snakeGame);
    window.gameManager.registerGame('tictactoe', tictactoeGame);
    window.gameManager.registerGame('memory', memoryGame);
    window.gameManager.registerGame('reaction', reactionGame);
    window.gameManager.registerGame('puzzle2048', puzzle2048Game);
    window.gameManager.registerGame('calculator', calculatorGame);
    window.gameManager.registerGame('pong', pongGame);
    window.gameManager.registerGame('wordle', wordleGame);
    
    // Mettre à jour le leaderboard
    window.playerManager.updateLeaderboard();
    
    // Mettre à jour les stats toutes les minutes
    setInterval(() => {
        window.statsManager.updateSessionTime();
    }, 60000);
    
    // Sauvegarder les stats à la fermeture
    window.addEventListener('beforeunload', () => {
        window.statsManager.updateSessionTime();
    });
    
    console.log('🎮 Mini Jeux Premium - Application chargée!');
});

