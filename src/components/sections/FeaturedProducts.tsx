'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  Heart,
  ShoppingCart,
  Star,
  MapPin,
  Clock,
  Weight,
  Award
} from 'lucide-react'

// Mock data - será substituído pela API real
const mockProducts = [
  {
    id: '1',
    name: 'Suíno Landrace Premium',
    breed: 'Landrace',
    age: 6,
    weight: 120,
    price: 2500,
    location: 'Luanda, Angola',
    images: ['/products/landrace-1.jpg'],
    healthStatus: 'excellent',
    vaccinated: true,
    features: ['Alto rendimento', 'Excelente conversão alimentar', 'Genética superior'],
    seller: {
      name: 'João Silva',
      company: 'Fazenda São João'
    }
  },
  {
    id: '2',
    name: 'Matriz Duroc Reprodutora',
    breed: 'Duroc',
    age: 18,
    weight: 180,
    price: 4200,
    location: 'Benguela, Angola',
    images: ['/products/duroc-1.jpg'],
    healthStatus: 'excellent',
    vaccinated: true,
    features: ['Matriz comprovada', 'Excelente prolificidade', 'Linhagem registrada'],
    seller: {
      name: 'Maria Santos',
      company: 'Granja Esperança'
    }
  },
  {
    id: '3',
    name: 'Leitões Large White',
    breed: 'Large White',
    age: 2,
    weight: 25,
    price: 180,
    location: 'Huíla, Angola',
    images: ['/products/large-white-1.jpg'],
    healthStatus: 'excellent',
    vaccinated: true,
    features: ['Desmamados', 'Vacinados', 'Peso ideal'],
    seller: {
      name: 'Carlos Oliveira',
      company: 'Suinocultura Sul'
    }
  },
  {
    id: '4',
    name: 'Reprodutor Hampshire',
    breed: 'Hampshire',
    age: 24,
    weight: 200,
    price: 5500,
    location: 'Namibe, Angola',
    images: ['/products/hampshire-1.jpg'],
    healthStatus: 'excellent',
    vaccinated: true,
    features: ['Reprodutor elite', 'Sêmen de alta qualidade', 'Pedigree completo'],
    seller: {
      name: 'Pedro Costa',
      company: 'Elite Genetics'
    }
  }
]

const FeaturedProducts = () => {
  const [products, setProducts] = useState(mockProducts)
  const [loading, setLoading] = useState(false)

  // Função para buscar produtos em destaque (será implementada com API real)
  const fetchFeaturedProducts = async () => {
    setLoading(true)
    try {
      // const response = await fetch('/api/products/featured')
      // const data = await response.json()
      // setProducts(data.products)
      
      // Por enquanto, usar dados mock
      setTimeout(() => {
        setProducts(mockProducts)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    }).format(price)
  }

  const formatAge = (age: number) => {
    if (age === 1) return '1 mês'
    if (age < 12) return `${age} meses`
    const years = Math.floor(age / 12)
    const months = age % 12
    if (months === 0) {
      return years === 1 ? '1 ano' : `${years} anos`
    }
    return `${years} ano${years > 1 ? 's' : ''} e ${months} mês${months > 1 ? 'es' : ''}`
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-yellow-600 bg-yellow-100'
      case 'fair': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getHealthStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return 'Excelente'
      case 'good': return 'Bom'
      case 'fair': return 'Regular'
      default: return 'N/A'
    }
  }

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
            Produtos em Destaque
          </span>
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-6">
            Suínos de
            <span className="text-gradient"> Qualidade Superior</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Confira nossa seleção de suínos premium, criados com os mais altos 
            padrões de qualidade e bem-estar animal pelos nossos associados.
          </p>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="card animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg" />
                <div className="card-body space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%2316a34a'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='white' font-size='18'%3E${product.breed}%3C/text%3E%3C/svg%3E`
                    }}
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 space-y-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getHealthStatusColor(product.healthStatus)}`}>
                      {getHealthStatusText(product.healthStatus)}
                    </span>
                    {product.vaccinated && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded-full block">
                        Vacinado
                      </span>
                    )}
                  </div>

                  {/* Favorite Button */}
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-colors">
                    <Heart size={16} className="text-gray-600 hover:text-red-500" />
                  </button>

                  {/* Price Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-primary-600 text-white px-3 py-1 text-sm font-bold rounded-full">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="card-body">
                  <div className="mb-3">
                    <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600">{product.breed}</p>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{formatAge(product.age)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Weight size={12} />
                      <span>{product.weight}kg</span>
                    </div>
                    <div className="flex items-center space-x-1 col-span-2">
                      <MapPin size={12} />
                      <span>{product.location}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {product.features.slice(0, 2).map((feature, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                      {product.features.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{product.features.length - 2} mais
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Seller */}
                  <div className="mb-4 p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Vendido por:</p>
                    <p className="text-sm font-medium text-gray-900">{product.seller.name}</p>
                    <p className="text-xs text-gray-500">{product.seller.company}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/produtos/${product.id}`}
                      className="flex-1 btn-primary text-center text-sm py-2"
                    >
                      Ver Detalhes
                    </Link>
                    <button className="w-10 h-10 bg-gray-100 hover:bg-primary-100 rounded-lg flex items-center justify-center transition-colors">
                      <ShoppingCart size={16} className="text-gray-600 hover:text-primary-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-gray-600 mb-6">
            Explore nossa coleção completa de suínos de alta qualidade
          </p>
          <Link
            href="/produtos"
            className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Ver Todos os Produtos
            <ArrowRight size={20} className="ml-2" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturedProducts
