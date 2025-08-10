import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Produtos',
  description: 'Listagem de produtos disponíveis'
}

async function getProducts() {
  const res = await fetch(`/api/products`, { next: { revalidate: 60 } })
  if (!res.ok) return []
  const json = await res.json()
  return json.data || []
}

export default async function ProdutosPage() {
  const products = await getProducts()

  return (
    <section className="container-custom py-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary-800">Produtos</h1>
          <p className="text-gray-600 mt-1">Animais disponíveis com qualidade e procedência.</p>
        </div>
      </div>
      {products.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-600">Nenhum produto disponível no momento.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p: any) => (
            <div key={p._id} className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden">
              <div className="h-44 bg-gray-100" />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg">{p.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{p.breed} • {p.weight} kg • {p.age} meses</p>
                {p.priceFormatted && (
                  <p className="mt-3 font-bold text-primary-700 text-base">{p.priceFormatted}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}