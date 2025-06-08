// Power-up-System für das Katzen-Sprungspiel

class PowerUp {
    constructor(type, x, gameWorld) {
        this.type = type;
        this.x = x;
        this.gameWorld = gameWorld;
        this.element = null;
        this.isActive = true;
        this.isCollected = false;
        this.speed = 5;
        
        // Basis-Eigenschaften
        this.width = 30;
        this.height = 30;
        this.y = 120; // Schwebt über dem Boden
        this.originalY = this.y;
        
        // Typ-spezifische Eigenschaften
        this.setupPowerUpType();
        
        // Animation
        this.floatAmplitude = 15;
        this.floatSpeed = 0.03;
        this.floatOffset = Math.random() * Math.PI * 2;
        this.rotationSpeed = 0.02;
        this.rotationOffset = Math.random() * Math.PI * 2;
        
        // Kollisions-Box
        this.collisionBox = {
            x: 5,
            y: 5,
            width: this.width - 10,
            height: this.height - 10
        };
        
        this.createElement();
        this.spawn();
    }

    // Power-up-Typ konfigurieren
    setupPowerUpType() {
        switch (this.type) {
            case 'jump':
                this.name = 'Doppelsprung';
                this.description = 'Ermöglicht einen zweiten Sprung in der Luft';
                this.color = '#00BFFF';
                this.icon = '🚀';
                this.rarity = 'common';
                this.points = 50;
                break;
                
            case 'shield':
                this.name = 'Schild';
                this.description = 'Schutz vor einem Treffer';
                this.color = '#FFD700';
                this.icon = '🛡️';
                this.rarity = 'uncommon';
                this.points = 75;
                break;
                
            case 'speed':
                this.name = 'Geschwindigkeit';
                this.description = 'Erhöht die Spielgeschwindigkeit';
                this.color = '#FF4500';
                this.icon = '⚡';
                this.rarity = 'common';
                this.points = 40;
                break;
                
            case 'magnet':
                this.name = 'Magnet';
                this.description = 'Zieht Power-ups automatisch an';
                this.color = '#32CD32';
                this.icon = '🧲';
                this.rarity = 'rare';
                this.points = 100;
                break;
                
            case 'coin':
                this.name = 'Münze';
                this.description = 'Bonus-Punkte';
                this.color = '#FFD700';
                this.icon = '🪙';
                this.rarity = 'common';
                this.points = 25;
                this.width = 20;
                this.height = 20;
                break;
                
            case 'life':
                this.name = 'Extra Leben';
                this.description = 'Zusätzliches Leben';
                this.color = '#FF69B4';
                this.icon = '❤️';
                this.rarity = 'legendary';
                this.points = 200;
                break;
                
            default:
                this.name = 'Unbekannt';
                this.description = 'Mysteriöser Power-up';
                this.color = '#FFFFFF';
                this.icon = '❓';
                this.rarity = 'common';
                this.points = 10;
        }
    }

    // DOM-Element erstellen
    createElement() {
        this.element = Utils.createElement('div', {}, ['powerup', `powerup-${this.type}`]);
        
        Utils.setStyles(this.element, {
            position: 'absolute',
            width: `${this.width}px`,
            height: `${this.height}px`,
            bottom: `${this.y}px`,
            left: `${this.x}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${this.color}, ${this.adjustColor(this.color, -30)})`,
            boxShadow: `0 0 20px ${this.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${this.width * 0.6}px`,
            zIndex: '6',
            cursor: 'pointer'
        });
        
        // Icon hinzufügen
        const icon = Utils.createElement('span', {}, ['powerup-icon']);
        icon.textContent = this.icon;
        Utils.setStyles(icon, {
            filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.5))',
            userSelect: 'none'
        });
        
        this.element.appendChild(icon);
        
        // Partikel-Effekt hinzufügen
        this.createParticleEffect();
    }

    // Farbe anpassen (heller/dunkler)
    adjustColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // Partikel-Effekt erstellen
    createParticleEffect() {
        const particleCount = this.rarity === 'legendary' ? 8 : this.rarity === 'rare' ? 6 : 4;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = Utils.createElement('div', {}, ['powerup-particle']);
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = this.width * 0.7;
            
            Utils.setStyles(particle, {
                position: 'absolute',
                width: '4px',
                height: '4px',
                background: this.color,
                borderRadius: '50%',
                left: `${this.width / 2 + Math.cos(angle) * distance}px`,
                top: `${this.height / 2 + Math.sin(angle) * distance}px`,
                animation: `sparkle 2s infinite ${i * 0.2}s`,
                pointerEvents: 'none'
            });
            
            this.element.appendChild(particle);
        }
    }

    // Power-up spawnen
    spawn() {
        const container = Utils.$('#powerupsContainer');
        if (container) {
            container.appendChild(this.element);
            
            // Spawn-Animation
            this.element.classList.add('spawning');
            AnimationUtils.addAnimation(this.element, 'powerupSpawn 0.5s ease-out', '0.5s', () => {
                this.element.classList.remove('spawning');
            });
        }
    }

    // Update-Schleife
    update(deltaTime, gameSpeed, player) {
        if (!this.isActive) return;

        // Position aktualisieren
        this.x -= this.speed * gameSpeed * (deltaTime / 16.67);
        
        // Schwebende Bewegung
        this.updateFloatingMovement();
        
        // Magnet-Effekt prüfen
        if (player && player.powerUps.magnet.active) {
            this.updateMagnetEffect(player);
        }
        
        // Position im DOM aktualisieren
        this.updatePosition();
        
        // Prüfen ob außerhalb des Bildschirms
        if (this.x + this.width < -50) {
            this.destroy();
        }
    }

    // Schwebende Bewegung
    updateFloatingMovement() {
        const time = performance.now();
        
        // Auf und ab schweben
        this.y = this.originalY + Math.sin(time * this.floatSpeed + this.floatOffset) * this.floatAmplitude;
        
        // Rotation
        const rotation = Math.sin(time * this.rotationSpeed + this.rotationOffset) * 15;
        if (this.element) {
            Utils.setStyle(this.element, 'transform', `rotate(${rotation}deg)`);
        }
    }

    // Magnet-Effekt
    updateMagnetEffect(player) {
        const playerCenter = {
            x: player.x + player.width / 2,
            y: player.y + player.height / 2
        };
        
        const powerUpCenter = {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
        
        const distance = MathUtils.distance(
            playerCenter.x, playerCenter.y,
            powerUpCenter.x, powerUpCenter.y
        );
        
        // Magnet-Reichweite
        const magnetRange = 150;
        
        if (distance < magnetRange && distance > 10) {
            // Richtung zum Spieler berechnen
            const dx = playerCenter.x - powerUpCenter.x;
            const dy = playerCenter.y - powerUpCenter.y;
            const magnetStrength = (magnetRange - distance) / magnetRange * 8;
            
            this.x += (dx / distance) * magnetStrength;
            this.y += (dy / distance) * magnetStrength;
        }
    }

    // Position im DOM aktualisieren
    updatePosition() {
        if (this.element) {
            Utils.setStyles(this.element, {
                left: `${this.x}px`,
                bottom: `${this.y}px`
            });
        }
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

    // Kollision mit Spieler prüfen
    checkCollisionWithPlayer(player) {
        if (!this.isActive || this.isCollected || !player.isAlive) return false;

        // Tatsächliche visuelle Position der Katze ermitteln (CSS-transformiert)
        let actualPlayerY = player.y;
        
        if (player.isJumping) {
            // Während Sprung: CSS-Animation Position berechnen
            const jumpProgress = (performance.now() - player.jumpStartTime) / player.jumpDuration;
            if (jumpProgress >= 0 && jumpProgress <= 1) {
                // CSS catJump Animation: 0% -> 30% -> 70% -> 100%
                let yOffset = 0;
                if (jumpProgress <= 0.3) {
                    // Aufstieg: 0% bis 30%
                    const progress = jumpProgress / 0.3;
                    yOffset = -140 * progress; // Bis -140px
                } else if (jumpProgress <= 0.7) {
                    // Schweben: 30% bis 70%
                    yOffset = -140; // Konstant bei -140px
                } else {
                    // Abstieg: 70% bis 100%
                    const progress = (jumpProgress - 0.7) / 0.3;
                    yOffset = -140 * (1 - progress); // Von -140px zu 0px
                }
                actualPlayerY = player.y + Math.abs(yOffset); // CSS translateY ist negativ, also addieren
            }
        }

        // Kollisions-Boxen mit CSS-Position
        const powerUpLeft = this.x + 5;  // Kollisions-Box Offset
        const powerUpRight = this.x + this.width - 5;
        const powerUpBottom = this.y + 5;
        const powerUpTop = this.y + this.height - 5;
        
        const playerLeft = player.x + 10;  // Player Kollisions-Box Offset
        const playerRight = player.x + player.width - 10;
        const playerBottom = actualPlayerY + 5;  // Verwende CSS-Position!
        const playerTop = actualPlayerY + player.height - 5;
        
        // Rechteck-Kollision prüfen
        const xOverlap = powerUpLeft < playerRight && powerUpRight > playerLeft;
        const yOverlap = powerUpBottom < playerTop && powerUpTop > playerBottom;
        
        if (xOverlap && yOverlap) {
            console.log(`POWERUP KOLLISION: ${this.type} bei X=${this.x.toFixed(1)}, Y=${this.y.toFixed(1)}, Player CSS-Y=${actualPlayerY.toFixed(1)}`);
            return true;
        }
        
        return false;
    }

    // Power-up sammeln
    collect(player) {
        if (this.isCollected) return;
        
        this.isCollected = true;
        this.isActive = false;
        
        // Sammel-Effekt
        this.createCollectionEffect();
        
        // Power-up anwenden
        this.applyEffect(player);
        
        // Sound abspielen
        window.audioManager.playCollectSound();
        
        // Punkte vergeben
        if (window.gameManager) {
            window.gameManager.addScore(this.points);
        }
        
        // Element nach Animation entfernen
        setTimeout(() => {
            this.destroy();
        }, 300);
    }

    // Power-up-Effekt anwenden
    applyEffect(player) {
        switch (this.type) {
            case 'jump':
                player.activatePowerUp('doubleJump');
                break;
                
            case 'shield':
                player.activatePowerUp('shield');
                break;
                
            case 'speed':
                player.activatePowerUp('speed');
                break;
                
            case 'magnet':
                player.activatePowerUp('magnet');
                break;
                
            case 'coin':
                // Nur Punkte, kein spezieller Effekt
                break;
                
            case 'life':
                if (window.gameManager) {
                    window.gameManager.addLife();
                }
                break;
        }
    }

    // Sammel-Effekt erstellen
    createCollectionEffect() {
        if (!this.element) return;
        
        // Sammel-Animation
        this.element.classList.add('collecting');
        
        // Partikel-Explosion
        this.createParticleExplosion();
        
        // Text-Popup
        this.createScorePopup();
    }

    // Partikel-Explosion
    createParticleExplosion() {
        const particleCount = 12;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = Utils.createElement('div', {}, ['explosion-particle']);
            const angle = (i / particleCount) * Math.PI * 2;
            const velocity = MathUtils.random(50, 100);
            
            Utils.setStyles(particle, {
                position: 'absolute',
                left: `${this.x + this.width / 2}px`,
                bottom: `${this.y + this.height / 2}px`,
                width: '6px',
                height: '6px',
                background: this.color,
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: '20'
            });
            
            this.gameWorld.appendChild(particle);
            
            // Partikel-Animation
            const endX = this.x + this.width / 2 + Math.cos(angle) * velocity;
            const endY = this.y + this.height / 2 + Math.sin(angle) * velocity;
            
            AnimationUtils.animate(0, 1, 800, 'easeOutQuad', (progress) => {
                const currentX = MathUtils.lerp(this.x + this.width / 2, endX, progress);
                const currentY = MathUtils.lerp(this.y + this.height / 2, endY, progress);
                const opacity = 1 - progress;
                const scale = 1 - progress * 0.5;
                
                Utils.setStyles(particle, {
                    left: `${currentX}px`,
                    bottom: `${currentY}px`,
                    opacity: opacity,
                    transform: `scale(${scale})`
                });
            }, () => {
                particle.remove();
            });
        }
    }

    // Score-Popup erstellen
    createScorePopup() {
        const popup = Utils.createElement('div', {}, ['score-popup']);
        popup.textContent = `+${this.points}`;
        
        Utils.setStyles(popup, {
            position: 'absolute',
            left: `${this.x + this.width / 2}px`,
            bottom: `${this.y + this.height + 10}px`,
            color: this.color,
            fontSize: '20px',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
            zIndex: '25',
            transform: 'translateX(-50%)'
        });
        
        this.gameWorld.appendChild(popup);
        
        // Popup-Animation
        AnimationUtils.animate(0, 1, 1000, 'easeOutQuad', (progress) => {
            const y = this.y + this.height + 10 + progress * 50;
            const opacity = 1 - progress;
            const scale = 1 + progress * 0.5;
            
            Utils.setStyles(popup, {
                bottom: `${y}px`,
                opacity: opacity,
                transform: `translateX(-50%) scale(${scale})`
            });
        }, () => {
            popup.remove();
        });
    }

    // Power-up zerstören
    destroy() {
        this.isActive = false;
        
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }

    // Debug-Informationen
    getDebugInfo() {
        return {
            type: this.type,
            name: this.name,
            position: { x: this.x, y: this.y },
            isActive: this.isActive,
            isCollected: this.isCollected,
            rarity: this.rarity,
            points: this.points
        };
    }
}

// Power-up-Manager
class PowerUpManager {
    constructor(gameWorld) {
        this.gameWorld = gameWorld;
        this.powerUps = [];
        this.spawnTimer = 0;
        this.spawnInterval = 5000; // 5 Sekunden
        this.gameSpeed = 1;
        
        // Spawn-Wahrscheinlichkeiten basierend auf Seltenheit
        this.spawnProbabilities = {
            'coin': 0.4,
            'jump': 0.25,
            'speed': 0.2,
            'shield': 0.1,
            'magnet': 0.04,
            'life': 0.01
        };
    }

    // Update-Schleife
    update(deltaTime, gameSpeed, player) {
        this.gameSpeed = gameSpeed;
        
        // Spawn-Timer aktualisieren
        this.spawnTimer += deltaTime;
        
        // Neues Power-up spawnen
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnPowerUp();
            this.spawnTimer = 0;
        }
        
        // Alle Power-ups aktualisieren
        this.powerUps.forEach(powerUp => {
            powerUp.update(deltaTime, gameSpeed, player);
        });
        
        // Inaktive Power-ups entfernen
        this.powerUps = this.powerUps.filter(powerUp => powerUp.isActive);
    }

    // Power-up spawnen
    spawnPowerUp() {
        const screenWidth = window.innerWidth;
        const spawnX = screenWidth + 50;
        
        // Zufälligen Power-up-Typ wählen
        const powerUpType = this.getRandomPowerUpType();
        
        const powerUp = new PowerUp(powerUpType, spawnX, this.gameWorld);
        this.powerUps.push(powerUp);
    }

    // Zufälligen Power-up-Typ basierend auf Wahrscheinlichkeiten wählen
    getRandomPowerUpType() {
        const random = Math.random();
        let cumulative = 0;
        
        for (const [type, probability] of Object.entries(this.spawnProbabilities)) {
            cumulative += probability;
            if (random <= cumulative) {
                return type;
            }
        }
        
        return 'coin'; // Fallback
    }

    // Kollisionen mit Spieler prüfen
    checkCollisions(player) {
        const collectedPowerUps = [];
        
        this.powerUps.forEach(powerUp => {
            if (powerUp.checkCollisionWithPlayer(player)) {
                powerUp.collect(player);
                collectedPowerUps.push(powerUp);
            }
        });
        
        return collectedPowerUps;
    }

    // Alle Power-ups entfernen
    clearAll() {
        this.powerUps.forEach(powerUp => {
            powerUp.destroy();
        });
        this.powerUps = [];
        this.spawnTimer = 0;
    }

    // Reset für neues Spiel
    reset() {
        this.clearAll();
        this.spawnInterval = 5000;
    }

    // Debug-Informationen
    getDebugInfo() {
        return {
            powerUpCount: this.powerUps.length,
            spawnTimer: Math.round(this.spawnTimer),
            spawnInterval: Math.round(this.spawnInterval),
            spawnProbabilities: this.spawnProbabilities,
            powerUps: this.powerUps.map(powerUp => powerUp.getDebugInfo())
        };
    }
}

// Export für andere Module
window.PowerUp = PowerUp;
window.PowerUpManager = PowerUpManager;