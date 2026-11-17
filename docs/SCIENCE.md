# Wissenschaftliches Modell

## Flüssig–Dampf-Gleichgewicht

Verwendet wird die Wagner-Form der IAPWS-95-Sättigungsdruckgleichung zwischen Tripel- und kritischer Temperatur. Am Tripelpunkt und am kritischen Punkt ist die Korrelation an die hinterlegten Referenzwerte gebunden.

## Eis–Dampf-Gleichgewicht

Die Sublimationskurve verwendet eine Clausius–Clapeyron-Näherung mit konstanter spezifischer Sublimationsenthalpie. Sie ist am Tripelpunkt verankert und außerhalb des verwendeten Temperaturfensters nicht definiert.

## Eis-Ih-Schmelzlinie

Die lokale lineare Näherung hat eine negative Steigung von ungefähr −0,0074 K/MPa. Sie wird im Code auf den Bereich bis 10 MPa begrenzt. Die Näherung darf nicht auf Hochdruck-Eisphasen extrapoliert werden.

## Siedepunktprüfung

Der normale Siedepunkt von Wasser bei 1 atm liegt ungefähr bei 99,974 °C. Bei genau 100 °C ist der Sättigungsdampfdruck etwa 101,418 kPa und damit etwas höher als 101,325 kPa. Ein Test, der bei exakt 100 °C 1 atm erwartet, ist daher falsch angesetzt.
