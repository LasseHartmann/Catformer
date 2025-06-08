// Hintergrund-Management für das Katzen-Sprungspiel

class BackgroundManager {
    constructor(gameWorld) {
        this.gameWorld = gameWorld;
        this.currentTheme = 'park';
        this.themes = ['park', 'city', 'beach', 'forest', 'night'];
        this.themeIndex = 0;
        this.themeChangeInterval = 30000; // 30 Sekunden
        this.themeChangeTimer = 0;
        this.isTransitioning = false;
        
        // Parallax-Ebenen
        this.layers = {
            layer1: Utils.$('#backgroundLayer1'),
            layer2: Utils.$('#backgroundLayer2'),
            layer3: Utils.$('#backgroundLayer3'),
            ground: Utils.$('#ground')
        };
        
        // Geschwindigkeiten für Parallax-Effekt
        this.layerSpeeds = {
            layer1: 0.2,
            layer2: 0.5,
            layer3: 0.8,
            ground: 1.0
        };
        
        // Wetter-Effekte
        this.weatherEffects = {
            rain: false,
            snow: false,
            wind: false
        };
        
        this.init();
    }

    // Initialisierung
    init() {
        this.setTheme(this.currentTheme);
        this.setupParallaxAnimations();
    }

    // Parallax-Animationen einrichten
    setupParallaxAnimations() {
        Object.keys(this.layers).forEach(layerName => {
            const layer = this.layers[layerName];
            if (layer) {
                const speed = this.layerSpeeds[layerName];
                const animationName = layerName === 'ground' ? 'moveGround' : `moveBackground${layerName.slice(-1)}`;
                
                // Animation-Dauer basierend auf Geschwindigkeit
                const duration = 20 / speed;
                layer.style.animationDuration = `${duration}s`;
                layer.style.animationName = animationName;
            }
        });
    }

    // Update-Schleife
    update(deltaTime, gameSpeed) {
        // Theme-Wechsel-Timer
        this.themeChangeTimer += deltaTime;
        
        if (this.themeChangeTimer >= this.themeChangeInterval && !this.isTransitioning) {
            this.changeToNextTheme();
            this.themeChangeTimer = 0;
        }
        
        // Parallax-Geschwindigkeit anpassen
        this.updateParallaxSpeed(gameSpeed);
        
        // Wetter-Effekte aktualisieren
        this.updateWeatherEffects(deltaTime);
    }

    // Parallax-Geschwindigkeit aktualisieren
    updateParallaxSpeed(gameSpeed) {
        Object.keys(this.layers).forEach(layerName => {
            const layer = this.layers[layerName];
            if (layer) {
                const baseSpeed = this.layerSpeeds[layerName];
                const adjustedSpeed = baseSpeed * gameSpeed;
                const duration = 20 / adjustedSpeed;
                
                layer.style.animationDuration = `${duration}s`;
            }
        });
    }

    // Theme setzen
    setTheme(themeName) {
        if (!this.themes.includes(themeName)) return;
        
        const gameScreen = Utils.$('#gameScreen');
        if (!gameScreen) return;
        
        // Alte Theme-Klassen entfernen
        this.themes.forEach(theme => {
            gameScreen.classList.remove(`background-${theme}`);
        });
        
        // Neue Theme-Klasse hinzufügen
        gameScreen.classList.add(`background-${themeName}`);
        this.currentTheme = themeName;
        
        // Theme-spezifische Einstellungen
        this.applyThemeSettings(themeName);
        
        // Wetter-Effekte für bestimmte Themes
        this.updateWeatherForTheme(themeName);
    }

    // Theme-spezifische Einstellungen anwenden
    applyThemeSettings(themeName) {
        switch (themeName) {
            case 'park':
                this.setWeather('clear');
                break;
                
            case 'city':
                this.setWeather('clear');
                this.addCityAmbience();
                break;
                
            case 'beach':
                this.setWeather('clear');
                this.addBeachAmbience();
                break;
                
            case 'forest':
                this.setWeather('clear');
                this.addForestAmbience();
                break;
                
            case 'night':
                this.setWeather('clear');
                this.addNightAmbience();
                break;
        }
    }

    // Wetter für Theme aktualisieren
    updateWeatherForTheme(themeName) {
        // Zufällige Wetter-Effekte für bestimmte Themes
        const weatherChance = Math.random();
        
        switch (themeName) {
            case 'city':
                if (weatherChance < 0.3) {
                    this.setWeather('rain');
                }
                break;
                
            case 'forest':
                if (weatherChance < 0.2) {
                    this.setWeather('rain');
                }
                break;
                
            case 'night':
                if (weatherChance < 0.1) {
                    this.setWeather('snow');
                }
                break;
        }
    }

    // Zum nächsten Theme wechseln
    changeToNextTheme() {
        this.themeIndex = (this.themeIndex + 1) % this.themes.length;
        const nextTheme = this.themes[this.themeIndex];
        
        this.transitionToTheme(nextTheme);
    }

    // Sanfter Übergang zu neuem Theme
    transitionToTheme(newTheme) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        const gameScreen = Utils.$('#gameScreen');
        
        if (gameScreen) {
            // Übergangs-Klasse hinzufügen
            gameScreen.classList.add('time-transition');
            
            // Theme nach kurzer Verzögerung wechseln
            setTimeout(() => {
                this.setTheme(newTheme);
                
                // Übergangs-Klasse nach Transition entfernen
                setTimeout(() => {
                    gameScreen.classList.remove('time-transition');
                    this.isTransitioning = false;
                }, 2000);
            }, 100);
        }
    }

    // Wetter setzen
    setWeather(weatherType) {
        const gameWorld = this.gameWorld;
        if (!gameWorld) return;
        
        // Alle Wetter-Klassen entfernen
        Object.keys(this.weatherEffects).forEach(weather => {
            gameWorld.classList.remove(`weather-${weather}`);
            this.weatherEffects[weather] = false;
        });
        
        // Neues Wetter setzen
        if (weatherType !== 'clear') {
            gameWorld.classList.add(`weather-${weatherType}`);
            this.weatherEffects[weatherType] = true;
        }
    }

    // Wetter-Effekte aktualisieren
    updateWeatherEffects(deltaTime) {
        // Hier könnten dynamische Wetter-Effekte implementiert werden
        // z.B. Regen-Intensität, Wind-Stärke, etc.
    }

    // Stadt-Ambiente hinzufügen
    addCityAmbience() {
        // Hier könnten Stadt-spezifische Effekte hinzugefügt werden
        // z.B. blinkende Lichter, Verkehrs-Sounds, etc.
    }

    // Strand-Ambiente hinzufügen
    addBeachAmbience() {
        // Hier könnten Strand-spezifische Effekte hinzugefügt werden
        // z.B. Wellen-Animation, Möwen-Sounds, etc.
    }

    // Wald-Ambiente hinzufügen
    addForestAmbience() {
        // Hier könnten Wald-spezifische Effekte hinzugefügt werden
        // z.B. Blätter-Rascheln, Vogel-Sounds, etc.
    }

    // Nacht-Ambiente hinzufügen
    addNightAmbience() {
        // Hier könnten Nacht-spezifische Effekte hinzugefügt werden
        // z.B. Sterne-Funkeln, Mond-Schein, etc.
        this.addStarTwinkle();
    }

    // Sterne-Funkeln-Effekt
    addStarTwinkle() {
        if (this.currentTheme !== 'night') return;
        
        const starCount = 20;
        const gameWorld = this.gameWorld;
        
        for (let i = 0; i < starCount; i++) {
            setTimeout(() => {
                const star = Utils.createElement('div', {}, ['star']);
                const x = MathUtils.random(0, window.innerWidth);
                const y = MathUtils.random(window.innerHeight * 0.1, window.innerHeight * 0.4);
                
                Utils.setStyles(star, {
                    position: 'absolute',
                    left: `${x}px`,
                    top: `${y}px`,
                    width: '2px',
                    height: '2px',
                    background: 'white',
                    borderRadius: '50%',
                    opacity: '0',
                    zIndex: '1',
                    pointerEvents: 'none'
                });
                
                gameWorld.appendChild(star);
                
                // Funkeln-Animation
                const twinkleDuration = MathUtils.random(2000, 4000);
                AnimationUtils.animate(0, 1, twinkleDuration, 'easeInOutQuad', (progress) => {
                    const opacity = Math.sin(progress * Math.PI * 4) * 0.8 + 0.2;
                    star.style.opacity = opacity;
                }, () => {
                    star.remove();
                });
                
            }, i * 200);
        }
    }

    // Partikel-Effekt erstellen (z.B. für Blätter, Schneeflocken)
    createParticleEffect(type, count = 10) {
        const gameWorld = this.gameWorld;
        if (!gameWorld) return;
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const particle = this.createParticle(type);
                gameWorld.appendChild(particle);
                this.animateParticle(particle, type);
            }, i * 100);
        }
    }

    // Einzelnes Partikel erstellen
    createParticle(type) {
        const particle = Utils.createElement('div', {}, ['particle', `particle-${type}`]);
        
        switch (type) {
            case 'leaf':
                Utils.setStyles(particle, {
                    width: '8px',
                    height: '12px',
                    background: 'green',
                    borderRadius: '0 100% 0 100%',
                    transform: 'rotate(45deg)'
                });
                break;
                
            case 'snowflake':
                Utils.setStyles(particle, {
                    width: '6px',
                    height: '6px',
                    background: 'white',
                    borderRadius: '50%'
                });
                break;
                
            case 'dust':
                Utils.setStyles(particle, {
                    width: '3px',
                    height: '3px',
                    background: 'rgba(139, 69, 19, 0.6)',
                    borderRadius: '50%'
                });
                break;
        }
        
        Utils.setStyles(particle, {
            position: 'absolute',
            top: '-20px',
            left: `${MathUtils.random(0, window.innerWidth)}px`,
            zIndex: '3',
            pointerEvents: 'none'
        });
        
        return particle;
    }

    // Partikel animieren
    animateParticle(particle, type) {
        const duration = MathUtils.random(3000, 6000);
        const endY = window.innerHeight + 50;
        const startX = parseFloat(particle.style.left);
        const drift = MathUtils.random(-50, 50);
        
        AnimationUtils.animate(0, 1, duration, 'linear', (progress) => {
            const y = progress * endY;
            const x = startX + Math.sin(progress * Math.PI * 4) * drift;
            const rotation = progress * 360;
            
            Utils.setStyles(particle, {
                top: `${y}px`,
                left: `${x}px`,
                transform: `rotate(${rotation}deg)`,
                opacity: 1 - progress * 0.3
            });
        }, () => {
            particle.remove();
        });
    }

    // Geschwindigkeits-Multiplikator setzen
    setSpeedMultiplier(multiplier) {
        Object.keys(this.layers).forEach(layerName => {
            const layer = this.layers[layerName];
            if (layer) {
                const baseSpeed = this.layerSpeeds[layerName];
                const adjustedSpeed = baseSpeed * multiplier;
                const duration = 20 / adjustedSpeed;
                
                layer.style.animationDuration = `${duration}s`;
            }
        });
    }

    // Theme manuell setzen (für Tests oder spezielle Events)
    forceTheme(themeName) {
        if (this.themes.includes(themeName)) {
            this.themeIndex = this.themes.indexOf(themeName);
            this.setTheme(themeName);
            this.themeChangeTimer = 0; // Timer zurücksetzen
        }
    }

    // Zufälliges Theme setzen
    setRandomTheme() {
        const randomIndex = MathUtils.randomInt(0, this.themes.length - 1);
        const randomTheme = this.themes[randomIndex];
        this.forceTheme(randomTheme);
    }

    // Reset für neues Spiel
    reset() {
        this.themeIndex = 0;
        this.themeChangeTimer = 0;
        this.isTransitioning = false;
        this.setTheme('park');
        this.setWeather('clear');
        this.setupParallaxAnimations();
    }

    // Debug-Informationen
    getDebugInfo() {
        return {
            currentTheme: this.currentTheme,
            themeIndex: this.themeIndex,
            themeChangeTimer: Math.round(this.themeChangeTimer),
            isTransitioning: this.isTransitioning,
            weatherEffects: this.weatherEffects,
            layerSpeeds: this.layerSpeeds
        };
    }

    // Cleanup
    cleanup() {
        // Alle Partikel und Effekte entfernen
        const particles = this.gameWorld.querySelectorAll('.particle, .star');
        particles.forEach(particle => particle.remove());
        
        // Wetter-Effekte entfernen
        this.setWeather('clear');
    }
}

// Export für andere Module
window.BackgroundManager = BackgroundManager;