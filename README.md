# Phasenlabor · Wasser

Ein interaktives, deutschsprachiges Lernexperiment zu den Aggregatzuständen von Wasser in Abhängigkeit von Temperatur und Druck. Die Anwendung läuft vollständig im Browser und ist für GitHub Pages vorbereitet.

## Funktionen

- Interaktives Druck-Temperatur-Phasendiagramm mit logarithmischer Druckachse
- Temperatur- und Druckregler mit numerischer Eingabe
- Zustandsauswahl durch Tippen, Klicken und Tastatur im Diagramm
- Erwärmung starten/pausieren, vier Geschwindigkeiten und Reset
- Szenarien für Eisfach, Raumtemperatur, Sieden, Hochgebirge, Tripel- und kritischen Punkt
- Messwertanzeige, Erklärbereich und transparente Modellgrenzen
- Responsive Oberfläche, Touch-/Pointerbedienung, Tastaturfokus und reduzierte Bewegung

## Technologien

React 19, TypeScript 5, Vite 8, Vitest 5, SVG und CSS. Kein Backend, keine Datenbank, keine externen Laufzeit-CDNs und kein Tracking.

## Entwicklung und Prüfung

Für die lokale Entwicklung werden Node.js 22 und npm benötigt:

```bash
npm install
npm run dev
```

Prüfungen:

```bash
npm run typecheck
npm test
npm run build
npm run preview
```

Die direkte Installation auf deinem eigenen Rechner ist für das GitHub-Pages-Deployment nicht erforderlich. Der GitHub-Actions-Workflow installiert die Abhängigkeiten in der CI-Umgebung. Es wird bewusst kein npm-Cache verwendet, da das Projekt ohne eingecheckten `package-lock.json` auskommt. Die direkten Paketversionen sind exakt in `package.json` festgelegt; für vollständig reproduzierbare transitive Abhängigkeiten sollte später ein `package-lock.json` aus einem vertrauenswürdigen npm-Lauf eingecheckt werden.

## GitHub Pages

Der Workflow `.github/workflows/deploy.yml` baut bei Push auf `main` und kann über `workflow_dispatch` manuell gestartet werden. Er führt `npm audit`, TypeScript-Prüfung, Unit-Tests und Build aus und veröffentlicht anschließend `dist`.

1. Projektdateien in das Repository `MGPossible/aggregat_sim` hochladen.
2. Unter **Settings → Pages → Build and deployment** als Quelle **GitHub Actions** auswählen.
3. Auf den Branch `main` committen oder den Workflow im Tab **Actions** manuell starten.
4. Die veröffentlichte URL im erfolgreichen Deployment-Job öffnen.

Für dieses Repository wird beim Build `VITE_BASE=/aggregat_sim/` verwendet. Für ein anderes Repository muss dieser Wert im Workflow angepasst werden.

## Projektstruktur

```text
src/
  components/PhaseDiagram.tsx   SVG-Phasendiagramm und Pointer-/Tastaturauswahl
  model/water.ts                Physikalische Modellfunktionen
  model/water.test.ts           Referenz- und Plausibilitätstests
  App.tsx                       Oberfläche und Zustandsverwaltung
  main.tsx                      React-Einstiegspunkt
  styles.css                    Responsive Gestaltung und Accessibility
.github/workflows/deploy.yml    GitHub-Pages-Deployment
```

## Wissenschaftliche Grundlagen

### Referenzwerte

- Tripelpunkt: `Tₜ = 273,16 K`, `pₜ = 611,657 Pa`
- Kritischer Punkt: `T꜀ = 647,096 K`, `p꜀ = 22,064 MPa`
- Normaler Siedepunkt: ungefähr `99,974 °C` bei `101,325 kPa`

**Hinweis zum CI-Test:** Bei exakt `100,000 °C` ergibt die IAPWS-Korrelation ungefähr `101,418 kPa`. Das ist kein Modellfehler: 100 °C liegt geringfügig oberhalb des normalen Siedepunkts von Wasser. Der Test vergleicht deshalb den berechneten Druck am normalen Siedepunkt (~99,974 °C) mit 1 atm und prüft separat den höheren Druck bei 100 °C.

### Verwendete Gleichungen

**Flüssig–Dampf-Grenze:** IAPWS-95/Wagner-Sättigungsdruckkorrelation. Mit `θ = 1 − T/Tc`:

```text
ln(psat/pc) = (Tc/T) · Σ ai · θ^bi
```

Die Koeffizienten und Exponenten sind in `src/model/water.ts` hinterlegt.

**Eis–Dampf-Grenze:** Clausius–Clapeyron-Näherung mit konstanter Sublimationsenthalpie, am Tripelpunkt verankert:

```text
ln(p/pt) ≈ − Δhsub/R · (1/T − 1/Tt)
```

**Eis-Ih-Schmelzgrenze:** lokale lineare Näherung mit negativer Steigung von ungefähr `−0,0074 K/MPa`. Sie wird im Modell nur bis 10 MPa angewendet.

### Modellgrenzen

Dies ist ein didaktisches Phasenkarten-Modell und keine vollständige Wasser-Zustandsgleichung. Die Verdampfungskurve verwendet die IAPWS-Korrelation. Die Sublimationskurve ist wegen konstanter angenäherter Sublimationsenthalpie eine Näherung. Die Schmelzlinie ist lokal linearisiert. Hochdruck-Eismodifikationen, metastabile Zustände, detaillierte Dichte-/Enthalpieeigenschaften und die kritische Skalierung werden nicht simuliert. Das Modell ist nicht für technische Auslegung oder präzise Stoffdatenauswertung vorgesehen.

Die Erwärmungsanimation verändert den Temperaturparameter; sie löst keine dynamische Wärmeübertragungs- oder kinetische Phasenwechselrechnung.

## Quellen

1. IAPWS, *Revised Release on the IAPWS Formulation 1995 for the Thermodynamic Properties of Ordinary Water Substance for General and Scientific Use* (R6-95(2018)): https://iapws.org/relguide/IAPWS95-2018.pdf
2. IAPWS, *Revised Release on the Pressure along the Melting and Sublimation Curves of Ordinary Water Substance* (R14-08(2011)): https://www.iapws.org/relguide/MeltSub.html
3. IAPWS, *Guideline on the Use of Fundamental Physical Constants and Basic Constants of Water* (G5-01): https://mail.iapws.org/relguide/fundam.pdf
4. NIST Chemistry WebBook, Water – Phase change data: https://webbook.nist.gov/cgi/cbook.cgi?Name=water&cTG=on&cTP=on

## Datenschutz

Keine Konten, Cookies, Tracking- oder Analyse-Skripte. Die Anwendung verwendet Systemschriften und benötigt keine externen Laufzeitressourcen.
