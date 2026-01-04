// ============================================
// JEU 2048 AMÉLIORÉ
// ============================================

class Puzzle2048Game {
    constructor() {
        this.grid = Array(4).fill(null).map(() => Array(4).fill(0));
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('puzzle2048Best')) || 0;
        this.maxTile = 2;
        this.gameStarted = false;
        
        this.init();
    }
    
    init() {
        document.getElementById('puzzle2048-best').textContent = this.bestScore;
        document.getElementById('puzzle2048-start').addEventListener('click', () => this.start());
        document.getElementById('puzzle2048-reset').addEventListener('click', () => this.reset());
        
        document.addEventListener('keydown', (e) => {
            if (!this.gameStarted) return;
            
            if (e.key === 'ArrowUp') this.move('up');
            else if (e.key === 'ArrowDown') this.move('down');
            else if (e.key === 'ArrowLeft') this.move('left');
            else if (e.key === 'ArrowRight') this.move('right');
        });
        
        this.render();
    }
    
    start() {
        const overlay = document.getElementById('puzzle2048-overlay');
        if (overlay) overlay.classList.add('hidden');

        const container = document.getElementById('puzzle2048');
        if (container && window.gameCountdown) {
            window.gameCountdown(container, () => {
                this.gameStarted = true;
                this.addRandomTile();
                this.addRandomTile();
                this.render();
            });
        } else {
            // Fallback si le décompte n'est pas disponible
            this.gameStarted = true;
            this.addRandomTile();
            this.addRandomTile();
            this.render();
        }
    }
    
    reset() {
        this.grid = Array(4).fill(null).map(() => Array(4).fill(0));
        this.score = 0;
        this.maxTile = 2;
        this.gameStarted = false;
        document.getElementById('puzzle2048-score').textContent = 0;
        document.getElementById('puzzle2048-max').textContent = 2;
        document.getElementById('puzzle2048-overlay').classList.remove('hidden');
        this.render();
    }
    
    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    move(direction) {
        const prevGrid = this.grid.map(row => [...row]);
        
        if (direction === 'left') {
            for (let i = 0; i < 4; i++) {
                this.grid[i] = this.mergeRow(this.grid[i]);
            }
        } else if (direction === 'right') {
            for (let i = 0; i < 4; i++) {
                this.grid[i] = this.mergeRow(this.grid[i].reverse()).reverse();
            }
        } else if (direction === 'up') {
            for (let j = 0; j < 4; j++) {
                const column = [this.grid[0][j], this.grid[1][j], this.grid[2][j], this.grid[3][j]];
                const merged = this.mergeRow(column);
                for (let i = 0; i < 4; i++) {
                    this.grid[i][j] = merged[i];
                }
            }
        } else if (direction === 'down') {
            for (let j = 0; j < 4; j++) {
                const column = [this.grid[3][j], this.grid[2][j], this.grid[1][j], this.grid[0][j]];
                const merged = this.mergeRow(column);
                for (let i = 0; i < 4; i++) {
                    this.grid[3 - i][j] = merged[i];
                }
            }
        }
        
        const changed = JSON.stringify(prevGrid) !== JSON.stringify(this.grid);
        
        if (changed) {
            this.addRandomTile();
            this.updateMaxTile();
            this.render();
            
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                localStorage.setItem('puzzle2048Best', this.bestScore);
                document.getElementById('puzzle2048-best').textContent = this.bestScore;
            }
            
            if (this.maxTile >= 2048) {
                setTimeout(() => {
                    alert('🎉 Félicitations! Vous avez atteint 2048!');
                    if (window.statsManager) {
                        window.statsManager.recordGame('puzzle2048', { score: this.score, win: true });
                    }
                }, 100);
            } else {
                // Vérifier si le jeu est terminé (grille pleine et aucun mouvement possible)
                this.checkGameOver();
            }
        }
    }
    
    checkGameOver() {
        // Vérifier s'il y a des cases vides
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) {
                    return; // Il y a encore des cases vides
                }
            }
        }
        
        // Vérifier s'il y a des mouvements possibles
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const current = this.grid[i][j];
                // Vérifier les cases adjacentes
                if ((i < 3 && this.grid[i + 1][j] === current) ||
                    (j < 3 && this.grid[i][j + 1] === current)) {
                    return; // Il y a encore des mouvements possibles
                }
            }
        }
        
        // Game Over
        setTimeout(() => {
            alert(`💀 Game Over! Score final: ${this.score}`);
            if (window.statsManager) {
                window.statsManager.recordGame('puzzle2048', { score: this.score, win: false });
            }
        }, 100);
    }
    
    updateMaxTile() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] > this.maxTile) {
                    this.maxTile = this.grid[i][j];
                    document.getElementById('puzzle2048-max').textContent = this.maxTile;
                }
            }
        }
    }
    
    mergeRow(row) {
        let filtered = row.filter(val => val !== 0);
        for (let i = 0; i < filtered.length - 1; i++) {
            if (filtered[i] === filtered[i + 1]) {
                filtered[i] *= 2;
                this.score += filtered[i];
                document.getElementById('puzzle2048-score').textContent = this.score;
                filtered[i + 1] = 0;
            }
        }
        filtered = filtered.filter(val => val !== 0);
        while (filtered.length < 4) {
            filtered.push(0);
        }
        return filtered;
    }
    
    render() {
        const gridElement = document.getElementById('puzzle2048-grid');
        gridElement.innerHTML = '';
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const cell = document.createElement('div');
                cell.className = 'puzzle2048-cell';
                const value = this.grid[i][j];
                
                if (value !== 0) {
                    cell.classList.add('has-tile');
                    cell.setAttribute('data-value', value);
                    cell.textContent = value;
                }
                
                gridElement.appendChild(cell);
            }
        }
    }
    
    onActivate() {
        this.render();
    }
}

