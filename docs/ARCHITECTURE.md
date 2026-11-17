# Architektur

- `src/model/water.ts`: Rechenfunktionen und Zustandsklassifikation ohne UI-Abhängigkeiten.
- `src/model/water.test.ts`: physikalische Referenz- und Plausibilitätstests.
- `src/components/PhaseDiagram.tsx`: SVG-Darstellung, logarithmische Druckachse, Touch-/Pointer- und Tastatureingabe.
- `src/App.tsx`: Parameter, Animation, Szenarien und Wissensansicht.
- `src/styles.css`: responsives Layout, Fokuszustände und Reduced-Motion-Verhalten.
- `.github/workflows/deploy.yml`: Prüfung, Build und GitHub-Pages-Deployment.

Die Anwendung ist ein rein clientseitiges statisches Vite-Projekt. Es gibt kein Backend und keine Laufzeit-API.
