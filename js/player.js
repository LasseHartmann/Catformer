// Spieler-Klasse (Katze) für das Sprungspiel

class Player {
    constructor(gameWorld) {
        this.gameWorld = gameWorld;
        this.element = Utils.$('#player');
        
        // Position und Größe
        this.x = 100;
        this.y = 60; // Boden-Position
        this.width = 60;
        this.height = 40;
        this.groundY = 60;
        
        // Physik
        this.velocityY = 0;
        this.gravity = 0.06; // Deutlich reduzierte Schwerkraft für längere Sprünge
        this.jumpPower = -50; // Erhöhte Sprungkraft für höhere Sprünge
        this.doubleJumpPower = -25; // Erhöhte Doppelsprung-Kraft
        this.isGrounded = true;
        this.isJumping = false;
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;
        
        // Zustand
        this.isAlive = true;
        this.isInvulnerable = false;
        this.invulnerabilityTime = 0;
        this.invulnerabilityDuration = 2000; // 2 Sekunden
        
        // Power-ups
        this.powerUps = {
            doubleJump: { active: false, timeLeft: 0, duration: 10000 },
            shield: { active: false, timeLeft: 0, duration: 8000 },
            speed: { active: false, timeLeft: 0, duration: 6000 },
            magnet: { active: false, timeLeft: 0, duration: 12000 }
        };
        
        // Animation
        this.animationState = 'running';
        this.animationFrame = 0;
        this.animationSpeed = 0.2;
        this.lastAnimationUpdate = 0;
        
        // Kollision
        this.collisionBox = {
            x: 10,
            y: 5,
            width: 40,
            height: 30
        };
        
        this.init();
    }

    init() {
        this.updatePosition();
        this.startRunningAnimation();
        this.setupInputHandlers();
    }

    // Input-Handler einrichten
    setupInputHandlers() {
        window.gameInputHandler.on('jump', () => {
            this.jump();
        });
    }

    // Sprung ausführen
    jump() {
        if (!this.isAlive) return;

        if (this.isGrounded) {
            // Normaler Sprung
            this.velocityY = this.jumpPower;
            this.isGrounded = false;
            this.isJumping = true;
            this.hasDoubleJumped = false;
            
            // Double-Jump verfügbar machen wenn Power-up aktiv
            if (this.powerUps.doubleJump.active) {
                this.canDoubleJump = true;
            }
            
            this.setAnimationState('jumping');
            window.audioManager.playJumpSound();
            
            // Sprung-Timer für Animation
            this.jumpStartTime = performance.now();
            this.jumpDuration = 1200; // Angepasst an CSS-Animation (1.2s)
            
        } else if (this.canDoubleJump && !this.hasDoubleJumped) {
            // Doppelsprung
            this.velocityY = this.doubleJumpPower;
            this.hasDoubleJumped = true;
            this.canDoubleJump = false;
            
            this.createDoubleJumpEffect();
            window.audioManager.playDoubleJumpSound();
            
            // Doppelsprung-Timer
            this.jumpStartTime = performance.now();
            this.jumpDuration = 800; // Längerer Doppelsprung
        }
    }

    // Update-Schleife
    update(deltaTime) {
        this.updatePhysics(deltaTime);
        this.updatePowerUps(deltaTime);
        this.updateInvulnerability(deltaTime);
        this.updateAnimation(deltaTime);
        this.updatePosition();
        this.updateVisualEffects();
    }

    // Physik aktualisieren
    updatePhysics(deltaTime) {
        if (!this.isAlive) return;

        // Prüfen ob Sprung-Animation läuft
        if (this.isJumping && this.jumpStartTime) {
            const elapsed = performance.now() - this.jumpStartTime;
            
            if (elapsed >= this.jumpDuration) {
                // Sprung beendet
                this.isJumping = false;
                this.jumpStartTime = null;
                this.land();
            }
            // Während der Sprung-Animation keine Y-Position ändern
            return;
        }

        // Normale Physik nur wenn nicht springend
        if (!this.isJumping) {
            // Schwerkraft anwenden
            if (!this.isGrounded) {
                this.velocityY += this.gravity;
            }

            // Position aktualisieren
            this.y += this.velocityY;

            // Boden-Kollision
            if (this.y <= this.groundY) {
                this.y = this.groundY;
                this.velocityY = 0;
                
                if (!this.isGrounded) {
                    this.land();
                }
                
                this.isGrounded = true;
                this.canDoubleJump = false;
            }
        }
    }

    // Landung
    land() {
        this.isGrounded = true;
        this.isJumping = false;
        this.y = this.groundY; // Sicherstellen, dass Katze auf dem Boden ist
        this.velocityY = 0;
        
        this.setAnimationState('landing');
        
        // Nach kurzer Zeit zurück zum Laufen
        setTimeout(() => {
            if (this.isGrounded && this.isAlive) {
                this.setAnimationState('running');
            }
        }, 200);
    }

    // Power-ups aktualisieren
    updatePowerUps(deltaTime) {
        Object.keys(this.powerUps).forEach(type => {
            const powerUp = this.powerUps[type];
            
            if (powerUp.active) {
                powerUp.timeLeft -= deltaTime;
                
                if (powerUp.timeLeft <= 0) {
                    this.deactivatePowerUp(type);
                }
            }
        });
    }

    // Unverwundbarkeit aktualisieren
    updateInvulnerability(deltaTime) {
        if (this.isInvulnerable) {
            this.invulnerabilityTime -= deltaTime;
            
            if (this.invulnerabilityTime <= 0) {
                this.isInvulnerable = false;
                this.element.classList.remove('collision-effect');
            }
        }
    }

    // Animation aktualisieren
    updateAnimation(deltaTime) {
        const now = performance.now();
        
        if (now - this.lastAnimationUpdate > 1000 / 60 * this.animationSpeed) {
            this.animationFrame++;
            this.lastAnimationUpdate = now;
        }
    }

    // Position im DOM aktualisieren
    updatePosition() {
        if (this.element) {
            Utils.setStyle(this.element, 'bottom', `${this.y}px`);
            Utils.setStyle(this.element, 'left', `${this.x}px`);
        }
    }

    // Visuelle Effekte aktualisieren
    updateVisualEffects() {
        if (!this.element) return;

        // Power-up Effekte
        Object.keys(this.powerUps).forEach(type => {
            const className = `${type}-active`;
            Utils.toggleClass(this.element, className, this.powerUps[type].active);
        });

        // Unverwundbarkeits-Effekt
        if (this.isInvulnerable) {
            const flashInterval = 200;
            const shouldFlash = Math.floor(this.invulnerabilityTime / flashInterval) % 2 === 0;
            Utils.toggleClass(this.element, 'flash', shouldFlash);
        } else {
            Utils.toggleClass(this.element, 'flash', false);
        }
    }

    // Animations-Zustand setzen
    setAnimationState(state) {
        if (this.animationState === state) return;
        
        // Alte Animation-Klassen entfernen
        this.element.classList.remove('running', 'jumping', 'landing');
        
        this.animationState = state;
        this.animationFrame = 0;
        
        // Neue Animation-Klasse hinzufügen
        this.element.classList.add(state);
    }

    // Lauf-Animation starten
    startRunningAnimation() {
        this.setAnimationState('running');
    }

    // Power-up aktivieren
    activatePowerUp(type) {
        if (!this.powerUps[type]) return;

        this.powerUps[type].active = true;
        this.powerUps[type].timeLeft = this.powerUps[type].duration;
        
        // Spezielle Aktivierungs-Effekte
        switch (type) {
            case 'doubleJump':
                this.canDoubleJump = !this.isGrounded;
                break;
            case 'shield':
                this.isInvulnerable = true;
                this.invulnerabilityTime = this.powerUps[type].duration;
                break;
            case 'speed':
                if (window.gameManager) {
                    window.gameManager.setSpeedMultiplier(1.5);
                }
                break;
            case 'magnet':
                // Magnet-Effekt wird im Game-Manager behandelt
                break;
        }
        
        this.createPowerUpActivationEffect(type);
        window.audioManager.playPowerUpActivateSound(type);
    }

    // Power-up deaktivieren
    deactivatePowerUp(type) {
        if (!this.powerUps[type]) return;

        this.powerUps[type].active = false;
        this.powerUps[type].timeLeft = 0;
        
        // Spezielle Deaktivierungs-Effekte
        switch (type) {
            case 'shield':
                if (!this.isInvulnerable) {
                    this.isInvulnerable = false;
                }
                break;
            case 'speed':
                if (window.gameManager) {
                    window.gameManager.setSpeedMultiplier(1.0);
                }
                break;
        }
    }

    // Kollision mit Hindernis
    collideWithObstacle() {
        if (this.isInvulnerable || !this.isAlive) return false;

        // Shield-Power-up prüfen
        if (this.powerUps.shield.active) {
            this.deactivatePowerUp('shield');
            this.makeInvulnerable(1000); // Kurze Unverwundbarkeit nach Shield
            return false;
        }

        this.takeDamage();
        return true;
    }

    // Schaden nehmen
    takeDamage() {
        this.isAlive = false;
        this.setAnimationState('hit');
        this.element.classList.add('collision-effect');
        
        window.audioManager.playHitSound();
        
        // Leben verlieren nach kurzer Verzögerung
        setTimeout(() => {
            if (window.gameManager) {
                window.gameManager.loseLife();
            }
        }, 500);
    }

    // Unverwundbar machen
    makeInvulnerable(duration) {
        this.isInvulnerable = true;
        this.invulnerabilityTime = duration;
    }

    // Kollisions-Box abrufen
    getCollisionBox() {
        return {
            x: this.x + this.collisionBox.x,
            y: this.y + this.collisionBox.y,
            width: this.collisionBox.width,
            height: this.collisionBox.height
        };
    }

    // Doppelsprung-Effekt erstellen
    createDoubleJumpEffect() {
        const effect = Utils.createElement('div', {}, ['double-jump-effect']);
        Utils.setStyles(effect, {
            position: 'absolute',
            left: `${this.x + this.width / 2}px`,
            bottom: `${this.y + this.height / 2}px`,
            width: '20px',
            height: '20px',
            background: 'radial-gradient(circle, #00BFFF, transparent)',
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: '15'
        });
        
        this.gameWorld.appendChild(effect);
        
        AnimationUtils.animate(0, 1, 300, 'easeOutQuad', (value) => {
            const scale = 1 + value * 2;
            const opacity = 1 - value;
            Utils.setStyles(effect, {
                transform: `scale(${scale})`,
                opacity: opacity
            });
        }, () => {
            effect.remove();
        });
    }

    // Power-up Aktivierungs-Effekt
    createPowerUpActivationEffect(type) {
        const colors = {
            doubleJump: '#00BFFF',
            shield: '#FFD700',
            speed: '#FF4500',
            magnet: '#32CD32'
        };
        
        const effect = Utils.createElement('div', {}, ['powerup-activation-effect']);
        Utils.setStyles(effect, {
            position: 'absolute',
            left: `${this.x}px`,
            bottom: `${this.y}px`,
            width: `${this.width}px`,
            height: `${this.height}px`,
            border: `3px solid ${colors[type]}`,
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: '20'
        });
        
        this.gameWorld.appendChild(effect);
        
        AnimationUtils.animate(0, 1, 500, 'easeOutQuad', (value) => {
            const scale = 1 + value * 0.5;
            const opacity = 1 - value;
            Utils.setStyles(effect, {
                transform: `scale(${scale})`,
                opacity: opacity
            });
        }, () => {
            effect.remove();
        });
    }

    // Reset für neues Spiel
    reset() {
        this.x = 100;
        this.y = this.groundY;
        this.velocityY = 0;
        this.isGrounded = true;
        this.isJumping = false;
        this.isAlive = true;
        this.isInvulnerable = false;
        this.invulnerabilityTime = 0;
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;
        
        // Alle Power-ups deaktivieren
        Object.keys(this.powerUps).forEach(type => {
            this.deactivatePowerUp(type);
        });
        
        // Animation zurücksetzen
        this.setAnimationState('running');
        this.element.classList.remove('collision-effect', 'flash');
        
        this.updatePosition();
    }

    // Debug-Informationen
    getDebugInfo() {
        return {
            position: { x: this.x, y: this.y },
            velocity: { y: this.velocityY },
            state: {
                isGrounded: this.isGrounded,
                isJumping: this.isJumping,
                isAlive: this.isAlive,
                isInvulnerable: this.isInvulnerable,
                canDoubleJump: this.canDoubleJump
            },
            powerUps: Object.keys(this.powerUps).reduce((acc, type) => {
                acc[type] = {
                    active: this.powerUps[type].active,
                    timeLeft: Math.round(this.powerUps[type].timeLeft)
                };
                return acc;
            }, {}),
            animation: {
                state: this.animationState,
                frame: this.animationFrame
            }
        };
    }

    // Cleanup
    cleanup() {
        // Event-Listener entfernen würde hier passieren
        // (wird durch gameInputHandler verwaltet)
    }
}

// Export für andere Module
window.Player = Player;