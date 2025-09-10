// Default glossary for protected terms (breeds, brand, proper nouns)
const DEFAULT_GLOSSARY = [
  'Landrace','Large White','Duroc','Hampshire','Pietrain','Yorkshire','Chester White','Spotted','Tamworth','Gloucester Old Spots','Mangalitsa','Ossabaw Island Hog','Mulefoot','Caipira','Piau','Moura','Canastra','Cruzado',
  // You can add brand/site names here
  'Associação de Suínos','AoPorco','BRAND_NAME'
]

export function getGlossary(): string[] {
  const fromEnv = process.env.TRANSLATION_GLOSSARY
  if (!fromEnv) return DEFAULT_GLOSSARY
  try {
    // Accept JSON array or comma-separated string
    if (fromEnv.trim().startsWith('[')) {
      const arr = JSON.parse(fromEnv)
      return Array.isArray(arr) ? arr.filter(Boolean) : DEFAULT_GLOSSARY
    }
    return fromEnv.split(',').map((s) => s.trim()).filter(Boolean)
  } catch {
    return DEFAULT_GLOSSARY
  }
}

