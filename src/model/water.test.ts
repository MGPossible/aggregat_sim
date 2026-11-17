import { describe, expect, it } from "vitest";
import {
  ATM,
  CRITICAL_P,
  CRITICAL_T,
  MAX_LOCAL_MELTING_PRESSURE,
  TRIPLE_P,
  TRIPLE_T,
  classifyState,
  meltingTemperatureK,
  referencePoints,
  saturationPressurePa,
  sublimationPressurePa,
} from "./water";

describe("water phase model reference checks", () => {
  it("returns the triple-point reference values", () => {
    expect(TRIPLE_T).toBeCloseTo(273.16, 5);
    expect(TRIPLE_P).toBeCloseTo(611.657, 2);
    expect(saturationPressurePa(TRIPLE_T)).toBeCloseTo(TRIPLE_P, 1);
  });

  it("reaches the critical pressure at the critical temperature", () => {
    expect(saturationPressurePa(CRITICAL_T)).toBeCloseTo(CRITICAL_P, -1);
  });

  it("matches the normal boiling point near 99.974 °C at one atmosphere", () => {
    const normalBoilingPointK = referencePoints.boiling.t + 273.15;
    expect(saturationPressurePa(normalBoilingPointK)).toBeCloseTo(ATM, -1);
  });

  it("predicts a saturation pressure above one atmosphere at exactly 100 °C", () => {
    // 100 °C is about 0.026 K above the normal boiling point of water.
    expect(saturationPressurePa(373.15)).toBeGreaterThan(ATM);
    expect(saturationPressurePa(373.15)).toBeCloseTo(101418, -1);
  });

  it("anchors the sublimation curve at the triple point", () => {
    expect(sublimationPressurePa(TRIPLE_T)).toBeCloseTo(TRIPLE_P, 5);
  });

  it("has the characteristic negative local slope of the ice-Ih melting line", () => {
    expect(meltingTemperatureK(10e6)).toBeLessThan(TRIPLE_T);
    expect(meltingTemperatureK(10e6)).toBeGreaterThan(272);
    expect(Number.isNaN(meltingTemperatureK(0))).toBe(true);
    expect(Number.isNaN(meltingTemperatureK(MAX_LOCAL_MELTING_PRESSURE * 2))).toBe(true);
  });

  it("classifies representative classroom conditions", () => {
    expect(classifyState(-10, ATM).phase).toBe("solid");
    expect(classifyState(20, ATM).phase).toBe("liquid");
    expect(classifyState(120, ATM).phase).toBe("gas");
    expect(classifyState(400, 30e6).phase).toBe("supercritical");
    expect(classifyState(referencePoints.triple.t, TRIPLE_P).phase).toBe("coexist");
  });

  it("uses the local negative melting-line slope just below 0 °C", () => {
    const pressure = 10e6;
    const meltC = meltingTemperatureK(pressure) - 273.15;
    expect(classifyState(meltC - 0.03, pressure).phase).toBe("solid");
    expect(classifyState(meltC + 0.03, pressure).phase).toBe("liquid");
  });

  it("rejects invalid pressure and non-finite input", () => {
    expect(() => classifyState(20, 0)).toThrow(RangeError);
    expect(() => classifyState(Number.NaN, ATM)).toThrow(RangeError);
    expect(() => classifyState(20, Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });

  it("returns NaN outside the documented correlation ranges", () => {
    expect(Number.isNaN(saturationPressurePa(TRIPLE_T - 1))).toBe(true);
    expect(Number.isNaN(saturationPressurePa(CRITICAL_T + 1))).toBe(true);
    expect(Number.isNaN(sublimationPressurePa(0))).toBe(true);
    expect(Number.isNaN(sublimationPressurePa(TRIPLE_T + 1))).toBe(true);
  });
});
