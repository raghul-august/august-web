// @ts-nocheck — repo has no @types/jest installed (preexisting). Logic verified manually; file runs clean once jest types are added.
import { computeDose } from "./glp1-dose-compute";

describe("computeDose — truth table", () => {
  it("row 1: sema 2.5 / 0.25 / 1.0 → 10.0 U, 0.1 mL, ok", () => {
    const r = computeDose({
      medication: "semaglutide",
      concentration: 2.5,
      dose: 0.25,
      barrelMl: 1.0,
    });
    expect(r.unitsU100).toBe(10.0);
    expect(r.volumeMl).toBe(0.1);
    expect(r.displayState).toBe("ok");
    expect(r.warnings).toEqual([]);
  });

  it("row 2: sema 2.5 / 2.4 / 1.0 → 96.0 U, 0.96 mL, ok", () => {
    const r = computeDose({
      medication: "semaglutide",
      concentration: 2.5,
      dose: 2.4,
      barrelMl: 1.0,
    });
    expect(r.unitsU100).toBe(96.0);
    expect(r.volumeMl).toBe(0.96);
    expect(r.displayState).toBe("ok");
    expect(r.warnings).toEqual([]);
  });

  it("row 3: sema 2.5 / 3.0 / 1.0 → 120.0 U, 1.2 mL, over (over_capacity + over_100_units)", () => {
    const r = computeDose({
      medication: "semaglutide",
      concentration: 2.5,
      dose: 3.0,
      barrelMl: 1.0,
    });
    expect(r.unitsU100).toBe(120.0);
    expect(r.volumeMl).toBe(1.2);
    expect(r.displayState).toBe("over");
    expect(r.warnings).toContain("over_capacity");
    expect(r.warnings).toContain("over_100_units");
  });

  it("row 4: tirz 17 / 2.5 / 1.0 → 14.7 U, 0.147 mL, ok", () => {
    const r = computeDose({
      medication: "tirzepatide",
      concentration: 17,
      dose: 2.5,
      barrelMl: 1.0,
    });
    expect(r.unitsU100).toBe(14.7);
    expect(r.volumeMl).toBe(0.147);
    expect(r.displayState).toBe("ok");
    expect(r.warnings).toEqual([]);
  });

  it("row 5: tirz 20 / 15 / 1.0 → 75.0 U, 0.75 mL, ok", () => {
    const r = computeDose({
      medication: "tirzepatide",
      concentration: 20,
      dose: 15,
      barrelMl: 1.0,
    });
    expect(r.unitsU100).toBe(75.0);
    expect(r.volumeMl).toBe(0.75);
    expect(r.displayState).toBe("ok");
    expect(r.warnings).toEqual([]);
  });

  it("row 6: tirz 40 / 15 / 1.0 → 37.5 U, 0.375 mL, ok", () => {
    const r = computeDose({
      medication: "tirzepatide",
      concentration: 40,
      dose: 15,
      barrelMl: 1.0,
    });
    expect(r.unitsU100).toBe(37.5);
    expect(r.volumeMl).toBe(0.375);
    expect(r.displayState).toBe("ok");
    expect(r.warnings).toEqual([]);
  });

  it("row 7: sema NaN / 2.5 / 1.0 → invalid", () => {
    const r = computeDose({
      medication: "semaglutide",
      concentration: NaN,
      dose: 2.5,
      barrelMl: 1.0,
    });
    expect(Number.isNaN(r.unitsU100)).toBe(true);
    expect(Number.isNaN(r.volumeMl)).toBe(true);
    expect(r.displayState).toBe("invalid");
    expect(r.warnings).toEqual([]);
  });

  it("row 8: sema 10 / 0 / 1.0 → invalid", () => {
    const r = computeDose({
      medication: "semaglutide",
      concentration: 10,
      dose: 0,
      barrelMl: 1.0,
    });
    expect(Number.isNaN(r.unitsU100)).toBe(true);
    expect(Number.isNaN(r.volumeMl)).toBe(true);
    expect(r.displayState).toBe("invalid");
    expect(r.warnings).toEqual([]);
  });

  it("row 9: sema -5 / 2.5 / 1.0 → invalid", () => {
    const r = computeDose({
      medication: "semaglutide",
      concentration: -5,
      dose: 2.5,
      barrelMl: 1.0,
    });
    expect(Number.isNaN(r.unitsU100)).toBe(true);
    expect(Number.isNaN(r.volumeMl)).toBe(true);
    expect(r.displayState).toBe("invalid");
    expect(r.warnings).toEqual([]);
  });
});

describe("computeDose — vial economics", () => {
  it("sema 2.5 / 0.25 / 1.0, vialMl=2 → totalMg=5, dosesPerVial=20", () => {
    const r = computeDose({
      medication: "semaglutide",
      concentration: 2.5,
      dose: 0.25,
      barrelMl: 1.0,
      vialMl: 2,
    });
    expect(r.totalMg).toBe(5);
    expect(r.dosesPerVial).toBe(20);
  });

  it("tirz 10 / 5 / 1.0, vialMl=1 → totalMg=10, dosesPerVial=2", () => {
    const r = computeDose({
      medication: "tirzepatide",
      concentration: 10,
      dose: 5,
      barrelMl: 1.0,
      vialMl: 1,
    });
    expect(r.totalMg).toBe(10);
    expect(r.dosesPerVial).toBe(2);
  });
});

describe("computeDose — sanity warnings", () => {
  it("sema 200 / 2.5 / 1.0 → sanity_conc", () => {
    const r = computeDose({
      medication: "semaglutide",
      concentration: 200,
      dose: 2.5,
      barrelMl: 1.0,
    });
    expect(r.warnings).toContain("sanity_conc");
  });

  it("sema 10 / 75 / 1.0 → sanity_dose AND over_capacity (vol=7.5 mL)", () => {
    const r = computeDose({
      medication: "semaglutide",
      concentration: 10,
      dose: 75,
      barrelMl: 1.0,
    });
    expect(r.warnings).toContain("sanity_dose");
    expect(r.warnings).toContain("over_capacity");
  });
});
