import type { Metadata } from 'next'
import NewProductClient from './NewProductClient'

export const metadata: Metadata = {
  title: 'Adicionar Produto - Painel Administrativo',
  description: 'Cadastrar novo produto'
}

export default function AdminNewProductPage() {
  return <NewProductClient />
}