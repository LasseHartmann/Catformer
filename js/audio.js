// Audio-Management mit Web Audio API für das Katzen-Sprungspiel

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.7; // Erhöht für bessere Hörbarkeit
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.sounds = {};
        this.currentMusic = null;
        this.backgroundMusic = null;
        this.initialized = false;
        
        // Audio-Einstellungen aus LocalStorage laden
        this.loadSettings();
    }

    // Audio-Context initialisieren (muss durch Benutzerinteraktion ausgelöst werden)
    async initialize() {
        if (this.initialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Falls der AudioContext suspended ist, versuchen zu aktivieren
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            // Hintergrundmusik laden
            await this.loadBackgroundMusic();
            
            this.initialized = true;
            console.log('Audio-System initialisiert');
        } catch (error) {
            console.warn('Audio-System konnte nicht initialisiert werden:', error);
        }
    }

    // Hintergrundmusik aus MP3-Datei laden
    async loadBackgroundMusic() {
        try {
            console.log('Versuche MP3-Hintergrundmusik zu laden...');
            const response = await fetch('assets/Chrome Dino Cats Adventure.mp3');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            console.log('MP3-Datei geladen, dekodiere Audio...');
            
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            this.backgroundMusicBuffer = audioBuffer;
            this.useMp3Background = true;
            console.log('MP3-Hintergrundmusik erfolgreich geladen und dekodiert');
        } catch (error) {
            console.warn('Hintergrundmusik konnte nicht geladen werden, verwende synthetische Musik:', error);
            this.useMp3Background = false;
        }
    }

    // Einstellungen laden
    loadSettings() {
        this.masterVolume = StorageUtils.get('audio_masterVolume', 0.3);
        this.soundEnabled = StorageUtils.get('audio_soundEnabled', true);
        this.musicEnabled = StorageUtils.get('audio_musicEnabled', true);
    }

    // Einstellungen speichern
    saveSettings() {
        StorageUtils.set('audio_masterVolume', this.masterVolume);
        StorageUtils.set('audio_soundEnabled', this.soundEnabled);
        StorageUtils.set('audio_musicEnabled', this.musicEnabled);
    }

    // Master-Lautstärke setzen
    setMasterVolume(volume) {
        this.masterVolume = MathUtils.clamp(volume, 0, 1);
        this.saveSettings();
    }

    // Sound ein/ausschalten
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.saveSettings();
        return this.soundEnabled;
    }

    // Musik ein/ausschalten
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (!this.musicEnabled && this.currentMusic) {
            this.stopMusic();
        }
        this.saveSettings();
        return this.musicEnabled;
    }

    // Basis-Oszillator erstellen
    createOscillator(frequency, type = 'sine') {
        if (!this.audioContext) return null;

        const oscillator = this.audioContext.createOscillator();
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        return oscillator;
    }

    // Gain-Node erstellen
    createGainNode(volume = 1) {
        if (!this.audioContext) return null;

        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(volume * this.masterVolume, this.audioContext.currentTime);
        return gainNode;
    }

    // Sprung-Sound
    playJumpSound() {
        if (!this.soundEnabled || !this.audioContext) return;

        const oscillator = this.createOscillator(300, 'sine');
        const gainNode = this.createGainNode(0.4);
        
        if (!oscillator || !gainNode) return;

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Frequenz-Sweep nach oben
        oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.15);
        
        // Volume-Envelope
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }

    // Doppelsprung-Sound
    playDoubleJumpSound() {
        if (!this.soundEnabled || !this.audioContext) return;

        // Erster Ton
        const osc1 = this.createOscillator(400, 'sine');
        const gain1 = this.createGainNode(0.3);
        
        if (osc1 && gain1) {
            osc1.connect(gain1);
            gain1.connect(this.audioContext.destination);
            
            osc1.frequency.exponentialRampToValueAtTime(700, this.audioContext.currentTime + 0.1);
            gain1.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            osc1.start(this.audioContext.currentTime);
            osc1.stop(this.audioContext.currentTime + 0.1);
        }

        // Zweiter Ton (verzögert)
        setTimeout(() => {
            const osc2 = this.createOscillator(500, 'sine');
            const gain2 = this.createGainNode(0.3);
            
            if (osc2 && gain2) {
                osc2.connect(gain2);
                gain2.connect(this.audioContext.destination);
                
                osc2.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
                gain2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                
                osc2.start(this.audioContext.currentTime);
                osc2.stop(this.audioContext.currentTime + 0.1);
            }
        }, 100);
    }

    // Power-up sammeln Sound
    playCollectSound() {
        if (!this.soundEnabled || !this.audioContext) return;

        const oscillator = this.createOscillator(800, 'sine');
        const gainNode = this.createGainNode(0.5);
        
        if (!oscillator || !gainNode) return;

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Melodischer Aufwärts-Sweep
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(1600, this.audioContext.currentTime + 0.2);

        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.25);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.25);
    }

    // Kollisions-Sound
    playHitSound() {
        if (!this.soundEnabled || !this.audioContext) return;

        const oscillator = this.createOscillator(150, 'sawtooth');
        const gainNode = this.createGainNode(0.6);
        
        if (!oscillator || !gainNode) return;

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Tiefer, rauer Ton mit Vibrato
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.3);

        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.4);
    }

    // Score-Erhöhung Sound
    playScoreSound() {
        if (!this.soundEnabled || !this.audioContext) return;

        const oscillator = this.createOscillator(600, 'triangle');
        const gainNode = this.createGainNode(0.3);
        
        if (!oscillator || !gainNode) return;

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Kurzer, heller Ton
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    // Level-Up Sound
    playLevelUpSound() {
        if (!this.soundEnabled || !this.audioContext) return;

        // Aufsteigende Tonfolge
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        
        notes.forEach((frequency, index) => {
            setTimeout(() => {
                const oscillator = this.createOscillator(frequency, 'sine');
                const gainNode = this.createGainNode(0.4);
                
                if (oscillator && gainNode) {
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.2);
                }
            }, index * 100);
        });
    }

    // Power-up Aktivierung Sound
    playPowerUpActivateSound(type) {
        if (!this.soundEnabled || !this.audioContext) return;

        let frequency, waveType;
        
        switch (type) {
            case 'jump':
                frequency = 400;
                waveType = 'sine';
                break;
            case 'shield':
                frequency = 300;
                waveType = 'triangle';
                break;
            case 'speed':
                frequency = 500;
                waveType = 'sawtooth';
                break;
            case 'magnet':
                frequency = 350;
                waveType = 'square';
                break;
            default:
                frequency = 400;
                waveType = 'sine';
        }

        const oscillator = this.createOscillator(frequency, waveType);
        const gainNode = this.createGainNode(0.4);
        
        if (!oscillator || !gainNode) return;

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Charakteristischer Sound für jeden Power-up-Typ
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, this.audioContext.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    // Hintergrundmusik (MP3-Datei oder synthetisch)
    playBackgroundMusic() {
        if (!this.musicEnabled || !this.audioContext) return;
        
        if (this.backgroundMusic || this.currentMusic) return; // Bereits aktiv

        if (this.useMp3Background && this.backgroundMusicBuffer) {
            // MP3-Hintergrundmusik verwenden
            this.playMp3BackgroundMusic();
        } else {
            // Synthetische Hintergrundmusik verwenden
            this.playSyntheticBackgroundMusic();
        }
    }

    // MP3-Hintergrundmusik abspielen
    playMp3BackgroundMusic() {
        try {
            console.log('Starte MP3-Hintergrundmusik...');
            
            // Prüfen ob AudioContext bereit ist
            if (this.audioContext.state === 'suspended') {
                console.log('AudioContext ist suspended, versuche zu aktivieren...');
                this.audioContext.resume().then(() => {
                    this.playMp3BackgroundMusic();
                });
                return;
            }
            
            // Audio-Source erstellen
            this.backgroundMusic = this.audioContext.createBufferSource();
            this.backgroundMusic.buffer = this.backgroundMusicBuffer;
            
            // Gain-Node für Lautstärke-Kontrolle
            const gainNode = this.createGainNode(0.5); // Deutlich lauter für bessere Hörbarkeit
            
            if (gainNode) {
                this.backgroundMusic.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
            } else {
                this.backgroundMusic.connect(this.audioContext.destination);
            }
            
            // Loop aktivieren
            this.backgroundMusic.loop = true;
            
            // Event-Listener für Ende (falls Loop nicht funktioniert)
            this.backgroundMusic.onended = () => {
                console.log('MP3-Musik beendet, starte neu...');
                if (this.musicEnabled) {
                    setTimeout(() => this.playMp3BackgroundMusic(), 100);
                }
            };
            
            // Musik starten
            this.backgroundMusic.start(0);
            
            console.log('MP3-Hintergrundmusik erfolgreich gestartet');
        } catch (error) {
            console.warn('Fehler beim Starten der MP3-Hintergrundmusik:', error);
            // Fallback zu synthetischer Musik
            this.playSyntheticBackgroundMusic();
        }
    }

    // Synthetische Hintergrundmusik abspielen
    playSyntheticBackgroundMusic() {
        this.currentMusic = {
            playing: true,
            timeoutId: null
        };

        // Einfache Melodie-Sequenz
        const melody = [
            { note: 523, duration: 0.5 }, // C5
            { note: 659, duration: 0.5 }, // E5
            { note: 784, duration: 0.5 }, // G5
            { note: 659, duration: 0.5 }, // E5
            { note: 523, duration: 0.5 }, // C5
            { note: 392, duration: 0.5 }, // G4
            { note: 523, duration: 1.0 }, // C5
            { note: 0, duration: 1.0 }    // Pause
        ];

        let currentNote = 0;

        const playNextNote = () => {
            if (!this.currentMusic || !this.currentMusic.playing) return;

            const note = melody[currentNote];
            
            if (note.note > 0) {
                const oscillator = this.createOscillator(note.note, 'sine');
                const gainNode = this.createGainNode(0.1); // Sehr leise Hintergrundmusik
                
                if (oscillator && gainNode) {
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + note.duration);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + note.duration);
                }
            }

            currentNote = (currentNote + 1) % melody.length;
            
            this.currentMusic.timeoutId = setTimeout(playNextNote, note.duration * 1000);
        };

        playNextNote();
        console.log('Synthetische Hintergrundmusik gestartet');
    }

    // Hintergrundmusik stoppen
    stopMusic() {
        // MP3-Hintergrundmusik stoppen
        if (this.backgroundMusic) {
            try {
                this.backgroundMusic.stop();
                this.backgroundMusic.disconnect();
                this.backgroundMusic = null;
                console.log('MP3-Hintergrundmusik gestoppt');
            } catch (error) {
                console.warn('Fehler beim Stoppen der MP3-Hintergrundmusik:', error);
                this.backgroundMusic = null;
            }
        }
        
        // Synthetische Hintergrundmusik stoppen
        if (this.currentMusic) {
            this.currentMusic.playing = false;
            if (this.currentMusic.timeoutId) {
                clearTimeout(this.currentMusic.timeoutId);
            }
            this.currentMusic = null;
            console.log('Synthetische Hintergrundmusik gestoppt');
        }
    }

    // Alle Sounds stoppen
    stopAllSounds() {
        this.stopMusic();
        
        if (this.audioContext) {
            // Alle aktiven Audio-Nodes stoppen
            try {
                this.audioContext.suspend();
                setTimeout(() => {
                    if (this.audioContext) {
                        this.audioContext.resume();
                    }
                }, 100);
            } catch (error) {
                console.warn('Fehler beim Stoppen der Sounds:', error);
            }
        }
    }

    // Audio-Context aufräumen
    cleanup() {
        this.stopAllSounds();
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.initialized = false;
    }

    // Debug-Informationen
    getDebugInfo() {
        return {
            initialized: this.initialized,
            contextState: this.audioContext ? this.audioContext.state : 'none',
            masterVolume: this.masterVolume,
            soundEnabled: this.soundEnabled,
            musicEnabled: this.musicEnabled,
            useMp3Background: this.useMp3Background,
            mp3MusicPlaying: this.backgroundMusic !== null,
            syntheticMusicPlaying: this.currentMusic ? this.currentMusic.playing : false,
            backgroundMusicLoaded: this.backgroundMusicBuffer !== undefined
        };
    }
}

// Globale Audio-Manager Instanz
window.audioManager = new AudioManager();

// Audio-System bei erster Benutzerinteraktion initialisieren
const initAudioOnInteraction = () => {
    window.audioManager.initialize();
    
    // Event-Listener entfernen nach Initialisierung
    document.removeEventListener('click', initAudioOnInteraction);
    document.removeEventListener('touchstart', initAudioOnInteraction);
    document.removeEventListener('keydown', initAudioOnInteraction);
};

// Event-Listener für verschiedene Interaktionstypen
document.addEventListener('click', initAudioOnInteraction);
document.addEventListener('touchstart', initAudioOnInteraction);
document.addEventListener('keydown', initAudioOnInteraction);