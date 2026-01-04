// ============================================
// JEU TIC TAC TOE AMÉLIORÉ AVEC IA
// ============================================

class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.xWins = parseInt(localStorage.getItem('xWins')) || 0;
        this.oWins = parseInt(localStorage.getItem('oWins')) || 0;
        this.draws = parseInt(localStorage.getItem('draws')) || 0;
        this.aiMode = false;
        this.aiPlayer = 'O';
        
        this.init();
    }
    
    init() {
        // Vérifier que tous les éléments nécessaires existent
        const xWinsEl = document.getElementById('x-wins');
        const oWinsEl = document.getElementById('o-wins');
        const drawsEl = document.getElementById('draws');

        if (xWinsEl) xWinsEl.textContent = this.xWins;
        if (oWinsEl) oWinsEl.textContent = this.oWins;
        if (drawsEl) drawsEl.textContent = this.draws;

        // Les event listeners seront attachés dans onActivate()
        this.renderBoard();
    }

    setupEventListeners() {
        const resetBtn = document.getElementById('tictactoe-reset');
        const aiBtn = document.getElementById('tictactoe-ai');

        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.reset();
            });
        }

        if (aiBtn) {
            aiBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleAI();
            });
        }
    }
    
    toggleAI() {
        this.aiMode = !this.aiMode;
        const btn = document.getElementById('tictactoe-ai');
        btn.textContent = this.aiMode ? '👤 Mode 2 Joueurs' : '🤖 Mode IA';
        btn.classList.toggle('active');
        this.reset();
    }
    
    renderBoard() {
        const boardElement = document.getElementById('tictactoe-board');
        boardElement.innerHTML = '';
        
        this.board.forEach((cell, index) => {
            const cellElement = document.createElement('button');
            cellElement.className = `tictactoe-cell ${cell.toLowerCase()}`;
            cellElement.textContent = cell;
            cellElement.disabled = cell !== '' || this.gameOver;
            cellElement.addEventListener('click', () => this.makeMove(index));
            boardElement.appendChild(cellElement);
        });
    }
    
    makeMove(index) {
        if (this.board[index] !== '' || this.gameOver) return;

        // S'assurer que currentPlayer est défini
        if (!this.currentPlayer) {
            console.error('currentPlayer is undefined!');
            this.currentPlayer = 'X';
        }

        // Enregistrer qui vient de jouer
        const playerWhoPlayed = this.currentPlayer;

        this.board[index] = this.currentPlayer;
        this.renderBoard();
        
        const winner = this.checkWinner();
        if (winner) {
            this.gameOver = true;
            if (winner === 'X') {
                this.xWins++;
                localStorage.setItem('xWins', this.xWins);
                document.getElementById('x-wins').textContent = this.xWins;
                document.getElementById('tictactoe-status').textContent = 'Joueur X gagne! 🎉';
                document.getElementById('tictactoe-status').className = 'game-status success';
            } else {
                this.oWins++;
                localStorage.setItem('oWins', this.oWins);
                document.getElementById('o-wins').textContent = this.oWins;
                document.getElementById('tictactoe-status').textContent = this.aiMode ? 'IA gagne! 🤖' : 'Joueur O gagne! 🎉';
                document.getElementById('tictactoe-status').className = 'game-status error';
            }
            
            if (window.statsManager) {
                window.statsManager.recordGame('tictactoe', { win: winner === 'X' });
            }
        } else if (this.board.every(cell => cell !== '')) {
            this.gameOver = true;
            this.draws++;
            localStorage.setItem('draws', this.draws);
            document.getElementById('draws').textContent = this.draws;
            document.getElementById('tictactoe-status').textContent = 'Match nul! 🤝';
            document.getElementById('tictactoe-status').className = 'game-status';
        } else {
            // Changer de joueur (avec sécurité)
            const nextPlayer = (this.currentPlayer === 'X') ? 'O' : 'X';
            this.currentPlayer = nextPlayer;
            document.getElementById('current-player').textContent = this.currentPlayer;
            document.getElementById('tictactoe-status').textContent =
                `Joueur ${playerWhoPlayed} a joué - Tour du joueur ${this.currentPlayer}`;
            document.getElementById('tictactoe-status').className = 'game-status';

            // Tour de l'IA
            if (this.aiMode && this.currentPlayer === this.aiPlayer && !this.gameOver) {
                // Petit délai pour que le changement de joueur soit visible
                setTimeout(() => this.aiMove(), 800);
            }
        }
    }
    
    aiMove() {
        // IA simple : essayer de gagner, sinon bloquer, sinon case stratégique, sinon aléatoire
        let move = this.findWinningMove(this.aiPlayer);

        if (move === -1) {
            move = this.findWinningMove(this.currentPlayer === 'X' ? 'O' : 'X'); // Bloquer
        }

        if (move === -1) {
            move = this.findBestMove();
        }

        if (move === -1) {
            move = this.findRandomMove();
        }

        if (move !== -1 && this.board[move] === '') {
            this.makeMove(move);
        }
    }
    
    findWinningMove(player) {
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = player;
                if (this.checkWinner() === player) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        return -1;
    }
    
    findBestMove() {
        // Priorité : centre, coins, puis autres
        const priorities = [4, 0, 2, 6, 8, 1, 3, 5, 7];
        for (const pos of priorities) {
            if (this.board[pos] === '') {
                return pos;
            }
        }
        return -1;
    }

    // Méthode pour trouver une case vide aléatoire comme fallback
    findRandomMove() {
        const emptyCells = [];
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                emptyCells.push(i);
            }
        }
        if (emptyCells.length > 0) {
            return emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
        return -1;
    }
    
    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.board[a] !== '' && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                return this.board[a];
            }
        }
        return null;
    }
    
    reset() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameOver = false;
        document.getElementById('current-player').textContent = 'X';
        document.getElementById('tictactoe-status').textContent = 'Nouvelle partie - Tour du joueur X';
        document.getElementById('tictactoe-status').className = 'game-status';

        const container = document.getElementById('tictactoe');
        if (container && window.gameCountdown) {
            window.gameCountdown(container, () => {
                this.renderBoard();
                // Si c'est le tour de l'IA au début, elle joue immédiatement
                if (this.aiMode && this.currentPlayer === this.aiPlayer && !this.gameOver) {
                    setTimeout(() => this.aiMove(), 1000); // Petit délai pour l'effet visuel
                }
            });
        } else {
            this.renderBoard();
            // Si c'est le tour de l'IA au début, elle joue immédiatement
            if (this.aiMode && this.currentPlayer === this.aiPlayer && !this.gameOver) {
                setTimeout(() => this.aiMove(), 1000);
            }
        }
    }
    
    onActivate() {
        // Attacher les event listeners quand le jeu devient actif
        this.setupEventListeners();
        this.renderBoard();
    }
}

