#!/usr/bin/env node

/**
 * Asset Validation Script
 *
 * Validates that PNG assets exist for all entries in airline and partner registries.
 * Also checks for orphan files (files in public but not in registry).
 *
 * Usage:
 *   node scripts/validate-assets.mjs
 *
 * Exit codes:
 *   0 - All assets validated, no missing files
 *   1 - Missing assets found (for CI failure)
 *
 * Naming conventions:
 *   - Airlines: IATA code, case-sensitive (e.g., LA.png, G3.png, AD.png)
 *   - Partners: slug, lowercase (e.g., decolar.png, kayak.png)
 */

import { readdirSync, existsSync } from "fs";
import { join, basename } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");

// ============================================================================
// Registry Data (inline to avoid TypeScript import issues)
// ============================================================================

// Airlines from lib/airlines/registry.ts
const AIRLINE_REGISTRY = [
  { code: "LA", name: "LATAM", asset: "/airlines-png/LA.png" },
  { code: "JJ", name: "LATAM Brasil", asset: "/airlines-png/JJ.png" },
  { code: "AD", name: "Azul", asset: "/airlines-png/AD.png" },
  { code: "G3", name: "GOL", asset: "/airlines-png/G3.png" },
  { code: "TP", name: "TAP Air Portugal", asset: "/airlines-png/TP.png" },
  { code: "IB", name: "Iberia", asset: "/airlines-png/IB.png" },
  { code: "AF", name: "Air France", asset: "/airlines-png/AF.png" },
  { code: "LH", name: "Lufthansa", asset: "/airlines-png/LH.png" },
  { code: "BA", name: "British Airways", asset: "/airlines-png/BA.png" },
  { code: "KL", name: "KLM", asset: "/airlines-png/KL.png" },
  { code: "UX", name: "Air Europa", asset: "/airlines-png/UX.png" },
  { code: "AA", name: "American Airlines", asset: "/airlines-png/AA.png" },
  { code: "UA", name: "United Airlines", asset: "/airlines-png/UA.png" },
  { code: "DL", name: "Delta Air Lines", asset: "/airlines-png/DL.png" },
  { code: "AC", name: "Air Canada", asset: "/airlines-png/AC.png" },
  { code: "WN", name: "Southwest", asset: "/airlines-png/WN.png" },
  { code: "EK", name: "Emirates", asset: "/airlines-png/EK.png" },
  { code: "QR", name: "Qatar Airways", asset: "/airlines-png/QR.png" },
  { code: "EY", name: "Etihad", asset: "/airlines-png/EY.png" },
  { code: "TK", name: "Turkish Airlines", asset: "/airlines-png/TK.png" },
  { code: "SQ", name: "Singapore Airlines", asset: "/airlines-png/SQ.png" },
  { code: "AR", name: "Aerolíneas Argentinas", asset: "/airlines-png/AR.png" },
  { code: "CM", name: "Copa Airlines", asset: "/airlines-png/CM.png" },
  { code: "AV", name: "Avianca", asset: "/airlines-png/AV.png" },
];

// Partners from lib/partners/registry.ts
const PARTNER_REGISTRY = [
  { slug: "latam", name: "LATAM", asset: "/partners-png/latam.png" },
  { slug: "gol", name: "GOL", asset: "/partners-png/gol.png" },
  { slug: "azul", name: "Azul", asset: "/partners-png/azul.png" },
  { slug: "tap", name: "TAP Portugal", asset: "/partners-png/tap.png" },
  { slug: "decolar", name: "Decolar", asset: "/partners-png/decolar.png" },
  { slug: "maxmilhas", name: "MaxMilhas", asset: "/partners-png/maxmilhas.png" },
  { slug: "123milhas", name: "123 Milhas", asset: "/partners-png/123milhas.png" },
  { slug: "googleflights", name: "Google Flights", asset: "/partners-png/googleflights.png" },
  { slug: "kayak", name: "Kayak", asset: "/partners-png/kayak.png" },
  { slug: "skyscanner", name: "Skyscanner", asset: "/partners-png/skyscanner.png" },
  { slug: "momondo", name: "Momondo", asset: "/partners-png/momondo.png" },
];

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get list of files in a directory
 */
function getFilesInDirectory(dirPath) {
  const fullPath = join(ROOT, "public", dirPath);
  if (!existsSync(fullPath)) {
    return [];
  }
  return readdirSync(fullPath).filter((f) => f.endsWith(".png"));
}

/**
 * Check if a file exists in public folder
 */
function assetExists(assetPath) {
  const fullPath = join(ROOT, "public", assetPath);
  return existsSync(fullPath);
}

// ============================================================================
// Validation
// ============================================================================

console.log("\n🔍 Validating PNG Assets...\n");
console.log("=" .repeat(60));

let hasErrors = false;

// --- Airlines ---
console.log("\n✈️  AIRLINES (public/airlines-png/)\n");
console.log("   Expected format: {IATA_CODE}.png (case-sensitive)");
console.log("   Example: LA.png, G3.png, AD.png\n");

const existingAirlineFiles = getFilesInDirectory("airlines-png");
const expectedAirlineFiles = AIRLINE_REGISTRY.map((a) => basename(a.asset));

// Missing airline assets
const missingAirlines = AIRLINE_REGISTRY.filter((a) => !assetExists(a.asset));
if (missingAirlines.length > 0) {
  console.log("   ❌ MISSING ASSETS:");
  missingAirlines.forEach((a) => {
    console.log(`      - ${a.code.padEnd(4)} (${a.name}) → ${a.asset}`);
  });
  hasErrors = true;
} else {
  console.log("   ✅ All airline assets present!");
}

// Orphan airline files
const orphanAirlineFiles = existingAirlineFiles.filter(
  (f) => !expectedAirlineFiles.includes(f)
);
if (orphanAirlineFiles.length > 0) {
  console.log("\n   ⚠️  ORPHAN FILES (in public but not in registry):");
  orphanAirlineFiles.forEach((f) => {
    console.log(`      - ${f}`);
  });
}

console.log(`\n   Summary: ${AIRLINE_REGISTRY.length - missingAirlines.length}/${AIRLINE_REGISTRY.length} present`);

// --- Partners ---
console.log("\n" + "=".repeat(60));
console.log("\n🤝 PARTNERS (public/partners-png/)\n");
console.log("   Expected format: {slug}.png (lowercase)");
console.log("   Example: decolar.png, kayak.png\n");

const existingPartnerFiles = getFilesInDirectory("partners-png");
const expectedPartnerFiles = PARTNER_REGISTRY.map((p) => basename(p.asset));

// Missing partner assets
const missingPartners = PARTNER_REGISTRY.filter((p) => !assetExists(p.asset));
if (missingPartners.length > 0) {
  console.log("   ❌ MISSING ASSETS:");
  missingPartners.forEach((p) => {
    console.log(`      - ${p.slug.padEnd(15)} (${p.name}) → ${p.asset}`);
  });
  hasErrors = true;
} else {
  console.log("   ✅ All partner assets present!");
}

// Orphan partner files
const orphanPartnerFiles = existingPartnerFiles.filter(
  (f) => !expectedPartnerFiles.includes(f)
);
if (orphanPartnerFiles.length > 0) {
  console.log("\n   ⚠️  ORPHAN FILES (in public but not in registry):");
  orphanPartnerFiles.forEach((f) => {
    console.log(`      - ${f}`);
  });
}

console.log(`\n   Summary: ${PARTNER_REGISTRY.length - missingPartners.length}/${PARTNER_REGISTRY.length} present`);

// --- Final Summary ---
console.log("\n" + "=".repeat(60));
console.log("\n📊 FINAL SUMMARY\n");

const totalExpected = AIRLINE_REGISTRY.length + PARTNER_REGISTRY.length;
const totalMissing = missingAirlines.length + missingPartners.length;
const totalOrphans = orphanAirlineFiles.length + orphanPartnerFiles.length;

console.log(`   Total assets expected:  ${totalExpected}`);
console.log(`   Assets present:         ${totalExpected - totalMissing}`);
console.log(`   Assets missing:         ${totalMissing}`);
console.log(`   Orphan files:           ${totalOrphans}`);

if (hasErrors) {
  console.log("\n❌ Validation FAILED. Add the missing assets listed above.\n");
  process.exit(1);
} else {
  console.log("\n✅ Validation PASSED. All assets are present.\n");
  process.exit(0);
}

