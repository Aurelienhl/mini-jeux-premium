// ============================================
// GESTIONNAIRE DE STATISTIQUES
// ============================================

class StatsManager {
    constructor() {
        this.stats = this.loadStats();
        this.sessionStart = Date.now();
    }

    loadStats() {
        const saved = localStorage.getItem('gameStats');
        return saved ? JSON.parse(saved) : {
            games: {},
            daily: {},
            weekly: {},
            monthly: {}
        };
    }

    saveStats() {
        localStorage.setItem('gameStats', JSON.stringify(this.stats));
    }

    recordGame(gameId, result) {
        const today = new Date().toISOString().split('T')[0];
        
        if (!this.stats.games[gameId]) {
            this.stats.games[gameId] = {
                total: 0,
                wins: 0,
                bestScore: 0,
                averageScore: 0,
                totalScore: 0
            };
        }

        if (!this.stats.daily[today]) {
            this.stats.daily[today] = {};
        }

        if (!this.stats.daily[today][gameId]) {
            this.stats.daily[today][gameId] = {
                games: 0,
                wins: 0,
                bestScore: 0
            };
        }

        const gameStats = this.stats.games[gameId];
        const dailyStats = this.stats.daily[today][gameId];

        gameStats.total++;
        dailyStats.games++;

        if (result.score !== undefined) {
            gameStats.totalScore += result.score;
            gameStats.averageScore = Math.round(gameStats.totalScore / gameStats.total);
            
            if (result.score > gameStats.bestScore) {
                gameStats.bestScore = result.score;
            }
            
            if (result.score > dailyStats.bestScore) {
                dailyStats.bestScore = result.score;
            }
        }

        if (result.win) {
            gameStats.wins++;
            dailyStats.wins++;
        }

        this.saveStats();
        return gameStats;
    }

    getGameStats(gameId) {
        return this.stats.games[gameId] || {
            total: 0,
            wins: 0,
            bestScore: 0,
            averageScore: 0
        };
    }

    getDailyStats(date = null) {
        if (!date) {
            date = new Date().toISOString().split('T')[0];
        }
        return this.stats.daily[date] || {};
    }

    getSessionTime() {
        return Math.floor((Date.now() - this.sessionStart) / 1000);
    }

    updateSessionTime() {
        const seconds = this.getSessionTime();
        if (window.playerManager) {
            window.playerManager.addPlayTime(seconds);
        }
        this.sessionStart = Date.now();
    }
}

