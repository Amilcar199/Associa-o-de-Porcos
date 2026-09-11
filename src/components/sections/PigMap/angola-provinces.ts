// Lista oficial das 21 províncias de Angola (divisão administrativa vigente)
// com coordenadas aproximadas das capitais/centros provinciais.
// Reutilizada pelo formulário de cadastro de fazendas e pelo mapa interativo
// da aba "Sobre". Caso a organização deseje maior precisão, estas coordenadas
// podem ser substituídas por centróides oficiais do IGCA.

export interface ProvinceGeo {
  name: string
  lat: number
  lng: number
}

export const ANGOLA_PROVINCES_GEO: ProvinceGeo[] = [
  { name: 'Luanda', lat: -8.8368, lng: 13.2343 },
  { name: 'Ícolo e Bengo', lat: -9.0932, lng: 13.6923 },
  { name: 'Bengo', lat: -8.5785, lng: 13.6644 },
  { name: 'Benguela', lat: -12.5763, lng: 13.4055 },
  { name: 'Bié', lat: -12.3833, lng: 16.9333 },
  { name: 'Cabinda', lat: -5.5500, lng: 12.2000 },
  { name: 'Cuando', lat: -15.1667, lng: 19.1667 },
  { name: 'Cubango', lat: -14.6588, lng: 17.6874 },
  { name: 'Cuanza Norte', lat: -9.3021, lng: 14.9134 },
  { name: 'Cuanza Sul', lat: -11.2059, lng: 13.8481 },
  { name: 'Cunene', lat: -17.0672, lng: 15.7275 },
  { name: 'Huambo', lat: -12.7761, lng: 15.7392 },
  { name: 'Huíla', lat: -14.9177, lng: 13.4925 },
  { name: 'Lunda Norte', lat: -7.3833, lng: 20.8333 },
  { name: 'Lunda Sul', lat: -9.6608, lng: 20.3911 },
  { name: 'Malanje', lat: -9.5402, lng: 16.3410 },
  { name: 'Moxico', lat: -11.7833, lng: 19.9167 },
  { name: 'Moxico Oriental', lat: -11.8833, lng: 22.9500 },
  { name: 'Namibe', lat: -15.1961, lng: 12.1522 },
  { name: 'Uíge', lat: -7.6087, lng: 15.0613 },
  { name: 'Zaire', lat: -6.2667, lng: 14.2500 },
]

export const ANGOLA_PROVINCE_NAMES: string[] = ANGOLA_PROVINCES_GEO.map(p => p.name).sort()

export function getProvinceGeo(name: string): ProvinceGeo | undefined {
  return ANGOLA_PROVINCES_GEO.find(p => p.name === name)
}

// Centro aproximado de Angola, usado como centro inicial do mapa
export const ANGOLA_CENTER: [number, number] = [-12.3, 17.5]
export const ANGOLA_DEFAULT_ZOOM = 5.4
