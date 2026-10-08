// Shared company-name rules for account creation and the fixture generator.
//
// Every name is a standalone legal entity in CAPITAL LETTERS, shaped as
// "<PREFIX> <LINE OF BUSINESS> <LEGAL SUFFIX>", e.g. "NIRJHOR TEXTILE MILLS LTD.".
// Suffixes follow the Bangladesh Companies (Second Amendment) Act 2020:
// private companies end in LIMITED / LTD., public companies end in PLC.
//
// Names must never look like a group, parent company or umbrella of companies,
// and must not borrow the brand of a well-known Bangladeshi conglomerate or bank.

const PREFIXES = [
  // Bengali words
  'ABAHAN', 'ADORSHO', 'AGNIBINA', 'ALOKITO', 'AMBAR', 'ANANNYA', 'ANIK', 'APON',
  'ARSHI', 'ATOSHI', 'BAHAR', 'BAISHAKHI', 'BARNALI', 'BHOROSA', 'BIJOYA', 'BIPASHA',
  'BORSHA', 'CHAITALI', 'CHANDRIMA', 'DHRUBO', 'DIPTO', 'DRISHTI', 'GANGCHIL', 'GODHULI',
  'HASNAHENA', 'HIMADRI', 'ISHAN', 'JHINUK', 'JONAKI', 'KAKOLI', 'KASHFUL', 'KHUSHBU',
  'KRISHNOCHURA', 'MADHABI', 'MAYURI', 'MEGHDOOT', 'MITALI', 'MOHONA', 'MOYNA', 'MRIDULA',
  'NABIN', 'NAKSHI', 'NILACHAL', 'NILANJANA', 'NIRJHOR', 'NOBANNO', 'OIKKO', 'OPURBO',
  'ORONNO', 'PADDOJA', 'PALASH', 'PANKHI', 'PAROMITA', 'PRANTIK', 'PROBAL', 'PROTTOY',
  'PURNIMA', 'RAJANIGANDHA', 'RAKHAL', 'RIMJHIM', 'RODELA', 'ROJONI', 'ROOPKATHA', 'RUPASHI',
  'SABUJ', 'SAGORIKA', 'SAMPAN', 'SANCHITA', 'SHAPNIL', 'SHEFALI', 'SHIMUL', 'SHISHIR',
  'SHRABON', 'SHUKTARA', 'SRABANTI', 'SUBORNO', 'SUCHONA', 'SUROVI', 'SWARNALI', 'TAMANNA',
  'TORONGO', 'TUSHAR', 'UDAYAN', 'UTSHO', 'UTTORON', 'ZINIA',

  // Neutral English words
  'AMBERLEAF', 'BLUECREST', 'BRIGHTWAVE', 'CEDARLINE', 'CLEARPATH', 'COASTLINE', 'CRESTVIEW',
  'EVERGLADE', 'FAIRWIND', 'HARBOURVIEW', 'IRONWOOD', 'LAKESHORE', 'MAPLETREE', 'OAKRIDGE',
  'PEARLWAY', 'RIVERSTONE', 'SILVERBAY', 'STONEBRIDGE', 'SUNFIELD', 'TRUEPATH', 'WESTBROOK'
]

// A single line of business each, so the name reads as one operating company.
const BUSINESS_LINES = [
  'TEXTILE MILLS', 'SPINNING MILLS', 'KNITWEAR', 'APPARELS', 'GARMENTS', 'DENIM', 'FABRICS',
  'DYEING', 'FOOTWEAR', 'LEATHER', 'TANNERY', 'JUTE MILLS', 'PHARMACEUTICALS', 'CHEMICALS',
  'COSMETICS', 'AGRO FOODS', 'FOOD PRODUCTS', 'BEVERAGE', 'RICE MILLS', 'FLOUR MILLS',
  'EDIBLE OIL', 'DAIRY', 'FEEDS', 'FISHERIES', 'HATCHERY', 'POULTRY', 'SEEDS', 'STEEL',
  'RE-ROLLING MILLS', 'CEMENT', 'CERAMICS', 'GLASS', 'PLASTICS', 'PACKAGING', 'PAPER MILLS',
  'PRINTING', 'FURNITURE', 'ELECTRONICS', 'CABLES', 'BATTERY', 'ENGINEERING', 'CONSTRUCTION',
  'BUILDERS', 'DEVELOPERS', 'PROPERTIES', 'LOGISTICS', 'SHIPPING', 'FREIGHT', 'COURIER',
  'TRANSPORT', 'TRADING', 'SOFTWARE', 'TECHNOLOGIES', 'POWER', 'HOSPITAL', 'DIAGNOSTICS'
]

// Weighted toward private companies, which far outnumber public ones.
const LEGAL_SUFFIXES = [
  { suffix: 'LTD.', weight: 6 },
  { suffix: 'LIMITED', weight: 3 },
  { suffix: 'PLC', weight: 1 }
]

// Words that signal a group, parent company or umbrella of several companies,
// or a legal form that is not a Bangladeshi limited company.
const DISALLOWED_WORDS = [
  'GROUP', 'GROUPS', 'HOLDING', 'HOLDINGS', 'CONGLOMERATE', 'CONSORTIUM', 'CONCERN', 'CONCERNS',
  'COMPANIES', 'ENTERPRISES', 'INDUSTRIES', 'AFFILIATES', 'SUBSIDIARIES', 'SISTER', 'ALLIANCE',
  'FEDERATION', 'ASSOCIATION', 'ASSOCIATES', 'FOUNDATION', 'TRUST', 'BROTHERS', 'VENTURES',
  'PARTNERS', 'INC', 'INC.', 'CORP', 'CORP.', 'CO', 'CO.', 'LLC', 'LLP', 'LP', 'OF'
]

// Brands of well-known Bangladeshi business groups and banks. A generated
// customer must not be mistaken for one of them or one of their sister concerns.
const RESERVED_BRANDS = [
  'ABUL', 'ACI', 'AGRANI', 'AKIJ', 'ANANDA', 'APEX', 'BANGABANDHU', 'BASHUNDHARA', 'BENGAL',
  'BEXIMCO', 'BISMILLAH', 'BRAC', 'CITIZENS', 'CITY', 'CONCORD', 'DESH', 'DHAKA', 'DRAGON',
  'EASTERN', 'EDISON', 'ELITE', 'ENVOY', 'FRESH', 'GRAMEEN', 'HABIB', 'IFIC', 'JAMUNA',
  'JANATA', 'KARNAPHULI', 'KHAIR', 'MEGHNA', 'MERCANTILE', 'MODHUMOTI', 'MUJIB', 'MUTUAL',
  'NATIONAL', 'NAVANA', 'NITOL', 'ORION', 'PADMA', 'PARTEX', 'PHP', 'PIONEER', 'PRAGATI',
  'PRAN', 'PRIME', 'PUBALI', 'RAHIMAFROOZ', 'RANGS', 'RFL', 'RUPALI', 'SMART', 'SONALI',
  'SQUARE', 'SUMMIT', 'SUNDARBAN', 'TITAS', 'TRANSCOM', 'UTTARA', 'WALTON', 'ZAMAN'
]

const NAME_PATTERN = /^[A-Z][A-Z0-9 &\-]* (LTD\.|LIMITED|PLC)$/

function formatCompanyName(prefix, businessLine, suffix) {
  return `${prefix} ${businessLine} ${suffix}`.replace(/\s+/g, ' ').trim().toUpperCase()
}

function isValidCompanyName(name) {
  if (typeof name !== 'string' || name !== name.toUpperCase()) return false
  if (!NAME_PATTERN.test(name)) return false
  const words = name.split(' ')
  return !words.some(w => DISALLOWED_WORDS.includes(w) || RESERVED_BRANDS.includes(w))
}

function pickSuffix(rand) {
  const total = LEGAL_SUFFIXES.reduce((sum, s) => sum + s.weight, 0)
  let r = rand() * total
  for (const { suffix, weight } of LEGAL_SUFFIXES) {
    r -= weight
    if (r < 0) return suffix
  }
  return LEGAL_SUFFIXES[0].suffix
}

function randomCompanyName(rand = Math.random) {
  const prefix = PREFIXES[Math.floor(rand() * PREFIXES.length)]
  const businessLine = BUSINESS_LINES[Math.floor(rand() * BUSINESS_LINES.length)]
  return formatCompanyName(prefix, businessLine, pickSuffix(rand))
}

module.exports = {
  PREFIXES,
  BUSINESS_LINES,
  LEGAL_SUFFIXES,
  DISALLOWED_WORDS,
  RESERVED_BRANDS,
  formatCompanyName,
  isValidCompanyName,
  pickSuffix,
  randomCompanyName
}
