// ============================================
// JEU CALCUL MENTAL AMÉLIORÉ
// ============================================

class CalculatorGame {
    constructor() {
        this.score = 0;
        this.correct = 0;
        this.total = 0;
        this.currentQuestion = null;
        this.gameRunning = false;
        this.difficulty = 'medium';
        this.timeLimit = null;
        
        this.init();
    }
    
    init() {
        document.getElementById('calc-start').addEventListener('click', () => this.start());
        document.getElementById('calc-submit').addEventListener('click', () => this.submitAnswer());
        document.getElementById('calc-answer').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitAnswer();
        });
        document.getElementById('calc-difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
        });
    }
    
    start() {
        const container = document.getElementById('calculator');
        if (container && window.gameCountdown) {
            window.gameCountdown(container, () => {
                this.startGame();
            });
        } else {
            this.startGame();
        }
    }
    
    startGame() {
        this.score = 0;
        this.correct = 0;
        this.total = 0;
        this.gameRunning = true;
        document.getElementById('calc-score').textContent = 0;
        document.getElementById('calc-correct').textContent = 0;
        document.getElementById('calc-accuracy').textContent = '0%';
        document.getElementById('calc-status').textContent = '';
        document.getElementById('calc-status').className = 'game-status';
        this.generateQuestion();
    }
    
    generateQuestion() {
        if (!this.gameRunning) return;

        let num1, num2, operation, answer;
        let availableOperations;

        switch(this.difficulty) {
            case 'easy':
                // Additions et soustractions simples
                availableOperations = ['+', '-'];
                num1 = Math.floor(Math.random() * 10) + 1;
                num2 = Math.floor(Math.random() * 10) + 1;
                break;
            case 'medium':
                // Additions, soustractions et multiplications
                availableOperations = ['+', '-', '*'];
                num1 = Math.floor(Math.random() * 20) + 1;
                num2 = Math.floor(Math.random() * 20) + 1;
                break;
            case 'hard':
                // Tout avec de plus gros nombres
                availableOperations = ['+', '-', '*'];
                num1 = Math.floor(Math.random() * 50) + 10; // Plus grands nombres
                num2 = Math.floor(Math.random() * 50) + 10;
                // Pour la multiplication, limiter un peu
                if (availableOperations.includes('*')) {
                    num1 = Math.floor(Math.random() * 25) + 5;
                    num2 = Math.floor(Math.random() * 15) + 2;
                }
                break;
        }

        operation = availableOperations[Math.floor(Math.random() * availableOperations.length)];
        
        switch (operation) {
            case '+':
                answer = num1 + num2;
                break;
            case '-':
                answer = num1 - num2;
                break;
            case '*':
                answer = num1 * num2;
                break;
        }
        
        this.currentQuestion = { num1, num2, operation, answer };
        document.getElementById('calc-question').textContent = `${num1} ${operation} ${num2} = ?`;
        document.getElementById('calc-answer').value = '';
        document.getElementById('calc-answer').focus();
    }
    
    submitAnswer() {
        if (!this.gameRunning || !this.currentQuestion) return;
        
        const answerInput = document.getElementById('calc-answer');
        const userAnswer = parseInt(answerInput.value);
        const status = document.getElementById('calc-status');
        
        // Vérifier si la réponse est valide
        if (isNaN(userAnswer) || answerInput.value.trim() === '') {
            status.textContent = '❌ Veuillez entrer un nombre valide';
            status.className = 'game-status error';
            return;
        }
        
        this.total++;
        
        if (userAnswer === this.currentQuestion.answer) {
            this.score += 10;
            this.correct++;
            status.textContent = '✅ Correct! +10 points';
            status.className = 'game-status success';
        } else {
            status.textContent = `❌ Incorrect! La réponse était ${this.currentQuestion.answer}`;
            status.className = 'game-status error';
        }
        
        const accuracy = Math.round((this.correct / this.total) * 100);
        
        document.getElementById('calc-score').textContent = this.score;
        document.getElementById('calc-correct').textContent = this.correct;
        document.getElementById('calc-accuracy').textContent = accuracy + '%';
        
        setTimeout(() => {
            this.generateQuestion();
            status.textContent = '';
            status.className = 'game-status';
        }, 1500);
    }
    
    onActivate() {
        // Rien de spécial
    }
}

