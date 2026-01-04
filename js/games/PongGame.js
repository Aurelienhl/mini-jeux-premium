// ============================================
// JEU PONG
// ============================================

class PongGame {
    constructor() {
        this.canvas = document.getElementById('pong-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.paddle1 = { x: 10, y: this.height / 2 - 50, width: 10, height: 100, speed: 5 };
        this.paddle2 = { x: this.width - 20, y: this.height / 2 - 50, width: 10, height: 100, speed: 5 };
        this.ball = { x: this.width / 2, y: this.height / 2, radius: 10, dx: 4, dy: 4 };
        this.score1 = 0;
        this.score2 = 0;
        this.gameRunning = false;
        this.gameLoop = null;
        this.speed = 1;
        this.keys = {};
        
        this.init();
    }
    
    init() {
        if (!this.canvas) return;
        
        document.getElementById('pong-start').addEventListener('click', () => this.start());
        document.getElementById('pong-pause').addEventListener('click', () => this.pause());
        document.getElementById('pong-reset').addEventListener('click', () => this.reset());
        
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Écouter les changements de taille de fenêtre
        window.addEventListener('resize', () => {
            if (this.canvas && !this.gameRunning) {
                this.resizeCanvas();
                this.draw();
            }
        });
        
        this.draw();
    }
    
    start() {
        if (this.gameRunning) return;

        const overlay = document.getElementById('pong-overlay');
        if (overlay) overlay.classList.add('hidden');

        const gameWrapper = this.canvas.parentElement;
        if (gameWrapper && window.gameCountdown) {
            window.gameCountdown(gameWrapper, () => {
                this.gameRunning = true;
                this.gameLoop = requestAnimationFrame(() => this.update());
            });
        } else {
            // Fallback si le décompte n'est pas disponible
            this.gameRunning = true;
            this.gameLoop = requestAnimationFrame(() => this.update());
        }
    }
    
    pause() {
        if (!this.gameRunning) return;
        this.gameRunning = false;
        cancelAnimationFrame(this.gameLoop);
        document.getElementById('pong-overlay').classList.remove('hidden');
        document.querySelector('#pong-overlay .overlay-content h3').textContent = '⏸ Pause';
    }
    
    reset() {
        this.gameRunning = false;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        this.resizeCanvas();
        this.paddle1.y = this.height / 2 - 50;
        this.paddle2.y = this.height / 2 - 50;
        this.ball = { x: this.width / 2, y: this.height / 2, radius: 10, dx: 4, dy: 4 };
        this.score1 = 0;
        this.score2 = 0;
        this.speed = 1;
        document.getElementById('pong-score1').textContent = 0;
        document.getElementById('pong-score2').textContent = 0;
        document.getElementById('pong-speed').textContent = '1x';
        document.getElementById('pong-overlay').classList.remove('hidden');
        document.querySelector('#pong-overlay .overlay-content h3').textContent = '🏓 Pong';
        this.draw();
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Mouvement des paddles
        if (this.keys['w'] || this.keys['W']) {
            this.paddle1.y = Math.max(0, this.paddle1.y - this.paddle1.speed);
        }
        if (this.keys['s'] || this.keys['S']) {
            this.paddle1.y = Math.min(this.height - this.paddle1.height, this.paddle1.y + this.paddle1.speed);
        }
        if (this.keys['ArrowUp']) {
            this.paddle2.y = Math.max(0, this.paddle2.y - this.paddle2.speed);
        }
        if (this.keys['ArrowDown']) {
            this.paddle2.y = Math.min(this.height - this.paddle2.height, this.paddle2.y + this.paddle2.speed);
        }
        
        // Mouvement de la balle
        this.ball.x += this.ball.dx * this.speed;
        this.ball.y += this.ball.dy * this.speed;
        
        // Collision avec les murs
        if (this.ball.y - this.ball.radius <= 0 || this.ball.y + this.ball.radius >= this.height) {
            this.ball.dy = -this.ball.dy;
        }
        
        // Collision avec paddle 1 (améliorée pour éviter les bugs)
        if (this.ball.dx < 0 && 
            this.ball.x - this.ball.radius <= this.paddle1.x + this.paddle1.width &&
            this.ball.x - this.ball.radius >= this.paddle1.x &&
            this.ball.y + this.ball.radius >= this.paddle1.y &&
            this.ball.y - this.ball.radius <= this.paddle1.y + this.paddle1.height) {
            // Ajuster l'angle selon où la balle touche le paddle
            const hitPos = (this.ball.y - this.paddle1.y) / this.paddle1.height;
            const angle = (hitPos - 0.5) * Math.PI / 3; // Angle max de 60 degrés
            const speed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
            this.ball.dx = Math.abs(Math.cos(angle)) * speed;
            this.ball.dy = Math.sin(angle) * speed;
            this.ball.x = this.paddle1.x + this.paddle1.width + this.ball.radius;
        }
        
        // Collision avec paddle 2 (améliorée)
        if (this.ball.dx > 0 && 
            this.ball.x + this.ball.radius >= this.paddle2.x &&
            this.ball.x + this.ball.radius <= this.paddle2.x + this.paddle2.width &&
            this.ball.y + this.ball.radius >= this.paddle2.y &&
            this.ball.y - this.ball.radius <= this.paddle2.y + this.paddle2.height) {
            // Ajuster l'angle selon où la balle touche le paddle
            const hitPos = (this.ball.y - this.paddle2.y) / this.paddle2.height;
            const angle = (hitPos - 0.5) * Math.PI / 3;
            const speed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
            this.ball.dx = -Math.abs(Math.cos(angle)) * speed;
            this.ball.dy = Math.sin(angle) * speed;
            this.ball.x = this.paddle2.x - this.ball.radius;
        }
        
        // Score
        if (this.ball.x < 0) {
            this.score2++;
            document.getElementById('pong-score2').textContent = this.score2;
            if (this.gameRunning) {
                this.resetBall();
            }
        } else if (this.ball.x > this.width) {
            this.score1++;
            document.getElementById('pong-score1').textContent = this.score1;
            if (this.gameRunning) {
                this.resetBall();
            }
        }
        
        // Augmenter la vitesse progressivement
        if ((this.score1 + this.score2) % 2 === 0 && (this.score1 + this.score2) > 0) {
            this.speed = Math.min(2, 1 + (this.score1 + this.score2) * 0.1);
            document.getElementById('pong-speed').textContent = this.speed.toFixed(1) + 'x';
        }
        
        // Vérifier la victoire
        if (this.score1 >= 5 || this.score2 >= 5) {
            const winner = this.score1 >= 5 ? 1 : 2;
            this.gameOver(winner);
            return;
        }
        
        this.draw();
        this.gameLoop = requestAnimationFrame(() => this.update());
    }
    
    resetBall() {
        // Réinitialiser la balle immédiatement
        this.ball = { 
            x: this.width / 2, 
            y: this.height / 2, 
            radius: 10, 
            dx: 0, 
            dy: 0 
        };
        
        // Attendre un peu avant de lancer la balle
        setTimeout(() => {
            if (this.gameRunning) {
                this.ball.dx = (Math.random() > 0.5 ? 1 : -1) * 4;
                this.ball.dy = (Math.random() > 0.5 ? 1 : -1) * 4;
            }
        }, 1000);
    }
    
    gameOver(winner) {
        this.gameRunning = false;
        cancelAnimationFrame(this.gameLoop);
        
        if (window.statsManager) {
            window.statsManager.recordGame('pong', { score: winner === 1 ? this.score1 : this.score2, win: true });
        }
        
        document.getElementById('pong-overlay').classList.remove('hidden');
        document.querySelector('#pong-overlay .overlay-content h3').textContent = `🎉 Joueur ${winner} gagne!`;
        document.querySelector('#pong-overlay .overlay-content p').textContent = `Score final: ${this.score1} - ${this.score2}`;
    }
    
    draw() {
        // Fond
        this.ctx.fillStyle = '#0a0e1a';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Ligne centrale
        this.ctx.strokeStyle = '#334155';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.width / 2, 0);
        this.ctx.lineTo(this.width / 2, this.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Paddles
        this.ctx.fillStyle = '#6366f1';
        this.ctx.fillRect(this.paddle1.x, this.paddle1.y, this.paddle1.width, this.paddle1.height);
        this.ctx.fillRect(this.paddle2.x, this.paddle2.y, this.paddle2.width, this.paddle2.height);
        
        // Balle
        this.ctx.fillStyle = '#10b981';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    onActivate() {
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
            const maxWidth = window.innerWidth - 100;
            const maxHeight = window.innerHeight - 200;
            const aspectRatio = 16 / 9;
            
            let width = Math.min(maxWidth, maxHeight * aspectRatio);
            let height = width / aspectRatio;
            
            if (height > maxHeight) {
                height = maxHeight;
                width = height * aspectRatio;
            }
            
            this.canvas.width = Math.floor(width);
            this.canvas.height = Math.floor(height);
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            
            // Réinitialiser les positions
            this.paddle1.x = 10;
            this.paddle1.y = this.height / 2 - 50;
            this.paddle2.x = this.width - 20;
            this.paddle2.y = this.height / 2 - 50;
            this.ball.x = this.width / 2;
            this.ball.y = this.height / 2;
        } else {
            // Mode normal : taille par défaut (correspond au HTML)
            this.canvas.width = 600;
            this.canvas.height = 400;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            
            this.paddle1.x = 10;
            this.paddle1.y = this.height / 2 - 50;
            this.paddle2.x = this.width - 20;
            this.paddle2.y = this.height / 2 - 50;
            this.ball.x = this.width / 2;
            this.ball.y = this.height / 2;
        }
    }
}

