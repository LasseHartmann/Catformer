// Utility-Funktionen für das Katzen-Sprungspiel

/**
 * Hilfsfunktionen für DOM-Manipulation
 */
const Utils = {
    // Element-Selektor mit Fehlerbehandlung
    $(selector) {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`Element nicht gefunden: ${selector}`);
        }
        return element;
    },

    // Mehrere Elemente selektieren
    $$(selector) {
        return document.querySelectorAll(selector);
    },

    // Element erstellen mit Attributen und Klassen
    createElement(tag, attributes = {}, classes = []) {
        const element = document.createElement(tag);
        
        // Attribute setzen
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        
        // Klassen hinzufügen
        if (classes.length > 0) {
            element.classList.add(...classes);
        }
        
        return element;
    },

    // Klasse sicher hinzufügen/entfernen
    toggleClass(element, className, condition) {
        if (!element) return;
        
        if (condition === undefined) {
            element.classList.toggle(className);
        } else {
            element.classList.toggle(className, condition);
        }
    },

    // CSS-Eigenschaft setzen
    setStyle(element, property, value) {
        if (element && element.style) {
            element.style[property] = value;
        }
    },

    // Mehrere CSS-Eigenschaften setzen
    setStyles(element, styles) {
        if (!element || !element.style) return;
        
        Object.entries(styles).forEach(([property, value]) => {
            element.style[property] = value;
        });
    }
};

/**
 * Mathematische Hilfsfunktionen
 */
const MathUtils = {
    // Zufallszahl zwischen min und max
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    // Zufällige ganze Zahl zwischen min und max
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Wert zwischen min und max begrenzen
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    // Lineare Interpolation
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    },

    // Distanz zwischen zwei Punkten
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    // Kollisionserkennung zwischen Rechtecken
    rectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },

    // Kollisionserkennung zwischen Kreisen
    circleCollision(circle1, circle2) {
        const distance = this.distance(
            circle1.x, circle1.y,
            circle2.x, circle2.y
        );
        return distance < circle1.radius + circle2.radius;
    }
};

/**
 * Animation-Hilfsfunktionen
 */
const AnimationUtils = {
    // Easing-Funktionen
    easing: {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        bounce: t => {
            if (t < 1/2.75) {
                return 7.5625 * t * t;
            } else if (t < 2/2.75) {
                return 7.5625 * (t -= 1.5/2.75) * t + 0.75;
            } else if (t < 2.5/2.75) {
                return 7.5625 * (t -= 2.25/2.75) * t + 0.9375;
            } else {
                return 7.5625 * (t -= 2.625/2.75) * t + 0.984375;
            }
        }
    },

    // Animierte Wert-Änderung
    animate(from, to, duration, easingFunc, callback, onComplete) {
        const startTime = performance.now();
        const easing = this.easing[easingFunc] || this.easing.linear;

        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easing(progress);
            const currentValue = MathUtils.lerp(from, to, easedProgress);

            callback(currentValue, progress);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else if (onComplete) {
                onComplete();
            }
        };

        requestAnimationFrame(step);
    },

    // CSS-Animation hinzufügen
    addAnimation(element, animationName, duration = '1s', onComplete) {
        if (!element) return;

        element.style.animation = `${animationName} ${duration}`;
        
        if (onComplete) {
            const handleAnimationEnd = () => {
                element.removeEventListener('animationend', handleAnimationEnd);
                element.style.animation = '';
                onComplete();
            };
            element.addEventListener('animationend', handleAnimationEnd);
        }
    }
};

/**
 * LocalStorage-Hilfsfunktionen
 */
const StorageUtils = {
    // Wert speichern
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn('LocalStorage nicht verfügbar:', error);
            return false;
        }
    },

    // Wert laden
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Fehler beim Laden aus LocalStorage:', error);
            return defaultValue;
        }
    },

    // Wert entfernen
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn('Fehler beim Entfernen aus LocalStorage:', error);
            return false;
        }
    },

    // Alle Werte löschen
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.warn('Fehler beim Löschen des LocalStorage:', error);
            return false;
        }
    }
};

/**
 * Performance-Hilfsfunktionen
 */
const PerformanceUtils = {
    // FPS-Zähler
    fps: {
        frames: 0,
        lastTime: performance.now(),
        current: 0,
        
        update() {
            this.frames++;
            const now = performance.now();
            
            if (now - this.lastTime >= 1000) {
                this.current = Math.round((this.frames * 1000) / (now - this.lastTime));
                this.frames = 0;
                this.lastTime = now;
            }
        },
        
        get() {
            return this.current;
        }
    },

    // Throttle-Funktion
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Debounce-Funktion
    debounce(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
};

/**
 * Device-Detection
 */
const DeviceUtils = {
    // Touch-Gerät erkennen
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    // Mobile-Gerät erkennen
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    // Bildschirmgröße kategorisieren
    getScreenSize() {
        const width = window.innerWidth;
        
        if (width < 568) return 'mobile-small';
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        if (width < 1200) return 'desktop-small';
        return 'desktop';
    },

    // Orientierung erkennen
    getOrientation() {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }
};

/**
 * Event-Hilfsfunktionen
 */
const EventUtils = {
    // Event-Listener mit automatischer Cleanup
    addListener(element, event, handler, options = {}) {
        if (!element) return null;
        
        element.addEventListener(event, handler, options);
        
        // Cleanup-Funktion zurückgeben
        return () => {
            element.removeEventListener(event, handler, options);
        };
    },

    // Mehrere Event-Listener hinzufügen
    addListeners(element, events) {
        const cleanupFunctions = [];
        
        Object.entries(events).forEach(([event, handler]) => {
            const cleanup = this.addListener(element, event, handler);
            if (cleanup) cleanupFunctions.push(cleanup);
        });
        
        // Alle Cleanup-Funktionen zurückgeben
        return () => {
            cleanupFunctions.forEach(cleanup => cleanup());
        };
    },

    // Custom Event erstellen und dispatchen
    dispatch(element, eventName, detail = {}) {
        if (!element) return;
        
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });
        
        element.dispatchEvent(event);
    }
};

/**
 * Formatierungs-Hilfsfunktionen
 */
const FormatUtils = {
    // Zahl mit führenden Nullen
    padNumber(num, length = 2) {
        return num.toString().padStart(length, '0');
    },

    // Score formatieren
    formatScore(score) {
        return score.toLocaleString('de-DE');
    },

    // Zeit formatieren (Sekunden zu MM:SS)
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${this.padNumber(minutes)}:${this.padNumber(remainingSeconds)}`;
    },

    // Große Zahlen abkürzen (1000 -> 1K)
    abbreviateNumber(num) {
        if (num < 1000) return num.toString();
        if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
        if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
        return (num / 1000000000).toFixed(1) + 'B';
    }
};

// Globale Hilfsfunktionen exportieren
window.Utils = Utils;
window.MathUtils = MathUtils;
window.AnimationUtils = AnimationUtils;
window.StorageUtils = StorageUtils;
window.PerformanceUtils = PerformanceUtils;
window.DeviceUtils = DeviceUtils;
window.EventUtils = EventUtils;
window.FormatUtils = FormatUtils;