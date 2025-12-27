/**
 * Airports Library Tests
 *
 * Validates the airports data layer functionality.
 */

import { describe, it, expect } from "vitest";
import {
  searchAirports,
  getAirportByCode,
  getAirportsByCityCode,
  getAirportCount,
} from "./index";

describe("Airports Data Layer", () => {
  describe("getAirportByCode", () => {
    it("should return GRU by code", () => {
      const airport = getAirportByCode("GRU");
      expect(airport).not.toBeNull();
      expect(airport?.code).toBe("GRU");
      expect(airport?.city).toBe("São Paulo");
    });

    it("should be case-insensitive", () => {
      const airport = getAirportByCode("gru");
      expect(airport).not.toBeNull();
      expect(airport?.code).toBe("GRU");
    });

    it("should return null for unknown code", () => {
      const airport = getAirportByCode("XXX");
      expect(airport).toBeNull();
    });
  });

  describe("getAirportsByCityCode", () => {
    it("should return GRU, CGH, VCP for SAO", () => {
      const airports = getAirportsByCityCode("SAO");
      expect(airports.length).toBeGreaterThanOrEqual(2);

      const codes = airports.map((a) => a.code);
      expect(codes).toContain("GRU");
      expect(codes).toContain("CGH");
    });

    it("should return GIG, SDU for RIO", () => {
      const airports = getAirportsByCityCode("RIO");
      expect(airports.length).toBeGreaterThanOrEqual(2);

      const codes = airports.map((a) => a.code);
      expect(codes).toContain("GIG");
      expect(codes).toContain("SDU");
    });

    it("should return JFK, LGA, EWR for NYC", () => {
      const airports = getAirportsByCityCode("NYC");
      expect(airports.length).toBeGreaterThanOrEqual(3);

      const codes = airports.map((a) => a.code);
      expect(codes).toContain("JFK");
      expect(codes).toContain("LGA");
      expect(codes).toContain("EWR");
    });
  });

  describe("searchAirports", () => {
    it("should find GRU by exact code", () => {
      const results = searchAirports("GRU");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].code).toBe("GRU");
    });

    it("should find GRU by lowercase code", () => {
      const results = searchAirports("gru");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].code).toBe("GRU");
    });

    it("should find São Paulo airports by city name", () => {
      const results = searchAirports("sao paulo");
      expect(results.length).toBeGreaterThanOrEqual(2);

      const codes = results.map((a) => a.code);
      expect(codes).toContain("GRU");
      expect(codes).toContain("CGH");
    });

    it("should find airports by city name with accent", () => {
      const results = searchAirports("são paulo");
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it("should find Rio airports by keyword 'rio'", () => {
      const results = searchAirports("rio");
      expect(results.length).toBeGreaterThanOrEqual(2);

      const codes = results.map((a) => a.code);
      // Should find Rio de Janeiro airports via city name or keywords
      expect(codes.some((c) => c === "GIG" || c === "SDU")).toBe(true);
    });

    it("should find NYC airports by searching 'nova york'", () => {
      const results = searchAirports("nova york");
      expect(results.length).toBeGreaterThanOrEqual(1);

      const codes = results.map((a) => a.code);
      expect(codes.some((c) => ["JFK", "LGA", "EWR"].includes(c))).toBe(true);
    });

    it("should respect limit parameter", () => {
      const results = searchAirports("a", 3);
      expect(results.length).toBeLessThanOrEqual(3);
    });

    it("should return empty for queries shorter than 2 chars", () => {
      const results = searchAirports("a");
      expect(results.length).toBe(0);
    });

    it("should return empty for empty query", () => {
      const results = searchAirports("");
      expect(results.length).toBe(0);
    });
  });

  describe("Dataset integrity", () => {
    it("should have a substantial number of airports", () => {
      const count = getAirportCount();
      expect(count).toBeGreaterThanOrEqual(50);
    });

    it("should have all required Brazilian airports", () => {
      const requiredBR = [
        "GRU",
        "CGH",
        "VCP",
        "GIG",
        "SDU",
        "BSB",
        "CNF",
        "SSA",
        "REC",
        "FOR",
        "POA",
        "CWB",
      ];

      for (const code of requiredBR) {
        const airport = getAirportByCode(code);
        expect(airport, `Missing airport: ${code}`).not.toBeNull();
        expect(airport?.country).toBe("BR");
      }
    });

    it("should have required US airports", () => {
      const requiredUS = ["JFK", "LGA", "EWR", "MIA", "LAX"];

      for (const code of requiredUS) {
        const airport = getAirportByCode(code);
        expect(airport, `Missing airport: ${code}`).not.toBeNull();
        expect(airport?.country).toBe("US");
      }
    });

    it("should have required EU hub airports", () => {
      const requiredEU = [
        "LIS",
        "OPO",
        "MAD",
        "BCN",
        "CDG",
        "ORY",
        "LHR",
        "LGW",
        "AMS",
        "FRA",
        "MUC",
        "FCO",
        "MXP",
      ];

      for (const code of requiredEU) {
        const airport = getAirportByCode(code);
        expect(airport, `Missing airport: ${code}`).not.toBeNull();
      }
    });

    it("should have required LatAm airports", () => {
      const requiredLatAm = ["EZE", "AEP", "SCL", "BOG", "LIM", "MEX", "PTY"];

      for (const code of requiredLatAm) {
        const airport = getAirportByCode(code);
        expect(airport, `Missing airport: ${code}`).not.toBeNull();
      }
    });
  });
});

