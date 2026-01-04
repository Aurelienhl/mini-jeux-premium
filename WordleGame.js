// ============================================
// JEU WORDLE
// ============================================

class WordleGame {
    constructor() {
        this.words = ['MAISON', 'JARDIN', 'VOITURE', 'BALCON', 'FENETRE', 'PORTE', 'CHAISE', 'TABLE', 'LUMIERE', 'COULEUR'];
        this.currentWord = '';
        this.guesses = [];
        this.currentGuess = '';
        this.currentRow = 0;
        this.gameOver = false;
        this.gamesPlayed = parseInt(localStorage.getItem('wordleGames')) || 0;
        this.wins = parseInt(localStorage.getItem('wordleWins')) || 0;
        this.streak = parseInt(localStorage.getItem('wordleStreak')) || 0;
        
        this.init();
    }
    
    init() {
        document.getElementById('wordle-games').textContent = this.gamesPlayed;
        document.getElementById('wordle-wins').textContent = this.wins;
        document.getElementById('wordle-streak').textContent = this.streak;
        
        document.getElementById('wordle-start').addEventListener('click', () => this.start());
        document.getElementById('wordle-reset').addEventListener('click', () => this.start());
        
        this.setupKeyboard();
        this.renderGrid();
    }
    
    start() {
        const overlay = document.getElementById('wordle-overlay');
        if (overlay) overlay.classList.add('hidden');

        const container = document.getElementById('wordle');
        if (container && window.gameCountdown) {
            window.gameCountdown(container, () => {
                this.startGame();
            });
        } else {
            this.startGame();
        }
    }
    
    startGame() {
        this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];
        this.guesses = [];
        this.currentGuess = '';
        this.currentRow = 0;
        this.gameOver = false;
        this.renderGrid();
    }
    
    setupKeyboard() {
        const keyboard = document.getElementById('wordle-keyboard');
        const rows = [
            ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
            ['W', 'X', 'C', 'V', 'B', 'N']
        ];
        
        keyboard.innerHTML = '';
        
        rows.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'keyboard-row';
            row.forEach(letter => {
                const key = document.createElement('button');
                key.className = 'keyboard-key';
                key.textContent = letter;
                key.addEventListener('click', () => this.handleKeyPress(letter));
                rowDiv.appendChild(key);
            });
            keyboard.appendChild(rowDiv);
        });
        
        const enterKey = document.createElement('button');
        enterKey.className = 'keyboard-key enter';
        enterKey.textContent = 'ENTRER';
        enterKey.addEventListener('click', () => this.submitGuess());
        
        const deleteKey = document.createElement('button');
        deleteKey.className = 'keyboard-key delete';
        deleteKey.textContent = '⌫';
        deleteKey.addEventListener('click', () => this.deleteLetter());
        
        const lastRow = keyboard.querySelector('.keyboard-row:last-child');
        lastRow.insertBefore(enterKey, lastRow.firstChild);
        lastRow.appendChild(deleteKey);
        
        document.addEventListener('keydown', (e) => {
            if (this.gameOver || document.getElementById('wordle-overlay').classList.contains('hidden') === false) return;
            
            if (e.key === 'Enter') {
                this.submitGuess();
            } else if (e.key === 'Backspace') {
                this.deleteLetter();
            } else if (/^[A-Za-z]$/.test(e.key)) {
                this.handleKeyPress(e.key.toUpperCase());
            }
        });
    }
    
    handleKeyPress(letter) {
        if (this.currentGuess.length < 6 && !this.gameOver) {
            this.currentGuess += letter;
            this.renderGrid();
        }
    }
    
    deleteLetter() {
        if (this.currentGuess.length > 0 && !this.gameOver) {
            this.currentGuess = this.currentGuess.slice(0, -1);
            this.renderGrid();
        }
    }
    
    submitGuess() {
        if (this.currentGuess.length !== 6 || this.gameOver) return;
        
        const guess = this.currentGuess.toUpperCase();
        this.guesses.push(guess);
        this.currentRow++;
        this.currentGuess = '';
        
        if (guess === this.currentWord) {
            this.gameOver = true;
            this.wins++;
            this.streak++;
            this.gamesPlayed++;
            localStorage.setItem('wordleWins', this.wins);
            localStorage.setItem('wordleStreak', this.streak);
            localStorage.setItem('wordleGames', this.gamesPlayed);
            this.updateStats();
            
            if (window.statsManager) {
                window.statsManager.recordGame('wordle', { score: this.currentRow, win: true });
            }
            
            setTimeout(() => {
                alert(`🎉 Félicitations! Vous avez trouvé en ${this.currentRow} tentatives!`);
            }, 500);
        } else if (this.currentRow >= 6) {
            this.gameOver = true;
            this.streak = 0;
            this.gamesPlayed++;
            localStorage.setItem('wordleStreak', 0);
            localStorage.setItem('wordleGames', this.gamesPlayed);
            this.updateStats();
            
            setTimeout(() => {
                alert(`Le mot était: ${this.currentWord}`);
            }, 500);
        }
        
        this.renderGrid();
    }
    
    updateStats() {
        document.getElementById('wordle-games').textContent = this.gamesPlayed;
        document.getElementById('wordle-wins').textContent = this.wins;
        document.getElementById('wordle-streak').textContent = this.streak;
    }
    
    renderGrid() {
        const grid = document.getElementById('wordle-grid');
        grid.innerHTML = '';
        
        for (let row = 0; row < 6; row++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'wordle-row';
            
            for (let col = 0; col < 6; col++) {
                const cell = document.createElement('div');
                cell.className = 'wordle-cell';
                
                if (row < this.guesses.length) {
                    const guess = this.guesses[row];
                    const letter = guess[col];
                    cell.textContent = letter;
                    
                    if (letter === this.currentWord[col]) {
                        cell.classList.add('correct');
                    } else if (this.currentWord.includes(letter)) {
                        cell.classList.add('present');
                    } else {
                        cell.classList.add('absent');
                    }
                } else if (row === this.guesses.length && this.currentGuess) {
                    cell.textContent = this.currentGuess[col] || '';
                }
                
                rowDiv.appendChild(cell);
            }
            
            grid.appendChild(rowDiv);
        }
    }
    
    onActivate() {
        this.renderGrid();
    }
}

