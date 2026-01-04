// ============================================
// JEU TEST DE RÉACTION AMÉLIORÉ
// ============================================

class ReactionGame {
    constructor() {
        this.bestTime = parseInt(localStorage.getItem('reactionBest')) || null;
        this.times = JSON.parse(localStorage.getItem('reactionTimes')) || [];
        this.waiting = false;
        this.startTime = null;
        this.timeout = null;
        
        this.init();
    }
    
    init() {
        this.updateDisplay();
        document.getElementById('reaction-start').addEventListener('click', () => this.start());
        document.getElementById('reaction-box').addEventListener('click', () => this.click());
    }
    
    updateDisplay() {
        if (this.bestTime) {
            document.getElementById('reaction-best').textContent = this.bestTime;
        }
        
        if (this.times.length > 0) {
            const avg = Math.round(this.times.reduce((a, b) => a + b, 0) / this.times.length);
            document.getElementById('reaction-avg').textContent = avg;
        }
        
        document.getElementById('reaction-tries').textContent = this.times.length;
    }
    
    start() {
        const container = document.getElementById('reaction');
        if (container && window.gameCountdown) {
            window.gameCountdown(container, () => {
                this.startGame();
            });
        } else {
            this.startGame();
        }
    }
    
    startGame() {
        this.waiting = true;
        const box = document.getElementById('reaction-box');
        const text = document.getElementById('reaction-text');
        const status = document.getElementById('reaction-status');
        
        box.className = 'reaction-box waiting';
        text.textContent = '⏳ Attendez...';
        status.textContent = 'Ne cliquez pas encore!';
        status.className = 'game-status';
        
        const delay = Math.random() * 3000 + 2000;
        
        this.timeout = setTimeout(() => {
            if (this.waiting) {
                box.className = 'reaction-box ready';
                text.textContent = '✅ CLIQUEZ MAINTENANT!';
                status.textContent = 'Cliquez le plus vite possible!';
                status.className = 'game-status success';
                this.startTime = Date.now();
            }
        }, delay);
    }
    
    click() {
        if (!this.waiting) return;
        
        const box = document.getElementById('reaction-box');
        const text = document.getElementById('reaction-text');
        const status = document.getElementById('reaction-status');
        
        if (!this.startTime) {
            clearTimeout(this.timeout);
            box.className = 'reaction-box too-early';
            text.textContent = '❌ Trop tôt!';
            status.textContent = 'Vous avez cliqué trop tôt!';
            status.className = 'game-status error';
            this.waiting = false;
            
            setTimeout(() => {
                box.className = 'reaction-box';
                text.textContent = 'Cliquez quand la boîte devient verte !';
                status.textContent = 'Prêt ? Cliquez pour commencer';
                status.className = 'game-status';
            }, 2000);
            return;
        }
        
        const reactionTime = Date.now() - this.startTime;
        this.times.push(reactionTime);
        
        if (this.times.length > 10) {
            this.times.shift();
        }
        
        localStorage.setItem('reactionTimes', JSON.stringify(this.times));
        
        if (!this.bestTime || reactionTime < this.bestTime) {
            this.bestTime = reactionTime;
            localStorage.setItem('reactionBest', this.bestTime);
        }
        
        box.className = 'reaction-box';
        text.textContent = `⚡ ${reactionTime}ms`;
        status.textContent = `Excellent! Votre temps: ${reactionTime}ms`;
        status.className = 'game-status success';
        
        this.waiting = false;
        this.startTime = null;
        
        this.updateDisplay();
        
        if (window.statsManager) {
            window.statsManager.recordGame('reaction', { score: reactionTime });
        }
        
        setTimeout(() => {
            text.textContent = 'Cliquez quand la boîte devient verte !';
            status.textContent = 'Prêt ? Cliquez pour commencer';
            status.className = 'game-status';
        }, 3000);
    }
    
    onActivate() {
        // Rien de spécial
    }
}

