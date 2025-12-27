/**
 * Test Script for /api/flights/search
 *
 * Run with: npx tsx scripts/test-api.ts
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

interface TestCase {
  name: string;
  url: string;
  expectedStatus?: number;
}

const testCases: TestCase[] = [
  {
    name: "One-way GRU → LIS",
    url: `${BASE_URL}/api/flights/search?from=GRU&to=LIS&depart=2025-03-15&max=5`,
  },
  {
    name: "Round-trip GRU → LIS",
    url: `${BASE_URL}/api/flights/search?from=GRU&to=LIS&depart=2025-03-15&return=2025-03-22&adults=2&max=5`,
  },
  {
    name: "Non-stop GRU → EZE",
    url: `${BASE_URL}/api/flights/search?from=GRU&to=EZE&depart=2025-04-01&nonStop=true&max=5`,
  },
  {
    name: "Invalid: missing 'from'",
    url: `${BASE_URL}/api/flights/search?to=LIS&depart=2025-03-15`,
    expectedStatus: 400,
  },
  {
    name: "Invalid: bad IATA code",
    url: `${BASE_URL}/api/flights/search?from=XX&to=LIS&depart=2025-03-15`,
    expectedStatus: 400,
  },
];

async function runTest(test: TestCase): Promise<void> {
  console.log(`\n📍 Test: ${test.name}`);
  console.log(`   URL: ${test.url}`);

  try {
    const start = Date.now();
    const response = await fetch(test.url);
    const duration = Date.now() - start;

    console.log(`   Status: ${response.status} (${duration}ms)`);

    const data = await response.json();

    if (test.expectedStatus && response.status !== test.expectedStatus) {
      console.log(`   ❌ Expected status ${test.expectedStatus}, got ${response.status}`);
    } else if (response.ok) {
      console.log(`   ✅ Success`);
      console.log(`   📊 Flights: ${data.flights?.length || 0}`);
      console.log(`   📦 Source: ${data.source}`);
      console.log(`   ⏱️  API Duration: ${data.meta?.durationMs}ms`);
      console.log(`   💾 Cached: ${data.meta?.cached}`);

      if (data.flights?.length > 0) {
        const first = data.flights[0];
        console.log(`   🛫 First flight:`);
        console.log(`      ${first.airline} (${first.airlineCode})`);
        console.log(`      ${first.departure} → ${first.arrival}`);
        console.log(`      ${first.duration} | ${first.stops}`);
        console.log(`      R$ ${first.price}`);
      }
    } else {
      console.log(`   ⚠️  Error: ${data.code}`);
      console.log(`   📝 Message: ${data.message}`);

      if (data.errors) {
        console.log(`   📋 Validation errors:`);
        data.errors.forEach((e: { field: string; message: string }) => {
          console.log(`      - ${e.field}: ${e.message}`);
        });
      }
    }
  } catch (error) {
    console.log(`   ❌ Network error: ${error instanceof Error ? error.message : error}`);
  }
}

async function main() {
  console.log("🚀 Testing /api/flights/search\n");
  console.log(`Base URL: ${BASE_URL}`);
  console.log("=".repeat(60));

  for (const test of testCases) {
    await runTest(test);
  }

  console.log("\n" + "=".repeat(60));
  console.log("✨ Tests completed\n");
}

main().catch(console.error);

