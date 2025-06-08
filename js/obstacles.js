// Hindernisse-System für das Katzen-Sprungspiel

class Obstacle {
    constructor(type, x, gameWorld) {
        this.type = type;
        this.x = x;
        this.gameWorld = gameWorld;
        this.element = null;
        this.isActive = true;
        this.speed = 5;
        
        // Typ-spezifische Eigenschaften
        this.setupObstacleType();
        
        this.createElement();
        this.spawn();
    }

    // Hindernis-Typ konfigurieren
    setupObstacleType() {
        switch (this.type) {
            case 'dog-small':
                this.width = 40;
                this.height = 25;
                this.y = 60; // Auf dem Boden
                this.points = 10;
                this.animationSpeed = 0.8;
                // Präzise Kollisions-Box für kleinen Hund
                this.collisionBox = {
                    x: 8,
                    y: 5,
                    width: 24,  // Nur der Körper, nicht die Ohren/Schwanz
                    height: 15  // Nur der untere Teil
                };
                break;
                
            case 'dog-large':
                this.width = 60;
                this.height = 45;
                this.y = 60; // Auf dem Boden
                this.points = 20;
                this.animationSpeed = 1.0;
                // Präzise Kollisions-Box für großen Hund
                this.collisionBox = {
                    x: 10,
                    y: 8,
                    width: 40,  // Hauptkörper
                    height: 25  // Unterer Teil
                };
                break;
                
            case 'bird':
                this.width = 30;
                this.height = 20;
                this.y = 120; // In der Luft
                this.points = 15;
                this.animationSpeed = 0.6;
                this.floatAmplitude = 10;
                this.floatSpeed = 0.05;
                this.floatOffset = Math.random() * Math.PI * 2;
                // Kleine Kollisions-Box für Vogel
                this.collisionBox = {
                    x: 5,
                    y: 4,
                    width: 20,  // Nur der Körper
                    height: 12  // Ohne Flügel-Spitzen
                };
                break;
                
            case 'crate':
                this.width = 35;
                this.height = 35;
                this.y = 60; // Auf dem Boden
                this.points = 5;
                this.animationSpeed = 0;
                // Präzise Kollisions-Box für Kiste
                this.collisionBox = {
                    x: 3,
                    y: 3,
                    width: 29,  // Fast die ganze Kiste
                    height: 29
                };
                break;
                
            default:
                this.width = 40;
                this.height = 25;
                this.y = 60;
                this.points = 10;
                this.animationSpeed = 0.8;
                this.collisionBox = {
                    x: 8,
                    y: 5,
                    width: 24,
                    height: 15
                };
        }
        
        this.originalY = this.y;
    }

    // DOM-Element erstellen
    createElement() {
        this.element = Utils.createElement('div', {}, ['obstacle', this.type]);
        
        // Spezielle Elemente für verschiedene Typen
        switch (this.type) {
            case 'dog-small':
            case 'dog-large':
                this.createDogElements();
                break;
            case 'bird':
                this.createBirdElements();
                break;
            case 'crate':
                this.createCrateElements();
                break;
        }
        
        Utils.setStyles(this.element, {
            position: 'absolute',
            width: `${this.width}px`,
            height: `${this.height}px`,
            bottom: `${this.y}px`,
            left: `${this.x}px`,
            zIndex: '5'
        });
    }

    // Hunde-Elemente erstellen
    createDogElements() {
        // Körper
        const body = Utils.createElement('div', {}, ['dog-body']);
        
        // Kopf
        const head = Utils.createElement('div', {}, ['dog-head']);
        
        // Ohren
        const ears = Utils.createElement('div', {}, ['dog-ears']);
        
        // Schwanz
        const tail = Utils.createElement('div', {}, ['dog-tail']);
        
        // Beine
        const legs = Utils.createElement('div', {}, ['dog-legs']);
        
        this.element.appendChild(body);
        this.element.appendChild(head);
        this.element.appendChild(ears);
        this.element.appendChild(tail);
        this.element.appendChild(legs);
        
        // Animation starten
        this.element.classList.add('walking');
    }

    // Vogel-Elemente erstellen
    createBirdElements() {
        // Körper
        const body = Utils.createElement('div', {}, ['bird-body']);
        Utils.setStyles(body, {
            width: '20px',
            height: '12px',
            background: '#8B4513',
            borderRadius: '50%',
            position: 'absolute',
            top: '4px',
            left: '5px'
        });
        
        // Flügel
        const wings = Utils.createElement('div', {}, ['bird-wings']);
        Utils.setStyles(wings, {
            width: '30px',
            height: '8px',
            background: '#654321',
            borderRadius: '50%',
            position: 'absolute',
            top: '6px',
            left: '0px',
            animation: 'wingFlap 0.3s infinite'
        });
        
        // Schnabel
        const beak = Utils.createElement('div', {}, ['bird-beak']);
        Utils.setStyles(beak, {
            width: '0',
            height: '0',
            borderTop: '3px solid transparent',
            borderBottom: '3px solid transparent',
            borderLeft: '8px solid orange',
            position: 'absolute',
            top: '8px',
            left: '25px'
        });
        
        this.element.appendChild(wings);
        this.element.appendChild(body);
        this.element.appendChild(beak);
        
        // Flug-Animation
        this.element.classList.add('flying');
    }

    // Kisten-Elemente erstellen
    createCrateElements() {
        Utils.setStyles(this.element, {
            background: 'linear-gradient(45deg, #8B4513, #A0522D)',
            border: '2px solid #654321',
            borderRadius: '5px'
        });
        
        // Holz-Textur simulieren
        const texture = Utils.createElement('div', {}, ['crate-texture']);
        Utils.setStyles(texture, {
            width: '100%',
            height: '100%',
            background: `repeating-linear-gradient(
                90deg,
                transparent 0px,
                transparent 8px,
                rgba(101,67,33,0.3) 8px,
                rgba(101,67,33,0.3) 10px
            ), repeating-linear-gradient(
                0deg,
                transparent 0px,
                transparent 8px,
                rgba(101,67,33,0.3) 8px,
                rgba(101,67,33,0.3) 10px
            )`,
            borderRadius: '3px'
        });
        
        this.element.appendChild(texture);
    }

    // Hindernis spawnen
    spawn() {
        const container = Utils.$('#obstaclesContainer');
        if (container) {
            container.appendChild(this.element);
            
            // Spawn-Animation
            this.element.classList.add('spawning');
            AnimationUtils.addAnimation(this.element, 'slideInFromRight 0.3s ease-out', '0.3s', () => {
                this.element.classList.remove('spawning');
                this.element.classList.add('moving');
            });
        }
    }

    // Update-Schleife
    update(deltaTime, gameSpeed) {
        if (!this.isActive) return;

        // Position aktualisieren
        this.x -= this.speed * gameSpeed * (deltaTime / 16.67); // 60 FPS normalisiert
        
        // Spezielle Bewegungen
        this.updateSpecialMovement(deltaTime);
        
        // Position im DOM aktualisieren
        this.updatePosition();
        
        // Prüfen ob außerhalb des Bildschirms
        if (this.x + this.width < -50) {
            this.destroy();
        }
    }

    // Spezielle Bewegungen (z.B. Vogel-Flug)
    updateSpecialMovement(deltaTime) {
        switch (this.type) {
            case 'bird':
                // Schwebende Bewegung
                const time = performance.now() * this.floatSpeed + this.floatOffset;
                this.y = this.originalY + Math.sin(time) * this.floatAmplitude;
                break;
                
            case 'dog-small':
            case 'dog-large':
                // Leichte Hüpf-Bewegung beim Laufen
                const walkTime = performance.now() * 0.01;
                this.y = this.originalY + Math.sin(walkTime) * 2;
                break;
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
        if (!this.isActive || !player.isAlive) return false;

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
                console.log(`CSS-Position: Sprung ${(jumpProgress*100).toFixed(1)}%, Y-Offset=${yOffset.toFixed(1)}, Actual Y=${actualPlayerY.toFixed(1)}`);
            }
        }

        // Sehr kleine Kollisions-Boxen - nur der absolute Kern
        const obstacleLeft = this.x + (this.width * 0.4);  // 40% vom linken Rand
        const obstacleRight = this.x + (this.width * 0.6);  // 60% vom linken Rand (nur 20% Breite)
        const playerLeft = player.x + (player.width * 0.4);  // 40% vom linken Rand der Katze
        const playerRight = player.x + (player.width * 0.6);  // 60% vom linken Rand (nur 20% Breite)
        
        // X-Überlappung prüfen - nur der absolute Kern
        const xOverlap = obstacleLeft < playerRight && obstacleRight > playerLeft;
        
        if (!xOverlap) {
            return false; // Keine X-Überlappung
        }
        
        // Debug: Zeige winzige Kollisions-Boxen
        console.log(`TINY-Check: Obstacle [${obstacleLeft.toFixed(1)}-${obstacleRight.toFixed(1)}], Player [${playerLeft.toFixed(1)}-${playerRight.toFixed(1)}]`);
        console.log(`Distance: ${Math.abs(this.x - player.x).toFixed(1)}px`);
        
        // Y-Kollision prüfen - Katze muss wirklich das Hindernis berühren
        if (this.type !== 'bird') {
            // Für Bodenhindernisse: Prüfen ob Katze über dem Hindernis ist
            const obstacleTop = this.y + this.height;
            const playerBottom = actualPlayerY; // Verwende tatsächliche CSS-Position!
            
            console.log(`Y-Check für ${this.type}: CSS-Katze Y=${playerBottom.toFixed(1)}, JS-Katze Y=${player.y}, Hindernis Top=${obstacleTop.toFixed(1)}`);
            
            // Wenn die Unterseite der Katze über der Oberseite des Hindernisses ist
            if (playerBottom > obstacleTop + 10) {
                console.log(`Keine Kollision: CSS-Katze springt über Hindernis (CSS Y=${playerBottom.toFixed(1)}, Hindernis Top=${obstacleTop.toFixed(1)})`);
                return false; // Katze springt über das Hindernis
            } else {
                console.log(`Y-Kollision möglich: CSS-Katze Y=${playerBottom.toFixed(1)} <= Hindernis Top=${obstacleTop.toFixed(1)}+10`);
            }
        }
        
        // Für Vögel: Kollision nur wenn Katze hoch genug ist
        if (this.type === 'bird') {
            // Verwende die tatsächliche CSS-Position für Vogel-Kollision
            if (actualPlayerY < this.y - 20) {
                console.log(`Keine Kollision: Katze zu niedrig für Vogel (CSS Y=${actualPlayerY.toFixed(1)}, Vogel Y=${this.y})`);
                return false; // Katze ist zu niedrig für Vogel-Kollision
            }
        }
        
        console.log(`ECHTE KOLLISION: ${this.type} bei X=${this.x.toFixed(1)}, Player bei X=${player.x}, Abstand=${Math.abs(this.x - player.x).toFixed(1)}px`);
        return true;
    }

    // Hindernis zerstören
    destroy() {
        this.isActive = false;
        
        if (this.element) {
            // Zerstörungs-Animation
            AnimationUtils.addAnimation(this.element, 'slideOutToLeft 0.3s ease-in', '0.3s', () => {
                if (this.element && this.element.parentNode) {
                    this.element.parentNode.removeChild(this.element);
                }
            });
        }
    }

    // Hindernis wurde übersprungen
    onPassed() {
        // Punkte vergeben - Zugriff über globalen GameManager
        if (window.gameManager) {
            window.gameManager.addScore(this.points);
            console.log(`Punkte vergeben: +${this.points} (Gesamt: ${window.gameManager.score})`);
        }
        
        window.audioManager.playScoreSound();
    }

    // Debug-Informationen
    getDebugInfo() {
        return {
            type: this.type,
            position: { x: this.x, y: this.y },
            size: { width: this.width, height: this.height },
            isActive: this.isActive,
            collisionBox: this.getCollisionBox()
        };
    }
}

// Hindernisse-Manager
class ObstacleManager {
    constructor(gameWorld) {
        this.gameWorld = gameWorld;
        this.obstacles = [];
        this.spawnTimer = 0;
        this.spawnInterval = 2000; // 2 Sekunden
        this.minSpawnInterval = 800; // Minimum 0.8 Sekunden
        this.maxSpawnInterval = 3000; // Maximum 3 Sekunden
        this.gameSpeed = 1;
        this.difficulty = 1;
        
        // Spawn-Wahrscheinlichkeiten
        this.spawnProbabilities = {
            'dog-small': 0.4,
            'dog-large': 0.3,
            'bird': 0.2,
            'crate': 0.1
        };
    }

    // Update-Schleife
    update(deltaTime, gameSpeed, difficulty) {
        this.gameSpeed = gameSpeed;
        this.difficulty = difficulty;
        
        // Spawn-Timer aktualisieren
        this.spawnTimer += deltaTime;
        
        // Neues Hindernis spawnen
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnObstacle();
            this.spawnTimer = 0;
            this.updateSpawnInterval();
        }
        
        // Alle Hindernisse aktualisieren
        this.obstacles.forEach(obstacle => {
            obstacle.update(deltaTime, gameSpeed);
        });
        
        // Inaktive Hindernisse entfernen
        this.obstacles = this.obstacles.filter(obstacle => obstacle.isActive);
    }

    // Hindernis spawnen
    spawnObstacle() {
        const screenWidth = window.innerWidth;
        const spawnX = screenWidth + 50;
        
        // Zufälligen Hindernis-Typ wählen
        const obstacleType = this.getRandomObstacleType();
        
        // Prüfen ob genug Platz zum letzten Hindernis
        const lastObstacle = this.obstacles[this.obstacles.length - 1];
        if (lastObstacle && (spawnX - lastObstacle.x) < 200) {
            return; // Zu nah, nicht spawnen
        }
        
        const obstacle = new Obstacle(obstacleType, spawnX, this.gameWorld);
        this.obstacles.push(obstacle);
    }

    // Zufälligen Hindernis-Typ basierend auf Wahrscheinlichkeiten wählen
    getRandomObstacleType() {
        const random = Math.random();
        let cumulative = 0;
        
        for (const [type, probability] of Object.entries(this.spawnProbabilities)) {
            cumulative += probability;
            if (random <= cumulative) {
                return type;
            }
        }
        
        return 'dog-small'; // Fallback
    }

    // Spawn-Intervall basierend auf Schwierigkeit aktualisieren
    updateSpawnInterval() {
        const baseInterval = 2000;
        const difficultyFactor = Math.max(0.3, 1 - (this.difficulty - 1) * 0.1);
        
        this.spawnInterval = MathUtils.clamp(
            baseInterval * difficultyFactor,
            this.minSpawnInterval,
            this.maxSpawnInterval
        );
        
        // Zufällige Variation hinzufügen
        const variation = MathUtils.random(0.8, 1.2);
        this.spawnInterval *= variation;
    }

    // Kollisionen mit Spieler prüfen
    checkCollisions(player) {
        for (const obstacle of this.obstacles) {
            if (obstacle.checkCollisionWithPlayer(player)) {
                return obstacle;
            }
        }
        return null;
    }

    // Übersprungene Hindernisse prüfen
    checkPassedObstacles(player) {
        this.obstacles.forEach(obstacle => {
            if (obstacle.isActive && obstacle.x + obstacle.width < player.x && !obstacle.passed) {
                obstacle.passed = true;
                obstacle.onPassed();
            }
        });
    }

    // Schwierigkeit erhöhen
    increaseDifficulty() {
        this.difficulty++;
        
        // Spawn-Wahrscheinlichkeiten anpassen
        if (this.difficulty > 3) {
            this.spawnProbabilities['dog-large'] += 0.1;
            this.spawnProbabilities['bird'] += 0.05;
            this.spawnProbabilities['dog-small'] -= 0.15;
        }
        
        if (this.difficulty > 5) {
            this.spawnProbabilities['crate'] += 0.1;
            this.spawnProbabilities['dog-small'] -= 0.1;
        }
    }

    // Alle Hindernisse entfernen
    clearAll() {
        this.obstacles.forEach(obstacle => {
            obstacle.destroy();
        });
        this.obstacles = [];
        this.spawnTimer = 0;
    }

    // Reset für neues Spiel
    reset() {
        this.clearAll();
        this.difficulty = 1;
        this.spawnInterval = 2000;
        
        // Spawn-Wahrscheinlichkeiten zurücksetzen
        this.spawnProbabilities = {
            'dog-small': 0.4,
            'dog-large': 0.3,
            'bird': 0.2,
            'crate': 0.1
        };
    }

    // Debug-Informationen
    getDebugInfo() {
        return {
            obstacleCount: this.obstacles.length,
            spawnTimer: Math.round(this.spawnTimer),
            spawnInterval: Math.round(this.spawnInterval),
            difficulty: this.difficulty,
            spawnProbabilities: this.spawnProbabilities,
            obstacles: this.obstacles.map(obstacle => obstacle.getDebugInfo())
        };
    }
}

// CSS für Vogel-Flügel-Animation hinzufügen
const style = document.createElement('style');
style.textContent = `
    @keyframes wingFlap {
        0%, 100% { transform: scaleY(1); }
        50% { transform: scaleY(0.3); }
    }
`;
document.head.appendChild(style);

// Export für andere Module
window.Obstacle = Obstacle;
window.ObstacleManager = ObstacleManager;