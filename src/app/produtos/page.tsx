import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Produtos',
  description: 'Listagem de produtos disponíveis'
}

async function getProducts() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/products`, { next: { revalidate: 60 } })
  if (!res.ok) return []
  const json = await res.json()
  return json.data || []
}

export default async function ProdutosPage() {
  const products = await getProducts()

  return (
    <section className="container-custom py-12">
      <h1 className="text-3xl font-heading font-bold text-primary-800 mb-6">Produtos</h1>
      {products.length === 0 ? (
        <p className="text-gray-600">Nenhum produto disponível no momento.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {products.map((p: any) => (
            <div key={p._id} className="bg-white rounded-xl shadow p-4">
              <div className="h-40 bg-gray-100 rounded mb-3" />
              <h3 className="font-semibold text-gray-900">{p.name}</h3>
              <p className="text-sm text-gray-600">{p.breed} • {p.weight} kg • {p.age} meses</p>
              {p.priceFormatted && (
                <p className="mt-2 font-bold text-primary-700">{p.priceFormatted}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}