# Wissenschaftliches Modell

## Modellumfang

Zustandskarte von reinem Wasser in einem Druckbereich von 100 Pa bis 100 MPa und einem Temperaturbereich von −100 °C bis 450 °C. Der Druck wird logarithmisch dargestellt. Die Modellfunktion liefert eine didaktische Phasenklassifikation, nicht sämtliche thermodynamischen Eigenschaften.

## Flüssig-Dampf-Gleichgewicht

Die Sättigungsdruckkurve wird mit der Wagner-Darstellung der IAPWS-Formulierung berechnet:

\[
\ln \left(\frac{p_s}{p_c}\right)=\frac{T_c}{T}\sum_{i=1}^{6}a_i\theta^{b_i},
\qquad \theta=1-\frac{T}{T_c}.
\]

Die Parameter sind im Quellcode fest hinterlegt. Der Gültigkeitsbereich der Implementierung reicht vom Tripelpunkt bis zum kritischen Punkt. Am Normaldruck liegt der Siedepunkt bei rund 99,97 °C.

## Eis-Dampf-Gleichgewicht

Für den Sublimationsdruck wird eine integrierte Clausius-Clapeyron-Näherung verwendet:

\[
\ln\left(\frac{p}{p_t}\right)\approx-\frac{\Delta h_{sub}}{R}
\left(\frac{1}{T}-\frac{1}{T_t}\right).
\]

Die Sublimationsenthalpie wird als konstant angenommen. Das ist eine didaktische Näherung und ersetzt nicht die IAPWS-Referenzkorrelation.

## Schmelzkurve

Für gewöhnliches Eis Ih wird nahe dem Tripelpunkt eine lineare Näherung verwendet:

\[
T_m(p)\approx T_t-0{,}0074\frac{\mathrm{K}}{\mathrm{MPa}}\,(p-p_t).
\]

Das negative Vorzeichen illustriert die anomale negative Steigung der Schmelzlinie von Eis Ih. Diese Beziehung ist ausdrücklich nicht für hohe Drücke oder andere Eis-Polymorphe gedacht.

## Klassifikation und Sonderpunkte

- Unterhalb des Tripeldrucks wird keine stabile flüssige Phase zugelassen.
- Oberhalb des kritischen Punkts wird der Bereich als überkritisch bezeichnet.
- Auf dem Tripelpunkt werden drei koexistierende Phasen markiert.
- Hochdruck-Eisphasen und metastabile Zustände werden nicht modelliert.

## Numerik

Die Gleichungen sind algebraisch und benötigen kein zeitliches Integrationsverfahren. Die UI-Animation nutzt `requestAnimationFrame` nur zur Aktualisierung der Temperaturvariable; der Zeitfortschritt wird aus der verstrichenen Zeit berechnet und begrenzt. Rendering und physikalische Klassifikation sind getrennt.
