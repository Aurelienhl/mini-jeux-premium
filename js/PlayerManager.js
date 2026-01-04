// ============================================
// GESTIONNAIRE DE JOUEURS
// Préparé pour le multijoueur
// ============================================

class PlayerManager {
    constructor() {
        this.currentPlayer = this.loadPlayer();
        this.players = this.loadAllPlayers();
        this.init();
    }

    init() {
        this.updateUI();
        this.setupEventListeners();
    }

    loadPlayer() {
        const saved = localStorage.getItem('currentPlayer');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            id: this.generateId(),
            name: 'Joueur',
            avatar: '👤',
            createdAt: Date.now(),
            stats: {
                totalGames: 0,
                totalScore: 0,
                playTime: 0,
                games: {}
            }
        };
    }

    loadAllPlayers() {
        const saved = localStorage.getItem('allPlayers');
        return saved ? JSON.parse(saved) : [];
    }

    generateId() {
        return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    updatePlayerName(name) {
        if (name.trim().length > 0) {
            this.currentPlayer.name = name.trim().substring(0, 20);
            this.savePlayer();
            this.updateUI();
        }
    }

    updatePlayerStats(gameId, stats) {
        if (!this.currentPlayer.stats.games[gameId]) {
            this.currentPlayer.stats.games[gameId] = {
                gamesPlayed: 0,
                wins: 0,
                bestScore: 0,
                totalScore: 0
            };
        }

        const gameStats = this.currentPlayer.stats.games[gameId];
        gameStats.gamesPlayed++;
        
        if (stats.score !== undefined) {
            gameStats.totalScore += stats.score;
            if (stats.score > gameStats.bestScore) {
                gameStats.bestScore = stats.score;
            }
        }

        if (stats.win) {
            gameStats.wins++;
        }

        this.currentPlayer.stats.totalGames++;
        if (stats.score) {
            this.currentPlayer.stats.totalScore += stats.score;
        }

        this.savePlayer();
        this.updateLeaderboard();
    }

    addPlayTime(seconds) {
        this.currentPlayer.stats.playTime += seconds;
        this.savePlayer();
        this.updateUI();
    }

    savePlayer() {
        localStorage.setItem('currentPlayer', JSON.stringify(this.currentPlayer));
        
        // Ajouter à la liste des joueurs si nouveau
        const exists = this.players.find(p => p.id === this.currentPlayer.id);
        if (!exists) {
            this.players.push(this.currentPlayer);
        } else {
            const index = this.players.findIndex(p => p.id === this.currentPlayer.id);
            this.players[index] = this.currentPlayer;
        }
        
        localStorage.setItem('allPlayers', JSON.stringify(this.players));
    }

    updateUI() {
        const nameInput = document.getElementById('player-name');
        const avatar = document.getElementById('player-avatar');
        const totalGames = document.getElementById('total-games');
        const totalScore = document.getElementById('total-score');
        const playTime = document.getElementById('play-time');

        if (nameInput) nameInput.value = this.currentPlayer.name;
        if (avatar) avatar.textContent = this.currentPlayer.avatar;
        if (totalGames) totalGames.textContent = this.currentPlayer.stats.totalGames;
        if (totalScore) totalScore.textContent = this.currentPlayer.stats.totalScore.toLocaleString();
        if (playTime) {
            const hours = Math.floor(this.currentPlayer.stats.playTime / 3600);
            const minutes = Math.floor((this.currentPlayer.stats.playTime % 3600) / 60);
            playTime.textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        }
    }

    setupEventListeners() {
        const nameInput = document.getElementById('player-name');
        if (nameInput) {
            nameInput.addEventListener('blur', (e) => {
                this.updatePlayerName(e.target.value);
            });
            nameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.target.blur();
                }
            });
        }
    }

    updateLeaderboard() {
        // Trier les joueurs par score total
        const sorted = [...this.players].sort((a, b) => {
            return b.stats.totalScore - a.stats.totalScore;
        });

        const leaderboardList = document.getElementById('leaderboard-list');
        if (!leaderboardList) return;

        leaderboardList.innerHTML = '';

        sorted.slice(0, 10).forEach((player, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            if (player.id === this.currentPlayer.id) {
                item.classList.add('current-player');
            }
            
            item.innerHTML = `
                <span class="leaderboard-rank">${index + 1}</span>
                <span class="leaderboard-avatar">${player.avatar}</span>
                <span class="leaderboard-name">${player.name}</span>
                <span class="leaderboard-score">${player.stats.totalScore.toLocaleString()}</span>
            `;
            
            leaderboardList.appendChild(item);
        });
    }

    getPlayer() {
        return this.currentPlayer;
    }

    // Méthodes pour le multijoueur (à implémenter plus tard)
    createRoom(roomName) {
        return {
            id: 'room_' + Date.now(),
            name: roomName,
            players: [this.currentPlayer],
            gameType: null,
            status: 'waiting'
        };
    }

    joinRoom(roomId) {
        // À implémenter avec WebSocket ou API
        console.log('Joining room:', roomId);
    }
}

