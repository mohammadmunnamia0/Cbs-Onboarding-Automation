// Generate 5,000 realistic Bangladeshi-style company names.
// Run: node scripts/generate_company_names.js > cypress/fixtures/company_names_5000.txt

const prefixes = [
  'Janata','Sonali','Rupali','Purbani','Purabi','Uttara','Dakshin','Pubali','Modhumoti','Meghna','Padma','Jamuna','Karnaphuli','Surma','Titas','Teesta','Shitalakkhya','Buriganga','Dhansiri','Rupsha',
  'Asha','Alif','Aman','Bismillah','Noor','Rahman','Karim','Hasan','Hossain','Islam',
  'Prime','Apex','Elite','Royal','Green','Golden','Smart','Future','Vision','Pioneer',
  'Sunrise','Sunset','Morning','Moonlight','Star','Galaxy','Sky','Ocean','River','Hill',
  'Nahar','Al-Madina','Al-Amin','Al-Hera','New Vision','Modern','Citizen','National','Eastern','Western','Northern','Southern','Unity','Trust','Progress','Success','Prosper','Harmony','Reliable',
  'Bangla','Bengal','Desh','Probash','Sundar','Shakti','Pragati','Somoy','Dhaka','Chiro','Priyo','Shonar','Samriddhi','Bandhu','Mukti','Sundarban','Purbasha','Nabab','Joy','Neel','Noya','Protic','Swapno',
  'Moni','Jalal','Rong','Noor','Tara','Majhi','Nodi','Srishti','Projot','Protyasha','Chaya','Alo','Jibon','Pran','Sukhi','Shapla','Bashundhara','Mithila','Akash','Milan','Jagoron','Palli','Bangabandhu','Mujib','Shanti','Sahaj','Kamal','Nirman',
  'Techland','Varies','Galaxy','Metrocom','Infinity','Eagle','Zenith','Nova','Orion','Silverline','Summit','Nexa','Radix','Axis','Polar','Lotus','Vertex','Aspire','Beacon','Vantage','Crest','Emerald','Horizon','Legacy','Momentum','Sapphire'
]

const categories = [
  'Trading','Enterprise','Industries','Logistics','Transport','Engineering','Garments','Textiles','Agro','Foods','Construction','Builders','Developers','IT','Software','Technologies','Packaging','Printing','Pharmaceuticals','Healthcare','Plastic','Ceramics','Steel','Furniture','Electronics','Telecom','Courier','Cargo','Shipping','Import & Export','Wholesale','Retail','Fashion','Leather','Fisheries','Poultry','Dairy','Rice Mills','Real Estate','Energy'
]

const corporateSuffixes = [
  'Ltd','Limited','Co','Corp','Corporation','PLC','LLP','LLC','Group','Enterprises','Enterprise','Traders','Industries','Association','Foundation','Trust','Services','Holdings','International','Global'
]

const uniquePrefixes = [...new Set(prefixes)]
const uniqueCategories = [...new Set(categories)]
const uniqueCorporateSuffixes = [...new Set(corporateSuffixes)]

const generated = []
const seen = new Set()

function pushUnique(name) {
  const normalized = name.trim().replace(/\s+/g, ' ')
  if (!seen.has(normalized)) {
    seen.add(normalized)
    generated.push(normalized)
  }
}

for (const prefix of uniquePrefixes) {
  for (const category of uniqueCategories) {
    for (const corp of uniqueCorporateSuffixes) {
      if (generated.length >= 5000) break
      pushUnique(`${prefix} ${category} ${corp}`)
      if (generated.length >= 5000) break
      pushUnique(`${prefix} ${category}`)
      if (generated.length >= 5000) break
      pushUnique(`${prefix} & ${category} ${corp}`)
      if (generated.length >= 5000) break
    }
    if (generated.length >= 5000) break
  }
  if (generated.length >= 5000) break
}

for (const name of generated.slice(0, 5000)) {
  console.log(name)
}
