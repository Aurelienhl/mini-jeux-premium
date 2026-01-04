// ============================================
// GESTIONNAIRE PRINCIPAL DES JEUX
// ============================================

class GameManager {
    constructor() {
        this.games = new Map();
        this.currentGame = null;
        this.init();
    }

    init() {
        this.setupGameCards();
        this.setupSidebar();
    }

    registerGame(gameId, gameInstance) {
        this.games.set(gameId, gameInstance);
    }

    getGame(gameId) {
        return this.games.get(gameId);
    }

    setupGameCards() {
        const gameCards = document.querySelectorAll('.game-card');

        gameCards.forEach(card => {
            card.addEventListener('click', () => {
                const gameId = card.getAttribute('data-game');
                this.launchGame(gameId);
            });
        });
    }

    launchGame(gameId) {
        const targetGame = document.getElementById(gameId);
        if (targetGame) {
            // Masquer la page d'accueil
            const homePage = document.querySelector('.home-page');
            if (homePage) {
                homePage.style.display = 'none';
            }

            // Afficher le conteneur principal des jeux
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.style.display = 'block';
            }

            // Afficher le jeu
            targetGame.classList.add('active');
            this.currentGame = gameId;

            // Activer immédiatement le mode plein écran
            this.enterFullscreenMode(targetGame);

            // Notifier le jeu qu'il est activé
            const gameInstance = this.games.get(gameId);
            if (gameInstance && typeof gameInstance.onActivate === 'function') {
                gameInstance.onActivate();
            }
        }
    }

    switchGame(gameId, navButtons, gameContainers) {
        // Sortir du mode plein écran si on change de jeu
        const currentActive = document.querySelector('.game-container.active');
        if (currentActive && currentActive.classList.contains('fullscreen-mode')) {
            this.exitFullscreenMode();
        }

        // Mettre à jour les boutons actifs
        navButtons.forEach(b => b.classList.remove('active'));
        const targetBtn = document.querySelector(`[data-game="${gameId}"]`);
        if (targetBtn) targetBtn.classList.add('active');

        // Afficher le jeu sélectionné
        gameContainers.forEach(container => {
            container.classList.remove('active');
        });

        const targetGame = document.getElementById(gameId);
        if (targetGame) {
            targetGame.classList.add('active');
            this.currentGame = gameId;

            // Notifier le jeu qu'il est activé (sans passer en plein écran automatiquement)
            const gameInstance = this.games.get(gameId);
            if (gameInstance && typeof gameInstance.onActivate === 'function') {
                gameInstance.onActivate();
            }
        }
    }
    
    enterFullscreenMode(gameContainer) {
        console.log('Entering fullscreen mode for:', gameContainer.id);

        // Créer ou récupérer le bouton de sortie
        let exitBtn = document.getElementById('fullscreen-exit');
        if (!exitBtn) {
            console.log('Creating exit button');
            exitBtn = document.createElement('button');
            exitBtn.id = 'fullscreen-exit';
            exitBtn.className = 'fullscreen-exit-btn';
            exitBtn.innerHTML = '✕';
            exitBtn.title = 'Quitter le mode plein écran';
            exitBtn.addEventListener('click', (e) => {
                console.log('Exit button clicked');
                e.preventDefault();
                e.stopPropagation();
                this.exitFullscreenMode();
            });
            document.body.appendChild(exitBtn);
        }

        // Ajouter la classe fullscreen au conteneur
        gameContainer.classList.add('fullscreen-mode');
        document.body.classList.add('game-fullscreen-active');
        exitBtn.classList.add('active');
        console.log('Exit button should now be visible');

        // Empêcher le scroll du body
        document.body.style.overflow = 'hidden';
    }
    
    exitFullscreenMode() {
        console.log('Exiting fullscreen mode');

        const activeGame = document.querySelector('.game-container.active');
        if (activeGame) {
            console.log('Removing fullscreen classes from:', activeGame.id);
            activeGame.classList.remove('fullscreen-mode');
            activeGame.classList.remove('active');
        }
        document.body.classList.remove('game-fullscreen-active');

        const exitBtn = document.getElementById('fullscreen-exit');
        if (exitBtn) {
            console.log('Hiding exit button');
            exitBtn.classList.remove('active');
        }

        // Masquer le conteneur des jeux
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.display = 'none';
        }

        // Réafficher la page d'accueil
        const homePage = document.querySelector('.home-page');
        if (homePage) {
            console.log('Showing home page');
            homePage.style.display = 'flex';
        }

        // Restaurer le scroll
        document.body.style.overflow = '';
        this.currentGame = null;
    }

    // Méthode publique pour que les jeux puissent activer le plein écran
    requestFullscreen(gameId) {
        const gameContainer = document.getElementById(gameId);
        if (gameContainer && gameContainer.classList.contains('active')) {
            this.enterFullscreenMode(gameContainer);
        }
    }

    setupSidebar() {
        const sidebarOpen = document.getElementById('sidebar-open');
        const sidebarClose = document.getElementById('sidebar-close');
        const sidebar = document.getElementById('sidebar');

        if (sidebarOpen) {
            sidebarOpen.addEventListener('click', () => {
                sidebar.classList.add('active');
            });
        }

        if (sidebarClose) {
            sidebarClose.addEventListener('click', () => {
                sidebar.classList.remove('active');
            });
        }

        // Fermer en cliquant à l'extérieur
        document.addEventListener('click', (e) => {
            if (sidebar && sidebar.classList.contains('active')) {
                if (!sidebar.contains(e.target) && !sidebarOpen.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });

        // Tabs du leaderboard
        const leaderboardTabs = document.querySelectorAll('.leaderboard-tab');
        leaderboardTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                leaderboardTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const tabType = tab.getAttribute('data-tab');
                // Mettre à jour le leaderboard selon le type
                if (window.playerManager) {
                    window.playerManager.updateLeaderboard();
                }
            });
        });
    }

    // Méthode pour préparer le multijoueur
    createMultiplayerSession(gameId, players) {
        return {
            gameId,
            players,
            sessionId: 'session_' + Date.now(),
            status: 'waiting',
            createdAt: Date.now()
        };
    }
}

