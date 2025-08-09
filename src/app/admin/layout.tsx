import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export const metadata = {
  title: 'Painel Administrativo - Associação de Porcos',
  description: 'Painel de administração da Associação de Porcos',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Verificar se usuário está logado e é admin
  if (!session || session.user.role !== 'admin') {
    redirect('/login?error=insufficient_permissions')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header do Admin */}
      <AdminHeader user={session.user} />
      
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Conteúdo Principal */}
        <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
