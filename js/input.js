// Input-Management für Tastatur und Touch-Steuerung

class InputManager {
    constructor() {
        this.keys = {};
        this.touches = {};
        this.callbacks = {};
        this.enabled = true;
        this.touchStartTime = 0;
        this.lastTouchEnd = 0;
        
        this.init();
    }

    // Input-System initialisieren
    init() {
        this.setupKeyboardEvents();
        this.setupTouchEvents();
        this.setupMouseEvents();
        this.setupGamepadEvents();
        
        // Verhindere Standard-Verhalten für bestimmte Tasten
        this.preventDefaultKeys = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    }

    // Tastatur-Events einrichten
    setupKeyboardEvents() {
        const handleKeyDown = (event) => {
            if (!this.enabled) return;
            
            const keyCode = event.code;
            const keyValue = event.key;
            
            // Verhindere Standard-Verhalten für Spiel-Tasten
            if (this.preventDefaultKeys.includes(keyCode) || this.preventDefaultKeys.includes(keyValue)) {
                event.preventDefault();
            }
            
            // Verwende primär event.code, fallback auf event.key
            const primaryKey = keyCode || keyValue;
            
            // Taste als gedrückt markieren - verwende beide Keys für bessere Kompatibilität
            const keyEntries = [keyCode, keyValue].filter(k => k);
            
            keyEntries.forEach(key => {
                if (!this.keys[key]) {
                    this.keys[key] = {
                        pressed: true,
                        justPressed: true,
                        timestamp: performance.now(),
                        code: keyCode,
                        key: keyValue
                    };
                }
            });
            
            this.triggerCallback('keydown', { key: primaryKey, code: keyCode, keyValue, event });
            
            // Spezielle Behandlung für Sprung-Tasten - prüfe beide Werte
            if (this.isJumpKey(keyCode) || this.isJumpKey(keyValue)) {
                this.triggerCallback('jump', { source: 'keyboard', key: primaryKey, code: keyCode, keyValue, event });
            }
        };

        const handleKeyUp = (event) => {
            if (!this.enabled) return;
            
            const keyCode = event.code;
            const keyValue = event.key;
            const keyEntries = [keyCode, keyValue].filter(k => k);
            
            keyEntries.forEach(key => {
                if (this.keys[key]) {
                    this.keys[key].pressed = false;
                    this.keys[key].justReleased = true;
                }
            });
            
            this.triggerCallback('keyup', { key: keyCode || keyValue, code: keyCode, keyValue, event });
        };

        // Event-Listener auf mehrere Targets setzen für bessere Kompatibilität
        document.addEventListener('keydown', handleKeyDown, true);
        document.addEventListener('keyup', handleKeyUp, true);
        window.addEventListener('keydown', handleKeyDown, true);
        window.addEventListener('keyup', handleKeyUp, true);
        
        // Fokus sicherstellen
        document.addEventListener('click', () => {
            document.body.focus();
        });
        
        // Tabindex setzen um Fokus zu ermöglichen
        if (!document.body.hasAttribute('tabindex')) {
            document.body.setAttribute('tabindex', '0');
        }
        document.body.focus();
    }

    // Touch-Events einrichten
    setupTouchEvents() {
        // Touch Start
        document.addEventListener('touchstart', (event) => {
            if (!this.enabled) return;
            
            event.preventDefault(); // Verhindere Scrollen etc.
            
            this.touchStartTime = performance.now();
            
            Array.from(event.changedTouches).forEach(touch => {
                this.touches[touch.identifier] = {
                    startX: touch.clientX,
                    startY: touch.clientY,
                    currentX: touch.clientX,
                    currentY: touch.clientY,
                    startTime: this.touchStartTime,
                    active: true
                };
            });
            
            this.triggerCallback('touchstart', { 
                touches: event.touches, 
                changedTouches: event.changedTouches,
                event 
            });
            
            // Sprung bei Touch
            this.triggerCallback('jump', { 
                source: 'touch', 
                x: event.changedTouches[0].clientX,
                y: event.changedTouches[0].clientY,
                event 
            });
        }, { passive: false });

        // Touch Move
        document.addEventListener('touchmove', (event) => {
            if (!this.enabled) return;
            
            event.preventDefault();
            
            Array.from(event.changedTouches).forEach(touch => {
                if (this.touches[touch.identifier]) {
                    this.touches[touch.identifier].currentX = touch.clientX;
                    this.touches[touch.identifier].currentY = touch.clientY;
                }
            });
            
            this.triggerCallback('touchmove', { 
                touches: event.touches, 
                changedTouches: event.changedTouches,
                event 
            });
        }, { passive: false });

        // Touch End
        document.addEventListener('touchend', (event) => {
            if (!this.enabled) return;
            
            const now = performance.now();
            this.lastTouchEnd = now;
            
            Array.from(event.changedTouches).forEach(touch => {
                const touchData = this.touches[touch.identifier];
                if (touchData) {
                    touchData.active = false;
                    touchData.endTime = now;
                    touchData.duration = now - touchData.startTime;
                    
                    // Berechne Swipe-Richtung und -Geschwindigkeit
                    const deltaX = touch.clientX - touchData.startX;
                    const deltaY = touch.clientY - touchData.startY;
                    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                    const velocity = distance / touchData.duration;
                    
                    // Swipe-Erkennung
                    if (distance > 30 && velocity > 0.1) {
                        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
                        let direction = 'none';
                        
                        if (angle > -45 && angle <= 45) direction = 'right';
                        else if (angle > 45 && angle <= 135) direction = 'down';
                        else if (angle > 135 || angle <= -135) direction = 'left';
                        else if (angle > -135 && angle <= -45) direction = 'up';
                        
                        this.triggerCallback('swipe', {
                            direction,
                            distance,
                            velocity,
                            deltaX,
                            deltaY,
                            duration: touchData.duration
                        });
                    }
                    
                    // Cleanup nach kurzer Zeit
                    setTimeout(() => {
                        delete this.touches[touch.identifier];
                    }, 100);
                }
            });
            
            this.triggerCallback('touchend', { 
                touches: event.touches, 
                changedTouches: event.changedTouches,
                event 
            });
        });

        // Touch Cancel
        document.addEventListener('touchcancel', (event) => {
            Array.from(event.changedTouches).forEach(touch => {
                delete this.touches[touch.identifier];
            });
        });
    }

    // Maus-Events einrichten
    setupMouseEvents() {
        document.addEventListener('mousedown', (event) => {
            if (!this.enabled) return;
            
            // Nur linke Maustaste
            if (event.button === 0) {
                this.triggerCallback('mousedown', { event });
                this.triggerCallback('jump', { 
                    source: 'mouse', 
                    x: event.clientX,
                    y: event.clientY,
                    event 
                });
            }
        });

        document.addEventListener('mouseup', (event) => {
            if (!this.enabled) return;
            
            if (event.button === 0) {
                this.triggerCallback('mouseup', { event });
            }
        });

        // Verhindere Kontext-Menü
        document.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }

    // Gamepad-Events einrichten (optional)
    setupGamepadEvents() {
        let gamepadIndex = -1;
        
        window.addEventListener('gamepadconnected', (event) => {
            gamepadIndex = event.gamepad.index;
            console.log('Gamepad verbunden:', event.gamepad.id);
        });

        window.addEventListener('gamepaddisconnected', (event) => {
            if (event.gamepad.index === gamepadIndex) {
                gamepadIndex = -1;
            }
            console.log('Gamepad getrennt:', event.gamepad.id);
        });

        // Gamepad-Polling (falls verbunden)
        const pollGamepad = () => {
            if (gamepadIndex >= 0) {
                const gamepad = navigator.getGamepads()[gamepadIndex];
                if (gamepad) {
                    // A-Button (Index 0) für Sprung
                    if (gamepad.buttons[0].pressed) {
                        this.triggerCallback('jump', { 
                            source: 'gamepad', 
                            button: 0 
                        });
                    }
                }
            }
            requestAnimationFrame(pollGamepad);
        };
        
        pollGamepad();
    }

    // Prüfen ob eine Taste eine Sprung-Taste ist
    isJumpKey(key) {
        const jumpKeys = [
            // Key codes
            'Space', 'ArrowUp', 'KeyW', 'KeyZ', 'Enter', 'NumpadEnter',
            // Key values (fallback)
            ' ', 'ArrowUp', 'w', 'W', 'z', 'Z', 'Enter'
        ];
        return jumpKeys.includes(key);
    }

    // Callback registrieren
    on(event, callback) {
        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        this.callbacks[event].push(callback);
        
        // Cleanup-Funktion zurückgeben
        return () => {
            this.off(event, callback);
        };
    }

    // Callback entfernen
    off(event, callback) {
        if (this.callbacks[event]) {
            const index = this.callbacks[event].indexOf(callback);
            if (index > -1) {
                this.callbacks[event].splice(index, 1);
            }
        }
    }

    // Callback auslösen
    triggerCallback(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Fehler in ${event} callback:`, error);
                }
            });
        }
    }

    // Taste gedrückt prüfen
    isKeyPressed(key) {
        return this.keys[key] && this.keys[key].pressed;
    }

    // Taste gerade gedrückt prüfen
    isKeyJustPressed(key) {
        return this.keys[key] && this.keys[key].justPressed;
    }

    // Taste gerade losgelassen prüfen
    isKeyJustReleased(key) {
        return this.keys[key] && this.keys[key].justReleased;
    }

    // Aktive Touches abrufen
    getActiveTouches() {
        return Object.values(this.touches).filter(touch => touch.active);
    }

    // Touch-Anzahl abrufen
    getTouchCount() {
        return this.getActiveTouches().length;
    }

    // Input aktivieren/deaktivieren
    setEnabled(enabled) {
        this.enabled = enabled;
        
        if (!enabled) {
            // Alle aktiven Inputs zurücksetzen
            this.keys = {};
            this.touches = {};
        }
    }

    // Frame-Update (sollte in der Spielschleife aufgerufen werden)
    update() {
        // Zurücksetzen der "just pressed/released" Flags
        Object.values(this.keys).forEach(keyData => {
            keyData.justPressed = false;
            keyData.justReleased = false;
        });
        
        // Alte Touch-Daten aufräumen
        const now = performance.now();
        Object.keys(this.touches).forEach(id => {
            const touch = this.touches[id];
            if (!touch.active && touch.endTime && (now - touch.endTime) > 1000) {
                delete this.touches[id];
            }
        });
    }

    // Vibration (falls unterstützt)
    vibrate(pattern = [100]) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    // Debug-Informationen
    getDebugInfo() {
        return {
            enabled: this.enabled,
            activeKeys: Object.keys(this.keys).filter(key => this.keys[key].pressed),
            activeTouches: this.getActiveTouches().length,
            callbacks: Object.keys(this.callbacks).map(event => ({
                event,
                count: this.callbacks[event].length
            }))
        };
    }

    // Cleanup
    cleanup() {
        this.keys = {};
        this.touches = {};
        this.callbacks = {};
        this.enabled = false;
    }
}

// Spezielle Input-Handler für das Spiel
class GameInputHandler {
    constructor(inputManager) {
        this.inputManager = inputManager;
        this.jumpCooldown = 0;
        this.jumpCooldownTime = 100; // ms
        this.callbacks = {};
        
        this.setupGameCallbacks();
    }

    setupGameCallbacks() {
        // Sprung-Handler mit Cooldown
        this.inputManager.on('jump', (data) => {
            const now = performance.now();
            
            if (now - this.jumpCooldown > this.jumpCooldownTime) {
                this.jumpCooldown = now;
                this.triggerCallback('jump', data);
                
                // Vibration bei Touch
                if (data.source === 'touch') {
                    this.inputManager.vibrate([50]);
                }
            }
        });

        // Pause-Handler
        this.inputManager.on('keydown', (data) => {
            if (data.key === 'Escape' || data.key === 'KeyP') {
                this.triggerCallback('pause');
            }
        });

        // Swipe-Handler
        this.inputManager.on('swipe', (data) => {
            if (data.direction === 'up') {
                this.triggerCallback('jump', { source: 'swipe', ...data });
            } else if (data.direction === 'down') {
                this.triggerCallback('duck', data);
            }
        });
    }

    // Callback registrieren
    on(event, callback) {
        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        this.callbacks[event].push(callback);
        
        return () => {
            this.off(event, callback);
        };
    }

    // Callback entfernen
    off(event, callback) {
        if (this.callbacks[event]) {
            const index = this.callbacks[event].indexOf(callback);
            if (index > -1) {
                this.callbacks[event].splice(index, 1);
            }
        }
    }

    // Callback auslösen
    triggerCallback(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Fehler in Game ${event} callback:`, error);
                }
            });
        }
    }

    // Update
    update() {
        this.inputManager.update();
    }

    // Cleanup
    cleanup() {
        this.callbacks = {};
    }
}

// Globale Input-Manager Instanzen
window.inputManager = new InputManager();
window.gameInputHandler = new GameInputHandler(window.inputManager);