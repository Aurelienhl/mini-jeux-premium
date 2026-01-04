// ============================================
// JEU SNAKE AMÉLIORÉ
// ============================================

class SnakeGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gridSize = 25;
        this.tileCount = 20;
        this.snake = [{ x: 10, y: 10 }];
        this.food = { x: 15, y: 15 };
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.level = 1;
        this.bestScore = parseInt(localStorage.getItem('snakeBest')) || 0;
        this.gameRunning = false;
        this.gameLoop = null;
        this.speed = 150;
        this.difficulty = 'medium';
        
        // Attendre que le DOM soit chargé
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        this.canvas = document.getElementById('snake-canvas');
        if (!this.canvas) {
            console.error('Canvas snake-canvas non trouvé');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.tileCount = Math.floor(this.canvas.width / this.gridSize);
        
        const bestEl = document.getElementById('snake-best');
        const levelEl = document.getElementById('snake-level');
        const startBtn = document.getElementById('snake-start');
        const pauseBtn = document.getElementById('snake-pause');
        const resetBtn = document.getElementById('snake-reset');
        const difficultySelect = document.getElementById('snake-difficulty');
        
        if (!bestEl || !levelEl || !startBtn || !pauseBtn || !resetBtn || !difficultySelect) {
            console.error('Éléments HTML du jeu Snake non trouvés');
            return;
        }
        
        bestEl.textContent = this.bestScore;
        levelEl.textContent = this.level;
        
        startBtn.addEventListener('click', () => this.start());
        pauseBtn.addEventListener('click', () => this.pause());
        resetBtn.addEventListener('click', () => this.reset());
        difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.updateSpeed();
        });
        
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;
            
            if (e.key === 'ArrowUp' && this.dy !== 1) {
                this.dx = 0;
                this.dy = -1;
            } else if (e.key === 'ArrowDown' && this.dy !== -1) {
                this.dx = 0;
                this.dy = 1;
            } else if (e.key === 'ArrowLeft' && this.dx !== 1) {
                this.dx = -1;
                this.dy = 0;
            } else if (e.key === 'ArrowRight' && this.dx !== -1) {
                this.dx = 1;
                this.dy = 0;
            } else if (e.key === ' ') {
                e.preventDefault();
                this.pause();
            }
        });
        
        this.updateSpeed();
        this.draw();
        
        // Écouter les changements de taille de fenêtre
        window.addEventListener('resize', () => {
            if (this.canvas) {
                this.resizeCanvas();
                if (!this.gameRunning) {
                    this.draw();
                }
            }
        });
    }
    
    updateSpeed() {
        switch(this.difficulty) {
            case 'easy': this.speed = 200; break;
            case 'medium': this.speed = 150; break;
            case 'hard': this.speed = 100; break;
        }
    }
    
    start() {
        if (this.gameRunning || !this.canvas) return;

        // Réinitialiser le jeu avant de commencer (position au centre, etc.)
        this.reset();

        const overlay = document.getElementById('snake-overlay');
        if (overlay) overlay.classList.add('hidden');

        const gameWrapper = this.canvas.parentElement;
        if (gameWrapper && window.gameCountdown) {
            window.gameCountdown(gameWrapper, () => {
                this.gameRunning = true;
                // Initialiser une direction par défaut si le serpent n'a pas encore de direction
                if (this.dx === 0 && this.dy === 0) {
                    this.dx = 1;
                    this.dy = 0;
                }
                this.gameLoop = setInterval(() => this.update(), this.speed);
            });
        } else {
            // Fallback si le décompte n'est pas disponible
            this.gameRunning = true;
            if (this.dx === 0 && this.dy === 0) {
                this.dx = 1;
                this.dy = 0;
            }
            this.gameLoop = setInterval(() => this.update(), this.speed);
        }
    }
    
    pause() {
        if (!this.gameRunning) return;
        this.gameRunning = false;
        clearInterval(this.gameLoop);
        const overlay = document.getElementById('snake-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            const h3 = overlay.querySelector('.overlay-content h3');
            const p = overlay.querySelector('.overlay-content p');
            if (h3) h3.textContent = '⏸ Pause';
            if (p) p.textContent = 'Cliquez sur Commencer pour reprendre';
        }
    }
    
    reset() {
        this.gameRunning = false;
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        // Positionner le serpent au centre du plateau
        const centerX = Math.floor(this.tileCount / 2);
        const centerY = Math.floor(this.tileCount / 2);
        this.snake = [{ x: centerX, y: centerY }];
        this.food = this.generateFood();
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.level = 1;
        const scoreEl = document.getElementById('snake-score');
        const levelEl = document.getElementById('snake-level');
        if (scoreEl) scoreEl.textContent = 0;
        if (levelEl) levelEl.textContent = 1;
        const overlay = document.getElementById('snake-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            const h3 = overlay.querySelector('.overlay-content h3');
            const p = overlay.querySelector('.overlay-content p');
            if (h3) h3.textContent = '🐍 Snake';
            if (p) p.textContent = 'Utilisez les flèches du clavier pour diriger le serpent';
        }
        this.updateSpeed();
        this.resizeCanvas();
        this.draw();
    }
    
    generateFood() {
        let food;
        let attempts = 0;
        do {
            food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
            attempts++;
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y) && attempts < 100);
        return food;
    }
    
    update() {
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            const scoreEl = document.getElementById('snake-score');
            if (scoreEl) scoreEl.textContent = this.score;
            
            // Augmenter le niveau tous les 50 points
            const newLevel = Math.floor(this.score / 50) + 1;
            if (newLevel > this.level) {
                this.level = newLevel;
                const levelEl = document.getElementById('snake-level');
                if (levelEl) levelEl.textContent = this.level;
                // Augmenter la vitesse
                clearInterval(this.gameLoop);
                this.speed = Math.max(50, this.speed - 5);
                this.gameLoop = setInterval(() => this.update(), this.speed);
            }
            
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
        
        this.draw();
    }
    
    gameOver() {
        this.gameRunning = false;
        clearInterval(this.gameLoop);
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('snakeBest', this.bestScore);
            const bestEl = document.getElementById('snake-best');
            if (bestEl) bestEl.textContent = this.bestScore;
        }
        
        // Enregistrer les stats
        if (window.statsManager) {
            window.statsManager.recordGame('snake', { score: this.score, win: false });
        }
        if (window.playerManager) {
            window.playerManager.updatePlayerStats('snake', { score: this.score });
        }
        
        const overlay = document.getElementById('snake-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            const h3 = overlay.querySelector('.overlay-content h3');
            const p = overlay.querySelector('.overlay-content p');
            if (h3) h3.textContent = '💀 Game Over!';
            if (p) p.textContent = `Score: ${this.score} | Niveau: ${this.level}`;
        }
    }
    
    draw() {
        if (!this.ctx || !this.canvas) return;
        
        this.ctx.fillStyle = '#0a0e1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Grille
        this.ctx.strokeStyle = '#1a1f2e';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
        
        // Serpent avec gradient
        this.snake.forEach((segment, index) => {
            const gradient = this.ctx.createLinearGradient(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                (segment.x + 1) * this.gridSize,
                (segment.y + 1) * this.gridSize
            );
            
            if (index === 0) {
                gradient.addColorStop(0, '#34d399');
                gradient.addColorStop(1, '#10b981');
            } else {
                gradient.addColorStop(0, '#10b981');
                gradient.addColorStop(1, '#059669');
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });
        
        // Nourriture avec effet
        const foodGradient = this.ctx.createRadialGradient(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            0,
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2
        );
        foodGradient.addColorStop(0, '#f87171');
        foodGradient.addColorStop(1, '#ef4444');
        this.ctx.fillStyle = foodGradient;
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }
    
    onActivate() {
        // Quand le jeu est activé
        this.resizeCanvas();
        this.draw();
    }
    
    resizeCanvas() {
        if (!this.canvas) return;
        
        const gameWrapper = this.canvas.parentElement;
        if (!gameWrapper) return;
        
        const container = gameWrapper.closest('.game-container');
        if (container && container.classList.contains('fullscreen-mode')) {
            // Mode plein écran : adapter la taille
            const maxSize = Math.min(window.innerHeight - 200, window.innerWidth - 100);
            const size = Math.floor(maxSize / this.gridSize) * this.gridSize;
            this.canvas.width = size;
            this.canvas.height = size;
            this.tileCount = Math.floor(this.canvas.width / this.gridSize);
        } else {
            // Mode normal : taille par défaut
            this.canvas.width = 500;
            this.canvas.height = 500;
            this.tileCount = Math.floor(this.canvas.width / this.gridSize);
        }
        
        // Régénérer la nourriture si nécessaire
        if (this.food.x >= this.tileCount || this.food.y >= this.tileCount) {
            this.food = this.generateFood();
        }
    }
}

