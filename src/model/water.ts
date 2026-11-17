/**
 * Didactic equilibrium model for ordinary water.
 * Liquid-vapour boundary: IAPWS-95 saturation-pressure equation (Wagner form).
 * Ice-vapour boundary: Clausius-Clapeyron approximation anchored at the triple point.
 * Ice-Ih melting line: local linear Clapeyron approximation near the triple point.
 *
 * The latter two are deliberately bounded teaching approximations, not a full
 * high-pressure ice polymorph / metastable-water equation of state.
 */
export const TRIPLE_T = 273.16;       // K
export const TRIPLE_P = 611.657;      // Pa
export const CRITICAL_T = 647.096;    // K
export const CRITICAL_P = 22.064e6;   // Pa
export const ATM = 101325;            // Pa
const R_WATER = 461.526;              // J kg-1 K-1, specific gas constant
const LATENT_SUB = 2.834e6;           // J kg-1, approximate near triple point
const MELT_SLOPE_K_PER_MPA = -0.0074; // local ice-Ih slope, K/MPa

export type Phase = "solid" | "liquid" | "gas" | "supercritical" | "coexist";
export type PhaseResult = {
  phase: Phase;
  label: string;
  detail: string;
  boundary?: "melting" | "sublimation" | "vaporisation";
};

export function saturationPressurePa(tempK: number): number {
  if (!Number.isFinite(tempK) || tempK < TRIPLE_T || tempK > CRITICAL_T) return NaN;
  const theta = 1 - tempK / CRITICAL_T;
  const a = [-7.85951783, 1.84408259, -11.7866497, 22.6807411, -15.9618719, 1.80122502];
  const powers = [1, 1.5, 3, 3.5, 4, 7.5];
  const sum = a.reduce((s, v, i) => s + v * theta ** powers[i], 0);
  return CRITICAL_P * Math.exp((CRITICAL_T / tempK) * sum);
}

export function sublimationPressurePa(tempK: number): number {
  if (!Number.isFinite(tempK) || tempK <= 0 || tempK > TRIPLE_T) return NaN;
  return TRIPLE_P * Math.exp((-LATENT_SUB / R_WATER) * (1 / tempK - 1 / TRIPLE_T));
}

export function meltingTemperatureK(pressurePa: number): number {
  return TRIPLE_T + MELT_SLOPE_K_PER_MPA * ((pressurePa - TRIPLE_P) / 1e6);
}

export function classifyState(tempC: number, pressurePa: number): PhaseResult {
  if (!Number.isFinite(tempC) || !Number.isFinite(pressurePa) || pressurePa <= 0) {
    throw new RangeError("Temperatur und Druck müssen endlich sein; der Druck muss positiv sein.");
  }
  const t = tempC + 273.15;
  if (t >= CRITICAL_T && pressurePa >= CRITICAL_P) {
    return { phase: "supercritical", label: "Überkritisches Fluid", detail: "Oberhalb von kritischer Temperatur und kritischem Druck gibt es keine scharfe Grenze zwischen Flüssigkeit und Gas." };
  }
  if (Math.abs(t - TRIPLE_T) < 0.015 && Math.abs(pressurePa - TRIPLE_P) < 1.5) {
    return { phase: "coexist", label: "Tripelpunkt", detail: "Fest, flüssig und gasförmig können im thermodynamischen Gleichgewicht gleichzeitig existieren." };
  }

  // The model uses the ice-Ih line only in a narrow neighbourhood of the triple point.
  const meltK = meltingTemperatureK(pressurePa);
  if (t < TRIPLE_T) {
    const ps = sublimationPressurePa(t);
    if (pressurePa < ps) return { phase: "gas", label: "Gasförmig", detail: "Unterhalb des Sublimationsdrucks ist Wasserdampf die stabile Phase." };
    return { phase: "solid", label: "Fest (Eis)", detail: "Unterhalb der Schmelzgrenze ist Eis Ih die stabile feste Phase." };
  }
  if (t < CRITICAL_T) {
    const pv = saturationPressurePa(Math.min(t, CRITICAL_T));
    if (pressurePa < TRIPLE_P) {
      return { phase: "gas", label: "Gasförmig", detail: "Unterhalb des Tripeldrucks ist flüssiges Wasser im Gleichgewicht nicht stabil." };
    }
    if (pressurePa < pv) return { phase: "gas", label: "Gasförmig", detail: "Der Druck liegt unter dem Sättigungsdampfdruck: Wasserdampf ist stabil." };
    if (pressurePa >= TRIPLE_P && t < meltK) return { phase: "solid", label: "Fest (Eis)", detail: "Die Temperatur liegt unter der modellierten Schmelzgrenze." };
    return { phase: "liquid", label: "Flüssig", detail: "Der Druck liegt oberhalb des Sättigungsdampfdrucks und die Temperatur oberhalb der Schmelzgrenze." };
  }
  return { phase: "gas", label: "Gasförmig", detail: "Oberhalb der kritischen Temperatur kann Wasserdampf durch Druck allein nicht mehr verflüssigt werden." };
}

export function stateAtNormalPressure(tempC: number): PhaseResult {
  return classifyState(tempC, ATM);
}

export const referencePoints = {
  triple: { t: TRIPLE_T - 273.15, p: TRIPLE_P, name: "Tripelpunkt" },
  critical: { t: CRITICAL_T - 273.15, p: CRITICAL_P, name: "Kritischer Punkt" },
  boiling: { t: 99.974, p: ATM, name: "Siedepunkt (1 atm)" },
  freezing: { t: 0, p: ATM, name: "Gefrierpunkt (1 atm)" },
};