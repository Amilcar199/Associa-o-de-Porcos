// Nomes exibidos no mapa e a chave usada nos cadastros de fazendas.
export interface AngolaProvinceMeta {
  id: string
  label: string
  dataName: string
}

export const ANGOLA_PROVINCE_META: AngolaProvinceMeta[] = [
  { id: 'cabinda', label: 'Cabinda', dataName: 'Cabinda' },
  { id: 'zaire', label: 'Zaire', dataName: 'Zaire' },
  { id: 'uige', label: 'Uíge', dataName: 'Uíge' },
  { id: 'bengo', label: 'Bengo', dataName: 'Bengo' },
  { id: 'luanda', label: 'Luanda', dataName: 'Luanda' },
  { id: 'cuanza-norte', label: 'Cuanza Norte', dataName: 'Cuanza Norte' },
  { id: 'icolo-e-bengo', label: 'Icolo e Bengo', dataName: 'Ícolo e Bengo' },
  { id: 'malanje', label: 'Malanje', dataName: 'Malanje' },
  { id: 'lunda-norte', label: 'Lunda Norte', dataName: 'Lunda Norte' },
  { id: 'lunda-sul', label: 'Lunda Sul', dataName: 'Lunda Sul' },
  { id: 'cuanza-sul', label: 'Cuanza Sul', dataName: 'Cuanza Sul' },
  { id: 'benguela', label: 'Benguela', dataName: 'Benguela' },
  { id: 'huambo', label: 'Huambo', dataName: 'Huambo' },
  { id: 'bie', label: 'Bié', dataName: 'Bié' },
  { id: 'huila', label: 'Huíla', dataName: 'Huíla' },
  { id: 'namibe', label: 'Namibe', dataName: 'Namibe' },
  { id: 'cunene', label: 'Cunene', dataName: 'Cunene' },
  { id: 'cubango', label: 'Cubango', dataName: 'Cubango' },
  { id: 'cuando', label: 'Cuando', dataName: 'Cuando' },
  { id: 'moxico', label: 'Moxico', dataName: 'Moxico' },
  { id: 'moxico-leste', label: 'Moxico Leste', dataName: 'Moxico Oriental' },
]

// Ajustes de rótulo para províncias estreitas ou junto à costa.
export const PROVINCE_LABEL_OFFSET: Record<string, { x: number; y: number }> = {
  'lunda-sul': { x: 142, y: 536 },
  'lunda-norte': { x: -642, y: 442 },
  malanje: { x: -642, y: -342 },
  cuando: { x: -642, y: -342 },
  cabinda: { x: 642, y: 0 },
  luanda: { x: -642, y: 0 },
}

export function getProvinceMeta(id: string): AngolaProvinceMeta | undefined {
  return ANGOLA_PROVINCE_META.find((province) => province.id === id)
}
