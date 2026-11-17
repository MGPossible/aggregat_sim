import { useMemo, type KeyboardEvent, type PointerEvent } from "react";
import {
  CRITICAL_T,
  MAX_LOCAL_MELTING_PRESSURE,
  TRIPLE_P,
  TRIPLE_T,
  meltingTemperatureK,
  referencePoints,
  saturationPressurePa,
  sublimationPressurePa,
} from "../model/water";

type Props = {
  tempC: number;
  pressurePa: number;
  onSelect: (temperatureC: number, pressurePa: number) => void;
};

const WIDTH = 760;
const HEIGHT = 430;
const LEFT = 72;
const RIGHT = 24;
const TOP = 22;
const BOTTOM = 58;
const TEMP_MIN = -100;
const TEMP_MAX = 450;
const PRESSURE_MIN = 100;
const PRESSURE_MAX = 100e6;
const log10 = (value: number) => Math.log(value) / Math.LN10;

export default function PhaseDiagram({ tempC, pressurePa, onSelect }: Props) {
  const x = (temperatureC: number) => LEFT + ((temperatureC - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)) * (WIDTH - LEFT - RIGHT);
  const y = (pressure: number) => TOP + ((log10(PRESSURE_MAX) - log10(pressure)) / (log10(PRESSURE_MAX) - log10(PRESSURE_MIN))) * (HEIGHT - TOP - BOTTOM);
  const px = x(tempC);
  const py = y(pressurePa);

  const paths = useMemo(() => {
    const liquid: string[] = [];
    const sublimation: string[] = [];
    const melting: string[] = [];

    // Flüssig-Dampf-Kurve: gleichmäßig in Temperatur abgetastet und mit
    // exaktem Start- und Endpunkt an Tripel- bzw. kritischem Punkt.
    for (let index = 0; index <= 600; index += 1) {
      const temperatureK = TRIPLE_T + ((CRITICAL_T - TRIPLE_T) * index) / 600;
      const temperatureC = temperatureK - 273.15;
      const pressure = saturationPressurePa(temperatureK);
      if (Number.isFinite(pressure) && pressure >= PRESSURE_MIN && pressure <= PRESSURE_MAX) {
        liquid.push(`${liquid.length ? "L" : "M"}${x(temperatureC).toFixed(2)},${y(pressure).toFixed(2)}`);
      }
    }

    // Sublimationskurve bis exakt zum Tripelpunkt.
    for (let index = 0; index <= 240; index += 1) {
      const temperatureC = TEMP_MIN + ((referencePoints.triple.t - TEMP_MIN) * index) / 240;
      const pressure = sublimationPressurePa(temperatureC + 273.15);
      if (Number.isFinite(pressure) && pressure >= PRESSURE_MIN && pressure <= PRESSURE_MAX) {
        sublimation.push(`${sublimation.length ? "L" : "M"}${x(temperatureC).toFixed(2)},${y(pressure).toFixed(2)}`);
      }
    }

    // Lokale Eis-Ih-Schmelzkurve nur bis 10 MPa, dem Modell-Gültigkeitsbereich.
    const meltPressureMin = TRIPLE_P;
    const meltPressureMax = MAX_LOCAL_MELTING_PRESSURE;
    for (let index = 0; index <= 180; index += 1) {
      const fraction = index / 180;
      const pressure = meltPressureMin * (meltPressureMax / meltPressureMin) ** fraction;
      const temperatureC = meltingTemperatureK(pressure) - 273.15;
      melting.push(`${melting.length ? "L" : "M"}${x(temperatureC).toFixed(2)},${y(pressure).toFixed(2)}`);
    }

    return {
      liquid: liquid.join(" "),
      sublimation: sublimation.join(" "),
      melting: melting.join(" "),
    };
  }, []);

  const pressureTicksMpa = [0.0001, 0.001, 0.01, 0.1, 1, 10, 100];
  const temperatureTicks = [-100, 0, 100, 200, 300, 400];
  const tripleX = x(referencePoints.triple.t);
  const tripleY = y(referencePoints.triple.p);
  const criticalX = x(referencePoints.critical.t);
  const criticalY = y(referencePoints.critical.p);

  function pointerSelect(event: PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const scaleX = WIDTH / rect.width;
    const scaleY = HEIGHT / rect.height;
    const localX = (event.clientX - rect.left) * scaleX;
    const localY = (event.clientY - rect.top) * scaleY;
    if (localX < LEFT || localX > WIDTH - RIGHT || localY < TOP || localY > HEIGHT - BOTTOM) return;

    const temperatureC = TEMP_MIN + ((localX - LEFT) / (WIDTH - LEFT - RIGHT)) * (TEMP_MAX - TEMP_MIN);
    const logPressure = log10(PRESSURE_MAX) - ((localY - TOP) / (HEIGHT - TOP - BOTTOM)) * (log10(PRESSURE_MAX) - log10(PRESSURE_MIN));
    onSelect(Number(temperatureC.toFixed(1)), 10 ** logPressure);
  }

  function keyboardSelect(event: KeyboardEvent<SVGSVGElement>) {
    const temperatureStep = event.shiftKey ? 10 : 1;
    const pressureFactor = event.shiftKey ? 2 : 1.2;
    let nextTemperature = tempC;
    let nextPressure = pressurePa;

    switch (event.key) {
      case "ArrowLeft": nextTemperature -= temperatureStep; break;
      case "ArrowRight": nextTemperature += temperatureStep; break;
      case "ArrowUp": nextPressure *= pressureFactor; break;
      case "ArrowDown": nextPressure /= pressureFactor; break;
      default: return;
    }

    event.preventDefault();
    onSelect(
      Math.max(TEMP_MIN, Math.min(TEMP_MAX, nextTemperature)),
      Math.max(PRESSURE_MIN, Math.min(PRESSURE_MAX, nextPressure)),
    );
  }

  return (
    <div className="diagram-wrap">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="application"
        tabIndex={0}
        aria-label="Interaktives Druck-Temperatur-Phasendiagramm von Wasser. Klicke oder tippe, um Temperatur und Druck auszuwählen. Mit den Pfeiltasten kannst du den Zustand schrittweise ändern; Umschalt vergrößert die Schritte."
        onPointerDown={pointerSelect}
        onKeyDown={keyboardSelect}
        className="phase-svg"
      >
        <defs>
          <clipPath id="plotClip"><rect x={LEFT} y={TOP} width={WIDTH - LEFT - RIGHT} height={HEIGHT - TOP - BOTTOM} /></clipPath>
          <linearGradient id="solidFill" x1="0" y1="1" x2="1" y2="0"><stop stopColor="#83b9d5" stopOpacity=".2" /><stop offset="1" stopColor="#83b9d5" stopOpacity=".04" /></linearGradient>
          <linearGradient id="liquidFill" x1="0" y1="1" x2="1" y2="0"><stop stopColor="#2e9dba" stopOpacity=".2" /><stop offset="1" stopColor="#2e9dba" stopOpacity=".04" /></linearGradient>
        </defs>

        <rect x={LEFT} y={TOP} width={WIDTH - LEFT - RIGHT} height={HEIGHT - TOP - BOTTOM} rx="8" fill="#0a202b" />
        <g clipPath="url(#plotClip)">
          <path d={`M${LEFT},${TOP} L${x(0)},${TOP} L${x(0)},${tripleY} L${tripleX},${tripleY} L${x(TEMP_MIN)},${y(Math.max(PRESSURE_MIN, sublimationPressurePa(TEMP_MIN + 273.15)))} L${LEFT},${y(PRESSURE_MIN)} Z`} fill="url(#solidFill)" />
          <path d={`M${tripleX},${tripleY} L${criticalX},${criticalY} L${criticalX},${y(PRESSURE_MAX)} L${tripleX},${y(PRESSURE_MAX)} Z`} fill="url(#liquidFill)" />
          {pressureTicksMpa.map((tick) => <line key={tick} x1={LEFT} x2={WIDTH - RIGHT} y1={y(tick * 1e6)} y2={y(tick * 1e6)} stroke="#28424c" strokeWidth="1" />)}
          {temperatureTicks.map((tick) => <line key={tick} x1={x(tick)} x2={x(tick)} y1={TOP} y2={HEIGHT - BOTTOM} stroke="#203943" strokeWidth="1" />)}
          <path d={paths.sublimation} fill="none" stroke="#9bc7df" strokeWidth="2.5" strokeDasharray="5 4" />
          <path d={paths.liquid} fill="none" stroke="#50c7d9" strokeWidth="3" />
          <path d={paths.melting} fill="none" stroke="#d9a86b" strokeWidth="2.2" strokeDasharray="4 4" />
          <line x1={px} x2={px} y1={TOP} y2={HEIGHT - BOTTOM} stroke="#f6f0df" strokeOpacity=".35" strokeDasharray="3 5" />
          <line x1={LEFT} x2={WIDTH - RIGHT} y1={py} y2={py} stroke="#f6f0df" strokeOpacity=".35" strokeDasharray="3 5" />
        </g>

        {pressureTicksMpa.map((tick) => (
          <g key={tick}><text x={LEFT - 12} y={y(tick * 1e6) + 4} textAnchor="end" className="axis-label">{tick.toLocaleString("de-DE")} MPa</text></g>
        ))}
        {temperatureTicks.map((tick) => (
          <g key={tick}><text x={x(tick)} y={HEIGHT - BOTTOM + 22} textAnchor="middle" className="axis-label">{tick}°</text></g>
        ))}
        <text x={(LEFT + WIDTH - RIGHT) / 2} y={HEIGHT - 10} textAnchor="middle" className="axis-title">Temperatur · °C</text>
        <text x="17" y={(TOP + HEIGHT - BOTTOM) / 2} transform={`rotate(-90 17 ${(TOP + HEIGHT - BOTTOM) / 2})`} textAnchor="middle" className="axis-title">Druck · MPa (logarithmisch)</text>
        <text x={x(-65)} y={y(3e7)} className="region-label">FEST</text>
        <text x={x(175)} y={y(3e6)} className="region-label">FLÜSSIG</text>
        <text x={x(315)} y={y(3e3)} className="region-label">GAS</text>
        <circle cx={tripleX} cy={tripleY} r="5" fill="#f0bd76" stroke="#071923" strokeWidth="2" />
        <text x={tripleX + 10} y={tripleY - 12} className="point-label">Tripelpunkt</text>
        <circle cx={criticalX} cy={criticalY} r="5" fill="#f0bd76" stroke="#071923" strokeWidth="2" />
        <text x={criticalX - 8} y={criticalY - 12} textAnchor="end" className="point-label">Kritischer Punkt</text>
        <circle cx={px} cy={py} r="8" fill="#f5f1e8" stroke="#43c6d8" strokeWidth="3" />
        <circle cx={px} cy={py} r="2.5" fill="#09202a" />
      </svg>

      <div className="diagram-legend">
        <span><i className="legend-line sublim" />Sublimation</span>
        <span><i className="legend-line vapor" />Verdampfung / Kondensation</span>
        <span><i className="legend-line melt" />Schmelzen / Erstarren (lokal)</span>
        <span className="legend-current"><i />Dein Zustand</span>
      </div>
    </div>
  );
}
