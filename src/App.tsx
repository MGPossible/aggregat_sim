import { useEffect, useMemo, useRef, useState } from "react";
import PhaseDiagram from "./components/PhaseDiagram";
import { ATM, classifyState, referencePoints } from "./model/water";

const fmt = (n: number, digits = 1) => new Intl.NumberFormat("de-DE", { maximumFractionDigits: digits }).format(n);
const presets = [
  { label: "Eisfach", t: -18, p: ATM, icon: "❄" },
  { label: "Raumtemperatur", t: 20, p: ATM, icon: "◌" },
  { label: "Kochendes Wasser", t: 100, p: ATM, icon: "♨" },
  { label: "Hochgebirge", t: 85, p: 0.58 * ATM, icon: "⌁" },
  { label: "Tripelpunkt", t: referencePoints.triple.t, p: referencePoints.triple.p, icon: "◇" },
  { label: "Kritischer Punkt", t: referencePoints.critical.t, p: referencePoints.critical.p, icon: "◎" },
];

export default function App() {
  const [temp, setTemp] = useState(20);
  const [pressure, setPressure] = useState(ATM);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [tab, setTab] = useState<"experiment" | "wissen">("experiment");
  const [, setHistory] = useState<{t:number;p:number}[]>([{t:20,p:ATM}]);
  const lastTick = useRef(0);
  const state = useMemo(() => classifyState(temp, pressure), [temp, pressure]);

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    const tick = (now: number) => {
      if (lastTick.current && now - lastTick.current > 0) {
        const dt = Math.min((now - lastTick.current) / 1000, 0.08) * speed;
        setTemp(v => Math.min(450, Math.max(-100, v + dt * 4)));
      }
      lastTick.current = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); lastTick.current = 0; };
  }, [running, speed]);

  useEffect(() => {
    setHistory(prev => {
      const next = [...prev, {t:temp,p:pressure}];
      return next.length > 36 ? next.slice(-36) : next;
    });
  }, [temp, pressure]);

  function reset() { setTemp(20); setPressure(ATM); setRunning(false); setSpeed(1); setHistory([{t:20,p:ATM}]); }
  function applyPreset(p: {t:number;p:number}) { setRunning(false); setTemp(p.t); setPressure(p.p); }
  const pressureMpa = pressure / 1e6;
  const progress = (temp + 100) / 550 * 100;
  const tempSlider = (v: number) => setTemp(Math.max(-100, Math.min(450, v)));
  const pressureSlider = (v: number) => setPressure(10 ** v * 1e6);

  return <main className="app-shell">
    <header className="topbar">
      <a className="brand" href="#" aria-label="Phasenlabor Startseite"><span className="brand-mark">H₂O</span><span>PHASEN<span className="brand-light">LABOR</span></span></a>
      <div className="top-meta"><span className="live-dot"></span> INTERAKTIVES EXPERIMENT <span className="meta-divider">/</span> PHYSIK & CHEMIE</div>
      <button className="quiet-button" onClick={() => setTab(tab === "experiment" ? "wissen" : "experiment")}>{tab === "experiment" ? "Grundlagen ansehen ↗" : "Zum Experiment ↗"}</button>
    </header>

    <section className="hero">
      <div className="eyebrow"><span>01</span> AGGREGATZUSTÄNDE · WASSER</div>
      <h1>Ein Stoff. Drei Zustände.<br/><em>Unendlich viele Bedingungen.</em></h1>
      <p className="hero-copy">Erforsche, wie Temperatur und Druck entscheiden, ob Wasser zu Eis, Flüssigkeit oder Wasserdampf wird.</p>
      <div className="hero-facts">
        <div><strong>273,16 K</strong><span>Tripeltemperatur</span></div>
        <div><strong>611,657 Pa</strong><span>Tripeldruck</span></div>
        <div><strong>647,096 K</strong><span>Kritische Temperatur</span></div>
      </div>
    </section>

    <nav className="tabs" aria-label="Ansichtsbereiche">
      <button className={tab === "experiment" ? "tab active" : "tab"} onClick={() => setTab("experiment")}> <span>01</span> Experiment</button>
      <button className={tab === "wissen" ? "tab active" : "tab"} onClick={() => setTab("wissen")}><span>02</span> Hintergrundwissen</button>
    </nav>

    {tab === "experiment" ? <div className="workspace">
      <section className="diagram-panel panel">
        <div className="panel-heading">
          <div><div className="eyebrow">PHASENKARTE</div><h2>Wo befindet sich dein Wasser?</h2></div>
          <span className="axis-chip">P–T DIAGRAMM</span>
        </div>
        <PhaseDiagram tempC={temp} pressurePa={pressure} onSelect={(t,p) => {setTemp(t);setPressure(p);setRunning(false);}}/>
        <div className="diagram-note"><span className="note-icon">↗</span><span><b>Interaktiv:</b> Tippe oder klicke direkt in das Diagramm, um einen Zustand auszuwählen. Die vertikale Achse ist logarithmisch skaliert.</span></div>
      </section>

      <aside className="control-column">
        <section className="panel control-panel">
          <div className="panel-heading compact"><div><div className="eyebrow">STEUERUNG</div><h2>Versuchsparameter</h2></div><button className="reset-button" onClick={reset} aria-label="Simulation zurücksetzen" title="Zurücksetzen">↺</button></div>
          <div className="control-group">
            <div className="control-label"><label htmlFor="temperature">Temperatur</label><output>{fmt(temp)} <small>°C</small></output></div>
            <input id="temperature" type="range" min="-100" max="450" step="0.1" value={temp} onChange={e => tempSlider(Number(e.target.value))} style={{"--range-progress":`${progress}%`} as React.CSSProperties}/>
            <div className="range-ends"><span>−100 °C</span><span>450 °C</span></div>
            <div className="number-wrap"><input aria-label="Temperatur in Grad Celsius" type="number" min="-100" max="450" step="0.1" value={temp} onChange={e => {const v=e.target.value.replace(",","."); if(v!=="" && Number.isFinite(Number(v))) tempSlider(Number(v));}}/><span>°C</span></div>
          </div>
          <div className="control-group pressure-group">
            <div className="control-label"><label htmlFor="pressure">Druck</label><output>{fmt(pressureMpa, 4)} <small>MPa</small></output></div>
            <input id="pressure" type="range" min="-4" max="2" step="0.01" value={Math.log10(pressureMpa)} onChange={e => pressureSlider(Number(e.target.value))} style={{"--range-progress":`${(Math.log10(pressureMpa)+4)/6*100}%`} as React.CSSProperties}/>
            <div className="range-ends"><span>100 Pa</span><span>100 MPa</span></div>
            <div className="number-wrap"><input aria-label="Druck in Megapascal" type="number" min="0.0001" max="100" step="any" value={Number(pressureMpa.toPrecision(5))} onChange={e => {const v=Number(e.target.value.replace(",", "."));if(v>0&&v<=100)setPressure(v*1e6);}}/><span>MPa</span></div>
          </div>
          <div className="control-actions">
            <button className="primary-button" onClick={() => {setRunning(!running);}}><span>{running ? "Ⅱ" : "▶"}</span>{running ? "Pausieren" : "Erwärmung starten"}</button>
            <label className="speed-select">Tempo <select value={speed} onChange={e => setSpeed(Number(e.target.value))}><option value={0.5}>0,5×</option><option value={1}>1×</option><option value={2}>2×</option><option value={4}>4×</option></select></label>
          </div>
          <p className="control-hint">Die Erwärmung erhöht die Temperatur mit konstantem Tempo. Der Druck bleibt unverändert.</p>
        </section>

        <section className="panel state-panel" aria-live="polite">
          <div className="eyebrow">AKTUELLER ZUSTAND</div>
          <div className={`state-display ${state.phase}`}><span className="state-symbol">{state.phase === "solid" ? "❄" : state.phase === "liquid" ? "◒" : state.phase === "supercritical" ? "◉" : state.phase === "coexist" ? "◇" : "≋"}</span><div><strong>{state.label}</strong><span>{state.detail}</span></div></div>
          <div className="readout-grid"><div><span>TEMPERATUR</span><b>{fmt(temp)} °C</b></div><div><span>DRUCK</span><b>{fmt(pressureMpa,4)} MPa</b></div></div>
        </section>
      </aside>

      <section className="panel presets-panel">
        <div className="panel-heading compact"><div><div className="eyebrow">STARTPUNKTE</div><h2>Probiere ein Szenario</h2></div><span className="small-muted">Vordefinierte Bedingungen</span></div>
        <div className="preset-grid">{presets.map(p => <button key={p.label} className="preset-card" onClick={() => applyPreset(p)}><span className="preset-icon">{p.icon}</span><span><b>{p.label}</b><small>{fmt(p.t,2)} °C · {p.p < 1000 ? `${fmt(p.p,1)} Pa` : `${fmt(p.p/1e6,3)} MPa`}</small></span><span className="preset-arrow">↗</span></button>)}</div>
      </section>
    </div> : <section className="knowledge-layout">
      <div className="panel knowledge-main">
        <div className="eyebrow">DIE WISSENSCHAFT DAHINTER</div><h2>Phasen sind Gleichgewichtszustände.</h2>
        <p>Der Aggregatzustand eines reinen Stoffes hängt von Temperatur <i>T</i> und Druck <i>p</i> ab. Im Phasendiagramm markieren Linien die Bedingungen, unter denen zwei Phasen im Gleichgewicht koexistieren. Auf einer Phasengrenze kann eine kleine Änderung von Temperatur oder Druck den Übergang auslösen.</p>
        <div className="concept-grid">
          <article><span className="concept-num">01 / FEST</span><h3>Schmelzen</h3><p>Beim Erwärmen wird das feste Kristallgitter instabil. Eis geht in flüssiges Wasser über. Bei Normaldruck geschieht das nahe 0 °C.</p></article>
          <article><span className="concept-num">02 / FLÜSSIG</span><h3>Verdampfen</h3><p>Wenn der Sättigungsdampfdruck den Umgebungsdruck erreicht, kann Wasser sieden. Bei geringerem Außendruck sinkt der Siedepunkt.</p></article>
          <article><span className="concept-num">03 / GAS</span><h3>Sublimieren</h3><p>Unterhalb des Tripeldrucks existiert keine stabile flüssige Phase. Eis geht beim Erwärmen direkt in Wasserdampf über.</p></article>
        </div>
        <h3 className="subhead">Zwei besondere Punkte</h3>
        <div className="special-points">
          <div><span className="point-dot triple"></span><div><b>Tripelpunkt</b><p>Bei 0,01 °C und 611,657 Pa können Eis, Wasser und Wasserdampf gleichzeitig im Gleichgewicht vorliegen.</p></div></div>
          <div><span className="point-dot critical"></span><div><b>Kritischer Punkt</b><p>Bei 373,946 °C und 22,064 MPa endet die Flüssig-Gas-Phasengrenze. Oberhalb davon liegt ein überkritisches Fluid vor.</p></div></div>
        </div>
      </div>
      <aside className="panel equations-panel"><div className="eyebrow">MATHEMATISCHES MODELL</div><h2>Die Phasengrenzen</h2>
        <div className="equation"><span>Verdampfungskurve</span><b>p<sub>sat</sub>(T)</b><small>IAPWS-Wagner-Gleichung</small></div>
        <div className="equation"><span>Sublimationskurve</span><b>ln(p/pₜ) ≈ − Δh<sub>sub</sub>/R · (1/T − 1/Tₜ)</b><small>Clausius–Clapeyron-Näherung</small></div>
        <div className="equation"><span>Schmelzkurve (lokal)</span><b>Tₘ(p) ≈ Tₜ + m · (p − pₜ)</b><small>Lineare Näherung für Eis Ih nahe Tripelpunkt</small></div>
        <div className="model-warning"><b>Modellgrenzen</b><p>Die Flüssig-Gas-Kurve verwendet die IAPWS-Sättigungsdruckkorrelation. Sublimations- und Schmelzkurve sind didaktische Näherungen. Hochdruck-Eisphasen (Eis II, III, V, VI …), metastabile Zustände und die genaue kritische Umgebung werden nicht berechnet. Die Karte ist daher ein Lernmodell, keine technische Zustandsgleichung.</p></div>
      </aside>
    </section>}

    <footer className="footer"><span>PHASENLABOR <i>·</i> WASSER</span><span>Ein interaktives Lernexperiment · Läuft vollständig im Browser</span><span>MODEL v1.0</span></footer>
  </main>;
}