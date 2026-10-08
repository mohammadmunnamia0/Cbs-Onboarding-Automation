// Generate 5,000 standalone Bangladeshi-style company names in CAPITAL LETTERS.
// Run: node scripts/generate_company_names.js > cypress/fixtures/company_names_5000.txt
//
// Naming rules live in cypress/support/companyNames.js and are shared with the
// Cypress specs. Output is deterministic (seeded) so regeneration is stable.

const {
  PREFIXES,
  BUSINESS_LINES,
  formatCompanyName,
  isValidCompanyName,
  pickSuffix
} = require('../cypress/support/companyNames')

const TOTAL = 5000

// Small seeded PRNG (mulberry32) so the fixture is reproducible.
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20261008)

// One company per prefix + line of business, so no two names differ only by
// their legal suffix (e.g. "X STEEL LTD." and "X STEEL PLC").
const pairs = []
for (const prefix of new Set(PREFIXES)) {
  for (const businessLine of new Set(BUSINESS_LINES)) {
    pairs.push([prefix, businessLine])
  }
}

if (pairs.length < TOTAL) {
  console.error(`Only ${pairs.length} unique prefix/business combinations; need ${TOTAL}.`)
  process.exit(1)
}

for (let i = pairs.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1))
  ;[pairs[i], pairs[j]] = [pairs[j], pairs[i]]
}

const names = pairs
  .slice(0, TOTAL)
  .map(([prefix, businessLine]) => formatCompanyName(prefix, businessLine, pickSuffix(rand)))

const invalid = names.filter(name => !isValidCompanyName(name))
if (invalid.length) {
  console.error(`Invalid company names generated:\n${invalid.join('\n')}`)
  process.exit(1)
}

for (const name of names) {
  console.log(name)
}
