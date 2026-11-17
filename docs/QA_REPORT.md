# Qualitätssicherung dieser ZIP-Fassung

## Korrigierte Punkte

- Normaler Siedepunkt: Der Test prüft 1 atm bei 99,974 °C statt fälschlich bei exakt 100 °C. Zusätzlich wird geprüft, dass der Sättigungsdruck bei 100 °C tatsächlich etwas über 1 atm liegt.
- Phasendiagramm: Die Flüssig-Dampf-Kurve wird bis zum exakten kritischen Punkt abgetastet. Die lokale Eis-Ih-Schmelzlinie wird aus der Druckabhängigkeit berechnet und endet bei 10 MPa, statt als stark verzogene Diagonale eingezeichnet zu werden.
- Modell: Die Schmelztemperatur-Näherung ist auf ihren dokumentierten Druckbereich begrenzt; die Klassifikation berücksichtigt die lokale Schmelzlinie unterhalb von 0 °C.
- React-App: nicht verwendeter Verlaufsspeicher entfernt.
- GitHub Actions: kein npm-Cache ohne Lockfile; `npm install` erzeugt den Lockfile in der CI-Umgebung. Dazu kommen `npm audit`, TypeScript-Prüfung, Vitest und Build.
- Abhängigkeiten: Vite, React-Plugin und Vitest auf aktuelle Versionen aktualisiert.

## In dieser Umgebung ausgeführte Prüfungen

- `tsc` auf `src/model/water.ts`: erfolgreich.
- TypeScript-Syntax-/Konsistenzprüfung für alle TS/TSX-Projektdateien mit temporären Typ-Stubs: erfolgreich. Diese Prüfung ersetzt keinen echten Projekt-Build mit den installierten React-/Vite-Paketen.
- Numerische Referenz-Smoke-Checks für Tripelpunkt, kritischen Punkt und normalen Siedepunkt: erfolgreich.

## Nicht ausgeführte Prüfungen

Ein echter `npm install`, `npm audit`, `npm test` mit Vitest und `npm run build` wurden hier nicht ausgeführt, da diese Laufumgebung keinen Zugriff auf die npm-Registry hat und keine Projekt-Abhängigkeiten vorinstalliert sind. Der aktualisierte GitHub-Actions-Workflow führt diese Prüfungen nach dem Upload in GitHub aus. Die ZIP ist daher eine korrigierte Projektfassung, aber noch kein von GitHub erfolgreich gebautes Deployment.
