import {
  referencePoints,
  saturationPressurePa,
  sublimationPressurePa,
} from "../model/water";

type Props = { tempC: number; pressurePa: number; onSelect: (t: number, p: number) => void };
const Tmin = -100, Tmax = 450, pMin = 100, pMax = 100e6;
const log10 = (x: number) => Math.log(x) / Math.LN10;

export default function PhaseDiagram({ tempC, pressurePa, onSelect }: Props) {
  const W = 760, H = 430, L = 72, R = 24, T = 22, B = 58;
  const x = (v: number) => L + (v - Tmin) / (Tmax - Tmin) * (W - L - R);
  const y = (p: number) => T + (log10(pMax) - log10(p)) / (log10(pMax) - log10(pMin)) * (H - T - B);
  const px = x(tempC), py = y(pressurePa);
  const path = useMemo(() => {
    const liquid: string[] = [], sublim: string[] = [];
    for (let c = 0; c <= 374; c += 2) {
      const p = saturationPressurePa(c + 273.15);
      if (Number.isFinite(p) && p >= pMin && p <= pMax) liquid.push(`${liquid.length ? "L" : "M"}${x(c).toFixed(1)},${y(p).toFixed(1)}`);
    }
    for (let c = -100; c <= 0; c += 1) {
      const p = sublimationPressurePa(c + 273.15);
      if (Number.isFinite(p) && p >= pMin && p <= pMax) sublim.push(`${sublim.length ? "L" : "M"}${x(c).toFixed(1)},${y(p).toFixed(1)}`);
    }
    return { liquid: liquid.join(" "), sublim: sublim.join(" ") };
  }, []);
  const ticks = [1e-4, 1e-3, 1e-2, 0.1, 1, 10, 100];
  const xTicks = [-100, 0, 100, 200, 300, 400];
  const tripleX = x(referencePoints.triple.t), tripleY = y(referencePoints.triple.p);
  const criticalX = x(referencePoints.critical.t), criticalY = y(referencePoints.critical.p);

  function pointerSelect(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = W / rect.width, sy = H / rect.height;
    const localX = (e.clientX - rect.left) * sx, localY = (e.clientY - rect.top) * sy;
    if (localX < L || localX > W - R || localY < T || localY > H - B) return;
    const t = Tmin + (localX - L) / (W - L - R) * (Tmax - Tmin);
    const lp = log10(pMax) - (localY - T) / (H - T - B) * (log10(pMax) - log10(pMin));
    onSelect(Number(t.toFixed(1)), 10 ** lp);
  }
  return <div className="diagram-wrap">
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Druck-Temperatur-Phasendiagramm von Wasser. Die vertikale Achse ist logarithmisch. Tippe oder klicke in das Diagramm, um Temperatur und Druck auszuwählen." onPointerDown={pointerSelect} className="phase-svg">
      <defs>
        <clipPath id="plotClip"><rect x={L} y={T} width={W-L-R} height={H-T-B}/></clipPath>
        <linearGradient id="solidFill" x1="0" y1="1" x2="1" y2="0"><stop stopColor="#83b9d5" stopOpacity=".2"/><stop offset="1" stopColor="#83b9d5" stopOpacity=".04"/></linearGradient>
        <linearGradient id="liquidFill" x1="0" y1="1" x2="1" y2="0"><stop stopColor="#2e9dba" stopOpacity=".2"/><stop offset="1" stopColor="#2e9dba" stopOpacity=".04"/></linearGradient>
      </defs>
      <rect x={L} y={T} width={W-L-R} height={H-T-B} rx="8" fill="#0a202b" />
      <g clipPath="url(#plotClip)">
        <path d={`M${L},${T} L${x(0)},${T} L${x(0)},${tripleY} L${tripleX},${tripleY} L${x(-100)},${y(sublimationPressurePa(173.15))} L${L},${y(pMin)} Z`} fill="url(#solidFill)" />
        <path d={`M${tripleX},${tripleY} L${criticalX},${criticalY} L${criticalX},${y(pMax)} L${tripleX},${y(pMax)} Z`} fill="url(#liquidFill)" />
        {ticks.map(p => <line key={p} x1={L} x2={W-R} y1={y(p*1e6)} y2={y(p*1e6)} stroke="#28424c" strokeWidth="1" />)}
        {xTicks.map(t => <line key={t} x1={x(t)} x2={x(t)} y1={T} y2={H-B} stroke="#203943" strokeWidth="1" />)}
        <path d={path.sublim} fill="none" stroke="#9bc7df" strokeWidth="2.5" strokeDasharray="5 4"/>
        <path d={path.liquid} fill="none" stroke="#50c7d9" strokeWidth="3"/>
        <path d={`M${x(-100)},${y(pMax)} L${x(0)},${tripleY}`} fill="none" stroke="#d9a86b" strokeWidth="2.2" strokeDasharray="4 4" />
        <line x1={px} x2={px} y1={T} y2={H-B} stroke="#f6f0df" strokeOpacity=".35" strokeDasharray="3 5"/>
        <line x1={L} x2={W-R} y1={py} y2={py} stroke="#f6f0df" strokeOpacity=".35" strokeDasharray="3 5"/>
      </g>
      {ticks.map(p => <g key={p}><text x={L-12} y={y(p*1e6)+4} textAnchor="end" className="axis-label">{p >= 1 ? `${p} MPa` : `${p} MPa`}</text></g>)}
      {xTicks.map(t => <g key={t}><text x={x(t)} y={H-B+22} textAnchor="middle" className="axis-label">{t}°</text></g>)}
      <text x={(L+W-R)/2} y={H-10} textAnchor="middle" className="axis-title">Temperatur · °C</text>
      <text x="17" y={(T+H-B)/2} transform={`rotate(-90 17 ${(T+H-B)/2})`} textAnchor="middle" className="axis-title">Druck · MPa (logarithmisch)</text>
      <text x={x(-65)} y={y(3e7)} className="region-label">FEST</text>
      <text x={x(175)} y={y(3e6)} className="region-label">FLÜSSIG</text>
      <text x={x(315)} y={y(3e3)} className="region-label">GAS</text>
      <circle cx={tripleX} cy={tripleY} r="5" fill="#f0bd76" stroke="#071923" strokeWidth="2"/>
      <text x={tripleX+10} y={tripleY-12} className="point-label">Tripelpunkt</text>
      <circle cx={criticalX} cy={criticalY} r="5" fill="#f0bd76" stroke="#071923" strokeWidth="2"/>
      <text x={criticalX-8} y={criticalY-12} textAnchor="end" className="point-label">Kritischer Punkt</text>
      <circle cx={px} cy={py} r="8" fill="#f5f1e8" stroke="#43c6d8" strokeWidth="3"/>
      <circle cx={px} cy={py} r="2.5" fill="#09202a"/>
    </svg>
    <div className="diagram-legend">
      <span><i className="legend-line sublim"></i>Sublimation</span>
      <span><i className="legend-line vapor"></i>Verdampfung / Kondensation</span>
      <span><i className="legend-line melt"></i>Schmelzen / Erstarren (schematisch)</span>
      <span className="legend-current"><i></i>Dein Zustand</span>
    </div>
  </div>;
}