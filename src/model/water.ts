/**
 * Didaktisches Gleichgewichtsmodell für gewöhnliches Wasser.
 * Flüssig–Dampf: IAPWS-95-Sättigungsdruckkorrelation (Wagner-Form).
 * Eis–Dampf: Clausius–Clapeyron-Näherung, am Tripelpunkt verankert.
 * Eis-Ih-Schmelzlinie: lokale lineare Clapeyron-Näherung nahe dem Tripelpunkt.
 *
 * Sublimations- und Schmelzkurve sind begrenzte Lehrmodell-Näherungen und
 * keine vollständige Hochdruck-Eis- oder Wasser-Zustandsgleichung.
 */
export const TRIPLE_T = 273.16; // K
export const TRIPLE_P = 611.657; // Pa
export const CRITICAL_T = 647.096; // K
export const CRITICAL_P = 22.064e6; // Pa
export const ATM = 101325; // Pa
export const MAX_LOCAL_MELTING_PRESSURE = 10e6; // Pa; Gültigkeitsbereich der lokalen Näherung

const R_WATER = 461.526; // J kg⁻¹ K⁻¹
const LATENT_SUB = 2.834e6; // J kg⁻¹, näherungsweise nahe dem Tripelpunkt
const MELT_SLOPE_K_PER_MPA = -0.0074; // K/MPa, Eis Ih nahe dem Tripelpunkt

export type Phase = "solid" | "liquid" | "gas" | "supercritical" | "coexist";

export type PhaseResult = {
  phase: Phase;
  label: string;
  detail: string;
  boundary?: "melting" | "sublimation" | "vaporisation";
};

/** Sättigungsdruck der Flüssig–Dampf-Grenze in Pa; außerhalb des Bereichs NaN. */
export function saturationPressurePa(tempK: number): number {
  if (!Number.isFinite(tempK) || tempK < TRIPLE_T || tempK > CRITICAL_T) return NaN;

  const theta = 1 - tempK / CRITICAL_T;
  const coefficients = [-7.85951783, 1.84408259, -11.7866497, 22.6807411, -15.9618719, 1.80122502];
  const exponents = [1, 1.5, 3, 3.5, 4, 7.5];
  const sum = coefficients.reduce((total, coefficient, index) => total + coefficient * theta ** exponents[index], 0);

  return CRITICAL_P * Math.exp((CRITICAL_T / tempK) * sum);
}

/** Sublimationsdruck in Pa; am Tripelpunkt ist die Kurve exakt verankert. */
export function sublimationPressurePa(tempK: number): number {
  if (!Number.isFinite(tempK) || tempK <= 0 || tempK > TRIPLE_T) return NaN;
  return TRIPLE_P * Math.exp((-LATENT_SUB / R_WATER) * (1 / tempK - 1 / TRIPLE_T));
}

/** Lokale lineare Schmelztemperatur von Eis Ih; nur bis 10 MPa verwenden. */
export function meltingTemperatureK(pressurePa: number): number {
  if (!Number.isFinite(pressurePa) || pressurePa < TRIPLE_P || pressurePa > MAX_LOCAL_MELTING_PRESSURE) return NaN;
  return TRIPLE_T + MELT_SLOPE_K_PER_MPA * ((pressurePa - TRIPLE_P) / 1e6);
}

export function classifyState(tempC: number, pressurePa: number): PhaseResult {
  if (!Number.isFinite(tempC) || !Number.isFinite(pressurePa) || pressurePa <= 0) {
    throw new RangeError("Temperatur und Druck müssen endlich sein; der Druck muss positiv sein.");
  }

  const tempK = tempC + 273.15;

  if (tempK >= CRITICAL_T && pressurePa >= CRITICAL_P) {
    return {
      phase: "supercritical",
      label: "Überkritisches Fluid",
      detail: "Oberhalb von kritischer Temperatur und kritischem Druck gibt es keine scharfe Grenze zwischen Flüssigkeit und Gas.",
    };
  }

  if (Math.abs(tempK - TRIPLE_T) < 0.015 && Math.abs(pressurePa - TRIPLE_P) < 1.5) {
    return {
      phase: "coexist",
      label: "Tripelpunkt",
      detail: "Fest, flüssig und gasförmig können im thermodynamischen Gleichgewicht gleichzeitig existieren.",
    };
  }

  if (tempK < TRIPLE_T) {
    const sublimationPressure = sublimationPressurePa(tempK);
    if (pressurePa < sublimationPressure) {
      return { phase: "gas", label: "Gasförmig", detail: "Unterhalb des Sublimationsdrucks ist Wasserdampf die stabile Phase.", boundary: "sublimation" };
    }

    // Unterhalb des Tripeltemperaturbereichs wird die lokale Eis-Ih-Schmelzlinie
    // nur im ausdrücklich begrenzten Druckbereich bis 10 MPa verwendet.
    if (pressurePa <= MAX_LOCAL_MELTING_PRESSURE && pressurePa >= TRIPLE_P) {
      const meltK = meltingTemperatureK(pressurePa);
      if (tempK >= meltK) {
        return { phase: "liquid", label: "Flüssig", detail: "Oberhalb der lokal angenäherten Eis-Ih-Schmelzgrenze ist flüssiges Wasser stabil.", boundary: "melting" };
      }
    }

    return { phase: "solid", label: "Fest (Eis)", detail: "Unterhalb der modellierten Schmelzgrenze ist Eis Ih die stabile feste Phase." };
  }

  if (tempK < CRITICAL_T) {
    // Unterhalb des Tripeldrucks existiert keine stabile flüssige Phase.
    if (pressurePa < TRIPLE_P) {
      return { phase: "gas", label: "Gasförmig", detail: "Unterhalb des Tripeldrucks ist flüssiges Wasser im Gleichgewicht nicht stabil." };
    }

    const vaporPressure = saturationPressurePa(tempK);
    if (pressurePa < vaporPressure) {
      return { phase: "gas", label: "Gasförmig", detail: "Der Druck liegt unter dem Sättigungsdampfdruck: Wasserdampf ist stabil.", boundary: "vaporisation" };
    }

    if (pressurePa <= MAX_LOCAL_MELTING_PRESSURE && tempK < meltingTemperatureK(pressurePa)) {
      return { phase: "solid", label: "Fest (Eis)", detail: "Die Temperatur liegt unter der lokal modellierten Schmelzgrenze.", boundary: "melting" };
    }

    return { phase: "liquid", label: "Flüssig", detail: "Der Druck liegt oberhalb des Sättigungsdampfdrucks und die Temperatur oberhalb der modellierten Schmelzgrenze." };
  }

  return { phase: "gas", label: "Gasförmig", detail: "Oberhalb der kritischen Temperatur kann Wasser durch Druck allein im Rahmen dieses Modells nicht mehr verflüssigt werden." };
}

export function stateAtNormalPressure(tempC: number): PhaseResult {
  return classifyState(tempC, ATM);
}

export const referencePoints = {
  triple: { t: TRIPLE_T - 273.15, p: TRIPLE_P, name: "Tripelpunkt" },
  critical: { t: CRITICAL_T - 273.15, p: CRITICAL_P, name: "Kritischer Punkt" },
  boiling: { t: 99.974, p: ATM, name: "Normaler Siedepunkt (1 atm)" },
  freezing: { t: 0, p: ATM, name: "Gefrierpunkt (1 atm)" },
};
