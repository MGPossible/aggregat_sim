import { describe, expect, it } from "vitest";
import { ATM, CRITICAL_P, CRITICAL_T, TRIPLE_P, TRIPLE_T, classifyState, saturationPressurePa, sublimationPressurePa, meltingTemperatureK } from "./water";

describe("water phase model reference checks", () => {
  it("returns the triple-point reference values", () => {
    expect(TRIPLE_T).toBeCloseTo(273.16, 5);
    expect(TRIPLE_P).toBeCloseTo(611.657, 2);
  });
  it("reaches the critical pressure at the critical temperature", () => {
    expect(saturationPressurePa(CRITICAL_T)).toBeCloseTo(CRITICAL_P, -1);
  });
  it("matches the normal boiling point near 100 °C at one atmosphere", () => {
    expect(saturationPressurePa(373.15)).toBeCloseTo(ATM, -2);
  });
  it("anchors the sublimation curve at the triple point", () => {
    expect(sublimationPressurePa(TRIPLE_T)).toBeCloseTo(TRIPLE_P, 5);
  });
  it("has the characteristic negative local slope of the ice-Ih melting line", () => {
    expect(meltingTemperatureK(10e6)).toBeLessThan(TRIPLE_T);
  });
  it("classifies representative classroom conditions", () => {
    expect(classifyState(-10, ATM).phase).toBe("solid");
    expect(classifyState(20, ATM).phase).toBe("liquid");
    expect(classifyState(120, ATM).phase).toBe("gas");
    expect(classifyState(400, 30e6).phase).toBe("supercritical");
  });
  it("rejects invalid pressure", () => {
    expect(() => classifyState(20, 0)).toThrow(RangeError);
  });
});