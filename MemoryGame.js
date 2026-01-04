// ============================================
// JEU MEMORY AMÉLIORÉ
// ============================================

class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.startTime = null;
        this.timer = null;
        this.timeElapsed = 0;
        this.difficulty = 'easy';
        this.icons = {
            easy: ['🎮', '🎯', '🎲', '🎨', '🎪', '🎭', '🎸', '🎺'],
            medium: ['🎮', '🎯', '🎲', '🎨', '🎪', '🎭', '🎸', '🎺', '🎤', '🎧', '🎬', '🎨'],
            hard: ['🎮', '🎯', '🎲', '🎨', '🎪', '🎭', '🎸', '🎺', '🎤', '🎧', '🎬', '🎨', '🎯', '🎲', '🎪', '🎭', '🎸', '🎺']
        };
        
        this.init();
    }
    
    init() {
        document.getElementById('memory-reset').addEventListener('click', () => this.reset());
        document.getElementById('memory-difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.reset();
        });
        this.reset();
    }
    
    reset() {
        this.matchedPairs = 0;
        this.moves = 0;
        this.timeElapsed = 0;
        this.flippedCards = [];
        this.startTime = null;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        const iconSet = this.icons[this.difficulty];
        const pairCount = this.difficulty === 'hard' ? 12 : this.difficulty === 'medium' ? 8 : 8;
        this.cards = [...iconSet.slice(0, pairCount), ...iconSet.slice(0, pairCount)]
            .sort(() => Math.random() - 0.5);

        this.updateDisplay();
        document.getElementById('memory-time').textContent = '0s';

        const container = document.getElementById('memory');
        if (container && window.gameCountdown) {
            window.gameCountdown(container, () => {
                this.renderBoard();
            });
        } else {
            this.renderBoard();
        }
    }
    
    renderBoard() {
        const grid = document.getElementById('memory-grid');
        grid.innerHTML = '';

        const cols = this.difficulty === 'hard' ? 6 : 4;
        grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        grid.setAttribute('data-cols', cols);
        
        this.cards.forEach((icon, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = index;
            card.addEventListener('click', () => this.flipCard(index));
            grid.appendChild(card);
        });
    }
    
    flipCard(index) {
        const card = document.querySelector(`.memory-card[data-index="${index}"]`);
        
        if (card.classList.contains('flipped') || 
            card.classList.contains('matched') || 
            this.flippedCards.length >= 2) {
            return;
        }
        
        if (!this.startTime) {
            this.startTime = Date.now();
            this.timer = setInterval(() => {
                this.timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
                document.getElementById('memory-time').textContent = this.timeElapsed + 's';
            }, 1000);
        }
        
        card.classList.add('flipped');
        card.textContent = this.cards[index];
        this.flippedCards.push({ index, card });
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateDisplay();
            setTimeout(() => this.checkMatch(), 1000);
        }
    }
    
    checkMatch() {
        const [first, second] = this.flippedCards;
        
        if (this.cards[first.index] === this.cards[second.index]) {
            first.card.classList.add('matched');
            second.card.classList.add('matched');
            this.matchedPairs++;
            this.updateDisplay();
            
            const totalPairs = this.difficulty === 'hard' ? 12 : 8;
            if (this.matchedPairs === totalPairs) {
                clearInterval(this.timer);
                const finalTime = this.timeElapsed;
                
                if (window.statsManager) {
                    window.statsManager.recordGame('memory', { 
                        score: this.moves, 
                        win: true,
                        time: finalTime 
                    });
                }
                if (window.playerManager) {
                    window.playerManager.updatePlayerStats('memory', { 
                        score: this.moves,
                        win: true 
                    });
                }
                
                setTimeout(() => {
                    alert(`🎉 Félicitations! Terminé en ${this.moves} coups et ${finalTime} secondes!`);
                }, 500);
            }
        } else {
            first.card.classList.remove('flipped');
            first.card.textContent = '';
            second.card.classList.remove('flipped');
            second.card.textContent = '';
        }
        
        this.flippedCards = [];
    }
    
    updateDisplay() {
        document.getElementById('memory-moves').textContent = this.moves;
        const totalPairs = this.difficulty === 'hard' ? 12 : 8;
        document.getElementById('memory-pairs').textContent = `${this.matchedPairs}/${totalPairs}`;
    }
    
    onActivate() {
        // Rien de spécial
    }
}

