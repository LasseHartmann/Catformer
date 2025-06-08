# 🐱 Katzen-Sprungspiel

Ein unterhaltsames Browser-Spiel im Chrome Dino-Stil, bei dem eine laufende Katze über Hunde springt!

## 🎮 Spielbeschreibung

Helfen Sie der Katze dabei, über verschiedene Hindernisse zu springen und Power-ups zu sammeln. Das Spiel bietet:

- **Automatisches Laufen**: Die Katze läuft kontinuierlich nach rechts
- **Sprung-Mechanik**: Springen Sie mit Leertaste, Mausklick oder Touch
- **Power-ups**: Sammeln Sie verschiedene Power-ups für besondere Fähigkeiten
- **Verschiedene Hindernisse**: Hunde, Vögel und Kisten
- **Wechselnde Umgebungen**: 5 verschiedene Hintergrund-Themes
- **Responsive Design**: Funktioniert auf Desktop und Mobile

## 🎵 Audio-Features

Das Spiel verfügt über ein intelligentes Audio-System:

### Hintergrundmusik
- **MP3-Unterstützung**: Verwendet die Datei `assets/Chrome Dino Cats Adventure.mp3` als Hintergrundmusik
- **Automatisches Fallback**: Falls die MP3-Datei nicht geladen werden kann (z.B. bei lokalen Dateien), wechselt das System automatisch zu synthetischer Musik
- **Web Audio API**: Alle Sound-Effekte werden mit der Web Audio API generiert

### Sound-Effekte
- 🎵 Sprung-Sounds (normal und Doppelsprung)
- 🎵 Sammel-Sounds für Power-ups
- 🎵 Kollisions-Sounds
- 🎵 Level-Up Melodien
- 🎵 Power-up Aktivierungs-Sounds

## 🚀 Installation und Ausführung

### Lokale Ausführung
1. Laden Sie alle Dateien herunter
2. Öffnen Sie `index.html` in einem modernen Browser
3. Das Spiel startet automatisch mit synthetischer Hintergrundmusik

### Server-Ausführung (für MP3-Musik)
Um die MP3-Hintergrundmusik zu nutzen, starten Sie einen lokalen HTTP-Server:

```bash
# Mit Python 3
python -m http.server 8000

# Mit Node.js (npx)
npx http-server

# Mit PHP
php -S localhost:8000
```

Dann öffnen Sie `http://localhost:8000` in Ihrem Browser.

## 🎯 Steuerung

### Desktop
- **Leertaste**: Springen
- **Mausklick**: Springen
- **Escape/P**: Pause
- **Ctrl+Shift+D**: Debug-Panel (Development)

### Mobile
- **Bildschirm berühren**: Springen
- **Swipe nach oben**: Springen
- **Touch-Button**: Springen

## 🏆 Spielmechaniken

### Power-ups
- 🚀 **Doppelsprung** (blau): Ermöglicht einen zweiten Sprung in der Luft
- 🛡️ **Schild** (gold): Schutz vor einem Treffer
- ⚡ **Geschwindigkeit** (rot): Erhöht die Spielgeschwindigkeit
- 🧲 **Magnet** (grün): Zieht Power-ups automatisch an
- 🪙 **Münzen** (gold): Bonus-Punkte
- ❤️ **Extra Leben** (pink): Zusätzliches Leben

### Hindernisse
- 🐕 **Kleine Hunde**: Niedrige Hindernisse
- 🐕‍🦺 **Große Hunde**: Hohe Hindernisse
- 🐦 **Vögel**: Fliegende Hindernisse
- 📦 **Kisten**: Statische Hindernisse

### Umgebungen
Das Spiel wechselt automatisch zwischen 5 verschiedenen Themes:
- 🌳 **Park**: Grüne Landschaft mit Bäumen
- 🏙️ **Stadt**: Urbane Umgebung mit Gebäuden
- 🏖️ **Strand**: Küstenlandschaft
- 🌲 **Wald**: Dichte Waldlandschaft
- 🌙 **Nacht**: Dunkle Umgebung mit Sternen

## 🛠️ Technische Details

### Technologie-Stack
- **HTML5**: Struktur und Canvas
- **CSS3**: Styling und Animationen
- **Vanilla JavaScript**: Spiellogik
- **Web Audio API**: Audio-Management

### Browser-Kompatibilität
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

### Performance-Optimierungen
- CSS-basierte Grafiken (keine externen Bilddateien)
- Object Pooling für Hindernisse und Effekte
- Hardware-beschleunigte Animationen
- Responsive Design für verschiedene Bildschirmgrößen

## 📁 Projektstruktur

```
Spring Katze/
├── index.html                    # Haupt-HTML-Datei
├── assets/
│   └── Chrome Dino Cats Adventure.mp3  # Hintergrundmusik
├── css/
│   ├── styles.css               # Basis-Styles
│   ├── animations.css           # CSS-Animationen
│   ├── backgrounds.css          # Hintergrund-Themes
│   └── responsive.css           # Mobile-Optimierung
├── js/
│   ├── utils.js                 # Hilfsfunktionen
│   ├── audio.js                 # Audio-Management
│   ├── input.js                 # Eingabe-Handler
│   ├── player.js                # Spieler-Logik
│   ├── obstacles.js             # Hindernisse-System
│   ├── powerups.js              # Power-up-System
│   ├── background.js            # Hintergrund-Management
│   └── game.js                  # Haupt-Spiellogik
├── katzen-sprungspiel-plan.md   # Entwicklungsplan
└── README.md                    # Diese Datei
```

## 🎨 Features

### Visuelle Effekte
- Parallax-Scrolling mit mehreren Ebenen
- Smooth CSS-Animationen
- Partikel-Effekte bei Power-up-Sammlung
- Dynamische Hintergrund-Wechsel
- Responsive UI-Elemente

### Audio-System
- Intelligentes Fallback-System
- Lautstärke-Kontrolle
- Verschiedene Sound-Effekte für jede Aktion
- Hintergrundmusik mit Loop-Funktion

### Gameplay
- Progressives Schwierigkeitssystem
- Highscore-Speicherung (LocalStorage)
- Leben-System mit Unverwundbarkeit
- Level-System mit automatischer Steigerung

## 🐛 Bekannte Einschränkungen

- **CORS-Beschränkung**: MP3-Hintergrundmusik funktioniert nur über HTTP-Server, nicht bei lokalen Dateien
- **Browser-Autoplay**: Einige Browser blockieren automatische Audio-Wiedergabe
- **Touch-Latenz**: Minimale Verzögerung bei Touch-Eingaben auf älteren Geräten

## 🔧 Entwicklung

### Debug-Features
- Debug-Panel mit Ctrl+Shift+D
- Console-Logging für alle wichtigen Events
- Performance-Monitoring (FPS-Anzeige)
- Detaillierte Spiel-Zustandsinformationen

### Erweiterungsmöglichkeiten
- Neue Power-up-Typen hinzufügen
- Weitere Hindernistypen implementieren
- Zusätzliche Hintergrund-Themes erstellen
- Multiplayer-Funktionalität
- Achievements-System

## 📄 Lizenz

Dieses Projekt wurde als Demonstration moderner Web-Technologien erstellt.

## 🎉 Viel Spaß beim Spielen!

Helfen Sie der Katze dabei, so weit wie möglich zu laufen und den Highscore zu knacken!