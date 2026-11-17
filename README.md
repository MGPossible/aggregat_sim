# Phasenlabor · Wasser

Ein interaktives, deutschsprachiges Lernexperiment zu den Aggregatzuständen von Wasser in Abhängigkeit von Temperatur und Druck. Die Anwendung läuft vollständig im Browser und ist für GitHub Pages vorbereitet.

## Funktionen

- Interaktives Druck-Temperatur-Phasendiagramm (logarithmische Druckachse)
- Temperatur- und Druckregler mit numerischer Eingabe
- Direkte Auswahl von Zuständen im Diagramm
- Erwärmung starten/pausieren, vier Geschwindigkeiten und Reset
- Szenarien für Eisfach, Raumtemperatur, Sieden, Hochgebirge, Tripel- und kritischen Punkt
- Messwertanzeige, Erklärbereich und transparente Modellgrenzen
- Responsive Oberfläche, Tastaturfokus, Touch-/Pointerbedienung und reduzierte Bewegung

## Technologien

React 19, TypeScript 5, Vite 6, SVG und CSS. Keine Laufzeit-API, kein Backend, keine Datenbank und kein Tracking.

## Lokal entwickeln

Voraussetzung: Node.js 22 LTS und npm.

```bash
npm ci
npm run dev
```

## Prüfen und bauen

```bash
npm run typecheck
npm test
npm run build
npm run preview
```

## GitHub Pages

Der Workflow `.github/workflows/deploy.yml` baut bei Push auf `main` und manuell über `workflow_dispatch`. Er führt TypeScript-Prüfung und Unit-Tests aus und veröffentlicht `dist` mit den offiziellen Pages-Actions.

1. Repository auf GitHub anlegen und den Projektinhalt pushen.
2. Unter **Settings → Pages → Build and deployment** die Quelle **GitHub Actions** auswählen.
3. Standardbranch im Workflow ggf. anpassen, falls er nicht `main` heißt.
4. Für eine Projektseite `https://BENUTZER.github.io/REPOSITORY/` die Repository-Variable `VITE_BASE` auf `/REPOSITORY/` setzen.
5. Für Benutzer-/Organisationsseiten oder eigene Domain `VITE_BASE` auf `/` setzen (Standard).
6. Unter **Actions** den Workflow ausführen und die veröffentlichte URL im Deployment-Job öffnen.

Die Vite-Basis wird zur Buildzeit über `VITE_BASE` gesetzt. Der Workflow erzeugt derzeit den Lockfile im CI-Lauf, weil in dieser Umgebung kein vollständiger npm-Lockfile aus dem Registry-Netzwerk bezogen werden konnte; committe für streng reproduzierbare Builds einen lokal mit `npm install` erzeugten `package-lock.json`. Der Workflow verwendet derzeit versionierte Major-Tags der offiziellen Actions (`actions/checkout@v4`, `setup-node@v4`, `configure-pages@v5`, `upload-pages-artifact@v3`, `deploy-pages@v4`). Für eine strengere Supply-Chain-Policy können diese Tags im Repository auf geprüfte Commit-SHAs festgeschrieben werden.

## Projektstruktur

```text
src/
  components/PhaseDiagram.tsx   SVG-Phasendiagramm und Pointer-Auswahl
  model/water.ts                Physikalische Modellfunktionen
  model/water.test.ts           Referenz- und Plausibilitätstests
  App.tsx                       Oberfläche, Steuerung und Zustandsverwaltung
  styles.css                    Responsive Design und Accessibility
.github/workflows/deploy.yml    GitHub-Pages-Deployment
```

## Wissenschaftliche Grundlagen

### Referenzwerte

- Tripelpunkt: `Tₜ = 273,16 K` und `pₜ = 611,657 Pa`
- Kritischer Punkt: `T꜀ = 647,096 K` und `p꜀ = 22,064 MPa`
- Normaler Siedepunkt: ungefähr `99,97 °C` bei `101,325 kPa`

### Verwendete Gleichungen

**Flüssig-Dampf-Grenze:** IAPWS-95/Wagner-Sättigungsdruckkorrelation. Mit `θ = 1 − T/Tc`:

```text
ln(psat/pc) = (Tc/T) · Σ ai · θ^bi
```

Koeffizienten `(ai)` und Exponenten `(bi)` sind im Quellcode in `src/model/water.ts` hinterlegt.

**Eis-Dampf-Grenze:** Clausius-Clapeyron-Näherung mit konstanter Sublimationsenthalpie, am Tripelpunkt verankert:

```text
ln(p/pt) ≈ − Δhsub/R · (1/T − 1/Tt)
```

**Eis-Ih-Schmelzgrenze:** lokale lineare Näherung nahe dem Tripelpunkt mit negativer Steigung (ungefähr −0,0074 K/MPa). Diese Näherung illustriert die ungewöhnliche Druckabhängigkeit des Schmelzens von gewöhnlichem Eis.

### Grenzen und Annahmen

Dies ist ein didaktisches Phasenkarten-Modell und keine vollständige Wasser-Zustandsgleichung. Die Verdampfungskurve basiert auf einer anerkannten IAPWS-Korrelation. Die Sublimationskurve ist wegen konstanter angenäherter Sublimationsenthalpie nur eine Näherung. Die Schmelzlinie ist lokal linearisiert. Hochdruck-Eismodifikationen, metastabile Zustände, detaillierte Dichte-/Enthalpieeigenschaften und kritische Skalierung werden nicht simuliert. Das Modell sollte daher nicht für technische Auslegung oder präzise Stoffdaten verwendet werden.

Die Erwärmungsanimation verändert den Temperaturparameter; sie löst keine dynamische Wärmeübertragungs- oder kinetische Phasenwechselrechnung.

## Quellen

1. IAPWS, *Revised Release on the IAPWS Formulation 1995 for the Thermodynamic Properties of Ordinary Water Substance for General and Scientific Use* (R6-95(2018)): https://iapws.org/relguide/IAPWS95-2018.pdf
2. IAPWS, *Revised Release on the Pressure along the Melting and Sublimation Curves of Ordinary Water Substance* (R14-08(2011)): https://www.iapws.org/relguide/MeltSub.html
3. IAPWS, *Guideline on the Use of Fundamental Physical Constants and Basic Constants of Water* (G5-01): https://mail.iapws.org/relguide/fundam.pdf
4. NIST Chemistry WebBook, Water – Phase change data: https://webbook.nist.gov/cgi/cbook.cgi?Name=water&cTG=on&cTP=on

## Datenschutz

Keine Konten, Cookies, Tracking- oder Analyse-Skripte. Es werden ausschließlich lokale Systemschriften verwendet; es gibt keine externen Laufzeitressourcen.
