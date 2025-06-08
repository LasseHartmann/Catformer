// Haupt-Spiellogik für das Katzen-Sprungspiel

class GameManager {
    constructor() {
        // Spiel-Zustand
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.isInitialized = false;
        
        // Spiel-Objekte
        this.player = null;
        this.obstacleManager = null;
        this.powerUpManager = null;
        this.backgroundManager = null;
        
        // Spiel-Variablen
        this.score = 0;
        this.highScore = 0;
        this.lives = 3;
        this.level = 1;
        this.gameSpeed = 1;
        this.baseGameSpeed = 1;
        this.speedMultiplier = 1;
        this.difficulty = 1;
        
        // Timing
        this.lastFrameTime = 0;
        this.gameTime = 0;
        this.levelUpTimer = 0;
        this.levelUpInterval = 30000; // 30 Sekunden pro Level
        
        // Performance
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        
        // DOM-Elemente
        this.elements = {};
        
        this.init();
    }

    // Initialisierung
    init() {
        this.loadElements();
        this.loadGameData();
        this.setupEventListeners();
        this.setupGameObjects();
        this.showMainMenu();
        
        this.isInitialized = true;
        console.log('Spiel initialisiert');
    }

    // DOM-Elemente laden
    loadElements() {
        this.elements = {
            // Bildschirme
            mainMenu: Utils.$('#mainMenu'),
            gameScreen: Utils.$('#gameScreen'),
            pauseMenu: Utils.$('#pauseMenu'),
            gameOverScreen: Utils.$('#gameOverScreen'),
            
            // UI-Elemente
            scoreDisplay: Utils.$('#score'),
            livesDisplay: Utils.$('#lives'),
            finalScore: Utils.$('#finalScore'),
            highScore: Utils.$('#highScore'),
            
            // Buttons
            startButton: Utils.$('#startButton'),
            pauseButton: Utils.$('#pauseButton'),
            resumeButton: Utils.$('#resumeButton'),
            restartButton: Utils.$('#restartButton'),
            mainMenuButton: Utils.$('#mainMenuButton'),
            playAgainButton: Utils.$('#playAgainButton'),
            backToMenuButton: Utils.$('#backToMenuButton'),
            
            // Spiel-Welt
            gameWorld: Utils.$('#gameWorld'),
            touchControls: Utils.$('#touchControls'),
            jumpButton: Utils.$('#jumpButton')
        };
    }

    // Spiel-Daten laden
    loadGameData() {
        this.highScore = StorageUtils.get('katzenspiel_highScore', 0);
        this.updateHighScoreDisplay();
    }

    // Event-Listener einrichten
    setupEventListeners() {
        // Menu-Buttons
        if (this.elements.startButton) {
            this.elements.startButton.addEventListener('click', () => this.startGame());
        }
        
        if (this.elements.pauseButton) {
            this.elements.pauseButton.addEventListener('click', () => this.pauseGame());
        }
        
        if (this.elements.resumeButton) {
            this.elements.resumeButton.addEventListener('click', () => this.resumeGame());
        }
        
        if (this.elements.restartButton) {
            this.elements.restartButton.addEventListener('click', () => this.restartGame());
        }
        
        if (this.elements.mainMenuButton) {
            this.elements.mainMenuButton.addEventListener('click', () => this.showMainMenu());
        }
        
        if (this.elements.playAgainButton) {
            this.elements.playAgainButton.addEventListener('click', () => this.restartGame());
        }
        
        if (this.elements.backToMenuButton) {
            this.elements.backToMenuButton.addEventListener('click', () => this.showMainMenu());
        }

        // Touch-Controls
        if (DeviceUtils.isTouchDevice()) {
            this.elements.touchControls?.classList.remove('hidden');
        }

        // Pause-Handler
        window.gameInputHandler.on('pause', () => {
            if (this.gameState === 'playing') {
                this.pauseGame();
            } else if (this.gameState === 'paused') {
                this.resumeGame();
            }
        });

        // Fenster-Events
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.gameState === 'playing') {
                this.pauseGame();
            }
        });

        window.addEventListener('blur', () => {
            if (this.gameState === 'playing') {
                this.pauseGame();
            }
        });
    }

    // Spiel-Objekte einrichten
    setupGameObjects() {
        // Hintergrund-Manager
        this.backgroundManager = new BackgroundManager(this.elements.gameWorld);
        
        // Spieler
        this.player = new Player(this.elements.gameWorld);
        this.player.gameManager = this;
        
        // Hindernisse-Manager
        this.obstacleManager = new ObstacleManager(this.elements.gameWorld);
        this.obstacleManager.gameManager = this;
        
        // Power-up-Manager
        this.powerUpManager = new PowerUpManager(this.elements.gameWorld);
        this.powerUpManager.gameManager = this;
    }

    // Spiel starten
    startGame() {
        this.gameState = 'playing';
        this.resetGameVariables();
        this.showGameScreen();
        this.startGameLoop();
        
        // Audio initialisieren und starten
        window.audioManager.initialize().then(() => {
            window.audioManager.playBackgroundMusic();
        });
        
        console.log('Spiel gestartet');
    }

    // Spiel pausieren
    pauseGame() {
        if (this.gameState !== 'playing') return;
        
        this.gameState = 'paused';
        this.showPauseMenu();
        
        // Audio pausieren
        window.audioManager.stopMusic();
        
        console.log('Spiel pausiert');
    }

    // Spiel fortsetzen
    resumeGame() {
        if (this.gameState !== 'paused') return;
        
        this.gameState = 'playing';
        this.showGameScreen();
        
        // Audio fortsetzen
        window.audioManager.playBackgroundMusic();
        
        console.log('Spiel fortgesetzt');
    }

    // Spiel neu starten
    restartGame() {
        this.gameState = 'playing';
        this.resetGameVariables();
        this.resetGameObjects();
        this.showGameScreen();
        this.startGameLoop(); // Spielschleife neu starten!
        
        // Audio neu starten
        window.audioManager.stopMusic();
        window.audioManager.initialize().then(() => {
            window.audioManager.playBackgroundMusic();
        });
        
        console.log('Spiel neu gestartet');
    }

    // Game Over
    gameOver() {
        if (this.gameState === 'gameOver') return;
        
        this.gameState = 'gameOver';
        this.updateHighScore();
        this.showGameOverScreen();
        
        // Audio stoppen
        window.audioManager.stopMusic();
        
        console.log('Game Over - Score:', this.score);
    }

    // Spiel-Variablen zurücksetzen
    resetGameVariables() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameSpeed = 1;
        this.baseGameSpeed = 1;
        this.speedMultiplier = 1;
        this.difficulty = 1;
        this.gameTime = 0;
        this.levelUpTimer = 0;
        
        this.updateUI();
    }

    // Spiel-Objekte zurücksetzen
    resetGameObjects() {
        this.player?.reset();
        this.obstacleManager?.reset();
        this.powerUpManager?.reset();
        this.backgroundManager?.reset();
    }

    // Haupt-Spielschleife
    startGameLoop() {
        const gameLoop = (currentTime) => {
            if (this.gameState !== 'playing') return;
            
            // Delta-Zeit berechnen
            const deltaTime = currentTime - this.lastFrameTime;
            this.lastFrameTime = currentTime;
            
            // FPS berechnen
            this.updateFPS(currentTime);
            
            // Spiel aktualisieren
            this.update(deltaTime);
            
            // Nächsten Frame anfordern
            requestAnimationFrame(gameLoop);
        };
        
        this.lastFrameTime = performance.now();
        requestAnimationFrame(gameLoop);
    }

    // Spiel-Update
    update(deltaTime) {
        // Spiel-Zeit aktualisieren
        this.gameTime += deltaTime;
        this.levelUpTimer += deltaTime;
        
        // Input aktualisieren
        window.gameInputHandler.update();
        
        // Geschwindigkeit berechnen
        this.gameSpeed = this.baseGameSpeed * this.speedMultiplier;
        
        // Spiel-Objekte aktualisieren
        this.player.update(deltaTime);
        this.obstacleManager.update(deltaTime, this.gameSpeed, this.difficulty);
        this.powerUpManager.update(deltaTime, this.gameSpeed, this.player);
        this.backgroundManager.update(deltaTime, this.gameSpeed);
        
        // Kollisionen prüfen
        this.checkCollisions();
        
        // Level-System
        this.updateLevel();
        
        // UI aktualisieren
        this.updateUI();
    }

    // FPS aktualisieren
    updateFPS(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
        }
    }

    // Kollisionen prüfen
    checkCollisions() {
        // Hindernisse-Kollisionen
        const hitObstacle = this.obstacleManager.checkCollisions(this.player);
        if (hitObstacle) {
            const damaged = this.player.collideWithObstacle();
            if (damaged) {
                this.loseLife();
            }
        }
        
        // Übersprungene Hindernisse
        this.obstacleManager.checkPassedObstacles(this.player);
        
        // Power-up-Kollisionen
        this.powerUpManager.checkCollisions(this.player);
    }

    // Level-System aktualisieren
    updateLevel() {
        if (this.levelUpTimer >= this.levelUpInterval) {
            this.levelUp();
            this.levelUpTimer = 0;
        }
    }

    // Level erhöhen
    levelUp() {
        this.level++;
        this.difficulty++;
        this.baseGameSpeed += 0.1;
        
        // Hindernisse-Manager informieren
        this.obstacleManager.increaseDifficulty();
        
        // Level-Up Sound
        window.audioManager.playLevelUpSound();
        
        // Level-Up Effekt anzeigen
        this.showLevelUpEffect();
        
        console.log(`Level ${this.level} erreicht!`);
    }

    // Level-Up Effekt anzeigen
    showLevelUpEffect() {
        const effect = Utils.createElement('div', {}, ['level-up-effect']);
        effect.textContent = `Level ${this.level}!`;
        
        Utils.setStyles(effect, {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '3rem',
            fontWeight: 'bold',
            color: '#FFD700',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            zIndex: '100',
            pointerEvents: 'none'
        });
        
        this.elements.gameWorld.appendChild(effect);
        
        AnimationUtils.animate(0, 1, 2000, 'easeOutQuad', (progress) => {
            const scale = 1 + progress * 0.5;
            const opacity = 1 - progress;
            
            Utils.setStyles(effect, {
                transform: `translate(-50%, -50%) scale(${scale})`,
                opacity: opacity
            });
        }, () => {
            effect.remove();
        });
    }

    // Score hinzufügen
    addScore(points) {
        this.score += points;
        
        // Score-Erhöhungs-Effekt
        if (this.elements.scoreDisplay) {
            this.elements.scoreDisplay.classList.add('score-increase');
            setTimeout(() => {
                this.elements.scoreDisplay.classList.remove('score-increase');
            }, 300);
        }
    }

    // Leben verlieren
    loseLife() {
        this.lives--;
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Player zurücksetzen für nächstes Leben
            this.player.isAlive = true;
            this.player.isJumping = false;
            this.player.isGrounded = true;
            this.player.y = this.player.groundY;
            this.player.velocityY = 0;
            this.player.setAnimationState('running');
            this.player.element.classList.remove('collision-effect');
            
            // Kurze Unverwundbarkeit
            this.player.makeInvulnerable(2000);
            
            console.log('Leben verloren, noch', this.lives, 'Leben übrig');
        }
    }

    // Leben hinzufügen
    addLife() {
        this.lives++;
        console.log('Extra Leben erhalten!');
    }

    // Geschwindigkeits-Multiplikator setzen
    setSpeedMultiplier(multiplier) {
        this.speedMultiplier = multiplier;
        this.backgroundManager?.setSpeedMultiplier(this.gameSpeed);
    }

    // High Score aktualisieren
    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            StorageUtils.set('katzenspiel_highScore', this.highScore);
            console.log('Neuer High Score:', this.highScore);
        }
    }

    // UI aktualisieren
    updateUI() {
        if (this.elements.scoreDisplay) {
            this.elements.scoreDisplay.textContent = FormatUtils.formatScore(this.score);
        }
        
        if (this.elements.livesDisplay) {
            this.elements.livesDisplay.textContent = this.lives;
        }
    }

    // High Score Display aktualisieren
    updateHighScoreDisplay() {
        if (this.elements.highScore) {
            this.elements.highScore.textContent = FormatUtils.formatScore(this.highScore);
        }
    }

    // Bildschirme anzeigen
    showMainMenu() {
        this.gameState = 'menu';
        this.hideAllScreens();
        this.elements.mainMenu?.classList.remove('hidden');
        this.elements.touchControls?.classList.add('hidden');
        
        // Audio stoppen
        window.audioManager.stopMusic();
    }

    showGameScreen() {
        this.hideAllScreens();
        this.elements.gameScreen?.classList.remove('hidden');
        
        if (DeviceUtils.isTouchDevice()) {
            this.elements.touchControls?.classList.remove('hidden');
        }
    }

    showPauseMenu() {
        this.hideAllScreens();
        this.elements.pauseMenu?.classList.remove('hidden');
        this.elements.touchControls?.classList.add('hidden');
    }

    showGameOverScreen() {
        this.hideAllScreens();
        this.elements.gameOverScreen?.classList.remove('hidden');
        this.elements.touchControls?.classList.add('hidden');
        
        // Final Score anzeigen
        if (this.elements.finalScore) {
            this.elements.finalScore.textContent = FormatUtils.formatScore(this.score);
        }
        
        this.updateHighScoreDisplay();
    }

    hideAllScreens() {
        Object.values(this.elements).forEach(element => {
            if (element && element.classList.contains('screen')) {
                element.classList.add('hidden');
            }
        });
    }

    // Debug-Informationen
    getDebugInfo() {
        return {
            gameState: this.gameState,
            score: this.score,
            lives: this.lives,
            level: this.level,
            gameSpeed: this.gameSpeed.toFixed(2),
            difficulty: this.difficulty,
            fps: this.fps,
            gameTime: Math.round(this.gameTime / 1000),
            player: this.player?.getDebugInfo(),
            obstacles: this.obstacleManager?.getDebugInfo(),
            powerUps: this.powerUpManager?.getDebugInfo(),
            background: this.backgroundManager?.getDebugInfo(),
            audio: window.audioManager?.getDebugInfo(),
            input: window.gameInputHandler?.inputManager?.getDebugInfo()
        };
    }

    // Debug-Panel anzeigen/verstecken
    toggleDebugPanel() {
        let debugPanel = Utils.$('#debugPanel');
        
        if (!debugPanel) {
            debugPanel = Utils.createElement('div', { id: 'debugPanel' });
            Utils.setStyles(debugPanel, {
                position: 'fixed',
                top: '10px',
                right: '10px',
                background: 'rgba(0,0,0,0.8)',
                color: 'white',
                padding: '10px',
                borderRadius: '5px',
                fontSize: '12px',
                fontFamily: 'monospace',
                zIndex: '1000',
                maxWidth: '300px',
                maxHeight: '400px',
                overflow: 'auto'
            });
            document.body.appendChild(debugPanel);
        }
        
        if (debugPanel.style.display === 'none') {
            debugPanel.style.display = 'block';
            this.updateDebugPanel();
        } else {
            debugPanel.style.display = 'none';
        }
    }

    // Debug-Panel aktualisieren
    updateDebugPanel() {
        const debugPanel = Utils.$('#debugPanel');
        if (!debugPanel || debugPanel.style.display === 'none') return;
        
        const debugInfo = this.getDebugInfo();
        debugPanel.innerHTML = '<pre>' + JSON.stringify(debugInfo, null, 2) + '</pre>';
        
        // Alle 500ms aktualisieren
        setTimeout(() => this.updateDebugPanel(), 500);
    }

    // Cleanup
    cleanup() {
        // Audio aufräumen
        window.audioManager?.cleanup();
        
        // Input aufräumen
        window.gameInputHandler?.cleanup();
        
        // Spiel-Objekte aufräumen
        this.player?.cleanup();
        this.obstacleManager?.clearAll();
        this.powerUpManager?.clearAll();
        this.backgroundManager?.cleanup();
    }
}

// Debug-Tastenkombinationen (nur in Development)
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey) {
        switch (event.key) {
            case 'D':
                event.preventDefault();
                if (window.gameManager) {
                    window.gameManager.toggleDebugPanel();
                }
                break;
            case 'R':
                event.preventDefault();
                location.reload();
                break;
        }
    }
});

// Spiel initialisieren wenn DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    window.gameManager = new GameManager();
    console.log('Katzen-Sprungspiel geladen!');
});